import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowLeft, RotateCcw, Trophy, Star, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, BookOpen, Sparkles, History,
} from "lucide-react";
import { getScoreColor, getSubjectTheme } from "./TestDashboard";

const getGrade = (pct) => {
  if (pct >= 90) return { label: "Excellent", emoji: "🏆", tag: "A+" };
  if (pct >= 80) return { label: "Great Job", emoji: "🌟", tag: "A" };
  if (pct >= 65) return { label: "Good", emoji: "👍", tag: "B" };
  if (pct >= 50) return { label: "Average", emoji: "📚", tag: "C" };
  return              { label: "Keep Practising", emoji: "💪", tag: "D" };
};

const typeConfig = {
  mcq:           { label: "MCQ",          bg: "bg-violet-50 dark:bg-violet-950/60", text: "text-violet-600 dark:text-violet-400" },
  fill_in_blank: { label: "Fill in Blank", bg: "bg-sky-50 dark:bg-sky-950/60",    text: "text-sky-600 dark:text-sky-400" },
  short_answer:  { label: "Short Answer", bg: "bg-teal-50 dark:bg-teal-950/60",   text: "text-teal-600 dark:text-teal-400" },
  long_answer:   { label: "Long Answer",  bg: "bg-orange-50 dark:bg-orange-950/60", text: "text-orange-600 dark:text-orange-400" },
};

// ─── Circular Score ───────────────────────────────────────────────────────────
const CircularScore = ({ pct }) => {
  const r = 50, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const col = getScoreColor(pct);
  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg width="144" height="144" viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-700/60" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className={col.ring} style={{ transition: "stroke-dashoffset 1.2s ease" }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-3xl font-black ${col.text}`}>{Math.round(pct)}%</span>
      </div>
    </div>
  );
};

