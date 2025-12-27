import React from "react";
import { BookOpen, Clock, TrendingUp, Target, Award } from "lucide-react";
import { motion } from "framer-motion";

const Stats = ({ subjects }) => {
  const totalProgress =
    subjects.reduce((sum, subject) => sum + subject.progress, 0) /
    subjects.length;
  const totalLessons = subjects.reduce(
    (sum, subject) => sum + subject.totalLessons,
    0
  );
  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };
  return (
    <motion.div
      initial="visible"
      animate="visible"
      variants={containerVariants}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {[
        {
          label: "Total Subjects",
          value: subjects.length,
          icon: <BookOpen className="h-5 w-5" />,
          accent: "text-blue-600 dark:text-blue-400",
          gradient:
            "from-blue-500 to-cyan-500 dark:from-blue-900/30 dark:to-blue-900/30",
          darkBg: "dark:bg-[#0f0f1a]",
          border: "border-blue-200",
          darkBorder: "dark:border-blue-500/20",
        },
        {
          label: "Avg. Progress",
          value: `${Math.round(totalProgress)}%`,
          icon: <Target className="h-5 w-5" />,
          accent: "text-purple-600 dark:text-purple-400 ",
          gradient:
            "from-purple-500 to-pink-500 dark:from-blue-900/30 dark:to-blue-900/30",
          darkBg: "dark:bg-[#0f0f1a]",
          border: "border-purple-200",
          darkBorder: "dark:border-purple-500/20",
        },
        {
          label: "Total Lessons",
          value: totalLessons,
          icon: <Clock className="h-5 w-5" />,
          accent: "text-green-600 dark:text-green-400",
          gradient:
            "from-green-500 to-emerald-500 dark:from-blue-900/30 dark:to-blue-900/30",
          darkBg: "dark:bg-[#0f0f1a]",
          border: "border-green-200",
          darkBorder: "dark:border-green-500/20",
        },
        {
          label: "Achievements",
          value: "12",
          icon: <Award className="h-5 w-5" />,
          accent: "text-orange-600 dark:text-orange-400",
          gradient:
            "from-orange-500 to-amber-500 dark:from-blue-900/30 dark:to-blue-900/30",
          darkBg: "dark:bg-[#0f0f1a]",
          border: "border-orange-200",
          darkBorder: "dark:border-orange-500/20",
        },
      ].map((stat) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          whileHover={{ y: -4 }}
          className={`
        rounded-xl
        border
        ${stat.border}
        ${stat.darkBorder}

        bg-gradient-to-br ${stat.gradient}
        
        ${stat.darkBg}

        p-5
        transition-all duration-300
        hover:shadow-lg
        dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.6)]
      `}
        >
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div
              className={`
            h-11 w-11 rounded-xl
            flex items-center justify-center
            bg-white/80 dark:bg-white/5
            ${stat.accent}
          `}
            >
              {stat.icon}
            </div>

            <TrendingUp className="h-4 w-4 text-green-100 dark:text-green-400" />
          </div>

          {/* Text */}
          <p className="text-sm text-gray-100 dark:text-white/50 mb-1">
            {stat.label}
          </p>
          <p className="text-2xl font-semibold text-gray-100 dark:text-white">
            {stat.value}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Stats;
