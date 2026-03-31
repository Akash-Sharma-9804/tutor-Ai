import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

// ── helpers ────────────────────────────────────────────────────────────────────
const typeConfig = {
  mcq:           { label: "MCQ",           color: "violet" },
  fill_in_blank: { label: "Fill in Blank", color: "sky"    },
  short_answer:  { label: "Short Answer",  color: "teal"   },
  long_answer:   { label: "Long Answer",   color: "amber"  },
};
const getTypeMeta = (t) =>
  typeConfig[t] || { label: t || "Question", color: "gray" };

const colorMap = {
  violet: { pill: "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300" },
  sky:    { pill: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"             },
  teal:   { pill: "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"         },
  amber:  { pill: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"     },
  gray:   { pill: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"            },
};

function getGrade(pct) {
  if (pct >= 90) return { label: "A+", color: "text-emerald-500", desc: "Outstanding"   };
  if (pct >= 80) return { label: "A",  color: "text-emerald-500", desc: "Excellent"     };
  if (pct >= 70) return { label: "B",  color: "text-blue-500",    desc: "Good"          };
  if (pct >= 60) return { label: "C",  color: "text-indigo-500",  desc: "Average"       };
  if (pct >= 40) return { label: "D",  color: "text-amber-500",   desc: "Below Average" };
  return               { label: "F",  color: "text-rose-500",    desc: "Needs Work"    };
}

function CircleProgress({ pct, size = 120, stroke = 10 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    const t = setTimeout(() => setOffset(circ - (pct / 100) * circ), 120);
    return () => clearTimeout(t);
  }, [pct, circ]);

  const grade = getGrade(pct);
  const color =
    pct >= 70 ? "#10b981" :
    pct >= 50 ? "#6366f1" :
    pct >= 35 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="currentColor" strokeWidth={stroke}
          className="text-[#e8e2d9] dark:text-[#252220]" />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-black ${grade.color}`}>{grade.label}</span>
        <span className="text-xs font-semibold text-[#a09589] dark:text-[#7a6f65] mt-0.5">{pct}%</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  const accentMap = {
    green:  "from-emerald-500/10 to-emerald-500/5 border-emerald-200 dark:border-emerald-900/40",
    red:    "from-rose-500/10 to-rose-500/5 border-rose-200 dark:border-rose-900/40",
    amber:  "from-amber-500/10 to-amber-500/5 border-amber-200 dark:border-amber-900/40",
    indigo: "from-indigo-500/10 to-indigo-500/5 border-indigo-200 dark:border-indigo-900/40",
  };
  const valMap = {
    green:  "text-emerald-600 dark:text-emerald-400",
    red:    "text-rose-500 dark:text-rose-400",
    amber:  "text-amber-600 dark:text-amber-400",
    indigo: "text-indigo-600 dark:text-indigo-400",
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${accentMap[accent]} p-4 flex flex-col gap-1`}>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-[#a09589] dark:text-[#7a6f65]">{label}</span>
      <span className={`text-3xl font-black tabular-nums ${valMap[accent]}`}>{value}</span>
      {sub && <span className="text-xs text-[#b0a899] dark:text-[#5a5550]">{sub}</span>}
    </div>
  );
}

function AnswerCard({ ans }) {
  const [open, setOpen] = useState(false);
  const meta = getTypeMeta(ans.type);
  const pill = colorMap[meta.color]?.pill || colorMap.gray.pill;

  const skipped = !ans.student_answer || ans.student_answer.trim() === "";
  const statusIcon = skipped
    ? { icon: "⊘", cls: "bg-[#f5f0eb] dark:bg-[#252220] text-[#b0a899]"                               }
    : ans.is_correct
    ? { icon: "✓", cls: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"  }
    : { icon: "✗", cls: "bg-rose-100 dark:bg-rose-950/50 text-rose-500 dark:text-rose-400"              };

  const isWritten = ans.type === "short_answer" || ans.type === "long_answer";

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white dark:bg-[#141312]
      ${skipped
        ? "border-[#e8e2d9] dark:border-[#252220]"
        : ans.is_correct
        ? "border-emerald-200 dark:border-emerald-900/50"
        : "border-rose-200 dark:border-rose-900/50"}`}>

      <button onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left focus:outline-none">
        <span className="shrink-0 w-8 h-8 rounded-xl bg-[#f0ebe4] dark:bg-[#1e1c18] text-[#8a7f72] text-sm font-bold flex items-center justify-center">
          {ans.q_no}
        </span>
        <span className="flex-1 text-sm font-medium text-[#1a1510] dark:text-[#e8e2d9] line-clamp-1 text-left">
          {ans.question}
        </span>
        <span className={`hidden sm:inline-flex shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${pill}`}>
          {meta.label}
        </span>
        <span className="shrink-0 text-xs font-bold tabular-nums text-[#c8763a]">
          {ans.marks_awarded}/{ans.max_marks}
        </span>
        <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${statusIcon.cls}`}>
          {statusIcon.icon}
        </span>
        <svg className={`shrink-0 w-4 h-4 text-[#c0b9b0] dark:text-[#4a4540] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-[#f0ebe4] dark:border-[#1e1c18] pt-4">
          {ans.type === "mcq" && ans.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(ans.options).map(([k, v]) => {
                const isCorrect     = k === ans.correct_answer;
                const isStudentPick = k === ans.student_answer;
                return (
                  <div key={k} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border
                    ${isCorrect
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
                      : isStudentPick && !isCorrect
                      ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800"
                      : "bg-[#faf8f5] dark:bg-[#1a1815] border-[#e8e2d9] dark:border-[#252220]"}`}>
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0
                      ${isCorrect ? "bg-emerald-500 text-white"
                        : isStudentPick ? "bg-rose-500 text-white"
                        : "bg-[#e8e2d9] dark:bg-[#2a2620] text-[#8a7f72]"}`}>{k}</span>
                    <span className="text-[#1a1510] dark:text-[#e8e2d9]">{v}</span>
                    {isCorrect && <span className="ml-auto text-emerald-600 dark:text-emerald-400 text-xs font-semibold">✓ Correct</span>}
                    {isStudentPick && !isCorrect && <span className="ml-auto text-rose-500 text-xs font-semibold">Your pick</span>}
                  </div>
                );
              })}
            </div>
          )}

          {!skipped ? (
            <div className={`rounded-xl p-3 border text-sm
              ${ans.is_correct
                ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40"}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${ans.is_correct ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                {ans.is_correct ? "✓ Your Answer" : "✗ Your Answer"}
              </p>
              <p className="text-[#1a1510] dark:text-[#e8e2d9] leading-relaxed">{ans.student_answer}</p>
            </div>
          ) : (
            <div className="rounded-xl p-3 border border-[#e8e2d9] dark:border-[#252220] bg-[#faf8f5] dark:bg-[#1a1815]">
              <p className="text-xs text-[#b0a899] dark:text-[#5a5550] italic">Not answered</p>
            </div>
          )}

          {(!ans.is_correct || skipped) && (
            <div className="rounded-xl p-3 border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Model Answer</p>
              <p className="text-sm text-[#1a1510] dark:text-[#e8e2d9] leading-relaxed">{ans.correct_answer}</p>
            </div>
          )}

          {isWritten && ans.evaluation_reason && !skipped && (
            <div className="rounded-xl p-3 border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50 dark:bg-indigo-950/20 flex gap-2">
              <svg className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
              </svg>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-0.5">AI Feedback</p>
                <p className="text-xs text-[#4a4f7a] dark:text-[#9098d0] leading-relaxed">{ans.evaluation_reason}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
// Route: /chapter/:chapterId/worksheet/:worksheetId/attempts/:attemptId/result
const WorksheetResult = () => {
  const { chapterId, worksheetId, attemptId } = useParams();
  const location  = useLocation();
  const navigate  = useNavigate();
  const token     = localStorage.getItem("token");
  const { bookId: stateBookId } = location.state || {};
  const bookId = stateBookId; // bookId from state

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filter,  setFilter]  = useState("all");

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const isDark = saved !== null
      ? JSON.parse(saved)
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    const fetchResult = async (id) => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/worksheets/${worksheetId}/attempts/${id}/result`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) setResult(res.data.result);
        else setError("Result not found.");
      } catch {
        setError("Failed to load result.");
      } finally {
        setLoading(false);
      }
    };

    // attemptId always in URL (from both post-submit redirect + View Result button)
    if (attemptId) {
      fetchResult(attemptId);
    } else {
      const id = location.state?.result?.attemptId;
      if (id) fetchResult(id);
      else { setError("No attempt found."); setLoading(false); }
    }
  }, [attemptId, chapterId, worksheetId]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f3ef] dark:bg-[#0e0d0b]">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-[3px] border-[#e8e2d9] dark:border-[#2a2620]" />
        <div className="absolute inset-0 rounded-full border-[3px] border-t-[#c8763a] animate-spin" />
      </div>
      <p className="text-sm text-[#a09589] dark:text-[#7a6f65] font-medium tracking-wide">Calculating your result…</p>
    </div>
  );

  if (error || !result) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f3ef] dark:bg-[#0e0d0b] gap-4">
      <p className="text-sm text-rose-500">{error || "Result not found."}</p>
      <button onClick={() => navigate(-1)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Go back</button>
    </div>
  );

  const { answers = [], percentage, obtainedMarks, totalMarks,
          worksheetTitle, correctCount, incorrectCount, skippedCount,
          totalQuestions, submittedAt } = result;

  const grade = getGrade(Math.round(percentage));

  const filtered = answers.filter((a) => {
    const skipped = !a.student_answer || a.student_answer.trim() === "";
    if (filter === "correct") return a.is_correct;
    if (filter === "wrong")   return !a.is_correct && !skipped;
    if (filter === "skipped") return skipped;
    return true;
  });

  const submittedDate = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen bg-[#f6f3ef] dark:bg-[#0e0d0b] font-sans">

      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0e0d0b]/80 backdrop-blur-md border-b border-[#e8e2d9] dark:border-[#1e1c18]">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-4">
          <button onClick={() => navigate(`/chapter/${chapterId}/worksheets/${bookId}`, { replace: true })}
            className="flex items-center gap-1.5 text-sm text-[#8a7f72] dark:text-[#9a8f83] hover:text-[#1a1510] dark:hover:text-[#f0ebe4] transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </button>
          <span className="text-xs font-semibold text-[#c8763a] uppercase tracking-widest">Result</span>
          {submittedDate && (
            <span className="text-xs text-[#b0a899] dark:text-[#5a5550] hidden sm:block">{submittedDate}</span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">

        {/* Hero card */}
        <div className="rounded-3xl bg-white dark:bg-[#141312] border border-[#e8e2d9] dark:border-[#252220] shadow-sm overflow-hidden">
          <div className={`h-1.5 w-full ${
            percentage >= 70 ? "bg-gradient-to-r from-emerald-400 to-teal-500"  :
            percentage >= 50 ? "bg-gradient-to-r from-indigo-400 to-violet-500" :
            percentage >= 35 ? "bg-gradient-to-r from-amber-400 to-orange-500"  :
            "bg-gradient-to-r from-rose-400 to-pink-500"
          }`} />
          <div className="p-6 sm:p-8">
            <h1 className="text-base font-semibold text-[#8a7f72] dark:text-[#9a8f83] mb-0.5 tracking-wide">
              {worksheetTitle || "Chapter Worksheet"}
            </h1>
            <p className={`text-2xl sm:text-3xl font-black mb-6 ${grade.color}`}>{grade.desc}</p>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <div className="shrink-0">
                <CircleProgress pct={Math.round(percentage)} size={140} stroke={12} />
              </div>
              <div className="flex-1 w-full space-y-5">
                <div className="text-center sm:text-left">
                  <p className="text-5xl sm:text-6xl font-black tabular-nums text-[#1a1510] dark:text-[#f0ebe4]">
                    {obtainedMarks}
                    <span className="text-2xl font-medium text-[#b0a899] dark:text-[#5a5550]">/{totalMarks}</span>
                  </p>
                  <p className="text-sm text-[#a09589] dark:text-[#7a6f65] mt-1">marks obtained</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Correct"  value={correctCount}   sub={`of ${totalQuestions}`} accent="green"  />
                  <StatCard label="Wrong"    value={incorrectCount} sub="questions"              accent="red"    />
                  <StatCard label="Skipped"  value={skippedCount}   sub="unanswered"             accent="amber"  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-base font-bold text-[#1a1510] dark:text-[#f0ebe4]">Question Breakdown</h2>
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#141312] border border-[#e8e2d9] dark:border-[#252220] rounded-xl p-1">
              {[
                { key: "all",     label: "All"       },
                { key: "correct", label: "✓ Correct" },
                { key: "wrong",   label: "✗ Wrong"   },
                { key: "skipped", label: "⊘ Skipped" },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filter === tab.key
                      ? "bg-[#1a1510] dark:bg-[#f0ebe4] text-white dark:text-[#1a1510] shadow-sm"
                      : "text-[#8a7f72] dark:text-[#9a8f83] hover:bg-[#f6f3ef] dark:hover:bg-[#1e1c18]"
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-sm text-[#b0a899] dark:text-[#5a5550]">
                No questions in this category.
              </div>
            ) : (
              filtered.map((ans) => <AnswerCard key={ans.q_no} ans={ans} />)
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
         
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3.5 rounded-2xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-200 dark:shadow-indigo-900/20 flex items-center justify-center gap-2">
            All Worksheets
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
};

export default WorksheetResult;