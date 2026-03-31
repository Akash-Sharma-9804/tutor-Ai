import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Trophy,
  BookOpen,
  Star,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  ChevronRight,
  Filter,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  GraduationCap,
  Zap,
} from "lucide-react";
import { getScoreColor, getSubjectTheme, RingProgress } from "./TestDashboard";

const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
};
const formatTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const getGrade = (pct) => {
  if (pct >= 90) return { label: "A+", color: "from-emerald-500 to-green-400" };
  if (pct >= 80) return { label: "A",  color: "from-emerald-400 to-teal-400" };
  if (pct >= 65) return { label: "B",  color: "from-blue-500 to-cyan-400" };
  if (pct >= 50) return { label: "C",  color: "from-amber-500 to-yellow-400" };
  return                 { label: "D",  color: "from-rose-500 to-red-400" };
};

// ─── Single Attempt Card ──────────────────────────────────────────────────────
const AttemptCard = ({ attempt, index, onClick }) => {
  const pct = parseFloat(attempt.percentage || 0);
  const col = getScoreColor(pct);
  const grade = getGrade(pct);
  const theme = getSubjectTheme(attempt.book_title || "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group cursor-pointer relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 p-5 shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {/* Hover glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />

      {/* Grade ribbon */}
      <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl rounded-tr-2xl text-xs font-black text-white bg-gradient-to-r ${grade.color}`}>
        {grade.label}
      </div>

      <div className="flex items-start gap-4 pr-12">
        {/* Subject emoji icon */}
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.4 }}
          className={`shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-xl shadow-md`}
        >
          {theme.emoji}
        </motion.div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {attempt.worksheet_title}
          </h3>
          <p className={`text-xs font-semibold mt-0.5 ${theme.accent}`}>{attempt.book_title}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <Clock className="w-3 h-3" />
              {formatDate(attempt.created_at)} · {formatTime(attempt.created_at)}
            </span>
          </div>
        </div>

        {/* Ring + score */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <RingProgress pct={pct} size={48} />
          <span className="text-[10px] text-gray-400 font-medium">
            {attempt.obtained_marks}/{attempt.total_marks}m
          </span>
        </div>
      </div>

      {/* Score bar + stats row */}
      <div className="mt-4 space-y-2">
        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, delay: index * 0.05 + 0.2 }}
            className={`h-full rounded-full bg-gradient-to-r ${col.bar}`}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badge ?? "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
              {pct.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400/50" />
              {attempt.obtained_marks} / {attempt.total_marks} marks
            </span>
          </div>
          <motion.span
            whileHover={{ x: 3 }}
            className={`inline-flex items-center gap-1 text-xs font-bold ${theme.accent}`}
          >
            View Result <ChevronRight className="w-3.5 h-3.5" />
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── TestAttemptsList ─────────────────────────────────────────────────────────
const TestAttemptsList = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [sortBy, setSortBy] = useState("recent"); // recent | score_high | score_low

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/books/tests/attempts`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAttempts(res.data.attempts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Derived data
  const subjects = ["all", ...new Set(attempts.map((a) => a.book_title).filter(Boolean))];

  const filtered = attempts
    .filter((a) => {
      const ms = a.worksheet_title?.toLowerCase().includes(search.toLowerCase()) ||
                 a.book_title?.toLowerCase().includes(search.toLowerCase());
      const mf = filterSubject === "all" || a.book_title === filterSubject;
      return ms && mf;
    })
    .sort((a, b) => {
      if (sortBy === "score_high") return parseFloat(b.percentage) - parseFloat(a.percentage);
      if (sortBy === "score_low")  return parseFloat(a.percentage) - parseFloat(b.percentage);
      return new Date(b.created_at) - new Date(a.created_at); // recent
    });

  const totalAttempts = attempts.length;
  const avgPct = totalAttempts
    ? attempts.reduce((s, a) => s + parseFloat(a.percentage || 0), 0) / totalAttempts
    : 0;
  const bestPct = totalAttempts ? Math.max(...attempts.map((a) => parseFloat(a.percentage || 0))) : 0;
  const above80 = attempts.filter((a) => parseFloat(a.percentage) >= 80).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="px-0 sm:px-6 lg:px-8 pt-8 pb-10 space-y-6 text-gray-900 dark:text-white"
    >
      {/* ── HERO BANNER ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -3 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#c4b5fd] via-[#FFFFED] to-[#6ee7b7] dark:from-purple-900/40 dark:via-indigo-900/30 dark:to-emerald-900/40"
      >
        <div className={`absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 opacity-10`} />
        <div className="relative p-6 sm:p-8">

          {/* Back */}
          <motion.button
            whileHover={{ x: -3 }}
            onClick={() => navigate("/tests")}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-5 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tests
          </motion.button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-3xl shadow-2xl"
              >
                📋
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  My Test History
                </h1>
                <p className="text-sm font-semibold mt-1 text-purple-600 dark:text-purple-400">
                  All {totalAttempts} attempt{totalAttempts !== 1 ? "s" : ""} across all subjects
                </p>
              </div>
            </div>

            {/* Stats pills */}
            {!loading && totalAttempts > 0 && (
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: <BarChart3 className="w-4 h-4" />, label: "Avg Score", value: `${avgPct.toFixed(1)}%`, col: "from-blue-500 to-cyan-500" },
                  { icon: <Trophy className="w-4 h-4" />, label: "Best", value: `${bestPct.toFixed(0)}%`, col: "from-yellow-500 to-orange-500" },
                  { icon: <CheckCircle2 className="w-4 h-4" />, label: "80%+ Scores", value: above80, col: "from-emerald-500 to-green-500" },
                ].map(({ icon, label, value, col }) => (
                  <div key={label} className="flex items-center gap-2 bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl px-4 py-2.5 border border-white/60 dark:border-gray-700/40 shadow-sm">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${col} text-white`}>{icon}</div>
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">{label}</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative border-t border-purple-200/60 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-purple-200/60 dark:divide-white/10">
            {[
              { icon: <Sparkles className="h-4 w-4 text-purple-500" />, label: "AI Graded" },
              { icon: <GraduationCap className="h-4 w-4 text-blue-500" />, label: "All Subjects" },
              { icon: <RotateCcw className="h-4 w-4 text-emerald-500" />, label: "Retry Anytime" },
              { icon: <Zap className="h-4 w-4 text-amber-500" />, label: "Instant Results" },
            ].map(({ icon, label }) => (
              <div key={label} className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {icon} {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── FILTERS ROW ── */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search worksheets..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition shadow-sm"
          />
        </div>

        {/* Subject filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          {subjects.slice(0, 6).map((s) => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterSubject(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-200
                ${filterSubject === s
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md"
                  : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-300 dark:hover:border-purple-600"
                }`}
            >
              {s === "all" ? "All Subjects" : s}
            </motion.button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs font-semibold border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition shadow-sm"
        >
          <option value="recent">Most Recent</option>
          <option value="score_high">Score: High → Low</option>
          <option value="score_low">Score: Low → High</option>
        </select>
      </div>

      {/* ── CONTENT ── */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5 h-48 animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-3" />
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
            {attempts.length === 0 ? "No attempts yet" : "No results found"}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {attempts.length === 0 ? "Complete a test to see your history here" : "Try adjusting your filters"}
          </p>
          {attempts.length === 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/tests")}
              className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold text-sm shadow-lg"
            >
              Browse Tests
            </motion.button>
          )}
        </motion.div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span> attempt{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((attempt, i) => (
              <AttemptCard
                key={attempt.attempt_id}
                attempt={attempt}
                index={i}
                onClick={() =>
                  navigate(`/test/${attempt.worksheet_id}/result`, {
                    state: {
                      attemptId: attempt.attempt_id,
                      result: {
                        obtainedMarks: attempt.obtained_marks,
                        totalMarks: attempt.total_marks,
                        percentage: attempt.percentage,
                      },
                      worksheetTitle: attempt.worksheet_title,
                      worksheetId: attempt.worksheet_id,
                      bookTitle: attempt.book_title,
                    },
                  })
                }
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default TestAttemptsList;