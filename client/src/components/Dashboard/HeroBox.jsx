import React from 'react'
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Award,
  Users,
  Star,
  Zap,
} from "lucide-react";

const HeroBox = ({student}) => {
  return (
    <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{
          y: -6,
        }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#8a9ceb] via-[#FFFFED] to-[#3EF4A1] dark:from-blue-900/30 dark:via-blue-500/30 dark:to-blue-900/30"
      >
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-8 ">
          {/* Left Content */}
          <div className="space-y-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                ✨ AI-Powered Learning
              </span>
              <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg">
                <Star className="h-3 w-3 inline mr-1" /> Personal Tuition
              </span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-gray-900 dark:text-white mb-2">
                Welcome to Your <br />
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Personal Learning Hub
                </span>
              </h1>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {student?.schoolName || "School"} • Class {student?.className}
              </p>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-100 leading-relaxed">
              Experience board-aligned curriculum with AI-guided learning,
              personalized for your class. Master every subject with interactive
              lessons, live doubt solving, and expert tutors.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center p-3 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-purple-200 dark:border-gray-800/60">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  12
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-100 mt-1">
                  Subjects
                </div>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-blue-200 dark:border-gray-800/60">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  24/7
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-100 mt-1">
                  Support
                </div>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-pink-200 dark:border-gray-800/60">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  100%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-100 mt-1">
                  Quality
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition text-white font-semibold shadow-lg shadow-purple-500/30"
              >
                Start Learning Today
                <ArrowRight className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 backdrop-blur-sm transition text-gray-900 dark:text-gray-100 font-semibold border border-gray-200 dark:border-gray-800/60"
              >
                <BookOpen className="h-4 w-4" />
                Browse Subjects
              </motion.button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative hidden lg:flex items-center justify-center">
            {/* 3D Floating Elements */}
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Book Stack */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-1/4 left-1/4 w-20 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-2xl transform -rotate-12"
              >
                <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">
                  📚
                </div>
              </motion.div>

              {/* Floating Certificate */}
              <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-1/3 right-1/4 w-24 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-2xl flex items-center justify-center text-3xl"
              >
                🏆
              </motion.div>

              {/* Laptop/Study Icon */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-1/4 left-1/3 w-28 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl flex items-center justify-center text-4xl transform rotate-6"
              >
                💻
              </motion.div>

              {/* Brain/AI Icon */}
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [0, -5, 0] }}
                transition={{
                  duration: 3.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-1/3 right-1/3 w-22 h-22 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-2xl flex items-center justify-center text-3xl"
              >
                🧠
              </motion.div>

              {/* Central Illustration Container - NO overflow-hidden */}
              <div className="relative z-10 w-72 h-72 flex items-center justify-center">
                {/* Image Circle */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 backdrop-blur-sm border-4 border-white dark:border-white/10 shadow-2xl overflow-hidden">
                  <img
                    src="/student.png"
                    alt="Students Learning"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Orbiting Elements - Outside the image circle */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg z-20">
                    ✓
                  </div>
                </motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0"
                >
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg z-20">
                    ★
                  </div>
                </motion.div>
              </div>

              {/* Floating Sparkles */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.5, 1, 0.5],
                  scale: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-1/4 right-1/2 text-3xl"
              >
                ✨
              </motion.div>
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.5, 1, 0.5],
                  scale: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
                className="absolute bottom-1/3 left-1/2 text-2xl"
              >
                💡
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="relative border-t border-purple-200 dark:border-gray-800/60 bg-white/40 dark:bg-white/5 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-purple-200 dark:divide-gray-800/60">
            <div className="px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Flexible Timings
              </div>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                AI Tutors
              </div>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                <Award className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                Certified Content
              </div>
            </div>
            <div className="px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                AI Assistance
              </div>
            </div>
          </div>
        </div>
      </motion.div>
  )
}

export default HeroBox