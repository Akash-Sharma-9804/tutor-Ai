/**
 * VoiceController.jsx
 *
 * Floating mic button + live answer panel.
 * Updated for streaming: shows text chunk-by-chunk as AI generates it.
 * Barge-in button visible while AI is speaking.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import useVoice from '../hooks/useVoice';
import { useNarration } from './AudioPlayer';
import cleanForTTS from '../utils/cleanForTTS';

// ── CSS injection ─────────────────────────────────────────────────────────────
let cssInjected = false;
const injectCSS = () => {
  if (cssInjected || typeof document === 'undefined') return;
  cssInjected = true;
  const s = document.createElement('style');
  s.textContent = `
    @keyframes pulse-ring {
      0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.5), 0 8px 24px rgba(239,68,68,0.35); }
      70%  { box-shadow: 0 0 0 14px rgba(239,68,68,0), 0 8px 24px rgba(239,68,68,0.35); }
      100% { box-shadow: 0 0 0 0 rgba(239,68,68,0), 0 8px 24px rgba(239,68,68,0.35); }
    }
    @keyframes speaking-pulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(99,210,165,0.5), 0 8px 24px rgba(99,210,165,0.3); }
      50%     { box-shadow: 0 0 0 10px rgba(99,210,165,0), 0 8px 24px rgba(99,210,165,0.3); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .vc-streaming-word {
      display: inline;
      animation: fadeIn 0.15s ease forwards;
    }
  `;
  document.head.appendChild(s);
};

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  wrapper: {
    position: 'fixed',
    bottom: '120px',
    right: '16px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '10px',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  panel: {
    background: 'rgba(12, 12, 20, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '18px',
    padding: '16px 18px',
    color: '#fff',
    maxWidth: '320px',
    minWidth: '240px',
    boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    marginBottom: '10px',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  dot: (color) => ({
    width: '6px', height: '6px',
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  }),
  transcript: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.55)',
    fontStyle: 'italic',
    lineHeight: 1.5,
    marginBottom: '8px',
    minHeight: '18px',
  },
  answerBox: {
    background: 'rgba(99,210,165,0.08)',
    border: '1px solid rgba(99,210,165,0.18)',
    borderRadius: '12px',
    padding: '10px 13px',
    fontSize: '14px',
    color: '#a8f5d3',
    lineHeight: 1.65,
    marginTop: '4px',
  },
  streamingBox: {
    background: 'rgba(99,102,241,0.08)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '12px',
    padding: '10px 13px',
    fontSize: '14px',
    color: '#c7d2fe',
    lineHeight: 1.65,
    marginTop: '4px',
    minHeight: '40px',
  },
  offTopicBox: {
    background: 'rgba(250,180,90,0.08)',
    border: '1px solid rgba(250,180,90,0.2)',
    borderRadius: '12px',
    padding: '10px 13px',
    fontSize: '13px',
    color: '#fbd38d',
    lineHeight: 1.55,
    marginTop: '4px',
  },
  garbledBox: {
    background: 'rgba(148,163,184,0.08)',
    border: '1px solid rgba(148,163,184,0.2)',
    borderRadius: '12px',
    padding: '10px 13px',
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: 1.55,
    marginTop: '4px',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    borderRadius: '8px',
    padding: '7px 11px',
    fontSize: '12px',
    color: '#fca5a5',
    marginTop: '4px',
  },
  btnRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  micBtn: (isListening, disabled) => ({
    width: '62px',
    height: '62px',
    borderRadius: '50%',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    outline: 'none',
    flexShrink: 0,
    background: isListening
      ? 'linear-gradient(135deg,#ef4444,#dc2626)'
      : 'linear-gradient(135deg,#6366f1,#4f46e5)',
    boxShadow: isListening
      ? '0 0 0 0 rgba(239,68,68,0.4), 0 8px 24px rgba(239,68,68,0.35)'
      : '0 8px 24px rgba(99,102,241,0.35)',
    animation: isListening ? 'pulse-ring 1.5s ease-out infinite' : 'none',
    opacity: disabled ? 0.5 : 1,
  }),
  interruptBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '1px solid rgba(99,210,165,0.3)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(99,210,165,0.12)',
    color: '#63d2a5',
    transition: 'all 0.2s',
    outline: 'none',
    animation: 'speaking-pulse 2s ease infinite',
  },
  iconBtn: (active) => ({
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.5)',
    transition: 'all 0.2s',
    outline: 'none',
  }),
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const MicIcon  = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
  </svg>
);
const StopIcon = () => (
  <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
    <rect x="6" y="6" width="12" height="12" rx="2"/>
  </svg>
);
const HandIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M7 11V7a2 2 0 0 1 4 0v3m0 0V6a2 2 0 0 1 4 0v5m0 0v-2a2 2 0 0 1 4 0v5a7 7 0 0 1-7 7H9a7 7 0 0 1-5-5v-3a2 2 0 0 1 4 0"/>
  </svg>
);
const SpinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)"
    strokeWidth={2.5} style={{ animation: 'spin 0.9s linear infinite' }}>
    <path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
  </svg>
);
const SpeakerIcon = ({ active }) => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    {active && <path strokeLinecap="round" d="M15.54 8.46a5 5 0 0 1 0 7.07"/>}
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
const VoiceController = ({
  chapterId,
  getVisibleText,
  getCurrentSegment,
  onCommand,
  onAnswer: onAnswerProp,
  className,
  autoNarrate = false,
  currentSegmentText = '',
  onNarrationEnd,
  onStopNarration,   // NEW: called when voice mode stops autoplay
}) => {
  injectCSS();

  const [showPanel,  setShowPanel]  = useState(false);
  const [error,      setError]      = useState('');
  const [answer,     setAnswer]     = useState(null);    // finalized answer
  const errorTimerRef = useRef(null);

  const handleAnswer = useCallback((msg) => {
    setAnswer({ text: msg.text, isOffTopic: !!msg.isOffTopic, isRepeat: !!msg.isRepeat, isGarbled: !!msg.isGarbled });
    onAnswerProp?.(msg);
  }, [onAnswerProp]);

  const handleError = useCallback((msg) => {
    setError(msg);
    clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(''), 4000);
  }, []);

  const voice = useVoice({
    chapterId,
    getVisibleText,
    getCurrentSegment,
    onAnswer: handleAnswer,
    onCommand: (cmd) => {
      onCommand?.(cmd);
      if (cmd === 'repeat') setAnswer(null);
    },
    onError: handleError,
  });

  const narration = useNarration({ silenced: voice.isListening });

  // Sync context to server
  useEffect(() => {
    if (currentSegmentText) voice.updateContext(currentSegmentText, getCurrentSegment?.());
  }, [currentSegmentText]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-narrate
  useEffect(() => {
    if (!autoNarrate || !currentSegmentText || voice.isListening) return;
    const cleaned = cleanForTTS(currentSegmentText);
    if (!cleaned) return;
    let cancelled = false;
    (async () => {
      await narration.narrateText(cleaned);
      if (!cancelled) onNarrationEnd?.();
    })();
    return () => { cancelled = true; narration.stopNarration(); };
  }, [currentSegmentText, autoNarrate, voice.isListening]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop narration when mic activates
  useEffect(() => {
    if (voice.isListening) narration.stopNarration();
  }, [voice.isListening]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = async () => {
    setAnswer(null);
    setError('');
    if (!showPanel) setShowPanel(true);
    // Stop autoplay/narration when activating voice mode
    if (!voice.isListening) {
      narration.stopNarration();
      onStopNarration?.();
    }
    await voice.toggle();
  };

  const handleInterrupt = () => {
    voice.interrupt();
    setAnswer(null);
  };

  const getStatus = () => {
    if (voice.isProcessing)    return ['#a78bfa', 'Thinking'];
    if (voice.isSpeaking)      return ['#63d2a5', 'Speaking'];
    if (voice.isListening)     return ['#ef4444', 'Listening'];
    if (narration.isNarrating) return ['#60a5fa', 'Reading'];
    return ['rgba(255,255,255,0.25)', 'Ready'];
  };
  const [dotColor, statusLabel] = getStatus();

  // Show streaming text while AI generates, then switch to finalized answer
  const showStreaming = !!voice.streamingText && !answer;
  const showAnswer   = !!answer;

  return (
    <div style={S.wrapper} className={className}>
      {/* Panel */}
      {showPanel && (
        <div style={S.panel}>
          {/* Status row */}
          <div style={S.statusRow}>
            <span style={S.dot(dotColor)}/>
            <span>{statusLabel}</span>
            {voice.isProcessing && <SpinIcon/>}
          </div>

          {/* Partial transcript */}
          {(voice.partialTranscript || voice.isListening) && (
            <div style={S.transcript}>
              {voice.partialTranscript || 'Listening…'}
            </div>
          )}

          {/* Live streaming answer (word by word) */}
          {showStreaming && (
            <div style={S.streamingBox}>
              {voice.streamingText}
              <span style={{ display: 'inline-block', width: '2px', height: '1em',
                background: '#818cf8', marginLeft: '2px', animation: 'spin 1s steps(1) infinite',
                verticalAlign: 'text-bottom', borderRadius: '1px' }}/>
            </div>
          )}

          {/* Finalized answer */}
          {showAnswer && !answer.isOffTopic && !answer.isGarbled && (
            <div style={S.answerBox}>{answer.text}</div>
          )}
          {showAnswer && answer.isOffTopic && (
            <div style={S.offTopicBox}>{answer.text}</div>
          )}
          {showAnswer && answer.isGarbled && (
            <div style={S.garbledBox}>{answer.text}</div>
          )}

          {/* Error */}
          {error && <div style={S.errorBox}>{error}</div>}

          {/* Narration control */}
          {autoNarrate && (
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                style={S.iconBtn(narration.isNarrating)}
                onClick={() => narration.isNarrating ? narration.stopNarration() : onNarrationEnd?.()}
                title={narration.isNarrating ? 'Stop reading' : 'Resume reading'}
              >
                <SpeakerIcon active={narration.isNarrating}/>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      <div style={S.btnRow}>
        {/* Interrupt button — visible while AI is speaking */}
        {voice.isSpeaking && (
          <button style={S.interruptBtn} onClick={handleInterrupt} title="Stop speaking (barge in)">
            <HandIcon/>
          </button>
        )}

        {/* Panel toggle */}
        {!voice.isListening && (
          <button
            style={{ ...S.iconBtn(showPanel), width: '38px', height: '38px', fontSize: '13px' }}
            onClick={() => setShowPanel(p => !p)}
            title={showPanel ? 'Hide' : 'Show voice panel'}
          >
            {showPanel ? '✕' : '⌃'}
          </button>
        )}

        {/* Main mic button */}
        <button
          data-tour="voice"
          style={S.micBtn(voice.isListening, false)}
          onClick={handleToggle}
          title={voice.isListening ? 'Stop' : 'Ask a question'}
          aria-label={voice.isListening ? 'Stop voice input' : 'Start voice input'}
        >
          {voice.isListening ? <StopIcon/> : <MicIcon/>}
        </button>
      </div>
    </div>
  );
};

export default VoiceController;