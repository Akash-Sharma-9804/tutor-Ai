import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Search,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Zap,
  BarChart3,
  GraduationCap,
  History,
} from "lucide-react";

// ─── shared helpers ───────────────────────────────────────────────────────────
export const getScoreColor = (pct) => {
  if (pct >= 80) return {
    bar: "from-emerald-400 to-green-500", text: "text-emerald-600 dark:text-emerald-400",
    bg: "from-emerald-500/10 to-green-500/10",
    badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
    ring: "text-emerald-500",
  };
  if (pct >= 50) return {
    bar: "from-amber-400 to-yellow-500", text: "text-amber-600 dark:text-amber-400",
    bg: "from-amber-500/10 to-yellow-500/10",
    badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    ring: "text-amber-500",
  };
  return {
    bar: "from-rose-400 to-red-500", text: "text-rose-600 dark:text-rose-400",
    bg: "from-rose-500/10 to-red-500/10",
    badge: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
    ring: "text-rose-500",
  };
};

export const RingProgress = ({ pct, size = 56 }) => {
  const r = 18, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const col = getScoreColor(pct);
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 44 44" className="-rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeWidth="3.5" className="text-gray-100 dark:text-gray-700/60" />
        <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeWidth="3.5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className={col.ring} style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <span className={`absolute text-[9px] font-black ${col.text}`}>{Math.round(pct)}%</span>
    </div>
  );
};

export const subjectThemes = {
  Mathematics: { emoji: "📐", gradient: "from-blue-500 to-cyan-400", light: "from-blue-50 to-cyan-50", dark: "dark:from-blue-900/20 dark:to-cyan-900/20", border: "border-blue-200 dark:border-blue-800/40", accent: "text-blue-600 dark:text-blue-400" },
  Science:     { emoji: "🔬", gradient: "from-green-500 to-emerald-400", light: "from-green-50 to-emerald-50", dark: "dark:from-green-900/20 dark:to-emerald-900/20", border: "border-green-200 dark:border-green-800/40", accent: "text-green-600 dark:text-green-400" },
  English:     { emoji: "📚", gradient: "from-purple-500 to-pink-400", light: "from-purple-50 to-pink-50", dark: "dark:from-purple-900/20 dark:to-pink-900/20", border: "border-purple-200 dark:border-purple-800/40", accent: "text-purple-600 dark:text-purple-400" },
  "Social Science": { emoji: "🌍", gradient: "from-orange-500 to-amber-400", light: "from-orange-50 to-amber-50", dark: "dark:from-orange-900/20 dark:to-amber-900/20", border: "border-orange-200 dark:border-orange-800/40", accent: "text-orange-600 dark:text-orange-400" },
  Physics:     { emoji: "⚛️", gradient: "from-indigo-500 to-purple-400", light: "from-indigo-50 to-purple-50", dark: "dark:from-indigo-900/20 dark:to-purple-900/20", border: "border-indigo-200 dark:border-indigo-800/40", accent: "text-indigo-600 dark:text-indigo-400" },
  Chemistry:   { emoji: "🧪", gradient: "from-teal-500 to-cyan-400", light: "from-teal-50 to-cyan-50", dark: "dark:from-teal-900/20 dark:to-cyan-900/20", border: "border-teal-200 dark:border-teal-800/40", accent: "text-teal-600 dark:text-teal-400" },
  Biology:     { emoji: "🧬", gradient: "from-lime-500 to-green-400", light: "from-lime-50 to-green-50", dark: "dark:from-lime-900/20 dark:to-green-900/20", border: "border-lime-200 dark:border-lime-800/40", accent: "text-lime-600 dark:text-lime-400" },
  History:     { emoji: "🏛️", gradient: "from-amber-500 to-yellow-400", light: "from-amber-50 to-yellow-50", dark: "dark:from-amber-900/20 dark:to-yellow-900/20", border: "border-amber-200 dark:border-amber-800/40", accent: "text-amber-600 dark:text-amber-400" },
  Geography:   { emoji: "🗺️", gradient: "from-rose-500 to-pink-400", light: "from-rose-50 to-pink-50", dark: "dark:from-rose-900/20 dark:to-pink-900/20", border: "border-rose-200 dark:border-rose-800/40", accent: "text-rose-600 dark:text-rose-400" },
};
export const getSubjectTheme = (name) =>
  subjectThemes[name] || { emoji: "📖", gradient: "from-gray-500 to-slate-400", light: "from-gray-50 to-slate-50", dark: "dark:from-gray-900/20 dark:to-slate-900/20", border: "border-gray-200 dark:border-gray-700/40", accent: "text-gray-600 dark:text-gray-400" };

