import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Clock,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Zap,
  Flame,
  Brain,
  Rocket,
  Sparkles,
  Star,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Loading skeleton component for subject cards
const SubjectSkeleton = () => (
  <motion.div
    className="w-full rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 p-5"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    {/* Header skeleton */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="space-y-2">
          <div className="w-32 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
    </div>
    {/* Progress bar skeleton */}
    <div className="space-y-2">
      <div className="flex justify-between">
        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full w-1/2 bg-gray-300 dark:bg-gray-600 animate-pulse" />
      </div>
    </div>
    {/* Action buttons skeleton */}
    <div className="flex justify-between items-center mt-4">
      <div className="w-32 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      <div className="flex gap-3">
        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  </motion.div>
);

const CourseSection = ({ subjects, student, stats, subjectWorksheetsBySubject, loading }) => {
  // Get worksheets by subject name for display
  const subjectWorksheetsList = Object.entries(subjectWorksheetsBySubject || {})
    .filter(([subjectId, worksheets]) => worksheets && worksheets.length > 0)
    .map(([subjectId, worksheets]) => ({
      subjectId,
      subjectName: subjects.find(s => s.id === parseInt(subjectId))?.name || `Subject ${subjectId}`,
      worksheets: worksheets.map(w => ({
        id: w.id,
        title: w.title,
        status: w.status,
        total_questions: w.total_questions,
        total_marks: w.total_marks,
        difficulty: w.difficulty,
        created_at: w.created_at
      }))
    }));

  const navigate = useNavigate();

  const handleStartLearning = async (subjectId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/subject/${subjectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data && res.data.length > 0) {
        navigate(`/book/${res.data[0].id}`);
      } else {
        navigate("/subjects");
      }
    } catch (err) {
      console.error("Failed to fetch book for subject", err);
      navigate("/subjects");
    }
  };

  // Subject icons mapping with better visuals
  const subjectIcons = {
    Mathematics: {
      icon: "➗",
      color: "bg-gradient-to-br from-blue-500 to-cyan-400",
      emoji: "📐",
    },
    Science: {
      icon: "🔬",
      color: "bg-gradient-to-br from-green-500 to-emerald-400",
      emoji: "🧪",
    },
    English: {
      icon: "📚",
      color: "bg-gradient-to-br from-purple-500 to-pink-400",
      emoji: "✍️",
    },
    "Social Science": {
      icon: "🌍",
      color: "bg-gradient-to-br from-orange-500 to-yellow-400",
      emoji: "🗺️",
    },
    Physics: {
      icon: "⚛️",
      color: "bg-gradient-to-br from-indigo-500 to-purple-400",
      emoji: "⚡",
    },
    Chemistry: {
      icon: "🧪",
      color: "bg-gradient-to-br from-teal-500 to-green-400",
      emoji: "⚗️",
    },
    Biology: {
      icon: "🧬",
      color: "bg-gradient-to-br from-lime-500 to-green-400",
      emoji: "🌱",
    },
    History: {
      icon: "🏛️",
      color: "bg-gradient-to-br from-amber-500 to-orange-400",
      emoji: "⏳",
    },
    Geography: {
      icon: "🗺️",
      color: "bg-gradient-to-br from-rose-500 to-red-400",
      emoji: "🌋",
    },
  };

  // Get subject data with fallback
  const getSubjectData = (subjectName) => {
    return (
      subjectIcons[subjectName] || {
        icon: "📚",
        color: "bg-gradient-to-br from-gray-500 to-gray-400",
        emoji: "📖",
      }
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
      {/* MY COURSES - Main Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-2"
      >
        <div className="rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-[#0f0f1a] border-2 border-gray-100 dark:border-gray-800 p-6 shadow-2xl shadow-blue-500/5 dark:shadow-purple-500/5">
          {/* Header with animated gradient */}
          <div className="relative mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 dark:opacity-30"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    My Subjects
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {student?.className
                      ? `Class ${student.className}`
                      : "AI Powered Learning"}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/subjects`)}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300"
              >
                View All
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 max-h-[50rem] overflow-y-auto">
            {loading ? (
              // Loading skeleton - responsive
              <>
                <SubjectSkeleton />
                <SubjectSkeleton />
                <SubjectSkeleton />
              </>
            ) : subjects.length === 0 ? (
              <div className="col-span-2 py-12 text-center">
                <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 mb-4">
                  <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto" />
                </div>
                <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No Subjects Found
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Subjects will appear here once your class schedule is updated.
                  Check back soon!
                </p>
              </div>
            ) : (
              subjects.map((subject, index) => {
                const subjectData = getSubjectData(subject.name);
                const progress = subject.progress || 0;

                return (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    // whileHover={{
                    //   y: -8,
                    //   scale: 1.02,
                    //   rotateX: 2,
                    //   rotateY: 2,
                    // }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-purple-500 p-5 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl"
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500"></div>
                    </div>

                    {/* Subject Header */}
                    <div className="relative flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className={` `}
                        >
                          <span className="text-4xl">{subjectData.emoji}</span>
                        </motion.div>
                        <div>
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                            {subject.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              Class {student?.className || "4-10"}
                            </span>
                            <motion.span
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 flex items-center gap-1"
                            >
                              <Zap className="w-3 h-3" /> AI Enhanced
                            </motion.span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Badge */}
                      <div className="text-right">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                          className="inline-flex flex-col items-center"
                        >
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full  flex items-center justify-center ">
                              <span className="font-bold text-gray-900 dark:text-white text-[10px]">
                                {progress}%
                              </span>
                            </div>
                            <svg className="absolute inset-0 w-12 h-12 transform -rotate-90">
                              <circle
                                cx="24"
                                cy="24"
                                r="18"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${progress * 1.13} 113`}
                                className={
                                  progress === 100
                                    ? "text-emerald-500 dark:text-emerald-400"
                                    : progress === 0
                                    ? "text-gray-300 dark:text-gray-600"
                                    : "text-blue-500 dark:text-purple-500"
                                }
                              />
                            </svg>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Progress Bar with Animation */}
                    <div className="relative mt-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">
                          Progress
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {progress}% Complete
                        </span>
                      </div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full ${
                            progress === 100
                              ? "bg-gradient-to-r from-emerald-500 to-green-600"
                              : subjectData.color.replace(
                                  "bg-gradient-to-br",
                                  "bg-gradient-to-r"
                                )
                          }`}
                        />
                      </div>

                      {/* Interactive Elements */}
                      <div className="flex justify-between items-center mt-4">
                      <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleStartLearning(subject.id)}
                          className={`px-4 py-2 rounded-lg text-white text-sm font-semibold flex items-center gap-2 shadow-lg bg-gradient-to-r ${
                            progress === 100
                              ? "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                              : progress > 0
                              ? "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                              : "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                          }`}
                        >
                          <Brain className="w-4 h-4" />
                          {progress === 100 ? "Review" : progress > 0 ? "Continue" : "Start Learning"}
                        </motion.button>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            {subject.completedSegments > 0 || subject.progress === 100 ? (subject.progress === 100 ? "Completed!" : `${Math.min(subject.completedSegments, 30)} day streak`) : "Not started"}
                          </span>
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </motion.div>

      {/* RIGHT SIDEBAR - Learning Activity & Deadlines */}
      <div className="space-y-6">
        {/* LEARNING ACTIVITY CARD */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-blue-900/20 border-2 border-blue-100 dark:border-blue-900/30 p-6 shadow-xl shadow-blue-500/10 dark:shadow-blue-500/5"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Learning Activity
              </h2>
            </div>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>

          {/* Main Stats */}
          <div className="space-y-5">
            {/* Study Time */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 dark:from-blue-900/30 dark:to-blue-900/30 p-5 text-white"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              <div className="relative">
                <p className="text-sm opacity-90">Study Time Today</p>
                <div className="flex items-end justify-between mt-2">
                  <p className="text-4xl font-bold">
                    {stats ? `${stats.studyHours.today}h` : "—"}
                  </p>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4" />
                      Total: {stats ? `${stats.studyHours.total}h` : "—"}
                    </div>
                    {stats?.studyHours.today >= 3 && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-sm mt-2">
                        <Award className="w-3 h-3" /> Goal achieved!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 border border-gray-100 dark:border-gray-700 shadow-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Worksheets
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats ? stats.worksheets.chapterWorksheets : "—"}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{stats ? stats.lessons.thisWeek : 0} this week
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 border border-gray-100 dark:border-gray-700 shadow-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-4 h-4 text-purple-500" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Quizzes
                  </p>
                </div>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats ? stats.worksheets.subjectWorksheets : "—"}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  92% avg score
                </p>
              </motion.div>
            </div>

            {/* Streak */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 dark:from-blue-900/30 dark:to-blue-900/30 p-4 text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Weekly Streak</p>
                  <p className="text-2xl font-bold mt-1">
                    {stats ? `${stats.streak.current} Day${stats.streak.current !== 1 ? 's' : ''}` : "—"}
                  </p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-3xl"
                >
                  {stats?.streak.current > 0 ? "🔥" : "💤"}
                </motion.div>
              </div>
              <div className="flex gap-1 mt-3">
                {(stats?.streak.weekDays || [...Array(7)].map((_, i) => ({
                  label: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
                  active: false
                }))).map((day, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div className={`w-full h-2 rounded-full overflow-hidden ${day.active ? 'bg-white' : 'bg-white/30'}`} />
                    <span className="text-[9px] text-white/70">{day.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* SUBJECT WORKSHEETS CARD */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl bg-gradient-to-br from-white to-indigo-50 dark:from-gray-900 dark:to-indigo-900/10 border-2 border-indigo-100 dark:border-indigo-900/30 p-6 shadow-xl shadow-indigo-500/10 dark:shadow-indigo-500/5"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-400">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Subject Worksheets
              </h2>
            </div>
            <Sparkles className="w-5 h-5 text-indigo-500" />
          </div>

          {/* Worksheets List */}
          <div className="space-y-4 max-h-[14.3rem] overflow-y-auto">
            {subjectWorksheetsList.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No worksheets completed yet
                </p>
              </div>
            ) : (
              subjectWorksheetsList.slice(0, 4).map((entry, i) => (
                <motion.div
                  key={entry.subjectId + i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-4 border-2 border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="ml-3">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                        {entry.subjectName}
                      </h4>
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                      >
                        {entry.worksheets.length} ws
                      </motion.span>
                    </div>

                    {/* Worksheet Details */}
                    <div className="space-y-2 mt-3">
                      {entry.worksheets.slice(0, 2).map((ws, j) => (
                        <div key={j} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              ws.status === 'done'
                                ? 'bg-emerald-500'
                                : ws.status === 'in-progress'
                                  ? 'bg-amber-500'
                                  : 'bg-gray-400'
                            }`} />
                            <span className="text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                              {ws.title}
                            </span>
                          </div>
                          <span className={`text-gray-500 dark:text-gray-400 ${
                            ws.difficulty === 'hard' ? 'text-rose-500' :
                            ws.difficulty === 'easy' ? 'text-emerald-500' :
                            'text-amber-500'
                          }`}>
                            {ws.difficulty}
                          </span>
                        </div>
                      ))}
                      {entry.worksheets.length > 2 && (
                        <p className="text-xs text-gray-400 italic">
                          +{entry.worksheets.length - 2} more worksheet{entry.worksheets.length > 3 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/tests")}
            className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-gray-700 transition-all duration-300"
          >
            <BookOpen className="w-4 h-4" />
            View All Worksheets
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseSection;
