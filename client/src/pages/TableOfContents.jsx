import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, ArrowLeft, FileText, Clock, CheckCircle2, Circle, BookMarked, Menu, X } from "lucide-react";

// Subject color mapping for gradient backgrounds
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
  default: "from-blue-600 to-purple-600"
};

const getSubjectGradient = (subjectName) => {
  if (!subjectName) return subjectColors.default;
  const key = Object.keys(subjectColors).find(k =>
    subjectName.toLowerCase().includes(k.toLowerCase())
  );
  return subjectColors[key] || subjectColors.default;
};

const TableOfContents = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({});
  const [subjectGradient, setSubjectGradient] = useState("from-blue-600 to-purple-600");
  const [showTooltip, setShowTooltip] = useState(null);
  const [showLockMsg, setShowLockMsg] = useState(null);

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
    loadBookChapters();
  }, [bookId]);

  const loadBookChapters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/${bookId}/chapters`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBook(res.data.book);
      setChapters(res.data.chapters);

      // Set subject gradient based on subject name
      const gradient = getSubjectGradient(res.data.book?.subject_name);
      setSubjectGradient(gradient);

      const progressRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/${bookId}/progress-summary`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const map = {};
      progressRes.data.chapters?.forEach((ch) => {
        map[ch.id] = ch.percent;
      });

      setProgress(map);
    } catch (err) {
      console.error("Failed to load chapters:", err);
    } finally {
      setLoading(false);
    }
  };

  const openChapter = (id) => navigate(`/reader/${id}`);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-100 dark:border-purple-900 border-t-blue-600 dark:border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const total = chapters.length;
  const doneCount = chapters.filter((c) => progress[c.id] === 100).length;
  const overall = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-full overflow-hidden">
      {/* BOOK HEADER CARD - Responsive */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${subjectGradient} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white mb-4 sm:mb-6 relative overflow-hidden`}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-white/10 rounded-full -mr-8 sm:-mr-10 -mt-8 sm:-mt-10" />
        <div className="absolute bottom-0 left-0 w-16 sm:w-24 h-16 sm:h-24 bg-white/10 rounded-full -ml-4 sm:-ml-8 -mb-4 sm:-mb-8" />

        <div className="relative z-10">
          {/* Back button - responsive */}
          <button
            onClick={() => navigate("/subjects")}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-white/80 hover:text-white mb-3 sm:mb-4 transition-colors"
          >
            <ArrowLeft size={16} sm={18} />
            <span className="hidden xs:inline">Back to Subjects</span>
            <span className="xs:hidden">Back</span>
          </button>

          {/* Main content - flex layout */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
            {/* Book Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
            </div>

            {/* Book Info */}
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg sm:text-xl md:text-2xl mb-1 truncate">{book?.title}</h1>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-white/80">
                {book?.subject_name && (
                  <span className="flex items-center gap-1 bg-white/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs">
                    <BookMarked size={12} sm={14} />
                    <span className="hidden sm:inline">{book.subject_name}</span>
                  </span>
                )}
                {book?.class_num && (
                  <span className="bg-white/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs">Class {book.class_num}</span>
                )}
                {book?.board && (
                  <span className="bg-white/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-xs hidden sm:inline">{book.board}</span>
                )}
              </div>
            </div>

            {/* Progress Card - Responsive - Full width on mobile */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 w-full sm:w-auto sm:min-w-[140px] md:min-w-[180px]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2 text-white/90">
                  <Clock size={14} sm={16} />
                  <span className="text-xs sm:text-sm font-medium">Progress</span>
                </div>
                <span className="text-sm sm:text-lg md:text-xl font-bold">{overall}%</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2">
                <div className="flex-1 h-2 sm:h-3 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${overall}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-white/70 mt-1.5 sm:mt-2">
                {doneCount}/{total} chapters
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CHAPTERS LIST */}
      <div className="space-y-2.5 sm:space-y-3">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 flex items-center gap-2">
          <BookOpen size={18} sm={20} className="text-blue-600 dark:text-blue-400" />
          <span>Chapters</span>
          <span className="text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400">({chapters.length})</span>
        </h2>

        {chapters.map((ch, i) => {
          const pct = progress[ch.id] ?? 0;
          const done = pct === 100;

          return (
            <motion.div
              key={ch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-[#1e1c19] border border-gray-200 dark:border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 cursor-pointer hover:shadow-lg hover:border-transparent transition-all duration-300 group overflow-hidden"
              onClick={() => openChapter(ch.id)}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">

                {/* LEFT - Chapter Info */}
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Number Badge */}
                  <div className={`w-8 h-8 sm:w-9 md:w-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
                    done
                      ? `bg-gradient-to-r ${subjectGradient} text-white`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'
                  }`}>
                    {done ? <CheckCircle2 size={16} /> : <span className="font-bold text-sm">{i + 1}</span>}
                  </div>

                  {/* Title & Status */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-xs sm:text-base text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {ch.chapter_title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {done ? (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
                          <CheckCircle2 size={12} /> <span className="hidden xs:inline">Completed</span>
                        </span>
                      ) : pct > 0 ? (
                        <span className="text-blue-600 dark:text-blue-400 text-xs font-medium">{pct}%</span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 text-xs flex items-center gap-1">
                          <Circle size={10} /> <span className="hidden xs:inline">Not started</span>
                        </span>
                      )}
                    </div>

                    {/* Progress Bar - Responsive */}
                    <div className="mt-2 h-1.5 sm:h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden w-full max-w-[180px] sm:max-w-[280px]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className={`h-full rounded-full bg-gradient-to-r ${subjectGradient}`}
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT - Actions - Stack on mobile */}
                <div className="flex items-center gap-1.5 sm:gap-3 ml-10 sm:ml-0 flex-shrink-0">

                  {/* Worksheet Button with Lock */}
                  <div
                    className="relative"
                    onMouseEnter={() => !done && setShowTooltip(ch.id)}
                    onMouseLeave={() => setShowTooltip(null)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (done) {
                          navigate(`/chapter/${ch.id}/worksheets/${bookId}`);
                        } else {
                          setShowLockMsg(ch.id);
                          setTimeout(() => setShowLockMsg(null), 2500);
                        }
                      }}
                      className={`text-xs flex items-center gap-1 px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl whitespace-nowrap transition-all ${
                        done
                          ? "bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-200 dark:border-indigo-700/50 text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md"
                          : "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      <FileText size={12} sm={14} />
                      <span className="xs:inline">Worksheet</span>
                      {!done && (
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>

                    {/* Hover Tooltip */}
                    {showTooltip === ch.id && !done && (
                      <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1.5 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg whitespace-nowrap">
                        Complete chapter to unlock
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                      </div>
                    )}

                    {/* Toast Message on Click */}
                    {showLockMsg === ch.id && !done && (
                      <div className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1.5 text-xs text-white bg-orange-500 dark:bg-orange-600 rounded-lg shadow-lg whitespace-nowrap animate-pulse">
                        Complete lessons to unlock!
                      </div>
                    )}
                  </div>

                  {/* Action Button - Responsive */}
                  <button className={`text-xs px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl flex items-center gap-1 font-semibold transition-all shadow-md ${
                    done
                      ? `bg-gradient-to-r ${subjectGradient} text-white hover:opacity-90 hover:shadow-lg`
                      : `bg-gradient-to-r ${subjectGradient} text-white hover:opacity-90`
                  }`}>
                    <span className=" ">{done ? "Review" : pct > 0 ? "Continue" : "Start"}</span>
                    
                    <ChevronRight size={12} sm={14} />
                  </button>

                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {chapters.length === 0 && (
        <div className="text-center py-10 sm:py-12">
          <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No chapters available for this book</p>
        </div>
      )}
    </div>
  );
};

export default TableOfContents;