// ─── TestResult ───────────────────────────────────────────────────────────────
const TestResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: worksheetIdParam } = useParams();
  const token = localStorage.getItem("token");

  const [expandedQ, setExpandedQ] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Core state — filled either from router state (post-submit) or fetched via attemptId
  const [resultData, setResultData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  // Initialize dark mode from localStorage (same logic as DashboardLayout)
  useEffect(() => {
    const initDarkMode = () => {
      const savedMode = localStorage.getItem("darkMode");
      let isDark = false;
      if (savedMode !== null) {
        isDark = JSON.parse(savedMode);
      } else {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    initDarkMode();
  }, []);

  useEffect(() => {
    const state = location.state;

    if (state?.result) {
      // Came directly from TestPlayer submit — all data in state
      setResultData({
        result: state.result,
        worksheetTitle: state.worksheetTitle,
        worksheetId: state.worksheetId || worksheetIdParam,
        bookTitle: state.bookTitle,
      });
      if (state.questions) setQuestions(state.questions);
      if (state.answers)   setAnswers(state.answers);
    }

    // If we have an attemptId (came from TestAttemptsList), fetch detailed breakdown
    if (state?.attemptId) {
      const fetchDetail = async () => {
        setLoadingDetail(true);
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/books/tests/attempt/${state.attemptId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const d = res.data;
          if (!state.result) {
            setResultData({
              result: { obtainedMarks: d.obtained_marks, totalMarks: d.total_marks, percentage: d.percentage },
              worksheetTitle: d.worksheet_title,
              worksheetId: d.worksheet_id,
              bookTitle: d.book_title,
            });
          }
          // Build questions + answers from stored per-question data
          if (d.answers?.length) {
            const qs = d.answers.map((a) => ({
              q_no: a.question_no,
              question: a.question_text || `Question ${a.question_no}`,
              type: a.question_type || "short_answer",
              marks: a.marks_total || 1,
              correct_answer: a.correct_answer,
              explanation: a.explanation || "",
              options: a.options ? (typeof a.options === "string" ? JSON.parse(a.options) : a.options) : null,
            }));
            setQuestions(qs);
            const ans = {};
            d.answers.forEach((a) => { ans[a.question_no] = a.student_answer; });
            setAnswers(ans);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingDetail(false);
        }
      };
      fetchDetail();
    }
  }, []);

  if (!resultData) {
    navigate("/tests");
    return null;
  }

  const { result, worksheetTitle, worksheetId, bookTitle } = resultData;
  const { obtainedMarks, totalMarks, percentage } = result;
  const pct = parseFloat(percentage) || 0;
  const col = getScoreColor(pct);
  const grade = getGrade(pct);
  const theme = getSubjectTheme(bookTitle || "");

  const mcqQs     = questions.filter((q) => q.type === "mcq" || q.type === "fill_in_blank");
  const writtenQs = questions.filter((q) => q.type === "short_answer" || q.type === "long_answer");

  return (
    <div className="min-h-screen bg-[#f7f6f3] dark:bg-[#111009]">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">

        {/* Back */}
        <div className="flex items-center justify-between mb-8">
          <motion.button whileHover={{ x: -3 }} onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} onClick={() => navigate("/tests/attempts")}
            className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl border-2 border-purple-200 dark:border-purple-700/50 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:shadow-md transition-all">
            <History className="w-3.5 h-3.5" /> All Attempts
          </motion.button>
        </div>

        {/* Hero score card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="bg-white dark:bg-[#1e1a15] rounded-2xl border-2 border-gray-100 dark:border-[#2e2820] shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden mb-6"
        >
          {/* Banner */}
          <div className={`px-6 py-3 flex items-center justify-between bg-gradient-to-r ${col.bar} text-white`}>
            <span className="text-sm font-bold">{grade.emoji} {grade.label}</span>
            <span className="text-xs font-black bg-white/20 px-2.5 py-1 rounded-full">{grade.tag}</span>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <CircularScore pct={pct} />
                <span className="text-xs text-gray-400 font-medium">Final Score</span>
              </div>
              <div className="flex-1 w-full">
                <h1 className="font-bold text-xl text-[#0f0d0a] dark:text-[#f5f0e8] mb-0.5">{worksheetTitle}</h1>
                {bookTitle && (
                  <div className="flex items-center gap-2 mb-5">
                    <span className={`text-xl`}>{theme.emoji}</span>
                    <p className={`text-sm font-semibold ${theme.accent}`}>{bookTitle}</p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: "Obtained", value: obtainedMarks, sub: "marks", colClass: col.text },
                    { label: "Total",    value: totalMarks,    sub: "marks", colClass: "text-gray-900 dark:text-white" },
                    { label: "Questions", value: questions.length || "—", sub: "total", colClass: "text-gray-900 dark:text-white" },
                  ].map(({ label, value, sub, colClass }) => (
                    <div key={label} className="bg-gray-50 dark:bg-[#2a2520] rounded-xl p-3 text-center">
                      <p className={`text-xl font-black ${colClass}`}>{value}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
                      <p className="text-[10px] text-gray-500">{sub}</p>
                    </div>
                  ))}
                </div>
                {/* Score bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Score breakdown</span>
                    <span className={`font-semibold ${col.text}`}>{obtainedMarks} / {totalMarks}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-[#2e2820] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(obtainedMarks / totalMarks) * 100}%` }} transition={{ duration: 1.2 }}
                      className={`h-full rounded-full bg-gradient-to-r ${col.bar}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Type breakdown chips */}
        {(mcqQs.length > 0 || writtenQs.length > 0) && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {mcqQs.length > 0 && (
              <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-[#1e1a15] border-2 border-violet-100 dark:border-violet-900/40 rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Objective</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{mcqQs.length} <span className="text-sm font-normal text-gray-400">questions</span></p>
                <p className="text-xs text-violet-500 dark:text-violet-400 mt-0.5">MCQ + Fill in blank</p>
              </motion.div>
            )}
            {writtenQs.length > 0 && (
              <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-[#1e1a15] border-2 border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Written</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{writtenQs.length} <span className="text-sm font-normal text-gray-400">questions</span></p>
                <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI evaluated</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Answer review */}
        {loadingDetail ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 bg-white dark:bg-[#1e1a15] rounded-xl border border-gray-100 dark:border-[#2e2820] animate-pulse" />
            ))}
          </div>
        ) : questions.length > 0 && (
          <div>
            <h2 className="font-bold text-base text-[#0f0d0a] dark:text-[#f5f0e8] mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" /> Answer Review
            </h2>
            <div className="space-y-3">
              {questions.map((q, idx) => {
                const studentAns = answers[q.q_no] || "";
                const isExpanded = expandedQ === idx;
                const isMcq = q.type === "mcq" || q.type === "fill_in_blank";
                const isCorrect = isMcq ? studentAns.toString().trim().toLowerCase() === q.correct_answer?.toString().trim().toLowerCase() : null;
                const typeMeta = typeConfig[q.type] || { label: q.type, bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600" };

                return (
                  <motion.div key={q.q_no} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                    className="bg-white dark:bg-[#1e1a15] border-2 border-gray-100 dark:border-[#2e2820] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <button onClick={() => setExpandedQ(isExpanded ? null : idx)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-[#2a2520] transition-colors">
                      {/* Status icon */}
                      <span className={`shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-sm font-bold
                        ${isMcq ? isCorrect ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600" : studentAns ? "bg-rose-100 dark:bg-rose-900/50 text-rose-600" : "bg-gray-100 dark:bg-[#2e2820] text-gray-400"
                          : studentAns ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600" : "bg-gray-100 dark:bg-[#2e2820] text-gray-400"}`}>
                        {isMcq ? (isCorrect ? "✓" : studentAns ? "✗" : "—") : "~"}
                      </span>
                      <span className="flex-1 text-sm text-[#1a1510] dark:text-[#e8e0d4] font-medium line-clamp-1">{q.question}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${typeMeta.bg} ${typeMeta.text}`}>{typeMeta.label}</span>
                        <span className="text-xs text-gray-400">{q.marks}m</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-[#2e2820] space-y-3">
                        <p className="text-sm text-[#1a1510] dark:text-[#e8e0d4] leading-relaxed">{q.question}</p>

                        {q.type === "mcq" && q.options && (
                          <div className="space-y-1.5">
                            {Object.entries(q.options).map(([key, val]) => {
                              const isSel = studentAns === key;
                              const isCorr = q.correct_answer === key;
                              return (
                                <div key={key} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs
                                  ${isCorr ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                                    : isSel ? "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
                                    : "text-gray-500 dark:text-gray-400"}`}>
                                  <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0
                                    ${isCorr ? "bg-emerald-500 text-white" : isSel ? "bg-rose-500 text-white" : "bg-gray-200 dark:bg-[#3a342c] text-gray-500"}`}>{key}</span>
                                  <span>{val}</span>
                                  {isCorr && <span className="ml-auto text-[10px] font-semibold">Correct</span>}
                                  {isSel && !isCorr && <span className="ml-auto text-[10px] font-semibold">Your answer</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {q.type !== "mcq" && (
                          <div className="space-y-2">
                            <div className="rounded-lg border border-gray-200 dark:border-[#3a342c] p-3">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Your Answer</p>
                              <p className="text-sm text-[#1a1510] dark:text-[#e8e0d4] leading-relaxed">{studentAns || <span className="italic text-gray-400">Not answered</span>}</p>
                            </div>
                            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/20 p-3">
                              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">Correct Answer</p>
                              <p className="text-sm text-emerald-800 dark:text-emerald-300 leading-relaxed">{q.correct_answer}</p>
                            </div>
                          </div>
                        )}

                        {q.explanation && (
                          <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 p-3">
                            <p className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Explanation</p>
                            <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/test/${worksheetId}`)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold border-2 border-gray-200 dark:border-[#2e2820] bg-white dark:bg-[#1e1a15] text-[#0f0d0a] dark:text-[#f5f0e8] hover:bg-gray-50 dark:hover:bg-[#2a2520] transition flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> Retry Test
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/tests/attempts")}
            className="flex-1 py-3 rounded-xl text-sm font-semibold border-2 border-purple-200 dark:border-purple-700/50 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:shadow-md transition flex items-center justify-center gap-2">
            <History className="w-4 h-4" /> All Attempts
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/tests")}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition shadow-md flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4" /> Back to Subjects
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default TestResult;