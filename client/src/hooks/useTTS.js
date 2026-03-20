import { useState, useRef } from 'react';
import { getTTSStreamUrl } from './useChapterData';
import cleanForTTS from '../utils/cleanForTTS';
import { chunkTextIntelligently } from '../utils/textUtils';
import {
  AUTOPLAY_PAUSE_SECONDS,
  MAX_TTS_CHUNK_SIZE,
  TTS_WORD_PACE_ESTIMATE,
  EQUATION_STEP_REVEAL_INTERVAL_MS,
  EQUATION_STEP_TYPING_DURATION_MS,
} from '../constants/readerConfig';

/**
 * All TTS / audio state and logic for the reader.
 * Exposes:
 *   speakWithDeepgram, readAloud, readTeacherBoard,
 *   stopReading, toggleAutoPlay,
 *   and all related state values.
 */
const useTTS = ({ chapterId, currentSegment, currentSegmentIndex, showExplanation, goToNextSegment }) => {
  const audioRef = useRef(null);
  const ttsAbortRef = useRef(null);
  const autoPlayRef = useRef(false);
  const autoPlayTimerRef = useRef(null);

  const [isReading, setIsReading] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [autoPlayMode, setAutoPlayMode] = useState(false);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(0);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
  const [currentWords, setCurrentWords] = useState([]);
  const [mainTextWordCount, setMainTextWordCount] = useState(0);

  const [teacherBoardWords, setTeacherBoardWords] = useState([]);
  const [teacherBoardHighlightIndex, setTeacherBoardHighlightIndex] = useState(-1);
  const [currentChunk, setCurrentChunk] = useState({ current: 0, total: 0 });

  const [activeEquationStep, setActiveEquationStep] = useState(0);
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [equationStepChars, setEquationStepChars] = useState({});
  const [activeStepUnderline, setActiveStepUnderline] = useState(-1);
  const [explanationWords, setExplanationWords] = useState({});

  // ─── Internal helpers ────────────────────────────────────────────────────────

  const startAutoPlayCountdown = () => {
    let remaining = AUTOPLAY_PAUSE_SECONDS;
    setAutoPlayCountdown(remaining);
    const tick = () => {
      remaining -= 1;
      setAutoPlayCountdown(remaining);
      if (remaining <= 0) {
        setAutoPlayCountdown(0);
        if (autoPlayRef.current) goToNextSegment();
      } else {
        autoPlayTimerRef.current = setTimeout(tick, 1000);
      }
    };
    autoPlayTimerRef.current = setTimeout(tick, 1000);
  };

  const startExplanationReveal = (stepIndex, explanationText, duration) => {
    const words = explanationText.split(/\s+/);
    const wordDuration = (duration / words.length) * 1000;
    let wordIndex = 0;
    const revealInterval = setInterval(() => {
      if (wordIndex <= words.length) {
        setExplanationWords(prev => ({ ...prev, [stepIndex]: wordIndex }));
        wordIndex++;
      } else {
        clearInterval(revealInterval);
      }
    }, wordDuration);
    if (audioRef.current) audioRef.current.explanationInterval = revealInterval;
  };

  const attachWordHighlight = (audioEl, wordList, estDuration, isTeacherBoard) => {
    let rafId = null;
    let lastIdx = -1;

    const track = () => {
      if (!audioRef.current || audioRef.current !== audioEl) return;
      const dur = audioEl.duration && isFinite(audioEl.duration) ? audioEl.duration : estDuration;
      const prog = audioEl.currentTime / Math.max(dur, 0.1);
      const idx = Math.min(Math.floor(prog * wordList.length), wordList.length - 1);
      if (idx !== lastIdx && idx >= 0) {
        lastIdx = idx;
        if (isTeacherBoard) setTeacherBoardHighlightIndex(idx);
        else setHighlightedWordIndex(idx);
      }
      rafId = requestAnimationFrame(track);
    };

    const onTimeUpdate = () => {
      if (rafId === null) rafId = requestAnimationFrame(track);
    };
    audioEl.addEventListener('timeupdate', onTimeUpdate);

    return { rafId: () => rafId, cancelRaf: () => { if (rafId) cancelAnimationFrame(rafId); rafId = null; }, onTimeUpdate };
  };

  const attachEndedHandler = (audioEl, wordList, isTeacherBoard, urlToRevoke, { cancelRaf, onTimeUpdate }) => {
    audioEl.onended = () => {
      if (audioEl.highlightInterval) clearInterval(audioEl.highlightInterval);
      if (audioEl.typingInterval) clearInterval(audioEl.typingInterval);
      if (audioEl.explanationInterval) clearInterval(audioEl.explanationInterval);
      audioEl.removeEventListener('timeupdate', onTimeUpdate);
      cancelRaf();

      if (isTeacherBoard) setTeacherBoardHighlightIndex(wordList.length - 1);
      else setHighlightedWordIndex(wordList.length - 1);
      setActiveStepUnderline(-1);

      if (currentSegment?.type !== 'equation') setIsReading(false);
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
      if (autoPlayRef.current && currentSegment?.type !== 'equation') startAutoPlayCountdown();
    };

    audioEl.onerror = () => {
      setIsReading(false);
      setAutoPlayMode(false);
      setActiveStepUnderline(-1);
    };
  };

  // ─── Core TTS function ───────────────────────────────────────────────────────

  const speakWithDeepgram = async (text, stepInfo = null, isTeacherBoard = false, segmentIndex = null) => {
    try {
      setIsLoadingAudio(true);
      const token = localStorage.getItem('token');

      if (ttsAbortRef.current) ttsAbortRef.current.abort();
      const abortController = new AbortController();
      ttsAbortRef.current = abortController;

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }

      const streamUrl = getTTSStreamUrl(chapterId);
      const mediaSource = new MediaSource();
      const blobUrl = URL.createObjectURL(mediaSource);

      const words = text.split(/\s+/).filter(Boolean);
      if (isTeacherBoard) setTeacherBoardWords(words);
      else setCurrentWords(words);

      const estimatedDuration = words.length * TTS_WORD_PACE_ESTIMATE;

      // ── Probe: cached JSON URL vs streaming with retry logic ────────────────
      let probeResponse;
      const maxRetries = 3;
      let lastError;
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          probeResponse = await fetch(streamUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ text, segmentIndex }),
            signal: abortController.signal,
          });
          break; // Success, exit retry loop
        } catch (e) {
          if (e.name === 'AbortError') return;
          lastError = e;
          // Exponential backoff: 500ms, 1000ms, 1500ms
          if (attempt < maxRetries - 1) {
            await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
          }
        }
      }
      
      if (!probeResponse) {
        console.error('TTS fetch failed after retries:', lastError);
        setIsLoadingAudio(false);
        setIsReading(false);
        return;
      }

      const contentType = probeResponse.headers.get('content-type') || '';

      // ── CACHED path ──────────────────────────────────────────────────────────
      if (contentType.includes('application/json')) {
        const { audioUrl: cachedUrl } = await probeResponse.json();
        const cachedAudio = new Audio(cachedUrl);
        audioRef.current = cachedAudio;

        let cachedRafId = null;
        let cachedLastIdx = -1;
        const trackCached = () => {
          if (!audioRef.current || audioRef.current !== cachedAudio) return;
          const dur = cachedAudio.duration && isFinite(cachedAudio.duration) ? cachedAudio.duration : estimatedDuration;
          const prog = cachedAudio.currentTime / Math.max(dur, 0.1);
          const idx = Math.min(Math.floor(prog * words.length), words.length - 1);
          if (idx !== cachedLastIdx && idx >= 0) {
            cachedLastIdx = idx;
            if (isTeacherBoard) setTeacherBoardHighlightIndex(idx);
            else setHighlightedWordIndex(idx);
          }
          cachedRafId = requestAnimationFrame(trackCached);
        };
        cachedAudio.addEventListener('timeupdate', () => {
          if (cachedRafId === null) cachedRafId = requestAnimationFrame(trackCached);
        });

        cachedAudio.onended = () => {
          if (cachedRafId) { cancelAnimationFrame(cachedRafId); cachedRafId = null; }
          if (isTeacherBoard) setTeacherBoardHighlightIndex(words.length - 1);
          else setHighlightedWordIndex(words.length - 1);
          setActiveStepUnderline(-1);
          if (currentSegment?.type !== 'equation' || !stepInfo) setIsReading(false);
          if (autoPlayRef.current && currentSegment?.type !== 'equation') startAutoPlayCountdown();
        };
        cachedAudio.onerror = () => { setIsReading(false); setAutoPlayMode(false); };

        setIsLoadingAudio(false);
        setIsReading(true);
        cachedAudio.play().catch(e => console.error('Cached audio play failed:', e));
        return;
      }

      // ── STREAMING path ───────────────────────────────────────────────────────
      const audio = new Audio();
      audioRef.current = audio;
      audio.src = blobUrl;

      mediaSource.addEventListener('sourceopen', async () => {
        let sourceBuffer;
        try {
          sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
        } catch (e) {
          console.error('Failed to add source buffer:', e);
          setIsLoadingAudio(false);
          return;
        }

        const response = probeResponse;
        setIsLoadingAudio(false);
        setIsReading(true);
        audio.play().catch(() => {});

        const reader = response.body.getReader();
        const chunkQueue = [];
        let isAppending = false;
        let streamDone = false;

        const tryAppendNext = () => {
          if (isAppending || chunkQueue.length === 0) return;
          if (abortController.signal.aborted) return;
          if (mediaSource.readyState !== 'open') return;
          isAppending = true;
          try { sourceBuffer.appendBuffer(chunkQueue.shift()); }
          catch (e) { console.error('appendBuffer error:', e); isAppending = false; }
        };

        sourceBuffer.addEventListener('updateend', () => {
          isAppending = false;
          if (streamDone && chunkQueue.length === 0) {
            try { mediaSource.endOfStream(); } catch (_) {}
          } else { tryAppendNext(); }
        });

        const pump = async () => {
          while (true) {
            if (abortController.signal.aborted) { reader.cancel(); return; }
            const { done, value } = await reader.read();
            if (done) {
              streamDone = true;
              if (!isAppending && chunkQueue.length === 0) {
                try { mediaSource.endOfStream(); } catch (_) {}
              }
              return;
            }
            chunkQueue.push(value);
            tryAppendNext();
          }
        };
        pump().catch(err => { if (err.name !== 'AbortError') console.error('Stream pump error:', err); });
      });

      // Equation step typing animation
      if (stepInfo) {
        audio.addEventListener('loadedmetadata', () => {
          const { stepIndex, stepText, explanationText } = stepInfo;
          const charDuration = EQUATION_STEP_TYPING_DURATION_MS / stepText.length;
          let charIndex = 0;
          const typingInterval = setInterval(() => {
            if (charIndex <= stepText.length) {
              setEquationStepChars(prev => ({ ...prev, [stepIndex]: charIndex }));
              charIndex++;
            } else {
              clearInterval(typingInterval);
              if (explanationText) startExplanationReveal(stepIndex, explanationText, audio.duration - EQUATION_STEP_TYPING_DURATION_MS / 1000);
            }
          }, charDuration);
          setActiveStepUnderline(stepIndex);
          audio.typingInterval = typingInterval;
        });
      }

      // Word highlight via RAF
      let streamRafId = null;
      let streamLastIdx = -1;
      const trackStream = () => {
        if (!audioRef.current || audioRef.current !== audio) return;
        const dur = audio.duration && isFinite(audio.duration) ? audio.duration : estimatedDuration;
        const prog = audio.currentTime / Math.max(dur, 0.1);
        const idx = Math.min(Math.floor(prog * words.length), words.length - 1);
        if (idx !== streamLastIdx && idx >= 0) {
          streamLastIdx = idx;
          if (isTeacherBoard) setTeacherBoardHighlightIndex(idx);
          else setHighlightedWordIndex(idx);
        }
        streamRafId = requestAnimationFrame(trackStream);
      };
      audio.addEventListener('timeupdate', () => {
        if (streamRafId === null) streamRafId = requestAnimationFrame(trackStream);
      });

      audio.onended = () => {
        if (audio.highlightInterval) clearInterval(audio.highlightInterval);
        if (audio.typingInterval) clearInterval(audio.typingInterval);
        if (audio.explanationInterval) clearInterval(audio.explanationInterval);
        if (streamRafId) { cancelAnimationFrame(streamRafId); streamRafId = null; }
        if (isTeacherBoard) setTeacherBoardHighlightIndex(words.length - 1);
        else setHighlightedWordIndex(words.length - 1);
        setActiveStepUnderline(-1);
        if (currentSegment?.type !== 'equation' || !stepInfo) setIsReading(false);
        URL.revokeObjectURL(blobUrl);
        if (autoPlayRef.current && currentSegment?.type !== 'equation') startAutoPlayCountdown();
      };

      audio.onerror = () => { setIsReading(false); setAutoPlayMode(false); setActiveStepUnderline(-1); };
      setIsReading(true);

      setTimeout(async () => {
        try { await audio.play(); }
        catch (e) { console.log('play retry', e); await audio.play(); }
      }, 120);

      setIsLoadingAudio(false);
    } catch (err) {
      console.error('Deepgram TTS failed:', err);
      setIsLoadingAudio(false);
      setIsReading(false);
      setActiveStepUnderline(-1);
    }
  };

  // ─── stopReading ─────────────────────────────────────────────────────────────

  const stopReading = () => {
    autoPlayRef.current = false;
    if (autoPlayTimerRef.current) { clearTimeout(autoPlayTimerRef.current); autoPlayTimerRef.current = null; }
    if (ttsAbortRef.current) { ttsAbortRef.current.abort(); ttsAbortRef.current = null; }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; audioRef.current = null; }

    setIsReading(false);
    setAutoPlayMode(false);
    setIsLoadingAudio(false);
    setHighlightedWordIndex(-1);
    setCurrentWords([]);
    setMainTextWordCount(0);
    setTeacherBoardWords([]);
    setTeacherBoardHighlightIndex(-1);
    setCurrentChunk({ current: 0, total: 0 });
    setAutoPlayCountdown(0);
  };

  // ─── readAloud ───────────────────────────────────────────────────────────────

  const readAloud = async (customText = null) => {
    if (!customText && !currentSegment) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }

    setTimeout(async () => {
      let textToRead = '';

      if (customText) {
        textToRead = cleanForTTS(String(customText));
      } else if (currentSegment?.type === 'equation') {
        // Disable autoplay during multi-step equation reading
        const wasAutoPlayEnabled = autoPlayRef.current;
        autoPlayRef.current = false;
        
        setActiveEquationStep(0);
        setEquationStepChars({});
        const waitForAudio = () => new Promise(resolve => {
          if (audioRef.current) audioRef.current.addEventListener('ended', resolve, { once: true });
          else resolve();
        });

        await speakWithDeepgram(cleanForTTS(`Equation: ${currentSegment.equation || ''}`), null, false, currentSegmentIndex);
        await waitForAudio();
        await new Promise(r => setTimeout(r, 1200)); // Longer delay in autoplay

        if (showExplanation && Array.isArray(currentSegment.derivation)) {
          for (let idx = 0; idx < currentSegment.derivation.length; idx++) {
            const step = currentSegment.derivation[idx];
            setActiveEquationStep(idx);
            const stepText = cleanForTTS(`Step ${idx + 1}: ${step.step || ''}. ${step.explanation || ''}`);
            if (stepText.trim()) {
              await speakWithDeepgram(stepText, { stepIndex: idx, stepText: step.step, explanationText: step.explanation }, false, currentSegmentIndex);
              await waitForAudio();
              await new Promise(r => setTimeout(r, 1200)); // Longer delay in autoplay
            }
          }
        }

        if (currentSegment.final_result) {
          setShowFinalResult(true);
          await speakWithDeepgram(cleanForTTS(`Final result: ${currentSegment.final_result}`), null, false, currentSegmentIndex);
          await waitForAudio();
        }

        setSpeakingIndex(null);
        setIsReading(false);
        
        // Re-enable autoplay and start countdown after ALL steps are read
        if (wasAutoPlayEnabled) {
          autoPlayRef.current = true;
          startAutoPlayCountdown();
        }
        return;

      } else if (currentSegment?.type === 'example') {
        // Disable autoplay during multi-step reading to prevent premature skipping
        const wasAutoPlayEnabled = autoPlayRef.current;
        autoPlayRef.current = false;
        
        const waitForAudio = () => new Promise(resolve => {
          if (audioRef.current) audioRef.current.addEventListener('ended', resolve, { once: true });
          else resolve();
        });

        const problemText = cleanForTTS(currentSegment.problem || '');
        if (problemText) {
          await speakWithDeepgram(problemText, null, false, currentSegmentIndex);
          await waitForAudio();
          await new Promise(r => setTimeout(r, 1000)); // Longer delay in autoplay
        }

        if (showExplanation) {
          const steps = Array.isArray(currentSegment._ttsSteps) && currentSegment._ttsSteps.length > 0
            ? currentSegment._ttsSteps
            : (currentSegment.solution || '').split('\n').filter(l => l.trim().length > 2);
          for (const step of steps) {
            const spoken = cleanForTTS(step);
            if (!spoken.trim()) continue;
            await speakWithDeepgram(spoken, null, false, currentSegmentIndex);
            await waitForAudio();
            await new Promise(r => setTimeout(r, 1000)); // Longer delay in autoplay
          }
        }

        setSpeakingIndex(null);
        setIsReading(false);
        
        // Re-enable autoplay and start countdown after ALL parts are read
        if (wasAutoPlayEnabled) {
          autoPlayRef.current = true;
          startAutoPlayCountdown();
        }
        return;

      } else if (currentSegment?.type === 'subheading') {
        textToRead = cleanForTTS(`Section: ${currentSegment.subheading}`);
      } else if (currentSegment?.type === 'dialogue') {
        const speaker = currentSegment.speakers ? `${currentSegment.speakers} says: ` : '';
        textToRead = cleanForTTS(speaker + (currentSegment.text || ''));
        if (showExplanation && currentSegment.what_it_reveals) textToRead += `. ${cleanForTTS(currentSegment.what_it_reveals)}`;
        if (showExplanation && currentSegment.tone) textToRead += `. Tone: ${cleanForTTS(currentSegment.tone)}`;
      } else if (Array.isArray(currentSegment?._ttsSteps) && currentSegment._ttsSteps.length > 0) {
        // Handle segments with multiple TTS steps (e.g., vocabulary definitions, multi-part content)
        // Temporarily disable autoplay to prevent skipping between steps
        const wasAutoPlayEnabled = autoPlayRef.current;
        autoPlayRef.current = false; // Disable so onended handlers don't trigger countdown
        
        const waitForAudio = () => new Promise(resolve => {
          if (audioRef.current) audioRef.current.addEventListener('ended', resolve, { once: true });
          else resolve();
        });

        for (const step of currentSegment._ttsSteps) {
          const spoken = cleanForTTS(step);
          if (!spoken.trim()) continue;
          await speakWithDeepgram(spoken, null, false, currentSegmentIndex);
          await waitForAudio();
          await new Promise(r => setTimeout(r, 1000)); // Longer delay in autoplay to prevent connection reset
        }

        setSpeakingIndex(null);
        setIsReading(false);
        
        // Re-enable autoplay and trigger countdown after ALL steps are done
        if (wasAutoPlayEnabled) {
          autoPlayRef.current = true;
          startAutoPlayCountdown();
        }
        return;

      } else if (currentSegment?.type === 'table') {
        textToRead = cleanForTTS(currentSegment.title || 'Word Meanings') + '. ';
        if (Array.isArray(currentSegment.rows)) {
          currentSegment.rows.forEach(row => {
            const word = cleanForTTS(row[0] || '');
            const meaning = cleanForTTS(row[1] || '');
            const extra = cleanForTTS(row[3] || row[2] || '');
            if (word && meaning) { textToRead += `${word} means ${meaning}. `; if (extra) textToRead += `${extra}. `; }
          });
        }
      } else if (currentSegment?.type === 'diagram_concept' || currentSegment?.type === 'diagram_reference') {
        const title = cleanForTTS(currentSegment.title || currentSegment.reference || 'this diagram');
        textToRead = `${title}. `;
        if (currentSegment.explanation) {
          const mainText = cleanForTTS(currentSegment.explanation);
          if (showExplanation) setMainTextWordCount(title.split(/\s+/).filter(Boolean).length + 1);
          textToRead += mainText;
        }
      } else {
        const mainText = cleanForTTS(currentSegment?.text || '');
        textToRead = mainText;
        if (showExplanation && currentSegment?.explanation) {
          setMainTextWordCount(mainText.split(/\s+/).filter(Boolean).length);
          textToRead += `. ${cleanForTTS(currentSegment.explanation)}`;
        } else {
          setMainTextWordCount(0);
        }
      }

      if (!textToRead.trim()) return;
      textToRead = cleanForTTS(textToRead);

      setIsReading(true);
      if (!customText) setSpeakingIndex(currentSegmentIndex);

      // Equation step reveal during regular read
      let stepInterval = null;
      if (currentSegment?.type === 'equation' && currentSegment.derivation?.length) {
        let step = 0;
        setActiveEquationStep(0);
        stepInterval = setInterval(() => {
          step += 1;
          setActiveEquationStep(prev => {
            if (prev >= currentSegment.derivation.length - 1) { clearInterval(stepInterval); return prev; }
            return step;
          });
        }, EQUATION_STEP_REVEAL_INTERVAL_MS);
      }

      if (!customText) setSpeakingIndex(currentSegmentIndex);
      await speakWithDeepgram(textToRead, null, false, currentSegmentIndex);
      if (stepInterval) clearInterval(stepInterval);
      setSpeakingIndex(null);
    }, 100);
  };

  // ─── readTeacherBoard ────────────────────────────────────────────────────────

  const readTeacherBoard = async (text) => {
    if (!text) return;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }

    setTeacherBoardWords([]);
    setTeacherBoardHighlightIndex(-1);
    setCurrentChunk({ current: 0, total: 0 });

    const cleanText = cleanForTTS(String(text));
    if (!cleanText) return;

    if (cleanText.length <= MAX_TTS_CHUNK_SIZE) {
      await speakWithDeepgram(cleanText, null, true);
      return;
    }

    const chunks = chunkTextIntelligently(cleanText, MAX_TTS_CHUNK_SIZE);
    setCurrentChunk({ current: 0, total: chunks.length });

    for (let i = 0; i < chunks.length; i++) {
      if (!audioRef.current && i > 0) break;
      setCurrentChunk({ current: i + 1, total: chunks.length });
      await speakWithDeepgram(chunks[i], null, true);
      await new Promise(resolve => {
        if (audioRef.current) audioRef.current.addEventListener('ended', resolve, { once: true });
        else resolve();
      });
      await new Promise(r => setTimeout(r, 500));
    }

    setCurrentChunk({ current: 0, total: 0 });
    setTeacherBoardWords([]);
    setTeacherBoardHighlightIndex(-1);
  };

  // ─── toggleAutoPlay ──────────────────────────────────────────────────────────

  const toggleAutoPlay = () => {
    if (autoPlayMode) {
      autoPlayRef.current = false;
      if (autoPlayTimerRef.current) { clearTimeout(autoPlayTimerRef.current); autoPlayTimerRef.current = null; }
      stopReading();
    } else {
      autoPlayRef.current = true;
      setAutoPlayMode(true);
      readAloud();
    }
  };

  return {
    // refs (passed to child components that need them)
    audioRef,
    ttsAbortRef,
    autoPlayRef,
    autoPlayTimerRef,

    // state
    isReading,
    isLoadingAudio,
    autoPlayMode,
    autoPlayCountdown,
    speakingIndex,
    highlightedWordIndex,
    currentWords,
    mainTextWordCount,
    teacherBoardWords,
    teacherBoardHighlightIndex,
    currentChunk,
    activeEquationStep,
    setActiveEquationStep,
    showFinalResult,
    setShowFinalResult,
    equationStepChars,
    setEquationStepChars,
    activeStepUnderline,
    explanationWords,

    // actions
    speakWithDeepgram,
    readAloud,
    readTeacherBoard,
    stopReading,
    toggleAutoPlay,
  };
};

export default useTTS;