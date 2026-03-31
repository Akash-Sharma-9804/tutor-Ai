// ─────────────────────────────────────────────────────────────────────────────
// DROP THIS COMPONENT into Progress.jsx
//
// 1. Add these imports at the top of Progress.jsx:
//    import { useNavigate } from "react-router-dom";
//    import { FileText, GraduationCap, History, ChevronRight as CR } from "lucide-react";
//
// 2. Add this state inside the Progress component:
//    const [testStats, setTestStats] = useState(null);
//
// 3. Inside fetchProgress() Promise.all, add a third call:
//    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/books/tests/attempts`, { headers })
//
//    Then destructure as: const [subjectsRes, statsRes, attemptsRes] = await Promise.all([...])
//
// 4. After setting state, add:
//    const att = attemptsRes.data.attempts || [];
//    if (att.length) {
//      const avg = att.reduce((s,a) => s + parseFloat(a.percentage||0), 0) / att.length;
//      const best = Math.max(...att.map(a => parseFloat(a.percentage||0)));
//      const above80 = att.filter(a => parseFloat(a.percentage) >= 80).length;
//      // group by subject
//      const bySubject = {};
//      att.forEach(a => {
//        if (!bySubject[a.book_title]) bySubject[a.book_title] = [];
//        bySubject[a.book_title].push(parseFloat(a.percentage||0));
//      });
//      const subjectAvgs = Object.entries(bySubject).map(([name, pcts]) => ({
//        name, avg: pcts.reduce((s,p)=>s+p,0)/pcts.length, count: pcts.length
//      })).sort((a,b) => b.avg - a.avg);
//      setTestStats({ total: att.length, avg, best, above80, subjectAvgs, recent: att.slice(0,4) });
//    }
//
// 5. Paste <TestPerformanceSection /> just above <GitHubContributionHeatmap />
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Trophy, BarChart3, CheckCircle2, TrendingUp,
  ChevronRight, History, FileText, GraduationCap, Star, Zap,
} from "lucide-react";

const getScoreColor = (pct) => {
  if (pct >= 80) return { bar: "from-emerald-400 to-green-500", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300" };
  if (pct >= 50) return { bar: "from-amber-400 to-yellow-500", text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" };
  return { bar: "from-rose-400 to-red-500", text: "text-rose-600 dark:text-rose-400", badge: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300" };
};

const subjectEmojis = {
  Mathematics: "📐", Science: "🔬", English: "📚",
  "Social Science": "🌍", Physics: "⚛️", Chemistry: "🧪",
  Biology: "🧬", History: "🏛️", Geography: "🗺️",
};

export const TestPerformanceSection = ({ testStats }) => {
  const navigate = useNavigate();

  if (!testStats || testStats.total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Test Performance</h2>
        </div>
        <div className="flex flex-col items-center py-10 text-gray-400">
          <div className="text-4xl mb-3">📝</div>
          <p className="font-semibold text-gray-600 dark:text-gray-400">No test attempts yet</p>
          <p className="text-sm mt-1">Complete a test to see your performance here</p>
          <motion.button whileHover={{ scale: 1.04 }} onClick={() => navigate("/tests")}
            className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold text-sm shadow-md">
            Go to Tests
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const col = getScoreColor(testStats.avg);
  const bestCol = getScoreColor(testStats.best);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="space-y-6"
    >
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Test Performance
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">AI-evaluated worksheet scores</p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.04, x: 2 }} onClick={() => navigate("/tests/attempts")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold text-sm shadow-md transition-all">
          <History className="h-4 w-4" /> View All <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <FileText className="h-5 w-5" />, label: "Total Attempts", value: testStats.total, color: "from-purple-500 to-indigo-500" },
          { icon: <BarChart3 className="h-5 w-5" />, label: "Avg Score", value: `${testStats.avg.toFixed(1)}%`, color: "from-blue-500 to-cyan-500" },
          { icon: <Trophy className="h-5 w-5" />, label: "Best Score", value: `${testStats.best.toFixed(0)}%`, color: "from-yellow-500 to-orange-500" },
          { icon: <CheckCircle2 className="h-5 w-5" />, label: "80%+ Scores", value: testStats.above80, color: "from-emerald-500 to-green-500" },
        ].map(({ icon, label, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
            whileHover={{ y: -3 }}
            className={`bg-gradient-to-br ${color} dark:opacity-90 rounded-2xl p-5 text-white shadow-xl`}>
            <div className="p-2.5 rounded-xl bg-white/20 w-fit mb-3">{icon}</div>
            <p className="text-2xl font-black">{value}</p>
            <p className="text-xs text-white/80 mt-0.5 font-medium">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Two-col: subject breakdown + recent attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Subject-wise avg scores */}
        <motion.div whileHover={{ y: -2 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Subject-wise Scores</h3>
          </div>
          <div className="space-y-4">
            {testStats.subjectAvgs.map((s, i) => {
              const sc = getScoreColor(s.avg);
              const emoji = subjectEmojis[s.name] || "📖";
              return (
                <motion.div key={s.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{emoji}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{s.name}</span>
                      <span className="text-[10px] text-gray-400">{s.count} attempt{s.count !== 1 ? "s" : ""}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sc.badge}`}>{s.avg.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${s.avg}%` }} transition={{ duration: 0.9, delay: i * 0.08 + 0.2 }}
                      className={`h-full rounded-full bg-gradient-to-r ${sc.bar}`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent attempts */}
        <motion.div whileHover={{ y: -2 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                <History className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Attempts</h3>
            </div>
            <motion.button whileHover={{ x: 2 }} onClick={() => navigate("/tests/attempts")}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
          <div className="space-y-3">
            {testStats.recent.map((attempt, i) => {
              const pct = parseFloat(attempt.percentage || 0);
              const sc = getScoreColor(pct);
              const emoji = subjectEmojis[attempt.book_title] || "📖";
              return (
                <motion.div key={attempt.attempt_id || i}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  whileHover={{ x: 4 }}
                  onClick={() => navigate(`/test/${attempt.worksheet_id}/result`, {
                    state: {
                      attemptId: attempt.attempt_id,
                      result: { obtainedMarks: attempt.obtained_marks, totalMarks: attempt.total_marks, percentage: attempt.percentage },
                      worksheetTitle: attempt.worksheet_title,
                      worksheetId: attempt.worksheet_id,
                      bookTitle: attempt.book_title,
                    }
                  })}
                  className="group flex items-center gap-3 p-3.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700/50 bg-gray-50/50 dark:bg-gray-900/40 cursor-pointer transition-all duration-200"
                >
                  <span className="text-xl shrink-0">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{attempt.worksheet_title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{attempt.book_title} · {attempt.obtained_marks}/{attempt.total_marks} marks</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sc.badge}`}>{pct.toFixed(0)}%</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TestPerformanceSection;