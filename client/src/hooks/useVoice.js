/**
 * useVoice.js — Professional real-time voice hook
 *
 * Audio pipeline redesign for zero-latency playback:
 *
 * OLD (slow): chunk arrives → wait for in-order → decode at play time → play
 * NEW (fast): chunk arrives → decode immediately (parallel) → schedule ahead
 *
 * Key changes:
 * 1. decodeAudioData() fires the instant each chunk arrives, not at play time
 * 2. AudioContext.currentTime scheduling — chunks play back-to-back with 0 gap
 * 3. audioMutedRef gates mic during TTS so AI voice doesn't echo into STT
 * 4. No forced sample rate (was 24000) — browser picks optimal for MP3 decode
 * 5. Smaller worklet buffer (150ms vs 200ms) for faster STT latency
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';

const WORKLET_CODE = `
class PCM16Processor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buf  = [];
    this._size = 0;
    this._target = 2400; // 150ms @ 16kHz (was 200ms)
  }
  process(inputs) {
    const ch = inputs[0]?.[0];
    if (!ch) return true;
    const pcm = new Int16Array(ch.length);
    for (let i = 0; i < ch.length; i++) {
      const s = Math.max(-1, Math.min(1, ch[i]));
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    this._buf.push(pcm);
    this._size += pcm.length;
    if (this._size >= this._target) {
      const out = new Int16Array(this._size);
      let off = 0;
      for (const c of this._buf) { out.set(c, off); off += c.length; }
      this.port.postMessage(out.buffer, [out.buffer]);
      this._buf = []; this._size = 0;
    }
    return true;
  }
}
registerProcessor('pcm16-processor', PCM16Processor);
`;

const SERVER_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '';

const useVoice = ({
  chapterId,
  getVisibleText,
  getCurrentSegment,
  onTranscript,
  onAnswer,
  onAnswerChunk,
  onCommand,
  onStopNarration,
  onError,
  autoConnect = false,
} = {}) => {

  const [isListening,       setIsListening]       = useState(false);
  const [isSpeaking,        setIsSpeaking]        = useState(false);
  const [isProcessing,      setIsProcessing]      = useState(false);
  const [isConnected,       setIsConnected]       = useState(false);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [lastAnswer,        setLastAnswer]        = useState(null);
  const [streamingText,     setStreamingText]     = useState('');

  // Socket / mic refs
  const socketRef           = useRef(null);
  const audioCtxRef         = useRef(null); // playback context (native rate)
  const micCtxRef           = useRef(null);   // mic capture context (16kHz)
  const workletNodeRef      = useRef(null);
  const micStreamRef        = useRef(null);
  const sourceNodeRef       = useRef(null);
  const workletUrlRef       = useRef(null);
  const sttReadyResolverRef = useRef(null);

  // ── Audio pipeline state ───────────────────────────────────────────────────
  const decodedMap      = useRef(new Map()); // index → AudioBuffer | null
  const nextSchedIdx    = useRef(0);         // next index to schedule
  const schedEndTime    = useRef(0);         // when last scheduled chunk ends
  const activeNodes     = useRef([]);        // playing BufferSourceNodes
  const totalExpected   = useRef(null);      // set when isFinal chunk arrives
  const schedCount      = useRef(0);         // how many chunks scheduled

  // ── Mic muting ─────────────────────────────────────────────────────────────
  const audioMutedRef       = useRef(false);
  const unmuteTimer         = useRef(null);
  const bargeInEnergyRef    = useRef(0);
  const scheduleReadyRef    = useRef(null);
  const stopCurrentAudioRef = useRef(null);

  const getAudioCtx = () => {
    // No forced sampleRate — let browser use its native rate for MP3 decode
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  };

  const getMicCtx = () => {
    // MUST be 16000Hz — matches what AssemblyAI expects for PCM16
    if (!micCtxRef.current || micCtxRef.current.state === 'closed') {
      micCtxRef.current = new AudioContext({ sampleRate: 16000 });
    }
    return micCtxRef.current;
  };

  // ── Stop all playback, reset pipeline ─────────────────────────────────────
  const stopCurrentAudio = useCallback(() => {
    for (const node of activeNodes.current) {
      try { node.onended = null; node.stop(0); } catch (_) {}
    }
    activeNodes.current = [];
    decodedMap.current.clear();
    nextSchedIdx.current  = 0;
    schedEndTime.current  = 0;
    totalExpected.current = null;
    schedCount.current    = 0;
    setIsSpeaking(false);
    setStreamingText('');
    // Unmute immediately on stop (interrupt / barge-in)
    clearTimeout(unmuteTimer.current);
    audioMutedRef.current = false;
  }, []);
  stopCurrentAudioRef.current = stopCurrentAudio;

  // ── Schedule all consecutive ready chunks ─────────────────────────────────
  // Called every time a chunk finishes decoding. Walks decodedMap in order
  // and schedules all that are ready, using AudioContext time scheduling.
  const scheduleReady = useCallback(() => {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().then(scheduleReady);
      return;
    }
    const now = ctx.currentTime;

    while (decodedMap.current.has(nextSchedIdx.current)) {
      const idx    = nextSchedIdx.current;
      const buffer = decodedMap.current.get(idx);
      decodedMap.current.delete(idx);
      nextSchedIdx.current++;

      if (!buffer) {
        // Null = decode failed, skip this index
        schedCount.current++;
        continue;
      }

      // Schedule to start exactly when previous ends (or now + tiny lookahead)
      const startAt = Math.max(schedEndTime.current, now + 0.005);
      schedEndTime.current = startAt + buffer.duration;
      schedCount.current++;

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      activeNodes.current.push(src);

      src.onended = () => {
        activeNodes.current = activeNodes.current.filter(n => n !== src);
        // Check if all chunks have played
        if (
          activeNodes.current.length === 0 &&
          totalExpected.current !== null &&
          schedCount.current >= totalExpected.current
        ) {
          setIsSpeaking(false);
          // Brief pause before unmuting mic (let room echo settle)
          bargeInEnergyRef.current = 0;
          bargeInEnergyRef.current = 0;
          clearTimeout(unmuteTimer.current);
          unmuteTimer.current = setTimeout(() => {
            audioMutedRef.current = false;
            console.log('[useVoice] Mic unmuted - ready');
          }, 150);
        }
      };

      src.start(startAt);
      setIsSpeaking(true);
      console.log(`[useVoice] Scheduled [${idx}] t+${(startAt - now).toFixed(3)}s dur=${buffer.duration.toFixed(2)}s`);
    }
  }, []);
  scheduleReadyRef.current = scheduleReady;

  // ── Receive & immediately decode a chunk ───────────────────────────────────
  const receiveChunk = useCallback(async (index, audioBase64) => {
    if (!audioBase64) {
      decodedMap.current.set(index, null);
      scheduleReady();
      return;
    }

    // Mute mic as soon as audio starts coming in
    clearTimeout(unmuteTimer.current);
    audioMutedRef.current = true;

    try {
      const ctx    = getAudioCtx();
      if (ctx.state === 'suspended') await ctx.resume();
      const bin    = atob(audioBase64);
      const bytes  = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      // .slice() transfers ownership — required before decodeAudioData
      const decoded = await ctx.decodeAudioData(bytes.buffer.slice(0));
      decodedMap.current.set(index, decoded);
      console.log(`[useVoice] Decoded [${index}] ${decoded.duration.toFixed(2)}s`);
    } catch (e) {
      console.error(`[useVoice] Decode error [${index}]:`, e.message);
      decodedMap.current.set(index, null);
    }

    scheduleReady();
  }, [scheduleReady]);

  // ── Socket ─────────────────────────────────────────────────────────────────
  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) return;

    const token  = localStorage.getItem('token') || sessionStorage.getItem('token');
    const socket = io(SERVER_URL, {
      auth:                 { token },
      transports:           ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay:    500,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[useVoice] Connected:', socket.id);
      setIsConnected(true);
      if (chapterId) {
        socket.emit('voice:join', {
          chapterId,
          visibleText:    getVisibleText?.()    || '',
          currentSegment: getCurrentSegment?.() || null,
        });
      }
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      setIsListening(false);
      console.log('[useVoice] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      onError?.('Voice connection failed: ' + err.message);
    });

    socket.on('voice:ready', ({ chapterTitle }) => {
      console.log('[useVoice] STT ready for:', chapterTitle);
      sttReadyResolverRef.current?.();
      sttReadyResolverRef.current = null;
    });

    socket.on('voice:partial_transcript', ({ text }) => {
      setPartialTranscript(text);
      onTranscript?.(text, false);
    });

    socket.on('voice:final_transcript', ({ text }) => {
      setPartialTranscript('');
      onTranscript?.(text, true);
    });

    socket.on('voice:processing', () => {
      setIsProcessing(true);
      setStreamingText('');
      stopCurrentAudio();
    });

    socket.on('voice:command', ({ command }) => {
      setIsProcessing(false);
      onCommand?.(command);
    });

    // Text chunk — display immediately, before audio arrives
    socket.on('voice:answer_text_chunk', ({ text, index, isRepeat, fromCache }) => {
      setStreamingText(prev => prev ? prev + ' ' + text : text);
      setIsProcessing(false);
      onAnswerChunk?.({ text, index, isRepeat, fromCache, type: 'text' });
    });

    // Audio chunk — decode immediately in parallel
    socket.on('voice:answer_chunk', (msg) => {
      const { audioBase64, index } = msg;
      console.log(`[useVoice] Chunk [${index}] hasAudio=${!!audioBase64}`);
      receiveChunk(index, audioBase64 ?? null);
      onAnswerChunk?.({ ...msg, type: 'audio' });
    });

    socket.on('voice:answer_done', (msg) => {
      // Set totalExpected so scheduleReady knows when all chunks are done
      if (msg.totalChunks) {
        totalExpected.current = msg.totalChunks;
        scheduleReadyRef.current?.();
      }
      setLastAnswer({ text: msg.text, isRepeat: !!msg.isRepeat, isOffTopic: false });
      onAnswer?.(msg);
      setTimeout(() => setStreamingText(''), 500);
    });

    // Legacy: off-topic / single-shot answer
    socket.on('voice:answer', (msg) => {
      setIsProcessing(false);
      setLastAnswer({ text: msg.text, isRepeat: !!msg.isRepeat, isOffTopic: !!msg.isOffTopic });
      onAnswer?.(msg);
      if (msg.audioBase64) { totalExpected.current = 1; receiveChunk(0, msg.audioBase64); }
    });

    socket.on('voice:stop_narration', () => { onStopNarration?.(); });

    socket.on('voice:done', () => setIsProcessing(false));

    socket.on('voice:interrupted', () => {
      stopCurrentAudio();
      setIsProcessing(false);
    });

    socket.on('voice:error', ({ message }) => {
      setIsProcessing(false);
      onError?.(message);
    });

  }, [chapterId, getVisibleText, getCurrentSegment, onTranscript, onAnswer,
      onAnswerChunk, onCommand, onStopNarration, onError, receiveChunk, stopCurrentAudio]);

  // ── Microphone ─────────────────────────────────────────────────────────────
  const startMicrophone = useCallback(async () => {
    if (micStreamRef.current) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate:       16000,
        channelCount:     1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl:  true,
      },
    });
    micStreamRef.current = stream;

    const ctx = getMicCtx();
    if (ctx.state === 'suspended') await ctx.resume();

    if (!workletUrlRef.current) {
      const blob = new Blob([WORKLET_CODE], { type: 'application/javascript' });
      workletUrlRef.current = URL.createObjectURL(blob);
    }
    await ctx.audioWorklet.addModule(workletUrlRef.current);

    const worklet = new AudioWorkletNode(ctx, 'pcm16-processor');
    workletNodeRef.current = worklet;

    worklet.port.onmessage = (e) => {
      if (!socketRef.current?.connected) return;
      if (audioMutedRef.current) {
        // Barge-in detection: measure speech energy while TTS plays
        const s16 = new Int16Array(e.data);
        let energy = 0;
        for (let i = 0; i < s16.length; i++) energy += Math.abs(s16[i]);
        if (energy / s16.length > 1200) {
          bargeInEnergyRef.current++;
          if (bargeInEnergyRef.current >= 4) {
            console.log('[useVoice] Barge-in! Interrupting TTS...');
            bargeInEnergyRef.current = 0;
            socketRef.current?.emit('voice:interrupt');
            stopCurrentAudioRef.current?.();
          }
        } else {
          bargeInEnergyRef.current = Math.max(0, bargeInEnergyRef.current - 1);
        }
        return;
      }
      bargeInEnergyRef.current = 0;
      const u8  = new Uint8Array(e.data);
      let   bin = '';
      for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
      socketRef.current.emit('voice:audio_chunk', { data: btoa(bin) });
    };

    const micSrc = ctx.createMediaStreamSource(stream);
    sourceNodeRef.current = micSrc;
    micSrc.connect(worklet);
    console.log('[useVoice] Mic active');
  }, []);

  const stopMicrophone = useCallback(() => {
    try {
      workletNodeRef.current?.port.close();
      workletNodeRef.current?.disconnect();
      sourceNodeRef.current?.disconnect();
      micStreamRef.current?.getTracks().forEach(t => t.stop());
    } catch (_) {}
    workletNodeRef.current = null;
    sourceNodeRef.current  = null;
    micStreamRef.current   = null;
    // Close mic context so it can be recreated fresh next time
    try { micCtxRef.current?.close(); } catch (_) {}
    micCtxRef.current = null;
  }, []);

  // ── Public API ─────────────────────────────────────────────────────────────
  const startListening = useCallback(async () => {
    try {
      const alreadyConnected = socketRef.current?.connected;
      const readyPromise = new Promise(res => { sttReadyResolverRef.current = res; });

      if (!alreadyConnected) {
        connectSocket();
      } else {
        socketRef.current.emit('voice:join', {
          chapterId,
          visibleText:    getVisibleText?.()    || '',
          currentSegment: getCurrentSegment?.() || null,
        });
      }

      await Promise.race([
        readyPromise,
        new Promise((_, rej) => setTimeout(() => rej(new Error('Voice session timeout')), 8000)),
      ]);

      await startMicrophone();
      stopCurrentAudio();
      setIsListening(true);
      console.log('[useVoice] Listening');
    } catch (e) {
      console.error('[useVoice] startListening error:', e);
      onError?.(
        e.message.includes('Permission') || e.message.includes('NotAllowed')
          ? 'Microphone access denied. Please allow microphone permission.'
          : 'Could not start: ' + e.message
      );
    }
  }, [connectSocket, startMicrophone, stopCurrentAudio, chapterId,
      getVisibleText, getCurrentSegment, onError]);

  const stopListening = useCallback(() => {
    stopMicrophone();
    stopCurrentAudio();
    setIsListening(false);
    setPartialTranscript('');
    socketRef.current?.emit('voice:end_session');
  }, [stopMicrophone, stopCurrentAudio]);

  const toggle = useCallback(async () => {
    if (isListening) stopListening();
    else await startListening();
  }, [isListening, startListening, stopListening]);

  const interrupt = useCallback(() => {
    socketRef.current?.emit('voice:interrupt');
    stopCurrentAudio(); // also unmutes mic immediately
  }, [stopCurrentAudio]);

  const updateContext = useCallback((text, segment) => {
    socketRef.current?.emit('voice:update_context', {
      visibleText: text, currentSegment: segment || null,
    });
  }, []);

  const playNarration = useCallback(async (audioBase64) => {
    if (isListening) return;
    stopCurrentAudio();
    audioMutedRef.current = false;
    totalExpected.current = 1; await receiveChunk(0, audioBase64);
  }, [isListening, stopCurrentAudio, receiveChunk]);

  useEffect(() => {
    if (autoConnect && chapterId) connectSocket();
    return () => {
      stopMicrophone();
      clearTimeout(unmuteTimer.current);
      try { audioCtxRef.current?.close(); } catch (_) {}
      socketRef.current?.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isListening, isSpeaking, isProcessing, isConnected,
    partialTranscript, lastAnswer, streamingText,
    startListening, stopListening, toggle, interrupt,
    updateContext, playNarration, stopCurrentAudio,
  };
};

export default useVoice;