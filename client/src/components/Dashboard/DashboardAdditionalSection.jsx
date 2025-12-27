import React from "react";
import { motion } from "framer-motion";
import {
  Video,
  FileText,
  Users,
  TrendingUp,
  MessageSquare,
  BookOpen,
  Award,
  GraduationCap,
  Target,
  Brain,
  Sparkles,
  Star,
  BarChart3,
  ChevronRight,
  Rocket,
} from "lucide-react";

const DashboardAdditionalSection = () => {
  // Quick actions
  const quickActions = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      name: "AI Tutor Chat",
      desc: "Get instant help",
      color: "from-blue-500 to-cyan-400",
      badge: "Live",
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      name: "Smart Library",
      desc: "AI Recommendations",
      color: "from-purple-500 to-pink-400",
    },
    {
      icon: <Award className="h-6 w-6" />,
      name: "Achievements",
      desc: "47 unlocked",
      color: "from-yellow-500 to-orange-400",
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      name: "Certificates",
      desc: "View 12 earned",
      color: "from-green-500 to-emerald-400",
    },
    {
      icon: <Brain className="h-6 w-6" />,
      name: "Practice AI",
      desc: "Smart exercises",
      color: "from-indigo-500 to-purple-400",
      badge: "New",
    },
    {
      icon: <Target className="h-6 w-6" />,
      name: "Goal Tracker",
      desc: "Set targets",
      color: "from-red-500 to-pink-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
      {/* PERFORMANCE SNAPSHOT */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-3xl blur-2xl"></div>
        <div className="relative rounded-3xl bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-900/10 border-2 border-blue-100 dark:border-blue-900/30 p-6 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Performance Snapshot
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  AI-powered insights
                </p>
              </div>
            </div>
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </div>

          {/* Average Score Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-900/30 dark:to-blue-900/30 p-6 text-white mb-6"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Average Score</p>
                  <p className="text-4xl font-bold mt-2">88%</p>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full"
                ></motion.div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4" />
                  <span className="opacity-90">Goal: 90%</span>
                </div>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-sm font-medium">
                  <TrendingUp className="h-4 w-4" /> +12% above class
                </span>
              </div>
            </div>
          </motion.div>

          {/* Weekly Improvement */}
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-5 border-2 border-gray-100 dark:border-gray-700 shadow-lg mb-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    Weekly Improvement
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    AI learning boost
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  +6%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  vs last week
                </p>
              </div>
            </div>
            <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "72%" }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* QUICK ACTIONS */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10 rounded-3xl blur-2xl"></div>
        <div className="relative rounded-3xl bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-900 dark:to-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-900/30 p-6 shadow-2xl shadow-emerald-500/10 dark:shadow-emerald-500/5">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                  Quick Actions
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  AI-powered tools
                </p>
              </div>
            </div>
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500/20" />
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{
                  scale: 1.08,
                  y: -5,
                  rotate: 2,
                }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500 p-5 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                {/* Background gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                ></div>

                {/* Badge */}
                {action.badge && (
                  <span className="absolute z-[1] top-2 right-2 text-xs px-2 py-1 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold">
                    {action.badge}
                  </span>
                )}

                {/* Icon */}
                <div className="relative mb-3">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl"></div>
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`relative p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-lg`}
                  >
                    <div className="text-white">{action.icon}</div>
                  </motion.div>
                </div>

                {/* Text */}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-center mb-1">
                    {action.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    {action.desc}
                  </p>
                </div>

                {/* Hover arrow */}
                <ChevronRight className="absolute bottom-3 right-3 h-4 w-4 text-gray-400 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardAdditionalSection;
