import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, ChevronRight, ArrowLeft, FileText,
  CheckCircle2, Circle, Lock, Zap, Trophy, Clock3,
} from "lucide-react";

// ─── Subject themes ────────────────────────────────────────────────────────────
const THEMES = {
  Mathematics:        { h1: "#3730a3", h2: "#4f46e5", accent: "#6366f1", soft: "#eef2ff", text: "#312e81", icon: "📐", particle: "◇" },
  Science:            { h1: "#065f46", h2: "#059669", accent: "#10b981", soft: "#ecfdf5", text: "#064e3b", icon: "🔬", particle: "✦" },
  Physics:            { h1: "#1e3a8a", h2: "#1d4ed8", accent: "#3b82f6", soft: "#eff6ff", text: "#1e3a8a", icon: "⚛️",  particle: "○" },
  Chemistry:          { h1: "#581c87", h2: "#7c3aed", accent: "#a855f7", soft: "#faf5ff", text: "#4c1d95", icon: "🧪", particle: "◈" },
  Biology:            { h1: "#14532d", h2: "#15803d", accent: "#22c55e", soft: "#f0fdf4", text: "#14532d", icon: "🧬", particle: "❋" },
  History:            { h1: "#7c2d12", h2: "#c2410c", accent: "#f97316", soft: "#fff7ed", text: "#7c2d12", icon: "📜", particle: "◉" },
  Geography:          { h1: "#134e4a", h2: "#0f766e", accent: "#14b8a6", soft: "#f0fdfa", text: "#134e4a", icon: "🌍", particle: "◎" },
  English:            { h1: "#4c1d95", h2: "#6d28d9", accent: "#8b5cf6", soft: "#f5f3ff", text: "#4c1d95", icon: "📖", particle: "◆" },
  "Computer Science": { h1: "#7c2d12", h2: "#b45309", accent: "#f59e0b", soft: "#fffbeb", text: "#78350f", icon: "💻", particle: "▣" },
  default:            { h1: "#1e3a8a", h2: "#2563eb", accent: "#3b82f6", soft: "#eff6ff", text: "#1e3a8a", icon: "📚", particle: "◇" },
};

const getTheme = (name) => {
  if (!name) return THEMES.default;
  const k = Object.keys(THEMES).find((k) => name.toLowerCase().includes(k.toLowerCase()));
  return THEMES[k] || THEMES.default;
};

// ─── SVG Ring ──────────────────────────────────────────────────────────────────
const Ring = ({ pct, size = 64, sw = 6, color = "#fff", trackColor = "rgba(255,255,255,0.18)" }) => {
  const r = (size - sw * 2) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={sw} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={sw} strokeLinecap="round"
        initial={{ strokeDasharray: `0 ${c}` }}
        animate={{ strokeDasharray: `${(pct / 100) * c} ${c}` }}
        transition={{ duration: 1.4, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </svg>
  );
};

// ─── Stat chip ─────────────────────────────────────────────────────────────────
const StatChip = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.18)" }}>
      <Icon size={15} className="text-white" />
    </div>
    <div>
      <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest leading-none mb-0.5">{label}</p>
      <p className="text-white font-bold text-sm leading-none">{value}</p>
    </div>
  </div>
);

