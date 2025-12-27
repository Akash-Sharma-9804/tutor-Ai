import React from "react";
import { motion } from "framer-motion";

const TopHeader = ({student}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-blue-800 via-red-800 to-pink-800 dark:from-blue-900/30 dark:via-blue-500/30 dark:to-blue-900/30 rounded-2xl p-6 md:p-8 text-white overflow-hidden relative mt-6"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-40 h-40 bg-white rounded-full -top-20 -right-20 animate-float"></div>
        <div
          className="absolute w-32 h-32 bg-white rounded-full -bottom-16 -left-16 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Welcome back,{" "}
              <span className="text-yellow-200">
                {student?.studentName.split(" ")[0]}! 🎉
              </span>
            </h1>
            <p className="text-white/90">
              Keep up your amazing progress! You're on a 10-day streak!
            </p>
          </div>
          <div className="hidden md:block text-7xl animate-float">📚</div>
        </div>
      </div>
    </motion.div>
  );
};

export default TopHeader;
