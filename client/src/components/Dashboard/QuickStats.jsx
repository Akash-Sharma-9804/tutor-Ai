import React from "react";
import { motion } from "framer-motion";

import {
  Clock,
  TrendingUp,
  Target,
  Zap,
  BookMarked,
} from "lucide-react";

const QuickStats = ({subjects}) => {
  const statsContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const statsItemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={statsContainerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {/* Active Courses */}
      <motion.div
        variants={statsItemVariants}
        whileHover={{
          y: -6,
          scale: 1.03,
          boxShadow: "0px 12px 30px rgba(0,0,0,0.08)",
        }}
        className="rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-900/30 dark:to-blue-900/30 p-4 border border-gray-200 dark:border-white/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white dark:text-white">Active Courses</p>
            <p className="text-2xl font-semibold mt-1 text-white dark:text-white">
              {subjects.length}
            </p>
          </div>
          <BookMarked className="h-8 w-8 text-white dark:text-white" />
        </div>
        <p className="text-xs text-white dark:text-white mt-2">
          Updated automatically
        </p>
      </motion.div>

      {/* Study Hours */}
      <motion.div
        variants={statsItemVariants}
        whileHover={{
          y: -6,
          scale: 1.03,
          boxShadow: "0px 12px 30px rgba(0,0,0,0.08)",
        }}
        className="rounded-xl bg-gradient-to-br from-green-400 to-green-600 dark:from-blue-900/30 dark:to-blue-900/30 p-4 border border-gray-200 dark:border-white/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white dark:text-white">Study Hours</p>
            <p className="text-2xl font-semibold mt-1 text-white dark:text-white">
              142
            </p>
          </div>
          <Clock className="h-8 w-8 text-white dark:text-white" />
        </div>
        <div className="flex items-center gap-1 text-xs text-white dark:text-green-500 mt-2">
          <TrendingUp className="h-3 w-3" />
          +12% this week
        </div>
      </motion.div>

      {/* Avg Score */}
      <motion.div
        variants={statsItemVariants}
        whileHover={{
          y: -6,
          scale: 1.03,
          boxShadow: "0px 12px 30px rgba(0,0,0,0.08)",
        }}
        className="rounded-xl bg-gradient-to-br from-red-400 to-red-600 dark:from-blue-900/30 dark:to-blue-900/30 p-4 border border-gray-200 dark:border-white/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white dark:text-white">Avg. Score</p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-semibold mt-1 text-white dark:text-white"
            >
              <motion.span
                initial={{ count: 0 }}
                animate={{ count: 94 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                {Math.round(94)}
              </motion.span>
              %
            </motion.p>
          </div>
          <Target className="h-8 w-8 text-white dark:text-white" />
        </div>
        <div className="flex items-center gap-1 text-xs text-white dark:text-green-500 mt-2">
          <TrendingUp className="h-3 w-3" />
          +6% improvement
        </div>
      </motion.div>

      {/* Streak */}
      <motion.div
        variants={statsItemVariants}
        whileHover={{
          y: -6,
          scale: 1.03,
          boxShadow: "0px 12px 30px rgba(0,0,0,0.08)",
        }}
        className="rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-blue-900/30 dark:to-blue-900/30 p-4 border border-gray-200 dark:border-white/10"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white dark:text-white">Streak</p>
            <p className="text-2xl font-semibold mt-1 text-white dark:text-white">
              21
            </p>
          </div>
          <Zap className="h-8 w-8 text-white dark:text-white" />
        </div>
        <p className="text-xs text-white dark:text-white mt-2">
          🔥 Keep it up!
        </p>
      </motion.div>
    </motion.div>
  );
};

export default QuickStats;
