
// pages/Dashboard.jsx - Fixed for Light Mode

import { React, useEffect, useState } from "react"
import axios from "axios";
import { motion } from "framer-motion";

import {
  ArrowRight,
  BookOpen,
  Clock,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Users,
  BarChart3,
  FileText,
  Video,
  MessageSquare,
  Bell,
  Star,
  Zap,
  Trophy,
  ChevronRight,
  BookMarked,
  GraduationCap,
} from "lucide-react"

const Dashboard = () => {

  const [student, setStudent] = useState(null);

  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.warn("⚠️ No token found, skipping subjects fetch");
          return;
        }

        console.log("📡 Fetching subjects...");

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/subjects/subjects`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("✅ Subjects fetched:", response.data);
        setSubjects(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch subjects:", error);
      }
    };

    fetchSubjects();
  }, []);



  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.warn("⚠️ No token found, skipping student profile fetch");
          return;
        }

        console.log("📡 Fetching student profile...");

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/student/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("✅ Student profile fetched:", response.data);
        setStudent(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch student profile:", error);
      }
    };

    fetchStudentProfile();
  }, []);

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-gray-900 dark:text-white "
    >


      {/* HEADER WITH STUDENT INFO */}
      <div className="flex flex-col sm:flex-row text-gray-900 dark:text-white justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold   ">Welcome back, <span className="text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
            {student?.studentName || "Student"}
          </span> ! 👋</h1>
          <p className="text-sm      mt-1">
            {student?.schoolName || "School"} • Class {student?.className}
          </p>
        </div>
        <div className="flex items-center text-gray-900 dark:text-white gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 dark:bg-white/5 border border-yellow-200  ">
            <Trophy className="h-4 w-4 text-yellow-600 " />
            <span className="text-sm   ">Rank: Top 15%</span>
          </div>
          <button className="p-2 rounded-lg bg-blue-50 dark:bg-white/5 hover:bg-blue-100 dark:hover:bg-white/10 transition border border-blue-200 dark:border-white/10">
            <Bell className="h-5 w-5 text-blue-600  " />
          </button>
        </div>
      </div>

      {/* HERO SECTION - Enhanced for E-Learning */}
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
  className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-[#0f0f1a] dark:to-[#1b1b2a] border border-purple-200 dark:border-white/10 shadow-xl"
>
  {/* Animated Background Elements */}
  <motion.div
    animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} 
    className="absolute top-0 right-0 w-40 h-40 bg-purple-200/50 dark:bg-white/5 rounded-full -translate-y-20 translate-x-20 blur-3xl"
  ></motion.div>
  <motion.div
    animate={{ y: [0, 10, 0], x: [0, -6, 0] }}
    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} 
    className="absolute bottom-0 left-0 w-32 h-32 bg-blue-200/50 dark:bg-white/5 rounded-full translate-y-16 -translate-x-16 blur-3xl"
  ></motion.div>

  {/* Decorative Pattern */}
  <div className="absolute inset-0 opacity-5 dark:opacity-5">
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>

  <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-8">
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

      <p className="text-sm text-gray-600 dark:text-gray-800 leading-relaxed">
        Experience board-aligned curriculum with AI-guided learning, personalized for your class. 
        Master every subject with interactive lessons, live doubt solving, and expert tutors.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-2">
        <div className="text-center p-3 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-purple-200 dark:border-gray-800/60">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">12</div>
          <div className="text-xs text-gray-600 dark:text-gray-800 mt-1">Subjects</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-blue-200 dark:border-gray-800/60">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
          <div className="text-xs text-gray-600 dark:text-gray-800 mt-1">Support</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-pink-200 dark:border-gray-800/60">
          <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">100%</div>
          <div className="text-xs text-gray-600 dark:text-gray-800 mt-1">Quality</div>
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
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 backdrop-blur-sm transition text-gray-900 dark:text-gray-800 font-semibold border border-gray-200 dark:border-gray-800/60"
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
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-20 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-2xl transform -rotate-12"
        >
          <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">📚</div>
        </motion.div>

        {/* Floating Certificate */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 w-24 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-2xl flex items-center justify-center text-3xl"
        >
          🏆
        </motion.div>

        {/* Laptop/Study Icon */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 left-1/3 w-28 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl flex items-center justify-center text-4xl transform rotate-6"
        >
          💻
        </motion.div>

        {/* Brain/AI Icon */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
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
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg z-20">
              ✓
            </div>
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
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
            scale: [0.8, 1, 0.8]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 right-1/2 text-3xl"
        >
          ✨
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1, 0.8]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
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
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-800">
          <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          Flexible Timings
        </div>
      </div>
      {/* <div className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-800">
          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Expert Tutors
        </div>
      </div> */}
      <div className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-800">
          <Award className="h-4 w-4 text-pink-600 dark:text-pink-400" />
          Certified Content
        </div>
      </div>
      <div className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-800">
          <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          AI Assistance
        </div>
      </div>
    </div>
  </div>
</motion.div>

      {/* QUICK STATS */}
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
            boxShadow: "0px 12px 30px rgba(0,0,0,0.08)"
          }}

          className="rounded-xl bg-[#756AB6] dark:bg-white/5 p-4 border border-gray-200 dark:border-white/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black dark:text-white/60">
                Active Courses
              </p>
              <p className="text-2xl font-semibold mt-1 text-black dark:text-white">
                {subjects.length}
              </p>
            </div>
            <BookMarked className="h-8 w-8 text-neutral-600 dark:text-purple-400" />
          </div>
          <p className="text-xs text-black dark:text-white/40 mt-2">
            Updated automatically
          </p>
        </motion.div>

        {/* Study Hours */}
        <motion.div
          variants={statsItemVariants}
          whileHover={{
            y: -6,
            scale: 1.03,
            boxShadow: "0px 12px 30px rgba(0,0,0,0.08)"
          }}

          className="rounded-xl bg-[#A4CCD9] dark:bg-white/5 p-4 border border-gray-200 dark:border-white/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-white/60">
                Study Hours
              </p>
              <p className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">
                142
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-2">
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
            boxShadow: "0px 12px 30px rgba(0,0,0,0.08)"
          }}

          className="rounded-xl bg-[#C7D9DD] dark:bg-white/5 p-4 border border-gray-200 dark:border-white/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-white/60">
                Avg. Score
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white"
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
            <Target className="h-8 w-8 text-green-500 dark:text-green-400" />
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-2">
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
            boxShadow: "0px 12px 30px rgba(0,0,0,0.08)"
          }}

          className="rounded-xl bg-[#F8F4E1] dark:bg-white/5 p-4 border border-gray-200 dark:border-white/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-white/60">
                Streak
              </p>
              <p className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">
                21
              </p>
            </div>
            <Zap className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
          </div>
          <p className="text-xs text-gray-500 dark:text-white/40 mt-2">
            🔥 Keep it up!
          </p>
        </motion.div>
      </motion.div>


      {/* GRID 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* MY COURSES */}
        <div className="lg:col-span-2 rounded-2xl bg-[#E6E6E6] dark:bg-[#14141f] border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Courses</h2>
            <button className="text-sm text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white flex items-center gap-1">
              View all <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {subjects.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-white/50">
                No subjects found for your class.
              </p>
            ) : (
              subjects.map((subject) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  whileHover={{
                    scale: 1.04,
                    rotate: 0.3,
                  }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent cursor-pointer"
                >

                  {/* Icon */}
                  <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                    <div className="h-10 w-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                      <BookOpen className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Subject Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {subject.name}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-white/50">
                          Subject • Class {student?.className}
                        </span>
                      </div>

                      <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400">
                        Active
                      </span>
                    </div>

                    {/* Placeholder Progress */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-white/50 mb-1">
                        <span>Progress</span>
                        <span>0%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "65%" }}   // later replace with real progress
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="h-full bg-indigo-500 rounded-full"
                        />

                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

        </div>

        {/* LEARNING ACTIVITY & UPCOMING */}
        <div className="space-y-6">
          {/* LEARNING ACTIVITY */}
          <div className="rounded-2xl bg-[#F3E8DF] dark:bg-[#14141f] border border-gray-200 dark:border-white/10 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Activity</h2>

            <div className="rounded-xl bg-purple-500/20 p-4 border border-purple-200 dark:border-purple-500/30">
              <p className="text-sm text-gray-600 dark:text-white/60">Study Time Today</p>
              <p className="text-3xl font-semibold mt-1 text-gray-900 dark:text-white">4.2h</p>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600 dark:text-white/60">Goal: 3h</span>
                <span className="text-green-600 dark:text-green-400">✓ Goal achieved</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-4 border border-gray-100 dark:border-transparent">
                <p className="text-sm text-gray-600 dark:text-white/60">Lessons Watched</p>
                <p className="text-xl font-semibold mt-1 text-gray-900 dark:text-white">12</p>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-4 border border-gray-100 dark:border-transparent">
                <p className="text-sm text-gray-600 dark:text-white/60">Quizzes Taken</p>
                <p className="text-xl font-semibold mt-1 text-gray-900 dark:text-white">3</p>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-4 border border-gray-100 dark:border-transparent">
              <p className="text-sm text-gray-600 dark:text-white/60">Weekly Streak</p>
              <div className="flex items-center justify-between">
                <p className="text-xl font-semibold mt-1 text-gray-900 dark:text-white">7 Days</p>
                <span className="text-yellow-400">🔥</span>
              </div>
            </div>
          </div>

          {/* UPCOMING DEADLINES */}
          <div className="rounded-2xl bg-[#EFE9E3] dark:bg-[#14141f] border border-gray-200 dark:border-white/10 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h2>

            <div className="space-y-3">
              {[
                {
                  title: "Quantum Mechanics Assignment",
                  type: "Assignment",
                  date: "Today · 4:00 PM",
                  priority: "high"
                },
                {
                  title: "Physics Mid-term Quiz",
                  type: "Quiz",
                  date: "Tomorrow",
                  priority: "medium"
                },
                {
                  title: "Economics Project",
                  type: "Project",
                  date: "Feb 28",
                  priority: "low"
                },
              ].map((item, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-white/50">{item.type}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${item.priority === 'high' ? 'bg-red-500/20 text-red-700 dark:text-red-400' : item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' : 'bg-blue-500/20 text-blue-700 dark:text-blue-400'}`}>
                    {item.date}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GRID 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* UPCOMING LEARNING */}
        <div className="rounded-2xl bg-[#F7F4EA] dark:bg-[#14141f] border border-gray-200 dark:border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Learning</h2>
            <button className="text-sm text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white">
              View calendar
            </button>
          </div>

          {[
            {
              title: "Quantum Mechanics",
              type: "Live Lesson",
              date: "Today · 4:00 PM",
              instructor: "Dr. Smith",
              icon: <Video className="h-4 w-4" />
            },
            {
              title: "Physics Quiz",
              type: "Test",
              date: "Tomorrow · 10:00 AM",
              instructor: "Prof. Johnson",
              icon: <FileText className="h-4 w-4" />
            },
            {
              title: "Study Group: Economics",
              type: "Group Session",
              date: "Feb 27 · 2:00 PM",
              instructor: "Peer-led",
              icon: <Users className="h-4 w-4" />
            },
          ].map((item, i) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              key={i}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <div className="text-purple-600 dark:text-purple-400">{item.icon}</div>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/50">
                    <span>{item.type}</span>
                    <span>•</span>
                    <span>{item.instructor}</span>
                  </div>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-white/50 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {item.date}
              </span>
            </motion.div>
          ))}
        </div>

        {/* PERFORMANCE & RECOMMENDATIONS */}
        <div className="space-y-6">
          {/* PERFORMANCE SNAPSHOT */}
          <div className="rounded-2xl bg-[#F9F5F0] dark:bg-[#14141f] border border-gray-200 dark:border-white/10 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Snapshot</h2>

            <div className="rounded-xl bg-purple-500/20 p-4 border border-purple-200 dark:border-purple-500/30">
              <p className="text-sm text-gray-600 dark:text-white/60">Average Score</p>
              <p className="text-3xl font-semibold mt-1 text-gray-900 dark:text-white">88%</p>
              <div className="flex items-center gap-2 text-sm mt-2">
                <span className="text-gray-600 dark:text-white/60">Class average: 76%</span>
                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +12%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-white/5 p-4 border border-gray-100 dark:border-transparent">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Weekly Improvement</p>
                  <p className="text-sm text-gray-600 dark:text-white/60">Compared to last week</p>
                </div>
              </div>
              <span className="text-green-600 dark:text-green-400 font-semibold">+6%</span>
            </div>

            <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-4 border border-gray-100 dark:border-transparent">
              <p className="text-sm text-gray-600 dark:text-white/60 mb-2">Course Performance</p>
              <div className="space-y-2">
                {[
                  { name: "Physics", score: 92, trend: "up" },
                  { name: "Economics", score: 88, trend: "up" },
                  { name: "Mathematics", score: 85, trend: "stable" },
                ].map((course, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }} key={i} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 dark:text-white">{course.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">{course.score}%</span>
                      {course.trend === "up" && <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />}
                      {course.trend === "stable" && <span className="text-gray-400 dark:text-white/60">—</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="rounded-2xl bg-white dark:bg-[#14141f] border border-gray-200 dark:border-white/10 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent">
                <MessageSquare className="h-5 w-5 mb-2 text-gray-900 dark:text-white" />
                <span className="text-sm text-gray-900 dark:text-white">Messages</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent">
                <BookOpen className="h-5 w-5 mb-2 text-gray-900 dark:text-white" />
                <span className="text-sm text-gray-900 dark:text-white">Library</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent">
                <Award className="h-5 w-5 mb-2 text-gray-900 dark:text-white" />
                <span className="text-sm text-gray-900 dark:text-white">Achievements</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent">
                <GraduationCap className="h-5 w-5 mb-2 text-gray-900 dark:text-white" />
                <span className="text-sm text-gray-900 dark:text-white">Certificates</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Dashboard