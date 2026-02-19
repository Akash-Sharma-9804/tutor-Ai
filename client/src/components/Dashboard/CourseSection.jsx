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

const CourseSection = ({ subjects, student }) => {
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
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300"
              >
                View All
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 max-h-[50rem] overflow-y-auto">
            {subjects.length === 0 ? (
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
                const progress = Math.floor(Math.random() * 100); // Replace with real progress

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
                                className="text-blue-500 dark:text-purple-500"
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
                          className={`h-full rounded-full ${subjectData.color.replace(
                            "bg-gradient-to-br",
                            "bg-gradient-to-r"
                          )}`}
                        />
                      </div>

                      {/* Interactive Elements */}
                      <div className="flex justify-between items-center mt-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold flex items-center gap-2 shadow-lg"
                        >
                          <Brain className="w-4 h-4" />
                          Continue
                        </motion.button>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {Math.floor(Math.random() * 5) + 1} day streak
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
                  <p className="text-4xl font-bold">4.2h</p>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4" />
                      Goal: 3h
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-sm mt-2">
                      <Award className="w-3 h-3" /> Goal achieved!
                    </span>
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
                    Lessons
                  </p>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  12
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +2 this week
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
                  8
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
                  <p className="text-2xl font-bold mt-1">7 Days</p>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-3xl"
                >
                  🔥
                </motion.div>
              </div>
              <div className="flex gap-1 mt-3">
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden"
                  >
                    <div className="h-full bg-white rounded-full"></div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* UPCOMING DEADLINES CARD */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl bg-gradient-to-br from-white to-rose-50 dark:from-gray-900 dark:to-rose-900/10 border-2 border-rose-100 dark:border-rose-900/30 p-6 shadow-xl shadow-rose-500/10 dark:shadow-rose-500/5"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-pink-400">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Upcoming Deadlines
              </h2>
            </div>
            <Rocket className="w-5 h-5 text-rose-500" />
          </div>

          {/* Deadlines List */}
          <div className="space-y-4 max-h-[14.3rem] overflow-y-auto">
            {[
              {
                title: "Quantum Mechanics Assignment",
                type: "Assignment",
                date: "Today · 4:00 PM",
                priority: "high",
                subject: "Physics",
                points: 100,
              },
              {
                title: "Math Mid-term Quiz",
                type: "Quiz",
                date: "Tomorrow",
                priority: "medium",
                subject: "Mathematics",
                points: 50,
              },
              {
                title: "History Project",
                type: "Project",
                date: "Feb 28",
                priority: "low",
                subject: "Social Science",
                points: 150,
              },
              {
                title: "Chemistry Lab Report",
                type: "Lab Report",
                date: "Mar 2",
                priority: "medium",
                subject: "Chemistry",
                points: 80,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                // whileHover={{ x: 5 }}
                className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-4 border-2 border-gray-100 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-500 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {/* Priority Indicator */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    item.priority === "high"
                      ? "bg-gradient-to-b from-red-500 to-rose-400"
                      : item.priority === "medium"
                      ? "bg-gradient-to-b from-yellow-500 to-amber-400"
                      : "bg-gradient-to-b from-blue-500 to-cyan-400"
                  }`}
                ></div>

                <div className="ml-3">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                      {item.title}
                    </h4>
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        item.priority === "high"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : item.priority === "medium"
                          ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {item.date}
                    </motion.span>
                  </div>

                  {/* Details */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        {item.type}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.subject}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {item.points} pts
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-rose-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-gray-700 transition-all duration-300"
          >
            <Calendar className="w-4 h-4" />
            View All Deadlines
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseSection;
