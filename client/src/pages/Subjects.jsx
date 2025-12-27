import React, { useState } from "react";
import {
  BookOpen,
  Users,
  Clock,
  Star,
  TrendingUp,
  ChevronRight,
  Filter,
  BarChart3,
  Target,
  Calendar,
  ChevronDown,
  Award,
  Zap,
  PieChart,
  Book,
  Download,
  Eye,
  X,
  Sparkles,
} from "lucide-react";
import { useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Stats from "../components/SubjectComponents/Stats";
import Footer from "../components/Footer/Footer";

const SubjectsPage = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [subjects, setSubjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showBooksModal, setShowBooksModal] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/subjects/subjects`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Fetched subjects:", res.data);
        // 🔥 MAP REAL SUBJECTS INTO UI SHAPE (KEY PART)
        const mappedSubjects = res.data.map((sub, index) => ({
          id: sub.id,
          name: sub.name,

          // UI-required fields (TEMP defaults)
          instructor: "AI Tutor",
          students: 100 + index * 25,
          progress: 30 + index * 10,
          rating: 4.7,
          color: [
            "from-blue-500 to-cyan-500",
            "from-purple-500 to-pink-500",
            "from-green-500 to-emerald-500",
            "from-orange-500 to-amber-500",
            "from-rose-500 to-red-500",
            "from-indigo-500 to-violet-500",
          ][index % 6],
          status: "In Progress",
          nextLesson: "AI Guided Lesson",
          totalLessons: 40,
          completedLessons: Math.floor((30 + index * 10) * 0.4),
          difficulty: "Intermediate",
          category: "Science",
          enrollmentDate: "2024-02-01",
          upcomingDeadline: "In 3 days",
        }));

        setSubjects(mappedSubjects);
      } catch (err) {
        console.error("Failed to fetch subjects", err);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        console.log("Fetching ALL books");

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/books`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Fetched books:", res.data);
        setBooks(res.data);
      } catch (err) {
        console.error("Failed to fetch books", err);
      }
    };

    fetchBooks();
  }, []);

  // Fetch books for a specific subject
  const fetchBooksBySubject = async (subjectId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingBooks(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/subject/${subjectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Fetched books for subject:", res.data);
      setFilteredBooks(res.data);
    } catch (err) {
      console.error("Failed to fetch books for subject", err);
      setFilteredBooks([]);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setShowBooksModal(true);
    fetchBooksBySubject(subject.id);
  };

  const filteredSubjects = subjects.filter((subject) => {
    // Category buttons filter
    const matchesActiveFilter =
      activeFilter === "all" || subject.name === activeFilter;

    // Dropdown category filter (safe)
    const matchesCategory =
      selectedCategory === "All" || subject.category === selectedCategory;

    // Search filter
    const matchesSearch = subject.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesActiveFilter && matchesCategory && matchesSearch;
  });

  const filters = [
    { id: "all", label: "All" },
    ...Array.from(new Set(subjects.map((subject) => subject.name))).map(
      (name) => ({
        id: name,
        label: name,
      })
    ),
  ];

  const subjectIdByName = subjects.reduce((acc, subject) => {
    acc[subject.name] = subject.id;
    return acc;
  }, {});

  const sortOptions = [
    { id: "progress", label: "Progress" },
    { id: "rating", label: "Rating" },
    { id: "students", label: "Popularity" },
    { id: "deadline", label: "Deadline" },
  ];

  // Calculate statistics for the dashboard

  // Subject distribution by category
  const categoryData = [
    { name: "Science", value: 3, color: "bg-blue-500" },
    { name: "Technology", value: 1, color: "bg-orange-500" },
    { name: "Humanities", value: 2, color: "bg-teal-500" },
  ];

  // Performance trend data
  const performanceData = [
    { month: "Jan", score: 78 },
    { month: "Feb", score: 82 },
    { month: "Mar", score: 85 },
    { month: "Apr", score: 88 },
    { month: "May", score: 90 },
    { month: "Jun", score: 92 },
  ];

  // Animation variants - visible from start, animate from bottom
  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 1, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.15,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="px-0 sm:px-6 lg:px-8 pt-6 space-y-6 text-gray-900 dark:text-white"
    >
      {/* Header with Stats */}
      <div className="mb-8 mt-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <div>
            <h1 className="mb-2 text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              My Subjects
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and track your enrolled courses
            </p>
          </div>
          <motion.div whileTap={{ scale: 0.95 }} className="mt-4 lg:mt-0">
            <button className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40">
              <BookOpen className="h-4 w-4" />
              Browse All Books
              <Sparkles className="h-4 w-4" />
            </button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <Stats subjects={subjects} />
      </div>

      {/* Filters Section - Enhanced */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <motion.button
                key={filter.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeFilter === filter.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600  text-white shadow-lg shadow-blue-500/30"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500"
                }`}
              >
                {filter.label}
                {activeFilter === filter.id && (
                  <motion.div
                    layoutId="activeFilter"
                    className="ml-2 inline-block h-2 w-2 rounded-full bg-white"
                  />
                )}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Subjects Grid */}
        <div className="xl:col-span-2">
          <motion.div
            initial="visible"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {filteredSubjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12"
              >
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  No subjects found
                </p>
              </motion.div>
            ) : (
              filteredSubjects.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial="initial"
                  animate="animate"
                  variants={itemVariants}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSubjectClick(subject)}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#14141f] overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-200 cursor-pointer group"
                >
                  {/* Header with Gradient */}
                  <div
                    className={`h-32 bg-gradient-to-br ${subject.color} dark:from-blue-900/30 dark:to-blue-900/30 p-6 relative overflow-hidden`}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 dark:bg-white/5 rounded-full"
                    />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="h-12 w-12 rounded-xl bg-white/20 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center transition-transform duration-200">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex items-center gap-1 bg-white/20 dark:bg-white/10 backdrop-blur-sm px-2 py-1 rounded-lg">
                          <Star className="h-3 w-3 text-yellow-300 fill-yellow-300" />
                          <span className="text-xs font-semibold text-white">
                            {subject.rating}
                          </span>
                        </div>
                      </div>
                      <div className=" flex justify-between">
                        <h3 className="font-bold text-xl text-white ">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-white/80">
                          {subject.instructor}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Progress
                        </span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">
                          {subject.progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${subject.progress}%` }}
                          transition={{ duration: 0.8, delay: index * 0.05 }}
                          className={`h-full bg-gradient-to-r ${subject.color} rounded-full`}
                        />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-blue-900/30 border border-blue-200 dark:border-transparent">
                        <Users className="h-4 w-4 text-blue-600 dark:text-gray-400 mx-auto mb-1" />
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {subject.students}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Students
                        </p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-blue-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-transparent">
                        <Clock className="h-4 w-4 text-purple-600 dark:text-gray-400 mx-auto mb-1" />
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {subject.totalLessons}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Lessons
                        </p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-blue-900/30 dark:to-blue-900/30 border border-green-200 dark:border-transparent">
                        <Calendar className="h-4 w-4 text-green-600 dark:text-gray-400 mx-auto mb-1" />
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {subject.upcomingDeadline}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Deadline
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r ${subject.color} text-white font-semibold shadow-lg transition-shadow duration-200 group`}
                    >
                      <Book className="h-4 w-4" />
                      View Books
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        {/* Sidebar with Charts and Insights */}
        <div className="space-y-6">
          {/* Subject Distribution Chart */}
          <div className="rounded-xl border border-indigo-200 dark:border-white/10 bg-white dark:bg-[#14141f] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Your Subjects
              </h3>
              <PieChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="space-y-4">
              {subjects.slice(0, 4).map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 1, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.4 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full bg-gradient-to-r ${subject.color}`}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {subject.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {subject.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${subject.progress}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05 }}
                      className={`h-full bg-gradient-to-r ${subject.color} rounded-full`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Performance Trend Chart */}
          <div className="rounded-xl border border-green-200 dark:border-white/10 bg-white dark:bg-[#14141f] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Performance Trend
              </h3>
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex items-end justify-between h-40">
              {performanceData.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${item.score * 0.4}px` }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      className="w-8 bg-gradient-to-t from-green-400 to-green-600 dark:from-green-500 dark:to-green-600 rounded-t-lg hover:from-green-500 hover:to-green-700 dark:hover:from-green-600 dark:hover:to-green-700 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Score: {item.score}%
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                📈 Monthly average scores are improving!
              </p>
            </div>
          </div>

          {/* Study Focus */}
          <div className="rounded-xl border border-yellow-200 dark:border-white/10 bg-white dark:bg-[#14141f] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Study Focus
              </h3>
              <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="space-y-3">
              {subjects
                .sort((a, b) => a.progress - b.progress)
                .slice(0, 2)
                .map((subject, index) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 1, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.4 }}
                    className="p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-blue-900/30 dark:to-blue-900/30 border border-yellow-200 dark:border-transparent"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${subject.color} shadow-lg`}
                      >
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {subject.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Progress: {subject.progress}%
                        </p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 dark:from-blue-600 dark:to-blue-700 text-white text-xs font-medium hover:from-yellow-600 hover:to-amber-600 dark:hover:from-blue-700 dark:hover:to-blue-600 transition-colors shadow-md"
                      >
                        Focus
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Books Modal */}
      <AnimatePresence>
        {showBooksModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBooksModal(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#14141f] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-white/10"
            >
              {/* Modal Header */}
              <div
                className={`p-6 bg-gradient-to-r ${selectedSubject?.color} dark:from-[#0f0f1a] dark:to-[#1b1b2a] relative overflow-hidden border-b dark:border-white/10`}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full"
                />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {selectedSubject?.name}
                    </h2>
                    <p className="text-white/80">Available Books & Resources</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowBooksModal(false)}
                    className="h-10 w-10 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 dark:hover:bg-white/20 transition-all"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {loadingBooks ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600 mb-4"
                    />
                    <p className="text-gray-600 dark:text-gray-400">
                      Loading books...
                    </p>
                  </div>
                ) : filteredBooks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <Book className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                      No books available
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm">
                      Books will be added soon!
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial="visible"
                    animate="visible"
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {filteredBooks.map((book, index) => (
                      <motion.div
                        key={book.id}
                        initial="initial"
                        animate="animate"
                        variants={itemVariants}
                        className="p-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-gray-50 to-white dark:bg-white/5 shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-12 w-12 rounded-lg bg-gradient-to-br ${selectedSubject?.color} flex items-center justify-center flex-shrink-0 shadow-lg`}
                          >
                            <Book className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                              {book.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-2">
                              <motion.a
                                href={book.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </motion.a>
                              <motion.a
                                href={book.pdf_url}
                                download
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </motion.a>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="  md:-mx-8 -mx-4">
        <Footer />
      </div>
    </motion.div>
  );
};

export default SubjectsPage;