// ─── SubjectCard ──────────────────────────────────────────────────────────────
const SubjectCard = ({ subjectName, worksheets, index, onView }) => {
  const theme = getSubjectTheme(subjectName);
  const attempted = worksheets.filter((w) => w.attempt_count > 0);
  const avgPct = attempted.length ? attempted.reduce((s, w) => s + parseFloat(w.best_percentage || 0), 0) / attempted.length : null;
  const col = avgPct !== null ? getScoreColor(avgPct) : null;
  const diffCounts = worksheets.reduce((acc, w) => { const d = w.difficulty?.toLowerCase() || "medium"; acc[d] = (acc[d] || 0) + 1; return acc; }, {});
  const diffColors = { easy: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300", medium: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300", hard: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onView}
      className={`group relative overflow-hidden cursor-pointer rounded-2xl bg-gradient-to-br ${theme.light} ${theme.dark} border-2 ${theme.border} p-5 shadow-lg hover:shadow-2xl transition-all duration-300`}
    >
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${theme.gradient} opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500`} />
      <div className="relative flex items-start justify-between gap-2 mb-4">
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-xl shadow-lg shrink-0`}>{theme.emoji}</motion.div>
          <div className="min-w-0">
            <h2 className="font-bold text-base text-gray-900 dark:text-white leading-snug truncate">{subjectName}</h2>
            <p className={`text-xs font-medium mt-0.5 ${theme.accent}`}>{worksheets.length} worksheet{worksheets.length !== 1 ? "s" : ""} · {attempted.length} done</p>
          </div>
        </div>
        {avgPct !== null ? <RingProgress pct={avgPct} size={52} /> : (
          <div className="w-[52px] h-[52px] shrink-0 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
            <span className="text-[10px] text-gray-400 font-medium">—</span>
          </div>
        )}
      </div>
      {Object.keys(diffCounts).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {Object.entries(diffCounts).map(([d, count]) => (
            <span key={d} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${diffColors[d] || diffColors.medium}`}>{count} {d}</span>
          ))}
        </div>
      )}
      <div className="mb-4">
        <div className="flex justify-between text-[11px] mb-1.5">
          <span className="text-gray-500 dark:text-gray-400 font-medium">Avg. Best Score</span>
          {avgPct !== null ? <span className={`font-bold ${col.text}`}>{avgPct.toFixed(1)}%</span> : <span className="text-gray-400">Not started</span>}
        </div>
        <div className="h-2 bg-gray-200/70 dark:bg-gray-700/50 rounded-full overflow-hidden">
          {avgPct !== null && (
            <motion.div initial={{ width: 0 }} animate={{ width: `${avgPct}%` }} transition={{ duration: 0.8, delay: index * 0.07 + 0.3 }}
              className={`h-full rounded-full bg-gradient-to-r ${col.bar}`} />
          )}
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-200/60 dark:border-gray-700/40">
        <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <BookOpen className="w-3.5 h-3.5" />{worksheets.reduce((s, w) => s + (w.total_questions || 0), 0)} questions
        </span>
        <motion.span whileHover={{ x: 3 }} className={`inline-flex items-center gap-1 text-xs font-bold ${theme.accent}`}>
          View Tests <ChevronRight className="w-3.5 h-3.5" />
        </motion.span>
      </div>
    </motion.div>
  );
};

// ─── TestDashboard ────────────────────────────────────────────────────────────
const TestDashboard = () => {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/books/tests`, { headers: { Authorization: `Bearer ${token}` } });
        const data = res.data.data || [];
        const groups = {};
        data.forEach((w) => { const key = w.book_title || "Unknown Subject"; if (!groups[key]) groups[key] = []; groups[key].push(w); });
        setGrouped(groups);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchTests();
  }, []);

  const filteredEntries = Object.entries(grouped).filter(([subject]) => subject.toLowerCase().includes(search.toLowerCase()));
  const totalWorksheets = Object.values(grouped).reduce((s, arr) => s + arr.length, 0);
  const totalAttempted = Object.values(grouped).reduce((s, arr) => s + arr.filter((w) => w.attempt_count > 0).length, 0);
  const allAttempted = Object.values(grouped).flat().filter((w) => w.attempt_count > 0);
  const overallAvg = allAttempted.length ? allAttempted.reduce((s, w) => s + parseFloat(w.best_percentage || 0), 0) / allAttempted.length : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
      className="px-0 sm:px-6 lg:px-8 pt-8 pb-10 space-y-6 text-gray-900 dark:text-white"
    >
      {/* ── HERO ── */}
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} whileHover={{ y: -4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#a78bfa] via-[#FFFFED] to-[#34d399] dark:from-purple-900/40 dark:via-blue-900/30 dark:to-emerald-900/40"
      >
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 sm:p-8">
          <div className="space-y-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg">✨ AI-Evaluated Tests</span>
              <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-white shadow-lg"><Trophy className="h-3 w-3 inline mr-1" /> Track Progress</span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-gray-900 dark:text-white">
                Your{" "}<span className="bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400 bg-clip-text text-transparent">Test Portal</span>
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">Attempt worksheets, get AI-evaluated scores, and track your subject-wise performance over time.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { label: "Subjects", value: Object.keys(grouped).length, color: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800/40" },
                { label: "Worksheets", value: totalWorksheets, color: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800/40" },
                { label: "Attempted", value: totalAttempted, color: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800/40" },
              ].map(({ label, value, color, border }) => (
                <div key={label} className={`text-center p-3 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border ${border}`}>
                  <div className={`text-2xl font-bold ${color}`}>{loading ? "—" : value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* History CTA button */}
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/tests/attempts")}
              className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/70 dark:bg-white/10 backdrop-blur-sm border-2 border-purple-300 dark:border-purple-700/60 text-purple-700 dark:text-purple-300 font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-200"
            >
              <History className="w-4 h-4" />
              View My Test History
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Right floating illustration */}
          <div className="hidden lg:flex items-center justify-center gap-6 relative">
            {[
              { emoji: "📝", delay: 0, color: "from-purple-500 to-indigo-500", rot: "-rotate-12", pos: "top-4 left-12" },
              { emoji: "🏆", delay: 0.3, color: "from-yellow-400 to-orange-500", rot: "rotate-6", pos: "top-8 right-12" },
              { emoji: "📊", delay: 0.15, color: "from-blue-500 to-cyan-400", rot: "rotate-12", pos: "bottom-4 left-20" },
              { emoji: "🧠", delay: 0.45, color: "from-emerald-400 to-teal-500", rot: "-rotate-6", pos: "bottom-8 right-16" },
            ].map(({ emoji, delay, color, rot, pos }) => (
              <motion.div key={emoji} animate={{ y: [0, -10, 0] }} transition={{ duration: 3 + delay, repeat: Infinity, ease: "easeInOut", delay }}
                className={`absolute ${pos} w-16 h-16 bg-gradient-to-br ${color} rounded-2xl shadow-2xl flex items-center justify-center text-2xl ${rot}`}>{emoji}</motion.div>
            ))}
            {overallAvg !== null && (
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
                className="relative z-10 w-32 h-32 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-2xl flex flex-col items-center justify-center border-2 border-purple-200 dark:border-purple-700/40">
                <span className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">{overallAvg.toFixed(0)}%</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-semibold">Overall Avg</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative border-t border-purple-200/60 dark:border-white/10 bg-white/30 dark:bg-white/5 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-purple-200/60 dark:divide-white/10">
            {[
              { icon: <Zap className="h-4 w-4 text-yellow-500" />, label: "AI Evaluated" },
              { icon: <BarChart3 className="h-4 w-4 text-blue-500" />, label: "Score Tracking" },
              { icon: <Target className="h-4 w-4 text-pink-500" />, label: "Per-Q Feedback" },
              { icon: <TrendingUp className="h-4 w-4 text-emerald-500" />, label: "Progress Insights" },
            ].map(({ icon, label }) => (
              <div key={label} className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">{icon} {label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── SECTION HEADER + SEARCH ── */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-10 dark:opacity-20" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">All Subjects</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Click a subject to see its worksheets</p>
            </div>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search subjects..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition shadow-sm" />
          </div>
        </div>
      </div>

      {/* ── GRID ── */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5 h-52 animate-pulse">
              <div className="flex justify-between mb-4"><div className="flex gap-3"><div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-700" /><div className="space-y-2"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" /><div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" /></div></div><div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" /></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-6" /><div className="h-px bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      ) : filteredEntries.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">No subjects found</p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEntries.map(([subject, worksheets], i) => (
            <SubjectCard key={subject} subjectName={subject} worksheets={worksheets} index={i}
              onView={() => navigate("/tests/subject", { state: { subject, worksheets } })} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TestDashboard;