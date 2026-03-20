/**
 * OnboardingTour.jsx
 *
 * First-time user spotlight tutorial.
 * Stored in localStorage under 'aitutor_tour_done_v1'.
 * Finds elements via data-tour="..." attributes on the page.
 *
 * Add these data-tour attributes in LineByLineReader:
 *   data-tour="read-aloud"   on the Read Aloud button
 *   data-tour="auto-play"    on the Auto-Play button
 *   data-tour="explain"      on the Explain in Detail button
 *   data-tour="pages"        on the sidebar page list wrapper
 *   data-tour="voice"        on the mic/voice button
 *   data-tour="next"         on the Next button
 *
 * Usage:
 *   import OnboardingTour from '../components/OnboardingTour';
 *   <OnboardingTour isReady={!loading} />
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const TOUR_KEY = 'aitutor_tour_done_v1';

const STEPS = [
  {
    target: 'read-aloud',
    emoji: '\uD83D\uDD0A',
    title: 'Read Aloud',
    body: 'Tap this and Andy reads the segment out loud while highlighting each word for you.',
    placement: 'bottom',
  },
  {
    target: 'auto-play',
    emoji: '\u25B6\uFE0F',
    title: 'Auto-Play',
    body: 'Moves through every segment automatically. Sit back and keep learning hands-free!',
    placement: 'bottom',
  },
  {
    target: 'explain',
    emoji: '\uD83E\uDDE0',
    title: 'Explain in Detail',
    body: 'Get a deeper AI breakdown of any concept. Andy writes a full explanation on the board.',
    placement: 'bottom',
  },
  {
    target: 'pages',
    emoji: '\uD83D\uDCC4',
    title: 'Pages & Sections',
    body: 'Jump to any section of the chapter instantly from this sidebar list.',
    placement: 'right',
  },
  {
    target: 'voice',
    emoji: '\uD83C\uDF99\uFE0F',
    title: 'Ask Andy Anything',
    body: 'Tap the mic and ask any question about what you are reading. Andy answers like a real tutor!',
    placement: 'top',
  },
  {
    target: 'next',
    emoji: '\u27A1\uFE0F',
    title: 'Next Segment',
    body: 'Move to the next part of the chapter. You can also just say "next" out loud to Andy!',
    placement: 'top',
  },
];

const TW = 296;
const TH = 190;
const GAP = 14;

function calcPos(box, placement) {
  if (!box) return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let top, left;
  if (placement === 'bottom') { top = box.top + box.height + GAP; left = box.left + box.width / 2 - TW / 2; }
  else if (placement === 'top') { top = box.top - TH - GAP; left = box.left + box.width / 2 - TW / 2; }
  else if (placement === 'right') { top = box.top + box.height / 2 - TH / 2; left = box.left + box.width + GAP; }
  else { top = box.top + box.height / 2 - TH / 2; left = box.left - TW - GAP; }
  top  = Math.max(8, Math.min(top,  vh - TH - 8));
  left = Math.max(8, Math.min(left, vw - TW - 8));
  return { position: 'fixed', top, left, width: TW };
}

export default function OnboardingTour({ isReady = true }) {
  const [phase, setPhase] = useState('hidden'); // hidden | welcome | steps | done
  const [step,  setStep]  = useState(0);
  const [box,   setBox]   = useState(null);
  const rafRef            = useRef(null);

  const finish = useCallback(() => {
    localStorage.setItem(TOUR_KEY, '1');
    setPhase('done');
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (localStorage.getItem(TOUR_KEY)) return;
    const t = setTimeout(() => setPhase('welcome'), 2000);
    return () => clearTimeout(t);
  }, [isReady]);

  useEffect(() => {
    if (phase !== 'steps') return;
    const measure = () => {
      const el = document.querySelector('[data-tour="' + STEPS[step].target + '"]');
      if (el) {
        const r = el.getBoundingClientRect();
        setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        setBox(null);
      }
    };
    measure();
    rafRef.current = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [phase, step]);

  if (phase === 'hidden' || phase === 'done') return null;

  const current  = STEPS[step];
  const isLast   = step === STEPS.length - 1;
  const tipPos   = phase === 'steps' ? calcPos(box, current.placement) : {};

  const spotStyle = box && phase === 'steps' ? {
    position: 'fixed',
    top:    box.top    - 6,
    left:   box.left   - 6,
    width:  box.width  + 12,
    height: box.height + 12,
    borderRadius: 10,
    boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
    zIndex: 10001,
    pointerEvents: 'none',
    outline: '2.5px solid rgba(99,102,241,0.85)',
    transition: 'top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease',
  } : null;

  const btnBase = {
    border: 'none', borderRadius: 9, cursor: 'pointer',
    fontFamily: "'Nunito', system-ui, sans-serif", fontWeight: 700,
  };
  const btnPrimary = {
    ...btnBase,
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    color: '#fff',
    padding: '9px 22px', fontSize: 14,
    boxShadow: '0 4px 18px rgba(99,102,241,0.45)',
  };
  const btnGhost = {
    ...btnBase,
    background: 'transparent',
    border: '1px solid rgba(139,92,246,0.3)',
    color: '#a5b4fc',
    padding: '9px 16px', fontSize: 13,
  };

  const arrowStyle = (() => {
    const base = { position: 'absolute', width: 0, height: 0 };
    if (current.placement === 'bottom') return { ...base, top: -8, left: '50%', transform: 'translateX(-50%)', borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '8px solid #1e1b4b' };
    if (current.placement === 'top')    return { ...base, bottom: -8, left: '50%', transform: 'translateX(-50%)', borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid #1e1b4b' };
    if (current.placement === 'right')  return { ...base, left: -8, top: '50%', transform: 'translateY(-50%)', borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: '8px solid #1e1b4b' };
    return { ...base, right: -8, top: '50%', transform: 'translateY(-50%)', borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '8px solid #1e1b4b' };
  })();

  return (
    <>
      {/* Dim overlay for welcome or when target not found */}
      {(phase === 'welcome' || (phase === 'steps' && !box)) && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(3px)',
          zIndex: 10000,
        }} />
      )}

      {/* Spotlight ring */}
      {spotStyle && <div style={spotStyle} />}

      {/* ── WELCOME CARD ── */}
      {phase === 'welcome' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{
            background: 'linear-gradient(150deg,#1e1b4b 0%,#2d1b69 60%,#1e1b4b 100%)',
            border: '1px solid rgba(139,92,246,0.4)',
            borderRadius: 22, padding: '32px 28px 26px',
            maxWidth: 400, width: '100%', textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.15)',
            animation: 'tourPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
          }}>
            <div style={{
              width: 68, height: 68, borderRadius: '50%',
              background: 'linear-gradient(135deg,#f97316,#ea580c)',
              margin: '0 auto 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 34, boxShadow: '0 8px 24px rgba(249,115,22,0.4)',
            }}>
              {'\uD83D\uDC68\u200D\uD83C\uDFEB'}
            </div>

            <h2 style={{ color: '#e0e7ff', fontFamily: "'Nunito',system-ui,sans-serif", fontSize: 21, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.3px' }}>
              Hi! I am Andy, your AI Tutor
            </h2>
            <p style={{ color: '#c4b5fd', fontFamily: "'Nunito',system-ui,sans-serif", fontSize: 14, lineHeight: 1.6, margin: '0 0 22px' }}>
              Let me show you the tools you have — it only takes 30 seconds!
            </p>

            {/* Feature grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 22, textAlign: 'left' }}>
              {[
                ['\uD83D\uDD0A', 'Read Aloud'],
                ['\u25B6\uFE0F', 'Auto-Play'],
                ['\uD83E\uDDE0', 'AI Explain'],
                ['\uD83C\uDF99\uFE0F', 'Ask Anything'],
              ].map(([em, lb]) => (
                <div key={lb} style={{
                  background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 10, padding: '8px 10px',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 18 }}>{em}</span>
                  <span style={{ color: '#a5b4fc', fontFamily: "'Nunito',sans-serif", fontSize: 13, fontWeight: 600 }}>{lb}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={finish} style={btnGhost}>Skip</button>
              <button onClick={() => setPhase('steps')} style={btnPrimary}>
                Show me around &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP TOOLTIP ── */}
      {phase === 'steps' && (
        <div style={{
          ...tipPos, zIndex: 10002,
          background: 'linear-gradient(150deg,#1e1b4b,#2d1b69)',
          border: '1px solid rgba(139,92,246,0.4)',
          borderRadius: 16, padding: '15px 16px 13px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(99,102,241,0.1)',
          animation: 'tourSlide 0.22s ease',
        }}>
          {/* Arrow */}
          <div style={arrowStyle} />

          {/* Progress bar dots */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 11, alignItems: 'center' }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                height: 5,
                width: i === step ? 20 : 5,
                borderRadius: 3,
                background: i < step ? 'rgba(99,102,241,0.5)' : i === step ? '#818cf8' : 'rgba(99,102,241,0.2)',
                transition: 'width 0.3s, background 0.3s',
              }} />
            ))}
            <span style={{ marginLeft: 'auto', color: 'rgba(167,139,250,0.45)', fontFamily: "'Nunito',sans-serif", fontSize: 11 }}>
              {step + 1} / {STEPS.length}
            </span>
          </div>

          {/* Icon + text */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 13, alignItems: 'flex-start' }}>
            <div style={{
              width: 40, height: 40, flexShrink: 0,
              background: 'rgba(99,102,241,0.2)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              {current.emoji}
            </div>
            <div>
              <h3 style={{ color: '#e0e7ff', fontFamily: "'Nunito',sans-serif", fontSize: 14.5, fontWeight: 800, margin: '0 0 4px' }}>
                {current.title}
              </h3>
              <p style={{ color: '#c4b5fd', fontFamily: "'Nunito',sans-serif", fontSize: 13, lineHeight: 1.55, margin: 0 }}>
                {current.body}
              </p>
            </div>
          </div>

          {/* Nav buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} style={{ ...btnGhost, padding: '6px 12px', fontSize: 12 }}>
                &larr; Back
              </button>
            ) : <div />}
            <div style={{ flex: 1 }} />
            <button onClick={finish} style={{ background: 'none', border: 'none', color: 'rgba(167,139,250,0.35)', fontSize: 11, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", padding: '4px 6px' }}>
              Skip
            </button>
            {isLast ? (
              <button onClick={finish} style={{ ...btnPrimary, padding: '7px 18px', fontSize: 13 }}>
                Got it! {'\uD83C\uDF89'}
              </button>
            ) : (
              <button onClick={() => setStep(s => s + 1)} style={{ ...btnPrimary, padding: '7px 18px', fontSize: 13 }}>
                Next &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes tourPop {
          from { opacity:0; transform:scale(0.88) translateY(14px); }
          to   { opacity:1; transform:scale(1)    translateY(0); }
        }
        @keyframes tourSlide {
          from { opacity:0; transform:translateY(7px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </>
  );
}