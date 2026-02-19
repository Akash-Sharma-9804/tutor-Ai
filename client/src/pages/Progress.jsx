import { motion } from "framer-motion";
import {
  TrendingUp,
  Target,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Award,
  Clock,
  BookOpen,
  Brain,
  Zap,
  Trophy,
  Star,
  Users,
  TrendingDown,
  Download,
  Filter,
  Share2,
  Eye,
  RefreshCw,
  ArrowUpRight,
  ChevronRight,
  Lightbulb,
  TargetIcon,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Settings,
} from "lucide-react";
import Footer from "../components/Footer/Footer";
import GitHubContributionHeatmap from "../components/ProgressComponent/GitHubContributionHeatmap";

export default function Progress() {
  // Overall progress data
  const overallProgress = {
    completion: 78,
    avgScore: 88,
    timeSpent: 342,
    streak: 14,
    rank: 12,
    improvement: "+12%",
  };

 

  // Subject progress data
  const subjectProgress = [
    {
      name: "Mathematics",
      score: 92,
      progress: 85,
      trend: "up",
      improvement: "+8%",
    },
    {
      name: "Physics",
      score: 88,
      progress: 78,
      trend: "up",
      improvement: "+5%",
    },
    {
      name: "Chemistry",
      score: 91,
      progress: 82,
      trend: "stable",
      improvement: "0%",
    },
    {
      name: "Biology",
      score: 85,
      progress: 75,
      trend: "up",
      improvement: "+3%",
    },
    {
      name: "English",
      score: 87,
      progress: 80,
      trend: "stable",
      improvement: "0%",
    },
    {
      name: "History",
      score: 83,
      progress: 70,
      trend: "up",
      improvement: "+6%",
    },
  ];

  // Monthly progress data for line chart
  const monthlyData = [
    { month: "Jan", score: 75, hours: 28 },
    { month: "Feb", score: 78, hours: 32 },
    { month: "Mar", score: 82, hours: 35 },
    { month: "Apr", score: 85, hours: 38 },
    { month: "May", score: 88, hours: 40 },
    { month: "Jun", score: 91, hours: 42 },
  ];

  // Study time distribution
  const timeDistribution = [
    {
      subject: "Mathematics",
      hours: 85,
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
    },
    {
      subject: "Physics",
      hours: 72,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    {
      subject: "Chemistry",
      hours: 65,
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
    },
    {
      subject: "Biology",
      hours: 58,
      color: "bg-gradient-to-r from-lime-500 to-green-500",
    },
    {
      subject: "Others",
      hours: 62,
      color: "bg-gradient-to-r from-orange-500 to-yellow-500",
    },
  ];

  // Milestones achieved
  const milestones = [
    {
      title: "100 Hours Learned",
      achieved: true,
      date: "Jun 15",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: "Math Pro Certification",
      achieved: true,
      date: "May 28",
      icon: <Award className="h-5 w-5" />,
    },
    {
      title: "30-Day Streak",
      achieved: false,
      target: "20/30",
      icon: <Zap className="h-5 w-5" />,
    },
    {
      title: "Top 10 in Class",
      achieved: false,
      target: "Current: #12",
      icon: <Trophy className="h-5 w-5" />,
    },
    {
      title: "All Subjects 90%+",
      achieved: false,
      target: "4/6 subjects",
      icon: <TargetIcon className="h-5 w-5" />,
    },
    {
      title: "AI Tutor Master",
      achieved: true,
      date: "Apr 12",
      icon: <Brain className="h-5 w-5" />,
    },
  ];

  // Learning insights from AI
  const insights = [
    {
      title: "Peak Learning Time",
      desc: "Your best performance is between 4-6 PM",
      icon: <Clock className="h-5 w-5" />,
      type: "schedule",
    },
    {
      title: "Fastest Improvement",
      desc: "Physics scores improved by 15% this month",
      icon: <TrendingUp className="h-5 w-5" />,
      type: "improvement",
    },
    {
      title: "Attention Needed",
      desc: "History requires more focus this week",
      icon: <AlertCircle className="h-5 w-5" />,
      type: "attention",
    },
    {
      title: "Consistency Award",
      desc: "14-day streak! Keep going!",
      icon: <Zap className="h-5 w-5" />,
      type: "achievement",
    },
  ];

  // Weekly progress comparison
  const weeklyComparison = [
    { day: "Mon", hours: 4.2, score: 85 },
    { day: "Tue", hours: 5.1, score: 88 },
    { day: "Wed", hours: 3.8, score: 82 },
    { day: "Thu", hours: 4.5, score: 90 },
    { day: "Fri", hours: 3.2, score: 78 },
    { day: "Sat", hours: 6.0, score: 92 },
    { day: "Sun", hours: 2.8, score: 80 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="px-0 sm:px-6 lg:px-8 pt-6 space-y-6 text-gray-900 dark:text-white"
    >
      {/* Header */}
      <div className="pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold dark:text-white text-blue-700 mb-2">
              Learning Progress
            </h1>
            <p className="dark:text-blue-100">
              Track your academic growth with AI-powered insights
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2.5 rounded-xl dark:bg-white/20 shadow-lg bg-white dark:backdrop-blur-sm dark:text-white font-semibold flex items-center gap-2 hover:bg-white/30 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export Report
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-600 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
            >
              <Share2 className="h-4 w-4" />
              Share Progress
            </motion.button>
          </div>
        </div>
      </div>

      <div className="pt-8">
        {/* Main Content Grid in 2 Parts */}
        <div className="grid grid-cols-1 gap-8">
          {/* LEFT PART - Activity Graph */}

          {/* RIGHT PART - All Progress Charts (3/4 width) */}
          <div className=" space-y-8">
            {/* Overview Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-900/30 dark:to-blue-900/30 rounded-2xl p-6 text-white shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-white/20">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <span className="text-sm px-2 py-1 rounded-full bg-white/20">
                    Overall
                  </span>
                </div>
                <p className="text-3xl font-bold mb-2">
                  {overallProgress.completion}%
                </p>
                <p className="text-blue-100">Course Completion</p>
                <div className="h-2 bg-white/30 rounded-full mt-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress.completion}%` }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-500 to-pink-500 dark:from-blue-900/30 dark:to-blue-900/30 rounded-2xl p-6 text-white shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-white/20">
                    <Star className="h-6 w-6" />
                  </div>
                  <span className="text-sm px-2 py-1 rounded-full bg-white/20">
                    Avg.
                  </span>
                </div>
                <p className="text-3xl font-bold mb-2">
                  {overallProgress.avgScore}%
                </p>
                <p className="text-purple-100">Average Score</p>
                <div className="flex items-center gap-2 mt-4">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">
                    {overallProgress.improvement} this month
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-green-500 to-emerald-500 dark:from-blue-900/30 dark:to-blue-900/30 rounded-2xl p-6 text-white shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-white/20">
                    <Clock className="h-6 w-6" />
                  </div>
                  <span className="text-sm px-2 py-1 rounded-full bg-white/20">
                    Total
                  </span>
                </div>
                <p className="text-3xl font-bold mb-2">
                  {overallProgress.timeSpent}h
                </p>
                <p className="text-green-100">Study Time</p>
                <div className="flex items-center gap-2 mt-4">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">
                    {overallProgress.streak} day streak
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-orange-500 to-yellow-500 dark:from-blue-900/30 dark:to-blue-900/30 rounded-2xl p-6 text-white shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-white/20">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <span className="text-sm px-2 py-1 rounded-full bg-white/20">
                    Rank
                  </span>
                </div>
                <p className="text-3xl font-bold mb-2">
                  #{overallProgress.rank}
                </p>
                <p className="text-orange-100">Class Ranking</p>
                <div className="flex items-center gap-2 mt-4">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Out of 1,564 students</span>
                </div>
              </motion.div>
            </div>

            {/* Main Charts Row - 2 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Subject Performance Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Subject Performance
                    </h2>
                  </div>
                  <select className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm">
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                    <option>All Time</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {subjectProgress.map((subject, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900 dark:text-white w-32">
                            {subject.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Score:
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {subject.score}%
                            </span>
                            {subject.trend === "up" ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {subject.progress}%
                          </span>
                          <span
                            className={`text-xs ml-2 px-2 py-1 rounded-full ${
                              subject.improvement.startsWith("+")
                                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {subject.improvement}
                          </span>
                        </div>
                      </div>

                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${subject.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={`h-full rounded-full ${
                            subject.score >= 90
                              ? "bg-gradient-to-r from-green-500 to-emerald-500"
                              : subject.score >= 80
                              ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                              : "bg-gradient-to-r from-orange-500 to-yellow-500"
                          }`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Progress Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                      <LineChart className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Progress Timeline
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Score
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Hours
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chart Visualization */}
                <div className="relative h-64 mt-8">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[100, 80, 60, 40, 20, 0].map((line) => (
                      <div
                        key={line}
                        className="border-t border-gray-200 dark:border-gray-700"
                      ></div>
                    ))}
                  </div>

                  {/* Data Points */}
                  <div className="absolute inset-0 flex items-end justify-between px-4">
                    {monthlyData.map((data, index) => (
                      <div
                        key={index}
                        className="relative flex flex-col items-center"
                      >
                        {/* Score Bar */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${data.score}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="w-6 bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-lg mb-2"
                        />

                        {/* Hours Bar */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${data.hours}%` }}
                          transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                          className="w-6 bg-gradient-to-t from-green-500 to-emerald-500 rounded-t-lg"
                        />

                        {/* Month Label */}
                        <span className="absolute -bottom-6 text-sm text-gray-600 dark:text-gray-400">
                          {data.month}
                        </span>

                        {/* Score Tooltip */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {data.score}% Score
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-4 mt-12">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800/30">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Highest Score
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      91%
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Jun (+3%)
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border border-green-200 dark:border-green-800/30">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Most Study Hours
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      42h
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Jun (+5h)
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Insights & Distribution Row - 3 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* AI Insights */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-500 to-purple-500 dark:from-blue-900/30 dark:to-blue-900/30 rounded-3xl shadow-2xl p-6 text-white"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Brain className="h-6 w-6" />
                    <h2 className="text-xl font-bold">AI Insights</h2>
                  </div>
                  <RefreshCw className="h-5 w-5 text-blue-200" />
                </div>

                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-3 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            insight.type === "achievement"
                              ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                              : insight.type === "improvement"
                              ? "bg-gradient-to-r from-green-500 to-emerald-500"
                              : insight.type === "attention"
                              ? "bg-gradient-to-r from-red-500 to-pink-500"
                              : "bg-gradient-to-r from-blue-500 to-cyan-500"
                          }`}
                        >
                          {insight.icon}
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">{insight.title}</h3>
                          <p className="text-sm text-blue-200">
                            {insight.desc}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-6 py-3 rounded-xl bg-white text-blue-600 font-bold shadow-lg hover:shadow-xl transition-shadow"
                >
                  Get Detailed Analysis
                </motion.button>
              </motion.div>

              {/* Study Time Distribution */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                      <PieChart className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Study Distribution
                    </h2>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total:{" "}
                    {timeDistribution.reduce((sum, t) => sum + t.hours, 0)}h
                  </span>
                </div>

                <div className="space-y-3">
                  {timeDistribution.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-900 dark:text-white">
                          {item.subject}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {item.hours}h
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.hours / 340) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={`h-full rounded-full ${item.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Daily Average
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Last 30 days
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      4.2h
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Learning Milestones */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500">
                      <TargetIcon className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Milestones
                    </h2>
                  </div>
                  <span className="text-sm px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-semibold">
                    3/6 Achieved
                  </span>
                </div>

                <div className="space-y-3">
                  {milestones.map((milestone, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className={`flex items-center justify-between p-3 rounded-xl ${
                        milestone.achieved
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                          : "bg-gray-50 dark:bg-gray-900/50"
                      } border ${
                        milestone.achieved
                          ? "border-green-200 dark:border-green-800/30"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            milestone.achieved
                              ? "bg-gradient-to-r from-green-500 to-emerald-500"
                              : "bg-gradient-to-r from-gray-500 to-gray-400"
                          }`}
                        >
                          <div className="text-white">{milestone.icon}</div>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {milestone.title}
                          </h3>
                          {milestone.achieved ? (
                            <p className="text-xs text-green-600 dark:text-green-400">
                              {milestone.date}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {milestone.target}
                            </p>
                          )}
                        </div>
                      </div>
                      {milestone.achieved ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
            <GitHubContributionHeatmap />
            {/* Weekly Comparison - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Weekly Performance
                  </h2>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Current Week: June 10-16
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weeklyComparison.map((day, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="text-center"
                  >
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      {day.day}
                    </div>
                    <div className="relative h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      {/* Hours bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.hours / 6) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-cyan-500"
                      />
                      {/* Score bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.score / 100) * 50}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 to-emerald-500 opacity-80"
                        style={{ height: "50%" }}
                      />
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-gray-900 dark:text-white font-medium">
                        {day.hours}h
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {day.score}%
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: "Avg. Daily Study",
                    value: "4.2h",
                    change: "+0.5h",
                    trend: "up",
                  },
                  {
                    label: "Completion Rate",
                    value: "78%",
                    change: "+12%",
                    trend: "up",
                  },
                  {
                    label: "Active Days",
                    value: "285",
                    change: "+45",
                    trend: "up",
                  },
                  {
                    label: "Focus Score",
                    value: "8.2/10",
                    change: "+0.8",
                    trend: "up",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {stat.value}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          stat.trend === "up"
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="md:-mx-8 -mx-4">
        <Footer />
      </div>
    </motion.div>
  );
}
