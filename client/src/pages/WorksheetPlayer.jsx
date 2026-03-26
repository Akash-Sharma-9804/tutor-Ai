import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

/* ── theme helper — reads same localStorage key as TableOfContents ── */
const getDark = () => {
  const s = localStorage.getItem("theme");
  if (s) return s === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
};

const WorksheetPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dark] = useState(getDark);
  const [worksheet, setWorksheet] = useState(null);
  const [showAnswer, setShowAnswer] = useState({});
  const [selected, setSelected] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/any/worksheets/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = res.data.worksheet;
      data.questions =
        typeof data.questions_json === "string"
          ? JSON.parse(data.questions_json)
          : data.questions_json;
      setWorksheet(data);
    };
    fetchData();
  }, []);

  const totalAnswered = Object.keys(showAnswer).length;
  const total = worksheet?.questions?.length || 0;
  const progress = total > 0 ? (totalAnswered / total) * 100 : 0;

  const handleSelect = (qi, key) => {
    if (showAnswer[qi]) return;
    setSelected((prev) => ({ ...prev, [qi]: key }));
  };

  const handleReveal = (qi) => {
    setShowAnswer((prev) => ({ ...prev, [qi]: true }));
  };

  const t = dark ? dk : lt;

  if (!worksheet) {
    return (
      <>
        <WPStyles t={t} dark={dark} />
        <div className="wp-root wp-center">
          <div className="wp-spinner" />
          <span className="wp-loading-text">Loading worksheet…</span>
        </div>
      </>
    );
  }

  return (
    <>
      <WPStyles t={t} dark={dark} />

      <div className="wp-root">

        {/* ── Sticky Header ── */}
        <header className="wp-header">
          <div className="wp-header-inner">
            <div className="wp-header-row">
              <button className="wp-back-btn" onClick={() => navigate(-1)}>
                ← Back
              </button>
              <h1 className="wp-title">{worksheet.title}</h1>
              <div className="wp-progress-chip">
                {totalAnswered}/{total}
              </div>
            </div>
            <div className="wp-bar-row">
              <div className="wp-bar-track">
                <div className="wp-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="wp-bar-pct">{Math.round(progress)}%</span>
            </div>
          </div>
        </header>

        {/* ── Layout ── */}
        <main className="wp-main">
          <div className="wp-layout">

            {/* Sidebar — desktop only */}
            <aside className="wp-sidebar">
              <div className="wp-sidebar-card">
                <p className="wp-sb-label">Questions</p>
                <p className="wp-sb-num">{total}</p>
                <hr className="wp-sb-hr" />
                <p className="wp-sb-label">Answered</p>
                <p className="wp-sb-num wp-sb-accent">{totalAnswered}</p>
                <hr className="wp-sb-hr" />
                <p className="wp-sb-label">Left</p>
                <p className="wp-sb-num">{total - totalAnswered}</p>
                <hr className="wp-sb-hr" />
                <p className="wp-sb-label" style={{ marginBottom: 10 }}>Jump to</p>
                <div className="wp-jump-grid">
                  {worksheet.questions?.map((_, i) => (
                    <a
                      key={i}
                      href={`#wpq${i}`}
                      className={`wp-jdot ${showAnswer[i] ? "jd-done" : selected[i] ? "jd-sel" : ""}`}
                    >
                      {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            </aside>

            {/* Questions feed */}
            <div className="wp-feed">
              {worksheet.questions?.map((q, i) => {
                const isRevealed = showAnswer[i];
                const correctKey = q.correct_answer;
                const userKey = selected[i];
                const hasOptions = q.options && Object.keys(q.options).length > 0;

                return (
                  <div
                    key={i}
                    id={`wpq${i}`}
                    className="wp-card"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className={`wp-card-stripe ${isRevealed ? "stripe-done" : "stripe-idle"}`} />

                    <div className="wp-card-body">
                      {/* question row */}
                      <div className="wp-q-row">
                        <div className={`wp-q-num ${isRevealed ? "qn-done" : ""}`}>
                          {isRevealed ? "✓" : i + 1}
                        </div>
                        <p className="wp-q-text">{q.question}</p>
                      </div>

                      {/* options */}
                      {hasOptions && (
                        <div className="wp-options">
                          {Object.entries(q.options).map(([k, v]) => {
                            let cls = "wp-opt";
                            if (isRevealed) {
                              cls += " wp-opt--disabled";
                              if (k === correctKey) cls += " wp-opt--correct";
                              else if (k === userKey) cls += " wp-opt--wrong";
                            } else if (userKey === k) {
                              cls += " wp-opt--selected";
                            }
                            return (
                              <div key={k} className={cls} onClick={() => handleSelect(i, k)}>
                                <span className="wp-opt-key">{k}</span>
                                <span className="wp-opt-val">{v}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* footer */}
                      <div className="wp-card-foot">
                        {!isRevealed ? (
                          <button className="wp-reveal-btn" onClick={() => handleReveal(i)}>
                            👁 Show Answer
                          </button>
                        ) : (
                          <div className="wp-answer-chip">
                            <span className="wp-ans-check">✓</span>
                            <span>
                              {q.correct_answer}
                              {q.options?.[correctKey] ? ` — ${q.options[correctKey]}` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Done banner */}
              {totalAnswered === total && total > 0 && (
                <div className="wp-done">
                  <div className="wp-done-icon">🎉</div>
                  <h3 className="wp-done-title">Worksheet Complete!</h3>
                  <p className="wp-done-sub">You've reviewed all {total} questions. Great work!</p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

/* ── Design tokens ── */
const lt = {
  bg: "#f7f5f2",
  headerBg: "#ffffff",
  border: "#e8e3dc",
  card: "#ffffff",
  optBg: "#faf8f5",
  text: "#1c1812",
  muted: "#7a6f63",
  faint: "#b0a89e",
  accent: "#b85c2a",
  accentBg: "#fff3eb",
  accentBorder: "#f0ddd0",
  sbBg: "#ffffff",
  jdotBg: "#f0ebe4",
};
const dk = {
  bg: "#141210",
  headerBg: "#1c1a17",
  border: "#2a2620",
  card: "#1e1c19",
  optBg: "#1a1815",
  text: "#f0ebe4",
  muted: "#9a8f83",
  faint: "#5a5248",
  accent: "#d4793a",
  accentBg: "#2d1f12",
  accentBorder: "#3d2a18",
  sbBg: "#1a1815",
  jdotBg: "#252320",
};

/* ── Styles component ── */
const WPStyles = ({ t, dark }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .wp-root {
      min-height: 100vh;
      background: ${t.bg};
      font-family: 'DM Sans', sans-serif;
      color: ${t.text};
    }

    .wp-center {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 14px;
    }

    .wp-loading-text { font-size: 14px; color: ${t.muted}; }

    .wp-spinner {
      width: 36px; height: 36px;
      border: 3px solid ${t.border};
      border-top-color: ${t.accent};
      border-radius: 50%;
      animation: wpspin 0.75s linear infinite;
    }
    @keyframes wpspin { to { transform: rotate(360deg); } }

    /* ── Header ── */
    .wp-header {
      background: ${t.headerBg};
      border-bottom: 1px solid ${t.border};
      position: sticky; top: 0; z-index: 20;
    }

    .wp-header-inner {
      max-width: 1120px; margin: 0 auto;
      padding: 14px 24px 14px;
    }

    .wp-header-row {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 10px;
    }

    .wp-back-btn {
      font-size: 13px; font-weight: 500;
      color: ${t.muted}; background: none; border: none;
      cursor: pointer; font-family: inherit;
      padding: 6px 10px; border-radius: 8px;
      white-space: nowrap; flex-shrink: 0;
      transition: color 0.15s, background 0.15s;
    }
    .wp-back-btn:hover {
      color: ${t.text};
      background: ${dark ? "#2a2620" : "#f0ebe4"};
    }

    .wp-title {
      font-family: 'Lora', serif;
      font-size: clamp(14px, 2vw, 20px);
      font-weight: 700; color: ${t.text};
      flex: 1; line-height: 1.2;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .wp-progress-chip {
      font-size: 12px; font-weight: 600;
      color: ${t.accent};
      background: ${t.accentBg};
      border: 1px solid ${t.accentBorder};
      padding: 4px 10px; border-radius: 100px;
      flex-shrink: 0;
    }

    .wp-bar-row {
      display: flex; align-items: center; gap: 10px;
    }

    .wp-bar-track {
      flex: 1; height: 4px;
      background: ${t.border}; border-radius: 2px; overflow: hidden;
    }

    .wp-bar-fill {
      height: 100%; background: ${t.accent};
      border-radius: 2px; transition: width 0.5s ease;
    }

    .wp-bar-pct {
      font-size: 11px; font-weight: 600; color: ${t.accent};
    }

    /* ── Main ── */
    .wp-main { padding: 28px 20px 80px; }

    .wp-layout {
      max-width: 1120px; margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr;
      gap: 24px;
      align-items: start;
    }

    @media (min-width: 900px) {
      .wp-layout { grid-template-columns: 190px 1fr; }
    }
@media (max-width: 899px) {
  .wp-layout {
    display: flex;
    flex-direction: column;
  }

  .wp-sidebar-card {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    text-align: center;
  }

  .wp-sb-hr {
    display: none;
  }

  .wp-jump-grid {
    grid-column: span 3;
    justify-content: center;
  }
}
    /* ── Sidebar ── */
    .wp-sidebar {
  display: block;
  order: -1;
}
    @media (min-width: 900px) {
  .wp-sidebar {
    position: sticky;
    top: 110px;
  }
}

    .wp-sidebar-card {
      background: ${t.sbBg};
      border: 1px solid ${t.border};
      border-radius: 16px;
      padding: 18px 16px;
    }

    .wp-sb-label {
      font-size: 10px; font-weight: 600;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: ${t.faint}; margin-bottom: 3px;
    }

    .wp-sb-num {
      font-size: 26px; font-weight: 700; color: ${t.text};
    }

    .wp-sb-accent { color: ${t.accent}; }

    .wp-sb-hr {
      border: none; border-top: 1px solid ${t.border};
      margin: 12px 0;
    }

    .wp-jump-grid { display: flex; flex-wrap: wrap; gap: 5px; }

    .wp-jdot {
      width: 28px; height: 28px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 600; text-decoration: none;
      background: ${t.jdotBg};
      color: ${t.muted};
      border: 1px solid ${t.border};
      transition: all 0.15s;
    }
    .wp-jdot:hover { border-color: ${t.accent}; color: ${t.accent}; }
    .jd-done { background: #dcfaec; color: #1d8a52; border-color: #b3e8cf; }
    .jd-sel  { background: ${t.accentBg}; color: ${t.accent}; border-color: ${t.accent}66; }

    /* ── Feed ── */
    .wp-feed { display: flex; flex-direction: column; gap: 12px; }

    /* ── Card ── */
    .wp-card {
      background: ${t.card};
      border: 1px solid ${t.border};
      border-radius: 18px;
      display: flex; overflow: hidden;
      animation: wpCardIn 0.38s ease both;
      transition: box-shadow 0.2s, border-color 0.2s;
    }
    .wp-card:hover {
      box-shadow: 0 4px 20px ${dark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.07)"};
      border-color: ${t.accent}44;
    }
    @keyframes wpCardIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .wp-card-stripe { width: 4px; flex-shrink: 0; }
    .stripe-done { background: #3aaa6e; }
    .stripe-idle { background: ${t.border}; }

    .wp-card-body { flex: 1; padding: 20px 22px; }

    .wp-q-row {
      display: flex; align-items: flex-start; gap: 12px;
      margin-bottom: 16px;
    }

    .wp-q-num {
      width: 30px; height: 30px; flex-shrink: 0;
      border-radius: 9px;
      background: ${t.jdotBg};
      border: 1px solid ${t.border};
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: ${t.accent};
    }
    .qn-done {
      background: #dcfaec; border-color: #b3e8cf; color: #1d8a52;
    }

    .wp-q-text {
      font-size: 15px; font-weight: 500;
      color: ${t.text}; line-height: 1.6; flex: 1;
    }

    /* ── Options: 1 col mobile, 2 col desktop ── */
    .wp-options {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px; margin-bottom: 18px;
    }

    @media (min-width: 640px) {
      .wp-options { grid-template-columns: 1fr 1fr; }
    }

    .wp-opt {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 11px 14px;
      border: 1.5px solid ${t.border};
      border-radius: 11px; cursor: pointer;
      background: ${t.optBg};
      transition: all 0.16s;
    }
    .wp-opt:hover:not(.wp-opt--disabled) {
      border-color: ${t.accent};
      background: ${dark ? "#2d1f12" : "#fff8f3"};
    }
    .wp-opt--selected { border-color: ${t.accent}; background: ${dark ? "#2d1f12" : "#fff8f3"}; }
    .wp-opt--correct  { border-color: #3aaa6e !important; background: ${dark ? "#0d2318" : "#f0faf5"} !important; }
    .wp-opt--wrong    { border-color: #e05555 !important; background: ${dark ? "#2a0f0f" : "#fff3f3"} !important; }
    .wp-opt--disabled { cursor: default; }

    .wp-opt-key {
      width: 22px; height: 22px; flex-shrink: 0;
      border-radius: 7px; border: 1.5px solid ${t.faint};
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 700; color: ${t.muted};
      transition: all 0.14s;
    }
    .wp-opt--selected .wp-opt-key { background: ${t.accent}; border-color: ${t.accent}; color: #fff; }
    .wp-opt--correct .wp-opt-key  { background: #3aaa6e; border-color: #3aaa6e; color: #fff; }
    .wp-opt--wrong .wp-opt-key    { background: #e05555; border-color: #e05555; color: #fff; }

    .wp-opt-val {
      font-size: 13.5px; color: ${t.text}; line-height: 1.4; padding-top: 1px;
    }

    /* ── Card footer ── */
    .wp-card-foot {
      border-top: 1px solid ${t.border};
      padding-top: 14px;
    }

    .wp-reveal-btn {
      display: inline-flex; align-items: center; gap: 7px;
      font-size: 13px; font-weight: 600; color: ${t.accent};
      background: ${t.accentBg}; border: 1.5px solid ${t.accentBorder};
      border-radius: 10px; padding: 8px 16px;
      cursor: pointer; font-family: inherit;
      transition: all 0.18s;
    }
    .wp-reveal-btn:hover {
      background: ${dark ? "#3a2615" : "#ffe9d6"};
      border-color: ${t.accent};
    }

    .wp-answer-chip {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 600; color: #1d8a52;
      background: ${dark ? "#0d2318" : "#f0faf5"};
      border: 1.5px solid ${dark ? "#1a4a30" : "#b3e8cf"};
      border-radius: 10px; padding: 8px 16px;
      animation: wpPop 0.28s ease;
    }
    @keyframes wpPop {
      from { opacity: 0; transform: scale(0.94); }
      to   { opacity: 1; transform: scale(1); }
    }
    .wp-ans-check { font-weight: 800; font-size: 14px; }

    /* ── Done ── */
    .wp-done {
      background: ${t.card}; border: 1px solid ${t.border};
      border-radius: 18px; padding: 40px 28px;
      text-align: center;
    }
    .wp-done-icon { font-size: 44px; margin-bottom: 12px; }
    .wp-done-title {
      font-family: 'Lora', serif;
      font-size: 22px; font-weight: 700;
      color: ${t.text}; margin-bottom: 8px;
    }
    .wp-done-sub { font-size: 14px; color: ${t.muted}; }
  `}</style>
);

export default WorksheetPlayer;