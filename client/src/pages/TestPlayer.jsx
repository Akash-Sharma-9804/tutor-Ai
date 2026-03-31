import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const typeConfig = {
  mcq: { label: "MCQ", bg: "bg-violet-50 dark:bg-violet-950/60", text: "text-violet-600 dark:text-violet-400" },
  fill_in_blank: { label: "Fill in Blank", bg: "bg-sky-50 dark:bg-sky-950/60", text: "text-sky-600 dark:text-sky-400" },
  short_answer: { label: "Short Answer", bg: "bg-teal-50 dark:bg-teal-950/60", text: "text-teal-600 dark:text-teal-400" },
  long_answer: { label: "Long Answer", bg: "bg-orange-50 dark:bg-orange-950/60", text: "text-orange-600 dark:text-orange-400" },
};

const getTypeMeta = (type) =>
  typeConfig[type] || { label: type, bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400" };

const TestPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [worksheet, setWorksheet] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const token = localStorage.getItem("token");

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
    const fetchTest = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/books/tests/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = res.data.worksheet;
        setWorksheet(data);
        setQuestions(data.questions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [id]);

  const handleAnswer = (qNo, value) => {
    setAnswers((prev) => ({ ...prev, [qNo]: value }));
  };

  const handleSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/tests/${id}/submit`,
        { worksheetId: id, answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Navigate to result page with full context
      navigate(`/test/${id}/result`, {
        state: {
          result: res.data.result,
          worksheetTitle: worksheet.title,
          worksheetId: id,
          bookTitle: worksheet.book_title,
          questions,
          answers,
        },
      });
    } catch (err) {
      console.error(err);
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentQ];
  const unanswered = questions.length - answeredCount;

  const handleGoBack = () => {
    navigate("/tests");
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading test…</p>
        </div>
      </div>
    );
  }

  if (!worksheet) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-rose-500 text-sm">Test not found</p>
      </div>
    );
  }

  /* ─── Confirm Modal ─── */
  const ConfirmModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
      <div className="relative z-10 bg-white dark:bg-[#1f1f1f] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-200 dark:border-[#2e2e2e]">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg mb-1">Submit Test?</h3>
        {unanswered > 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            You have <span className="font-semibold text-amber-600 dark:text-amber-400">{unanswered} unanswered</span> question{unanswered !== 1 ? "s" : ""}. You can't change answers after submitting.
          </p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            All questions answered. Ready to submit?
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => setShowConfirm(false)}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-[#3a3a3a] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition"
          >
            Review
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );

  /* ─── Sidebar ─── */
  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-gray-100 dark:border-[#2e2e2e]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Questions</p>
        <div className="flex flex-col gap-1.5">
          {[
            { color: "bg-blue-500 dark:bg-blue-600", label: "Current" },
            { color: "bg-emerald-500 dark:bg-emerald-600", label: "Answered" },
            { color: "bg-gray-300 dark:bg-gray-700", label: "Not Attempted" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded ${color}`} />
              <span className="text-[11px] text-gray-500 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-4 gap-2">
          {questions.map((q, index) => {
            const isCurrent = currentQ === index;
            const isAnswered = !!answers[q.q_no];
            return (
              <button
                key={q.q_no}
                onClick={() => { setCurrentQ(index); if (mobile) setSidebarOpen(false); }}
                className={`h-9 w-full rounded-lg text-xs font-semibold transition-all duration-150 focus:outline-none
                  ${isCurrent
                    ? "bg-blue-600 text-white"
                    : isAnswered
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                {q.q_no}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-4 border-t border-gray-100 dark:border-[#2e2e2e] space-y-3">
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Progress</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{answeredCount}/{questions.length}</span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-[#3a3a3a] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}
            />
          </div>
        </div>
        <button
          onClick={() => { setShowConfirm(true); if (mobile) setSidebarOpen(false); }}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition"
        >
          Submit Test
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col">
      {showConfirm && <ConfirmModal />}
      {submitting && (
        <div className="fixed inset-0 z-50 bg-white/80 dark:bg-[#181818]/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Evaluating your answers…</p>
            <p className="text-xs text-gray-400">This may take a moment for written answers</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#1f1f1f]/80 backdrop-blur-md border-b border-gray-100 dark:border-[#2e2e2e] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-4 px-4 sm:px-6 py-3">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200 truncate">
              {worksheet.title}
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              {worksheet.total_questions} Questions · {worksheet.total_marks} Marks
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-900 rounded-xl px-3 py-1.5 border border-gray-200 dark:border-gray-800">
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Question</span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {currentQ + 1} <span className="font-normal text-gray-400">/ {questions.length}</span>
            </span>
          </div>

          {/* Desktop submit */}
          <button
            onClick={() => setShowConfirm(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Submit Test
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-white/80 dark:bg-[#1f1f1f]/80 backdrop-blur-md border-r border-gray-100 dark:border-[#2e2e2e] overflow-hidden">
          <SidebarContent />
        </aside>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 flex md:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="relative z-10 w-64 bg-white dark:bg-[#1f1f1f] h-full shadow-2xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#2e2e2e]">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Question Panel</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a]">
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SidebarContent mobile />
            </div>
          </div>
        )}

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
            {currentQuestion ? (
              <>
                {/* Question card */}
                <div className="bg-white dark:bg-[#1f1f1f] rounded-2xl border border-gray-100 dark:border-[#2e2e2e] shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden">
                  {/* Card header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                        {currentQuestion.q_no}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${getTypeMeta(currentQuestion.type).bg} ${getTypeMeta(currentQuestion.type).text}`}>
                        {getTypeMeta(currentQuestion.type).label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#3a3a3a] rounded-lg px-2.5 py-1">
                      <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{currentQuestion.marks}</span>
                      <span className="text-xs text-gray-400">marks</span>
                    </div>
                  </div>

                  {/* Question body */}
                  <div className="px-6 py-6">
                    <p className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-100 mb-6 font-medium">
                      {currentQuestion.question}
                    </p>

                    {/* MCQ */}
                    {currentQuestion.type === "mcq" && currentQuestion.options && (
                      <div className="space-y-2.5">
                        {Object.entries(currentQuestion.options).map(([key, val]) => {
                          const isSelected = answers[currentQuestion.q_no] === key;
                          let cls = "w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium flex items-center gap-3 transition-all duration-150 focus:outline-none";
                          cls += isSelected
                            ? " bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-200"
                            : " bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600";
                          return (
                            <button key={key} onClick={() => handleAnswer(currentQuestion.q_no, key)} className={cls}>
                              <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isSelected ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>
                                {key}
                              </span>
                              <span className="flex-1">{val}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Text answer */}
                    {currentQuestion.type !== "mcq" && (
                      <textarea
                        rows={currentQuestion.type === "long_answer" ? 7 : 4}
                        value={answers[currentQuestion.q_no] || ""}
                        onChange={(e) => handleAnswer(currentQuestion.q_no, e.target.value)}
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-[#3a3a3a] bg-gray-50 dark:bg-[#252525] text-gray-800 dark:text-gray-200 text-sm leading-relaxed placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition resize-none"
                        placeholder="Write your answer here…"
                      />
                    )}
                  </div>
                </div>

                {/* Nav */}
                <div className="flex items-center justify-between mt-6">
                  <button
                    disabled={currentQ === 0}
                    onClick={() => setCurrentQ((p) => p - 1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#3a3a3a] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <span className="text-xs text-gray-400 font-medium hidden sm:block">{currentQ + 1} of {questions.length}</span>

                  {currentQ === questions.length - 1 ? (
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition"
                    >
                      Submit Test
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQ((p) => p + 1)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition"
                    >
                      Next
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Mobile submit */}
                <div className="sm:hidden mt-4">
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition"
                  >
                    Submit Test ({answeredCount}/{questions.length} answered)
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <p className="text-sm">No questions available</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TestPlayer;