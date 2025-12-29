import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen,
  Award,
  Target,
  Star,
  TrendingUp,
  Clock,
  Users,
  Zap,
  Edit2,
  Settings,
  Download,
  Share2,
  Shield,
  Sparkles,
  Brain,
  Trophy,
  Activity,
  BarChart3,
  Bookmark,
  Heart,
  Bell,
  Camera,
} from "lucide-react";
import Footer from "../components/Footer/Footer";

export default function Profile() {
  // Student data
  const student = {
    name: "Alex Johnson",
    grade: "Grade 9",
    studentId: "STU-2024-9876",
    email: "alex.j@student.edu",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    joinDate: "January 2023",
    bio: "Passionate learner excelling in Science and Mathematics. Always eager to explore new concepts with AI-powered tools.",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=06b6d4",
    streak: 14,
    totalHours: 342,
    rank: 12,
    totalStudents: 1564,
  };

  // Subjects with performance
  const subjects = [
    {
      name: "Mathematics",
      score: 92,
      progress: 85,
      color: "from-blue-500 to-cyan-500",
      icon: "➗",
    },
    {
      name: "Physics",
      score: 88,
      progress: 78,
      color: "from-purple-500 to-pink-500",
      icon: "⚛️",
    },
    {
      name: "Chemistry",
      score: 91,
      progress: 82,
      color: "from-green-500 to-emerald-500",
      icon: "🧪",
    },
    {
      name: "Biology",
      score: 85,
      progress: 75,
      color: "from-lime-500 to-green-500",
      icon: "🧬",
    },
    {
      name: "English",
      score: 87,
      progress: 80,
      color: "from-orange-500 to-yellow-500",
      icon: "📚",
    },
    {
      name: "History",
      score: 83,
      progress: 70,
      color: "from-rose-500 to-red-500",
      icon: "🏛️",
    },
  ];

  // Recent achievements
  const achievements = [
    {
      title: "Math Master",
      desc: "Scored 100% in 5 consecutive quizzes",
      icon: <Trophy className="h-5 w-5" />,
      date: "2 days ago",
      color: "bg-gradient-to-r from-yellow-500 to-amber-500",
    },
    {
      title: "Fast Learner",
      desc: "Completed 20 AI lessons in a week",
      icon: <Zap className="h-5 w-5" />,
      date: "1 week ago",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
    },
    {
      title: "Study Streak",
      desc: "14 days of consistent learning",
      icon: <TrendingUp className="h-5 w-5" />,
      date: "Today",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      title: "AI Partner",
      desc: "Solved 100+ AI practice problems",
      icon: <Brain className="h-5 w-5" />,
      date: "3 days ago",
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
    },
  ];

  // Upcoming deadlines
  const deadlines = [
    {
      title: "Physics Mid-term",
      subject: "Physics",
      date: "Mar 15",
      priority: "high",
    },
    {
      title: "Math Assignment",
      subject: "Mathematics",
      date: "Mar 18",
      priority: "medium",
    },
    {
      title: "Chemistry Lab Report",
      subject: "Chemistry",
      date: "Mar 20",
      priority: "medium",
    },
    {
      title: "English Essay",
      subject: "English",
      date: "Mar 22",
      priority: "low",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="px-0 sm:px-6 lg:px-8 pt-6 space-y-6 text-gray-900 dark:text-white"
    >
      <div className="  pt-6">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-500/10 to-yellow-500/10 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="relative group"
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="relative w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 shadow-xl"
                  />
                  <button className="absolute bottom-2 right-2 p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <Camera className="h-4 w-4" />
                  </button>
                </motion.div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {student.name}
                      </h1>
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold">
                        {student.grade}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-2xl">
                      {student.bio}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-2 shadow hover:shadow-md transition-shadow"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </motion.button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {student.totalHours}h
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Study Time
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 p-4 rounded-2xl border border-purple-200 dark:border-purple-800/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {student.streak}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Day Streak
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 p-4 rounded-2xl border border-green-200 dark:border-green-800/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          #{student.rank}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Class Rank
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 p-4 rounded-2xl border border-orange-200 dark:border-orange-800/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          4.8
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Rating
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Email
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {student.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Phone
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {student.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Location
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {student.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Member Since
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {student.joinDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Subjects & Performance */}
          <div className="lg:col-span-2 space-y-8">
            {/* Subjects Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Subjects Performance
                  </h2>
                </div>
                <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                  Detailed Report
                  <Download className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map((subject, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -5 }}
                    className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 rounded-xl bg-gradient-to-br ${subject.color}`}
                        >
                          <span className="text-xl">{subject.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {subject.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Current Score
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {subject.score}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Progress
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {subject.progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${subject.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={`h-full rounded-full bg-gradient-to-r ${subject.color}`}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition-shadow">
                        Practice
                      </button>
                      <button className="flex-1 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Recent Achievements
                  </h2>
                </div>
                <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  View All (24)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ x: 5 }}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 p-4 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-3 rounded-xl ${achievement.color} shadow-lg`}
                      >
                        <div className="text-white">{achievement.icon}</div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {achievement.desc}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {achievement.date}
                          </span>
                          <Heart className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Deadlines */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Upcoming Deadlines
                  </h2>
                </div>
                <span className="text-sm px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 font-semibold">
                  4 Pending
                </span>
              </div>

              <div className="space-y-4">
                {deadlines.map((deadline, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    whileHover={{ x: 5 }}
                    className="group p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {deadline.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          deadline.priority === "high"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : deadline.priority === "medium"
                            ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {deadline.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {deadline.subject}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {deadline.date}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                View All Deadlines
              </motion.button>
            </motion.div>

            {/* Learning Goals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Learning Goals
                  </h2>
                </div>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                  3/5 Complete
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    goal: "Master Calculus Basics",
                    progress: 90,
                    color: "from-blue-500 to-cyan-500",
                  },
                  {
                    goal: "Complete Physics Module",
                    progress: 75,
                    color: "from-purple-500 to-pink-500",
                  },
                  {
                    goal: "Read 5 Science Papers",
                    progress: 60,
                    color: "from-green-500 to-emerald-500",
                  },
                  {
                    goal: "Improve Writing Skills",
                    progress: 45,
                    color: "from-orange-500 to-yellow-500",
                  },
                  {
                    goal: "Learn AI Basics",
                    progress: 30,
                    color: "from-red-500 to-pink-500",
                  },
                ].map((goal, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-900 dark:text-white">
                        {goal.goal}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${goal.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 font-semibold border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Set New Goals
              </motion.button>
            </motion.div>

            {/* AI Study Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl shadow-2xl p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-4">
                <Brain className="h-6 w-6" />
                <h2 className="text-xl font-bold">AI Study Recommendations</h2>
              </div>

              <p className="text-blue-100 mb-6">
                Based on your learning patterns, AI suggests focusing on Physics
                for maximum improvement this week.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Physics Practice</span>
                  <span className="font-semibold">45 min/day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Math Revision</span>
                  <span className="font-semibold">30 min/day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Chemistry Lab</span>
                  <span className="font-semibold">60 min (once)</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 rounded-xl bg-white text-blue-600 font-bold shadow-lg hover:shadow-xl transition-shadow"
              >
                Generate Study Plan
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="  md:-mx-8 -mx-4">
        <Footer />
      </div>
    </motion.div>
  );
}