// ─── Main ──────────────────────────────────────────────────────────────────────
const TableOfContents = () => {
  const { bookId } = useParams();
  const navigate   = useNavigate();

  const [book,       setBook]       = useState(null);
  const [chapters,   setChapters]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [progress,   setProgress]   = useState({});
  const [segments,   setSegments]   = useState({});
  const [overallPct, setOverallPct] = useState(0);
  const [theme,      setTheme]      = useState(THEMES.default);
  const [showTooltip,  setShowTooltip]  = useState(null);
  const [showLockMsg,  setShowLockMsg]  = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    const isDark = saved !== null ? JSON.parse(saved) : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => { loadBookChapters(); }, [bookId]);

  const loadBookChapters = async () => {
    try {
      setLoading(true);
      const token   = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [bookRes, progRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/books/${bookId}/chapters`, { headers }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/books/${bookId}/progress-summary`, { headers }),
      ]);
      setBook(bookRes.data.book);
      setChapters(bookRes.data.chapters);
      setTheme(getTheme(bookRes.data.book?.subject_name));
      const pctMap = {}, segMap = {};
      progRes.data.chapters?.forEach((ch) => {
        pctMap[ch.id] = ch.percent;
        segMap[ch.id] = { completed: ch.completedSegments, total: ch.totalSegments };
      });
      setProgress(pctMap);
      setSegments(segMap);
      setOverallPct(progRes.data.overallPercent ?? 0);
    } catch (err) {
      console.error("Failed to load chapters:", err);
    } finally {
      setLoading(false);
    }
  };

  const openChapter = (id) => navigate(`/reader/${id}`);

  // ─── Skeleton ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f]">
        <div className="h-64 bg-gradient-to-br from-gray-300 to-gray-200 dark:from-gray-800 dark:to-gray-700 animate-pulse" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 space-y-3 pb-10">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-white dark:bg-gray-800 animate-pulse shadow-sm" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    );
  }

  const total     = chapters.length;
  const doneCount = chapters.filter(c => progress[c.id] === 100).length;
  const inProgCount = chapters.filter(c => (progress[c.id] ?? 0) > 0 && progress[c.id] < 100).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f]">

      {/* ═══════════════════════════════════════════════════════════════
          HERO BANNER — full bleed, rich gradient with texture
      ═══════════════════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.h1} 0%, ${theme.h2} 55%, ${theme.accent} 100%)`,
          paddingBottom: "72px",
        }}
      >
        {/* Grid texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/4 w-96 h-48 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.07) 0%, transparent 70%)" }} />
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div key={i} className="absolute text-white/10 font-bold select-none pointer-events-none"
            style={{ fontSize: `${14 + i * 6}px`, left: `${8 + i * 15}%`, top: `${10 + (i % 3) * 28}%` }}
            animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.4 }}
          >
            {theme.particle}
          </motion.div>
        ))}

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6">
          {/* Back */}
          <motion.button
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/subjects")}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-1 sm:mb-2  mt-0 sm:mt-5 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Subjects
          </motion.button>

          {/* Top row: book info + ring */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-start gap-4 flex-1 min-w-0"
            >
              {/* Subject icon box */}
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl sm:text-4xl"
                style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(12px)", border: "1.5px solid rgba(255,255,255,0.25)" }}
              >
                {theme.icon}
              </div>
              <div className="min-w-0 pt-1">
                {/* Tags row */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {book?.subject_name && (
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.9)" }}>
                      {book.subject_name}
                    </span>
                  )}
                  {book?.class_num && (
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}>
                      Class {book.class_num}
                    </span>
                  )}
                  {book?.board && (
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)" }}>
                      {book.board}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
                  {book?.title}
                </h1>
                {book?.author && (
                  <p className="text-white/50 text-xs sm:text-sm mt-1.5 font-medium leading-snug line-clamp-1">
                    {book.author}
                  </p>
                )}
              </div>
            </motion.div>

            {/* Overall progress ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="flex-shrink-0 rounded-2xl px-5 py-4 flex items-center gap-4"
              style={{ background: "rgba(255,255,255,0.13)", backdropFilter: "blur(16px)", border: "1.5px solid rgba(255,255,255,0.2)" }}
            >
              <div className="relative">
                <Ring pct={overallPct} size={68} sw={6} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-extrabold text-[13px] leading-none">{overallPct}%</span>
                </div>
              </div>
              <div>
                <p className="text-white/55 text-[10px] font-bold uppercase tracking-widest mb-1">Overall</p>
                <p className="text-white font-extrabold text-lg leading-tight">{doneCount}<span className="text-white/50 font-semibold text-sm">/{total}</span></p>
                <p className="text-white/55 text-[11px] font-medium">chapters done</p>
              </div>
            </motion.div>
          </div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap gap-2 mt-6"
          >
            <StatChip icon={BookOpen}    label="Total"       value={`${total} chapters`} />
            <StatChip icon={Trophy}      label="Completed"   value={`${doneCount} chapters`} />
            <StatChip icon={Zap}         label="In Progress" value={`${inProgCount} chapters`} />
            {total - doneCount - inProgCount > 0 && (
              <StatChip icon={Clock3}    label="Remaining"   value={`${total - doneCount - inProgCount} chapters`} />
            )}
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CHAPTERS — overlap card rising from banner
      ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 pb-16 relative z-10">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-md"
            style={{ background: theme.soft, color: theme.text }}
          >
            <BookOpen size={15} />
            <span>Chapters</span>
            <span
              className="text-[11px] font-bold px-1.5 py-0.5 rounded-md ml-0.5"
              style={{ background: theme.accent, color: "#fff" }}
            >
              {total}
            </span>
          </div>
          {doneCount === total && total > 0 && (
            <span className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
              <Trophy size={14} /> All chapters complete!
            </span>
          )}
        </div>

        {/* Chapter list */}
        <div className="space-y-3">
          {chapters.map((ch, i) => {
            const pct    = progress[ch.id] ?? 0;
            const seg    = segments[ch.id] ?? {};
            const done   = pct === 100;
            const inProg = pct > 0 && pct < 100;
            const actionLabel = done ? "Review" : inProg ? "Continue" : "Start";

            return (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.07, duration: 0.4 }}
                onClick={() => openChapter(ch.id)}
                className="group relative cursor-pointer"
              >
                {/* Card */}
                <div
                  className="relative overflow-hidden rounded-2xl transition-all duration-300
                              bg-white dark:bg-[#1a1a1a]
                              border border-gray-100 dark:border-white/[0.07]
                              hover:shadow-xl hover:-translate-y-0.5
                              dark:hover:border-white/[0.13]"
                  style={{
                    boxShadow: done
                      ? `0 2px 12px ${theme.accent}22`
                      : "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Top progress fill (done chapters get a full-width tinted header) */}
                  {done && (
                    <div
                      className="absolute inset-x-0 top-0 h-[3px]"
                      style={{ background: `linear-gradient(90deg, ${theme.h1}, ${theme.accent})` }}
                    />
                  )}

                  <div className="flex items-center py-5 gap-0">
                    {/* Chapter number sidebar */}
                    <div
                      className="flex-shrink-0 w-14 sm:w-16 flex flex-col items-center justify-center self-stretch py-4 gap-1"
                      style={{
                        background: done
                          ? `linear-gradient(160deg, ${theme.h1}18, ${theme.accent}22)`
                          : inProg
                          ? "rgba(245,158,11,0.06)"
                          : "rgba(0,0,0,0.02)",
                        borderRight: done
                          ? `1.5px solid ${theme.accent}25`
                          : "1.5px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      {done ? (
                        <CheckCircle2 size={22} style={{ color: theme.accent }} />
                      ) : (
                        <>
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: inProg ? "#d97706" : "#9ca3af" }}
                          >CH</span>
                          <span
                            className="text-lg font-extrabold tabular-nums leading-none"
                            style={{ color: inProg ? "#f59e0b" : "#d1d5db" }}
                          >
                            {String(ch.chapter_no ?? i + 1).padStart(2, "0")}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0 px-4 py-3.5 sm:py-4">
                      {/* Title */}
                      <h3
                        className="font-bold text-sm sm:text-base leading-snug text-gray-900 dark:text-gray-100 transition-colors duration-200"
                        style={{ letterSpacing: "-0.01em" }}
                      >
                        {ch.chapter_title}
                      </h3>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {done ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold"
                            style={{ color: theme.accent }}>
                            <CheckCircle2 size={11} /> Completed
                          </span>
                        ) : inProg ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            {pct}% in progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 dark:text-gray-500">
                            <Circle size={10} /> Not started
                          </span>
                        )}

                        {seg.total > 0 && (
                          <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
                            {seg.completed ?? 0}/{seg.total} segments
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      {(inProg || done) && (
                        <div className="mt-2.5 h-1.5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700/50 max-w-xs">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.9, delay: 0.5 + i * 0.07 }}
                            className="h-full rounded-full"
                            style={{
                              background: done
                                ? `linear-gradient(90deg, ${theme.h2}, ${theme.accent})`
                                : "linear-gradient(90deg, #f59e0b, #fbbf24)",
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Right actions */}
                    <div
                      className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-2 px-3 sm:px-4 py-3"
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Worksheet btn */}
                      <div
                        className="relative"
                        onMouseEnter={() => !done && setShowTooltip(ch.id)}
                        onMouseLeave={() => setShowTooltip(null)}
                      >
                        <button
                          onClick={() => {
                            if (done) navigate(`/chapter/${ch.id}/worksheets/${bookId}`);
                            else {
                              setShowLockMsg(ch.id);
                              setTimeout(() => setShowLockMsg(null), 2400);
                            }
                          }}
                          className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl border transition-all duration-200"
                          style={done ? {
                            background: theme.soft,
                            color: theme.text,
                            borderColor: `${theme.accent}40`,
                          } : {
                            background: "transparent",
                            color: "#9ca3af",
                            borderColor: "#e5e7eb",
                            cursor: "not-allowed",
                          }}
                        >
                          {done ? <FileText size={12} /> : <Lock size={11} />}
                          Worksheet
                        </button>

                        <AnimatePresence>
                          {showTooltip === ch.id && !done && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                              className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2.5 py-1.5 text-[11px] font-semibold text-white rounded-lg whitespace-nowrap pointer-events-none"
                              style={{ background: "#111827" }}
                            >
                              Complete chapter to unlock
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#111827]" />
                            </motion.div>
                          )}
                          {showLockMsg === ch.id && !done && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 text-[11px] font-bold text-white bg-orange-500 rounded-lg whitespace-nowrap"
                            >
                              Finish chapter to unlock
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* CTA button */}
                      <button
                        onClick={() => openChapter(ch.id)}
                        className="flex items-center gap-1.5 text-xs sm:text-[13px] font-extrabold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-white transition-all duration-200 active:scale-95 whitespace-nowrap"
                        style={{
                          background: inProg
                            ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                            : `linear-gradient(135deg, ${theme.h2}, ${theme.accent})`,
                          boxShadow: inProg
                            ? "0 4px 14px rgba(245,158,11,0.4)"
                            : `0 4px 14px ${theme.accent}55`,
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                      >
                        {actionLabel}
                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty state */}
        {total === 0 && (
          <div className="text-center py-20">
            <div
              className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
              style={{ background: theme.soft }}
            >
              {theme.icon}
            </div>
            <p className="font-bold text-gray-700 dark:text-gray-300 text-base">No chapters yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Check back soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableOfContents;