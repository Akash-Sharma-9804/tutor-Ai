import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const typeConfig = {
  mcq: {
    label: "MCQ",
    bg: "bg-violet-50 dark:bg-violet-950/50",
    text: "text-violet-600 dark:text-violet-400",
  },
  fill_in_blank: {
    label: "Fill in Blank",
    bg: "bg-sky-50 dark:bg-sky-950/50",
    text: "text-sky-600 dark:text-sky-400",
  },
  short_answer: {
    label: "Short Answer",
    bg: "bg-teal-50 dark:bg-teal-950/50",
    text: "text-teal-600 dark:text-teal-400",
  },
  long_answer: {
    label: "Long Answer",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    text: "text-amber-600 dark:text-amber-400",
  },
};
const getTypeMeta = (type) =>
  typeConfig[type] || {
    label: type || "Question",
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-500 dark:text-gray-400",
  };

// Route: /chapter/:chapterId/worksheet/:worksheetId
const WorksheetPlayer = () => {
  const { id, chapterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { bookId: stateBookId } = location.state || {};
  const bookId = stateBookId; // bookId from state

  const [worksheet, setWorksheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("token");

  // dark mode
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const isDark =
      saved !== null
        ? JSON.parse(saved)
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // fetch worksheet
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/worksheets/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = res.data.worksheet;
        data.questions =
          typeof data.questions_json === "string"
            ? JSON.parse(data.questions_json)
            : data.questions_json ?? [];
        setWorksheet(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, chapterId]);

  const questions = worksheet?.questions ?? [];
  const total = questions.length;
  const currentQuestion = questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const unanswered = total - answeredCount;
  const progress = total ? Math.round((answeredCount / total) * 100) : 0;

  const handleAnswer = (qNo, value) =>
    setAnswers((p) => ({ ...p, [qNo]: value }));

  const handleSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/worksheets/${id}/submit`,
        { worksheetId: id, answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/chapter/${chapterId}/worksheet/${id}/attempts/${res.data.result.attemptId}/result`, {
        state: {
          result: res.data.result,
          worksheetTitle: worksheet.title,
          worksheetId: id,
          chapterId,
          bookId,
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

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f3ef] dark:bg-[#0e0d0b]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-[3px] border-[#e8e2d9] dark:border-[#2a2620]" />
          <div className="absolute inset-0 rounded-full border-[3px] border-t-[#c8763a] animate-spin" />
        </div>
        <p className="mt-4 text-sm font-medium text-[#a09589] dark:text-[#7a6f65] tracking-wide">
          Loading worksheet…
        </p>
      </div>
    );
  }

  if (!worksheet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f3ef] dark:bg-[#0e0d0b]">
        <p className="text-sm text-rose-500">Worksheet not found.</p>
      </div>
    );
  }

  // ── Confirm Modal ──────────────────────────────────────────────────────────
  const ConfirmModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setShowConfirm(false)}
      />
      <div className="relative z-10 bg-white dark:bg-[#1a1815] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-[#e8e2d9] dark:border-[#2a2620]">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="font-bold text-[#1a1510] dark:text-[#f0ebe4] text-lg mb-1">
          Submit Worksheet?
        </h3>
        {unanswered > 0 ? (
          <p className="text-sm text-[#8a7f72] dark:text-[#7a6f65] mb-5">
            You have{" "}
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {unanswered} unanswered
            </span>{" "}
            question{unanswered !== 1 ? "s" : ""}. You can't change answers after submitting.
          </p>
        ) : (
          <p className="text-sm text-[#8a7f72] dark:text-[#7a6f65] mb-5">
            All {total} questions answered. Ready to submit and see your score?
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => setShowConfirm(false)}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-[#e8e2d9] dark:border-[#2a2620] text-[#8a7f72] dark:text-[#9a8f83] hover:bg-[#f6f3ef] dark:hover:bg-[#252220] transition"
          >
            Review
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );

  // ── Sidebar ────────────────────────────────────────────────────────────────
  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-[#e8e2d9] dark:border-[#252220]">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#a09589] mb-3">
          Legend
        </p>
        <div className="flex flex-col gap-1.5">
          {[
            { color: "bg-indigo-500", label: "Current" },
            { color: "bg-emerald-500", label: "Answered" },
            { color: "bg-[#e8e2d9] dark:bg-[#2a2620]", label: "Not Attempted" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
              <span className="text-xs text-[#8a7f72] dark:text-[#7a6f65]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-4 gap-1.5">
          {questions.map((q, index) => {
            const isCurrent = currentQ === index;
            const isAnswered = !!answers[q.q_no];
            return (
              <button
                key={q.q_no}
                onClick={() => {
                  setCurrentQ(index);
                  if (mobile) setSidebarOpen(false);
                }}
                className={`h-9 w-full rounded-lg text-xs font-semibold transition-all focus:outline-none ${
                  isCurrent
                    ? "bg-indigo-600 text-white shadow-md"
                    : isAnswered
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    : "bg-[#f0ebe4] dark:bg-[#252220] text-[#8a7f72] hover:bg-[#e8e2d9] dark:hover:bg-[#2a2620]"
                }`}
              >
                {q.q_no}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-4 border-t border-[#e8e2d9] dark:border-[#252220] space-y-3">
        <div>
          <div className="flex justify-between text-xs text-[#a09589] mb-1.5">
            <span>Progress</span>
            <span className="font-semibold text-[#1a1510] dark:text-[#e8e2d9]">
              {answeredCount}/{total}
            </span>
          </div>
          <div className="h-1.5 bg-[#e8e2d9] dark:bg-[#252220] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <button
          onClick={() => {
            setShowConfirm(true);
            if (mobile) setSidebarOpen(false);
          }}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition"
        >
          Submit Worksheet
        </button>
      </div>
    </div>
  );

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f6f3ef] dark:bg-[#0e0d0b] flex flex-col">
      {showConfirm && <ConfirmModal />}

      {/* Submitting overlay */}
      {submitting && (
        <div className="fixed inset-0 z-50 bg-white/80 dark:bg-[#0e0d0b]/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-[3px] border-indigo-100 dark:border-indigo-900/50" />
              <div className="absolute inset-0 rounded-full border-[3px] border-t-indigo-500 animate-spin" />
            </div>
            <p className="text-sm font-medium text-[#1a1510] dark:text-[#e8e2d9]">
              Evaluating your answers…
            </p>
            <p className="text-xs text-[#a09589]">
              AI grading may take a moment for written answers
            </p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#131210]/80 backdrop-blur-md border-b border-[#e8e2d9] dark:border-[#252220]">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#8a7f72] dark:text-[#9a8f83] hover:bg-[#f0ebe4] dark:hover:bg-[#2a2620] transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg bg-[#f0ebe4] dark:bg-[#252220] text-[#8a7f72]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-[#1a1510] dark:text-[#f0ebe4] truncate">
              {worksheet.title}
            </h1>
            <p className="text-xs text-[#a09589] hidden sm:block">
              {total} Questions · {worksheet.total_marks} Marks
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-[#faf8f5] dark:bg-[#1a1815] border border-[#e8e2d9] dark:border-[#252220] rounded-xl px-3 py-1.5">
            <span className="text-xs text-[#a09589]">Q</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {currentQ + 1}
            </span>
            <span className="text-xs text-[#a09589]">/ {total}</span>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Submit
          </button>
        </div>

        {/* Thin progress bar */}
        <div className="h-0.5 bg-[#e8e2d9] dark:bg-[#252220]">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-white/90 dark:bg-[#131210]/90 border-r border-[#e8e2d9] dark:border-[#252220] overflow-hidden">
          <SidebarContent />
        </aside>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 flex md:hidden">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative z-10 w-64 bg-white dark:bg-[#171614] h-full shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e2d9] dark:border-[#252220]">
                <span className="text-sm font-semibold text-[#1a1510] dark:text-[#f0ebe4]">
                  Questions
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#f0ebe4] dark:hover:bg-[#2a2620]"
                >
                  <svg className="w-4 h-4 text-[#8a7f72]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SidebarContent mobile />
            </div>
          </div>
        )}

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
            {currentQuestion ? (
              <>
                {/* Question card */}
                <div className="bg-white dark:bg-[#171614] rounded-2xl border border-[#e8e2d9] dark:border-[#252220] shadow-sm overflow-hidden">
                  {/* Card header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0ebe4] dark:border-[#1e1c18] bg-[#faf8f5] dark:bg-[#131210]">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white text-sm font-bold flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-900/30">
                        {currentQuestion.q_no}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${getTypeMeta(currentQuestion.type).bg} ${getTypeMeta(currentQuestion.type).text}`}
                      >
                        {getTypeMeta(currentQuestion.type).label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-[#1e1c18] border border-[#e8e2d9] dark:border-[#252220] rounded-lg px-2.5 py-1">
                      <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {currentQuestion.marks}
                      </span>
                      <span className="text-xs text-[#a09589]">marks</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-6">
                    <p className="text-[15px] leading-relaxed text-[#1a1510] dark:text-[#e8e2d9] font-medium mb-6">
                      {currentQuestion.question}
                    </p>

                    {/* MCQ */}
                    {currentQuestion.type === "mcq" && currentQuestion.options && (
                      <div className="space-y-2.5">
                        {Object.entries(currentQuestion.options).map(([key, val]) => {
                          const isSelected = answers[currentQuestion.q_no] === key;
                          return (
                            <button
                              key={key}
                              onClick={() => handleAnswer(currentQuestion.q_no, key)}
                              className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium flex items-center gap-3 transition-all duration-150 focus:outline-none ${
                                isSelected
                                  ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-600"
                                  : "bg-[#faf8f5] dark:bg-[#131210] border-[#e8e2d9] dark:border-[#252220] hover:bg-white dark:hover:bg-[#1a1815] hover:border-indigo-300 dark:hover:border-indigo-700"
                              }`}
                            >
                              <span
                                className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                  isSelected
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30"
                                    : "bg-[#e8e2d9] dark:bg-[#252220] text-[#8a7f72]"
                                }`}
                              >
                                {key}
                              </span>
                              <span className="flex-1 text-[#1a1510] dark:text-[#e8e2d9]">{val}</span>
                              {isSelected && (
                                <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Fill in blank */}
                    {currentQuestion.type === "fill_in_blank" && (
                      <input
                        type="text"
                        value={answers[currentQuestion.q_no] || ""}
                        onChange={(e) => handleAnswer(currentQuestion.q_no, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#e8e2d9] dark:border-[#252220] bg-[#faf8f5] dark:bg-[#131210] text-[#1a1510] dark:text-[#e8e2d9] text-sm placeholder-[#c0b9b0] dark:placeholder-[#4a4540] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                        placeholder="Type your answer here…"
                      />
                    )}

                    {/* Short / long answer */}
                    {(currentQuestion.type === "short_answer" ||
                      currentQuestion.type === "long_answer") && (
                      <textarea
                        rows={currentQuestion.type === "long_answer" ? 7 : 4}
                        value={answers[currentQuestion.q_no] || ""}
                        onChange={(e) => handleAnswer(currentQuestion.q_no, e.target.value)}
                        className="w-full p-4 rounded-xl border border-[#e8e2d9] dark:border-[#252220] bg-[#faf8f5] dark:bg-[#131210] text-[#1a1510] dark:text-[#e8e2d9] text-sm leading-relaxed placeholder-[#c0b9b0] dark:placeholder-[#4a4540] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition resize-none"
                        placeholder="Write your answer here…"
                      />
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-5">
                  <button
                    disabled={currentQ === 0}
                    onClick={() => setCurrentQ((p) => p - 1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-[#171614] border border-[#e8e2d9] dark:border-[#252220] text-[#8a7f72] dark:text-[#9a8f83] hover:bg-[#f6f3ef] dark:hover:bg-[#1e1c18] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <span className="text-xs text-[#a09589] font-medium hidden sm:block">
                    {currentQ + 1} of {total}
                  </span>

                  {currentQ === total - 1 ? (
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-md shadow-indigo-200 dark:shadow-indigo-900/20"
                    >
                      Submit Worksheet
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQ((p) => p + 1)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition"
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
                    className="w-full py-3 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition"
                  >
                    Submit Worksheet ({answeredCount}/{total} answered)
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-[#a09589]">
                <p className="text-sm">No questions available.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorksheetPlayer;