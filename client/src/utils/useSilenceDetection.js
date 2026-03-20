/**
 * useSilenceDetection.js
 * Voice Activity Detection using Web Audio API's AnalyserNode.
 * Fires onSilence() after configurable silence duration.
 * Fires onSpeechStart() when audio level rises above threshold.
 *
 * Usage:
 *   const vad = useSilenceDetection({
 *     onSilence: () => stopListening(),
 *     onSpeechStart: () => stopNarration(),
 *     silenceDuration: 2000,   // ms of silence before callback
 *     threshold: 10,           // RMS threshold (0-128)
 *   });
 *   vad.attach(audioStream);   // call with MediaStream
 *   vad.detach();              // cleanup
 */

import { useRef, useCallback } from 'react';

const useSilenceDetection = ({
  onSilence,
  onSpeechStart,
  silenceDuration = 2000,
  threshold = 10,
} = {}) => {
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const rafRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isSpeakingRef = useRef(false);

  const attach = useCallback((stream) => {
    if (!stream) return;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyserRef.current = analyser;

    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);
    sourceRef.current = source;

    const dataArray = new Uint8Array(analyser.fftSize);

    const tick = () => {
      analyser.getByteTimeDomainData(dataArray);

      // Compute RMS
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const val = (dataArray[i] - 128) / 128;
        sum += val * val;
      }
      const rms = Math.sqrt(sum / dataArray.length) * 100;

      if (rms > threshold) {
        // Speech detected
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        if (!isSpeakingRef.current) {
          isSpeakingRef.current = true;
          onSpeechStart?.();
        }
      } else {
        // Silence — start timer if not already running
        if (isSpeakingRef.current && !silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            isSpeakingRef.current = false;
            silenceTimerRef.current = null;
            onSilence?.();
          }, silenceDuration);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [onSilence, onSpeechStart, silenceDuration, threshold]);

  const detach = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    sourceRef.current?.disconnect();
    audioCtxRef.current?.close().catch(() => {});
    rafRef.current = null;
    silenceTimerRef.current = null;
    sourceRef.current = null;
    analyserRef.current = null;
    audioCtxRef.current = null;
    isSpeakingRef.current = false;
  }, []);

  return { attach, detach };
};

export default useSilenceDetection;