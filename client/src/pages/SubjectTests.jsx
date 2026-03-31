import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Search,
  Star,
  Target,
  Trophy,
  Zap,
  Flame,
  RotateCcw,
  Sparkles,
  BarChart3,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { getScoreColor, RingProgress, getSubjectTheme } from "./TestDashboard";

// ─── difficulty config ────────────────────────────────────────────────────────
const diffColors = {
  easy: { chip: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  medium: { chip: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  hard: { chip: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300", dot: "bg-rose-500" },
};

const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

// ─── WorksheetCard ────────────────────────────────────────────────────────────
const WorksheetCard = ({ test, theme, index, onStart }) => {
  const d = diffColors[test.difficulty?.toLowerCase()] || diffColors.medium;
  const hasBest = test.attempt_count > 0 && test.best_percentage != null;
  const pct = hasBest ? parseFloat(test.best_percentage) : null;
  const col = pct !== null ? getScoreColor(pct) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onStart}
      className="group relative overflow-hidden cursor-pointer rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 p-5 shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {/* Hover glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />

      {/* Attempt ribbon */}
      {hasBest && (
        <div className="absolute top-0 right-0">
          <div className={`px-2.5 py-1 text-[10px] font-bold rounded-bl-xl rounded-tr-2xl bg-gradient-to-r ${col.bar} text-white`}>
            Best: {pct?.toFixed(0)}%
          </div>
        </div>
      )}

      {/* Title + difficulty */}
      <div className="flex items-start gap-3 mb-4 pr-16">
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
          className={`shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-lg shadow-md`}
        >
          {theme.emoji}
        </motion.div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {test.title}
          </h3>
          {test.created_at && (
            <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(test.created_at)}</p>
          )}
        </div>
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${d.chip}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${d.dot}`} />
          {test.difficulty || "Medium"}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
          <BookOpen className="w-3 h-3" /> {test.total_questions} Qs
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
          <Star className="w-3 h-3 fill-amber-500" /> {test.total_marks} marks
        </span>
        {test.attempt_count > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
            <RotateCcw className="w-3 h-3" /> {test.attempt_count}×
          </span>
        )}
      </div>

      {/* Score bar */}
      {hasBest ? (
        <div className="mb-4">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Best Score</span>
            <span className={`font-bold ${col.text}`}>{pct?.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, delay: index * 0.06 + 0.3 }}
              className={`h-full rounded-full bg-gradient-to-r ${col.bar}`}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
            <div className="h-full w-0 rounded-full" />
          </div>
          <span className="text-[11px] text-gray-400 italic">Not attempted</span>
        </div>
      )}

      {/* Footer CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/60">
        {hasBest ? (
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Attempted
          </span>
        ) : (
          <span className="text-[11px] text-gray-400">Ready to attempt</span>
        )}
        <motion.span
          whileHover={{ x: 3 }}
          className={`inline-flex items-center gap-1 text-xs font-bold ${theme.accent}`}
        >
          {hasBest ? "Retry" : "Start"}
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </motion.span>
      </div>
    </motion.div>
  );
};

// ─── SubjectTests ─────────────────────────────────────────────────────────────
const SubjectTests = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const { subject, worksheets: initial = [] } = location.state || {};
  const [worksheets, setWorksheets] = useState(initial);
  const [search, setSearch] = useState("");
  const [filterDiff, setFilterDiff] = useState("all");

  const theme = getSubjectTheme(subject || "");

  useEffect(() => {
    if (!subject) return;
    const refresh = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/books/tests`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const fresh = (res.data.data || []).filter((w) => w.book_title === subject);
        if (fresh.length) setWorksheets(fresh);
      } catch {}
    };
    refresh();
  }, [subject]);

  if (!subject) { navigate("/tests"); return null; }

  const filtered = worksheets.filter((w) => {
    const ms = w.title?.toLowerCase().includes(search.toLowerCase());
    const md = filterDiff === "all" || w.difficulty?.toLowerCase() === filterDiff;
    return ms && md;
  });

  const attempted = worksheets.filter((w) => w.attempt_count > 0);
  const avgPct = attempted.length
    ? attempted.reduce((s, w) => s + parseFloat(w.best_percentage || 0), 0) / attempted.length
    : null;
  const col = avgPct !== null ? getScoreColor(avgPct) : null;
  const totalQ = worksheets.reduce((s, w) => s + (w.total_questions || 0), 0);
  const totalM = worksheets.reduce((s, w) => s + (w.total_marks || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="px-0 sm:px-6 lg:px-8 pt-8 pb-10 space-y-6 text-gray-900 dark:text-white"
    >
      {/* ── HERO BANNER for subject ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -3 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.light} ${theme.dark} border-2 ${theme.border}`}
      >
        {/* decorative blobs */}
        <div className={`absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gradient-to-br ${theme.gradient} opacity-10`} />
        <div className={`absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-gradient-to-br ${theme.gradient} opacity-10`} />

        <div className="relative p-6 sm:p-8">
          {/* Back */}
          <motion.button
            whileHover={{ x: -3 }}
            onClick={() => navigate("/tests")}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-5 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> All Subjects
          </motion.button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {/* Left */}
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-3xl shadow-2xl`}
              >
                {theme.emoji}
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{subject}</h1>
                <p className={`text-sm font-semibold mt-1 ${theme.accent}`}>
                  {worksheets.length} worksheet{worksheets.length !== 1 ? "s" : ""} · {attempted.length} attempted
                </p>
              </div>
            </div>

            {/* Right: score ring + stats */}
            <div className="flex items-center gap-4 flex-wrap">
              {avgPct !== null && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl px-4 py-3 border-2 border-white/60 dark:border-gray-700/40 shadow-lg"
                >
                  <RingProgress pct={avgPct} size={52} />
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">Avg Best Score</p>
                    <p className={`text-xl font-black ${col.text}`}>{avgPct.toFixed(1)}%</p>
                  </div>
                </motion.div>
              )}

              {/* mini stat chips */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/60 dark:border-gray-700/40 shadow-sm">
                  <BookOpen className={`w-4 h-4 ${theme.accent}`} />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{totalQ} questions</span>
                </div>
                <div className="flex items-center gap-2 bg-white/70 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/60 dark:border-gray-700/40 shadow-sm">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{totalM} total marks</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom info bar */}
        <div className="relative border-t border-gray-200/60 dark:border-gray-700/40 bg-white/30 dark:bg-white/5 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200/60 dark:divide-gray-700/40">
            {[
              { icon: <Zap className="h-4 w-4 text-yellow-500" />, label: "AI Evaluated" },
              { icon: <BarChart3 className="h-4 w-4 text-blue-500" />, label: "Score History" },
              { icon: <Sparkles className="h-4 w-4 text-purple-500" />, label: "Explanations" },
              { icon: <TrendingUp className="h-4 w-4 text-emerald-500" />, label: "Retry Anytime" },
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

      {/* ── FILTER ROW ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search worksheets..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {["all", "easy", "medium", "hard"].map((d) => (
            <motion.button
              key={d}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterDiff(d)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-200
                ${filterDiff === d
                  ? `bg-gradient-to-r ${theme.gradient} text-white shadow-md`
                  : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-300 dark:hover:border-purple-600"
                }`}
            >
              {d}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── WORKSHEET GRID ── */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">No worksheets found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters</p>
        </motion.div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Showing <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span> worksheet{filtered.length !== 1 ? "s" : ""}
            </p>
            {attempted.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> {attempted.length} completed
              </span>
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((test, i) => (
              <WorksheetCard
                key={test.id}
                test={test}
                theme={theme}
                index={i}
                onStart={() => navigate(`/test/${test.id}`)}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default SubjectTests;