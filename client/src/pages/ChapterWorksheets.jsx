import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, FileText, ClipboardList, ChevronRight,
  Layers, Clock, Award, CheckCircle, BarChart2
} from "lucide-react";

const subjectColors = {
  Mathematics: "from-indigo-600 to-blue-500",
  Science: "from-green-500 to-emerald-500",
  Physics: "from-blue-600 to-cyan-500",
  Chemistry: "from-purple-500 to-pink-500",
  Biology: "from-green-600 to-teal-500",
  History: "from-amber-500 to-orange-500",
  Geography: "from-teal-500 to-cyan-500",
  English: "from-violet-500 to-purple-500",
  "Computer Science": "from-orange-500 to-amber-500",
  default: "from-blue-600 to-purple-600",
};

const getSubjectGradient = (subjectName) => {
  if (!subjectName) return subjectColors.default;
  const key = Object.keys(subjectColors).find((k) =>
    subjectName.toLowerCase().includes(k.toLowerCase())
  );
  return subjectColors[key] || subjectColors.default;
};

const ChapterWorksheets = () => {
  // Route: /chapter/:chapterId/worksheets/:bookId
  const { chapterId, bookId } = useParams();
  const navigate = useNavigate();

  const [worksheets, setWorksheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectGradient, setSubjectGradient] = useState(subjectColors.default);

  // dark mode
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const isDark =
      saved !== null
        ? JSON.parse(saved)
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // 1. Fetch worksheets
        const wsRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/worksheets`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const wsList = wsRes.data.worksheets || [];

        if (wsRes.data.book) {
          setSubjectGradient(getSubjectGradient(wsRes.data.book.subject_name));
        }

        setWorksheets(wsList);
      } catch (err) {
        console.error("Error fetching worksheets:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [chapterId]);

  // 📊 Average score across attempted worksheets
  const attemptedWorksheets = worksheets.filter(ws => ws.attempt_id);
  const avgScore = attemptedWorksheets.length > 0
    ? Math.round(
        attemptedWorksheets.reduce((sum, ws) => sum + (ws.percentage || 0), 0) /
        attemptedWorksheets.length
      )
    : null;

  // 🔓 Progressive unlock logic
  const processedWorksheets = worksheets.map((ws, index) => {
    const prev = worksheets[index - 1];

    const isFirst = index === 0;

    const prevAttempted = prev
      ? !!prev.attempt_id
      : false;

    const unlocked = isFirst || prevAttempted;

    return {
      ...ws,
      unlocked
    };
  });

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-full overflow-hidden">

      {/* ── HEADER CARD ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${subjectGradient} rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white mb-4 sm:mb-6 relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-8 -mt-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-6 -mb-6" />

        <div className="relative z-10">
          <button
            onClick={() => navigate(`/book/${bookId}`)}
            className="flex items-center gap-1.5 text-xs sm:text-sm text-white/80 hover:text-white mb-3 sm:mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Chapters</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
              <ClipboardList className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-white/80 mb-0.5">Chapter Resources</p>
              <h1 className="font-bold text-lg sm:text-2xl mb-1">Practice Worksheets</h1>
              <p className="text-xs sm:text-sm text-white/80">Reinforce your understanding chapter by chapter</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <FileText size={14} />
                  <span className="text-xs sm:text-sm font-medium">Available</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold mt-1">{worksheets.length}</p>
                <p className="text-[10px] sm:text-xs text-white/70">worksheets</p>
              </div>

              {avgScore !== null && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <BarChart2 size={14} />
                    <span className="text-xs sm:text-sm font-medium">Avg Score</span>
                  </div>
                  <p className={`text-2xl sm:text-3xl font-bold mt-1 ${
                    avgScore >= 70 ? "text-emerald-300" :
                    avgScore >= 40 ? "text-amber-300" :
                    "text-rose-300"
                  }`}>{avgScore}%</p>
                  <p className="text-[10px] sm:text-xs text-white/70">
                    {attemptedWorksheets.length}/{worksheets.length} done
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── WORKSHEETS LIST ───────────────────────────────────────────────────── */}
      <div className="lg:w-[60vw] mx-auto">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 flex items-center gap-2">
          <Layers size={18} className="text-blue-600 dark:text-blue-400" />
          <span>Practice Worksheets</span>
          <span className="text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400">
            ({worksheets.length})
          </span>
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-[#1e1c19] rounded-xl p-4 sm:p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : worksheets.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#1e1c19] rounded-2xl border border-gray-200 dark:border-white/10">
            <FileText className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No worksheets available for this chapter yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {processedWorksheets.map((ws, i) => {
              const attempt = ws.attempt_id
                ? {
                  id: ws.attempt_id,
                  obtained_marks: ws.obtained_marks,
                  total_marks: ws.total_marks,
                  percentage: ws.percentage,
                }
                : null;
              const attempted = !!attempt;
              const pct = attempt ? Math.round(attempt.percentage) : null;

              return (
                <motion.div
                  key={ws.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-[#1e1c19] border border-gray-200 dark:border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-5 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">

                    {/* Icon */}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${subjectGradient} text-white shadow-md`}>
                      <FileText size={20} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-xs sm:text-base text-gray-900 dark:text-gray-100 leading-snug break-words flex items-center gap-1">
                        {ws.title}
                        {!ws.unlocked && <span>🔒</span>}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${subjectGradient} text-white`}>
                          <ClipboardList size={10} />
                          {ws.total_questions} questions
                        </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${subjectGradient} text-white`}>
                          <ClipboardList size={10} />
                          {ws.worksheet_total_marks} Marks
                        </span>
                        {attempted && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle size={10} />
                            Attempted · {pct}%
                          </span>
                        )}
                        {ws.time_limit && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock size={10} />
                            {ws.time_limit} min
                          </span>
                        )}
                        {ws.passing_score && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Award size={10} />
                            Pass: {ws.passing_score}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      {/* View Result button — only if attempted */}
                      {attempted && (
                        <button
                          onClick={() =>
                            navigate(
                              `/chapter/${chapterId}/worksheet/${ws.id}/attempts/${attempt.id}/result`,
                              { state: { bookId } }
                            )
                          }
                          className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-all"
                        >
                          <BarChart2 size={14} />
                          <span className="hidden sm:inline">View Result</span>
                          <span className="sm:hidden">Result</span>
                        </button>
                      )}

                      {/* Start / Retry button */}
                      <button
                        disabled={!ws.unlocked || attempted}
                        onClick={() => {
                          if (ws.unlocked && !attempted) {
                            navigate(`/chapter/${chapterId}/worksheet/${ws.id}`, { state: { bookId } });
                          }
                        }}
                        className={`flex items-center justify-center gap-1.5 w-full sm:w-auto px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md
    ${!ws.unlocked
                            ? "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                            : attempted
                              ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                              : `bg-gradient-to-r ${subjectGradient} text-white hover:opacity-90 hover:shadow-lg`
                          }`}
                      >
                        <span>
                          {!ws.unlocked
                            ? "Locked"
                            : attempted
                              ? "Completed"
                              : "Start"}
                        </span>

                        {ws.unlocked && !attempted && <ChevronRight size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Score bar — only if attempted */}
                  {attempted && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                        <span>Score: {attempt.obtained_marks}/{attempt.total_marks} marks</span>
                        <span className={`font-bold ${pct >= 70 ? "text-emerald-600 dark:text-emerald-400" :
                            pct >= 40 ? "text-amber-600 dark:text-amber-400" :
                              "text-rose-500 dark:text-rose-400"
                          }`}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${pct >= 70 ? "from-emerald-400 to-teal-500" :
                              pct >= 40 ? "from-amber-400 to-orange-500" :
                                "from-rose-400 to-pink-500"
                            }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterWorksheets;