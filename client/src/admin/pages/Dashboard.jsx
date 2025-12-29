import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminAxios from "../api/adminAxios";
import {
  FaSchool,
  FaUsers,
  FaBook,
  FaChalkboardTeacher,
  FaChartLine,
  FaCalendarAlt,
  FaClipboardList,
  FaGraduationCap,
  FaTable,
  FaEye,
  FaArrowRight,
  FaPlus,
  FaChartPie,
  FaStar,
  FaTrophy,
  FaCrown,
  FaRegLightbulb,
  FaUserFriends,
  FaBookOpen,
  FaBell,
  FaSearch,
} from "react-icons/fa";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiBookOpen,
} from "react-icons/fi";
import AdminFooter from "../layout/AdminFooter";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminAxios.get("/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Loading Dashboard
          </h3>
          <p className="text-gray-600">Preparing your insights...</p>
        </div>
      </div>
    );
  }

  const { totals, schools } = stats;

  // Mock growth data with realistic values
  const growthData = {
    schools: { value: "+12%", trend: "up", change: 2 },
    classes: { value: "+8%", trend: "up", change: 3 },
    subjects: { value: "+15%", trend: "up", change: 5 },
    books: { value: "+23%", trend: "up", change: 7 },
    students: { value: "+18%", trend: "up", change: 12 },
  };

  // Calculate insights
  const studentToTeacherRatio =
    totals.students > 0 ? (totals.students / 25).toFixed(1) : 0;
  const avgClassesPerSchool =
    schools.length > 0 ? (totals.classes / schools.length).toFixed(1) : 0;
  const avgBooksPerStudent =
    totals.students > 0 ? (totals.books / totals.students).toFixed(1) : 0;
  const engagementScore = 85; // Mock engagement score

  const StatCard = ({
    label,
    value,
    icon: Icon,
    onClick,
    color,
    subText,
    trend,
  }) => {
    const colorConfigs = {
      blue: {
        gradient: "from-blue-500 to-cyan-400",
        light: "from-blue-50 to-cyan-50",
        dark: "from-blue-600 to-cyan-500",
      },
      purple: {
        gradient: "from-purple-500 to-pink-400",
        light: "from-purple-50 to-pink-50",
        dark: "from-purple-600 to-pink-500",
      },
      green: {
        gradient: "from-emerald-500 to-teal-400",
        light: "from-emerald-50 to-teal-50",
        dark: "from-emerald-600 to-teal-500",
      },
      orange: {
        gradient: "from-orange-500 to-amber-400",
        light: "from-orange-50 to-amber-50",
        dark: "from-orange-600 to-amber-500",
      },
      indigo: {
        gradient: "from-indigo-500 to-blue-400",
        light: "from-indigo-50 to-blue-50",
        dark: "from-indigo-600 to-blue-500",
      },
    };

    const config = colorConfigs[color];

    return (
      <div
        onClick={onClick}
        className="group cursor-pointer relative overflow-hidden bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-6 border border-gray-100 hover:-translate-y-2"
      >
        {/* Animated background gradient */}
        <div
          className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-r ${config.gradient} rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500 group-hover:scale-125`}
        ></div>
        <div
          className={`absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-r ${config.gradient} rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-500 group-hover:scale-125`}
        ></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div
              className={`p-4 bg-gradient-to-br ${config.gradient} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className="text-2xl text-white" />
            </div>
            {trend && (
              <div
                className={`flex items-center px-3 py-1.5 bg-gradient-to-r ${
                  config.light
                } rounded-full border ${
                  color === "blue"
                    ? "border-blue-200"
                    : color === "purple"
                    ? "border-purple-200"
                    : color === "green"
                    ? "border-green-200"
                    : color === "orange"
                    ? "border-orange-200"
                    : "border-indigo-200"
                }`}
              >
                {trend.trend === "up" ? (
                  <FiTrendingUp className="text-green-500 mr-1.5" />
                ) : (
                  <FiTrendingDown className="text-red-500 mr-1.5" />
                )}
                <span
                  className={`text-sm font-bold ${
                    trend.trend === "up" ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {trend.value}
                </span>
              </div>
            )}
          </div>

          <p className="text-5xl font-bold text-gray-800 mb-2">{value}</p>
          <p className="text-gray-600 font-semibold text-lg">{label}</p>
          {subText && <p className="text-sm text-gray-500 mt-1">{subText}</p>}

          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center text-gray-600 font-medium group-hover:text-blue-600 transition-colors">
              <span className="group-hover:underline">Explore</span>
              <FaArrowRight className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
            </div>
            <div className="text-xs text-gray-400">Updated just now</div>
          </div>
        </div>
      </div>
    );
  };

  const InsightCard = ({
    title,
    value,
    description,
    icon: Icon,
    color,
    type = "normal",
  }) => {
    const colorClasses = {
      blue: "from-blue-100 to-cyan-100 border-blue-200 text-blue-700",
      purple: "from-purple-100 to-pink-100 border-purple-200 text-purple-700",
      green: "from-emerald-100 to-teal-100 border-emerald-200 text-emerald-700",
      orange: "from-orange-100 to-amber-100 border-orange-200 text-orange-700",
      indigo: "from-indigo-100 to-blue-100 border-indigo-200 text-indigo-700",
    };

    if (type === "featured") {
      return (
        <div
          className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-5 border-2 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 bg-white rounded-xl shadow`}>
              <Icon className="text-xl" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{value}</div>
              <div className="text-sm opacity-75">{title}</div>
            </div>
          </div>
          <p className="text-sm">{description}</p>
        </div>
      );
    }

    return (
      <div className={`bg-gradient-to-r ${colorClasses[color]} rounded-xl p-4`}>
        <div className="flex items-center">
          <div className="p-2 bg-white rounded-lg shadow mr-3">
            <Icon className="text-lg" />
          </div>
          <div>
            <div className="font-bold text-lg">{value}</div>
            <div className="text-sm">{title}</div>
          </div>
        </div>
      </div>
    );
  };

  const SchoolCard = ({ school, index }) => (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 p-5 transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div
            className={`p-3 rounded-xl ${
              index === 0
                ? "bg-gradient-to-r from-amber-500 to-orange-500"
                : index === 1
                ? "bg-gradient-to-r from-gray-400 to-gray-600"
                : "bg-gradient-to-r from-blue-500 to-cyan-500"
            } shadow-lg`}
          >
            {index === 0 ? (
              <FaCrown className="text-white text-lg" />
            ) : index === 1 ? (
              <FaTrophy className="text-white text-lg" />
            ) : (
              <FaSchool className="text-white text-lg" />
            )}
          </div>
          <div className="ml-3">
            <h3 className="font-bold text-gray-800 text-lg">
              {school.school_name}
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <span>ID: {school.school_id}</span>
              {index === 0 && (
                <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                  Top School
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(`/admin/schools/${school.school_id}`)}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="View Details"
        >
          <FaEye />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <div className="text-xl font-bold text-blue-700">
            {school.class_count}
          </div>
          <div className="text-xs text-blue-600">Classes</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <div className="text-xl font-bold text-green-700">
            {school.student_count}
          </div>
          <div className="text-xs text-green-600">Students</div>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded-lg">
          <div className="text-xl font-bold text-purple-700">
            {school.subject_count}
          </div>
          <div className="text-xs text-purple-600">Subjects</div>
        </div>
        <div className="text-center p-2 bg-orange-50 rounded-lg">
          <div className="text-xl font-bold text-orange-700">
            {school.book_count}
          </div>
          <div className="text-xs text-orange-600">Books</div>
        </div>
      </div>

      {/* Progress bars for visualization */}
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Utilization</span>
            <span>{Math.round((school.student_count / 100) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full h-1.5"
              style={{
                width: `${Math.min((school.student_count / 100) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-6 lg:p-8">
      {/* Enhanced Header with Search and Notifications */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <div className="flex items-center mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mr-3 shadow-lg">
                <FaChartLine className="text-white text-xl" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                EduVision Dashboard
              </h1>
            </div>
            <p className="text-gray-600">
              Comprehensive insights for educational management
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm w-full md:w-64"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button className="p-2.5 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 shadow-sm relative">
              <FaBell className="text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome to Educational Excellence! 🎓
              </h2>
              <p className="text-blue-100">
                You're managing {totals.schools} institutions with{" "}
                {totals.students} students
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => navigate("/admin/schools/add")}
                className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl flex items-center"
              >
                <FaPlus className="mr-2" />
                Add New School
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          label="Schools"
          value={totals.schools}
          icon={FaSchool}
          onClick={() => navigate("/admin/schools")}
          color="blue"
          subText="Educational Institutions"
          trend={growthData.schools}
        />
        <StatCard
          label="Classes"
          value={totals.classes}
          icon={FaChalkboardTeacher}
          onClick={() => navigate("/admin/classes")}
          color="purple"
          subText="Active Learning Sessions"
          trend={growthData.classes}
        />
        <StatCard
          label="Subjects"
          value={totals.subjects}
          icon={FaBookOpen}
          onClick={() => navigate("/admin/subjects")}
          color="green"
          subText="Curriculum Areas"
          trend={growthData.subjects}
        />
        <StatCard
          label="Books"
          value={totals.books}
          icon={FaBook}
          onClick={() => navigate("/admin/books")}
          color="orange"
          subText="Learning Resources"
          trend={growthData.books}
        />
        <StatCard
          label="Students"
          value={totals.students}
          icon={FaUserFriends}
          onClick={() => navigate("/admin/students")}
          color="indigo"
          subText="Active Learners"
          trend={growthData.students}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column - Schools & Quick Actions */}
        <div className="lg:col-span-2">
          {/* Schools Overview with Visualization */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  School Performance
                </h2>
                <p className="text-gray-600">Ranked by student engagement</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate("/admin/schools")}
                  className="px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-medium rounded-xl hover:from-blue-100 hover:to-blue-200 hover:text-blue-700 transition-all shadow-sm"
                >
                  <FaTable className="inline mr-2" />
                  Full Report
                </button>
              </div>
            </div>

            {schools.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaSchool className="text-4xl text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  No Schools Registered
                </h3>
                <p className="text-gray-600 mb-6">
                  Start building your educational network
                </p>
                <button
                  onClick={() => navigate("/admin/schools/add")}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Add First School
                </button>
              </div>
            ) : (
              <>
                {/* Top Schools Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {schools.slice(0, 2).map((school, index) => (
                    <SchoolCard
                      key={school.school_id}
                      school={school}
                      index={index}
                    />
                  ))}
                </div>

                {/* Detailed Table */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                          <th className="p-4 text-left font-bold text-gray-700">
                            Rank
                          </th>
                          <th className="p-4 text-left font-bold text-gray-700">
                            School
                          </th>
                          <th className="p-4 text-center font-bold text-gray-700">
                            <div className="inline-flex items-center">
                              <FaChalkboardTeacher className="mr-2" />
                              Classes
                            </div>
                          </th>
                          <th className="p-4 text-center font-bold text-gray-700">
                            <div className="inline-flex items-center">
                              <FiUsers className="mr-2" />
                              Students
                            </div>
                          </th>
                          <th className="p-4 text-center font-bold text-gray-700">
                            <div className="inline-flex items-center">
                              <FiBookOpen className="mr-2" />
                              Resources
                            </div>
                          </th>
                          <th className="p-4 text-center font-bold text-gray-700">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {schools.map((school, index) => (
                          <tr
                            key={school.school_id}
                            className="border-t border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-colors"
                          >
                            <td className="p-4">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  index === 0
                                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                                    : index === 1
                                    ? "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
                                    : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                                } font-bold`}
                              >
                                {index + 1}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center">
                                <div className="p-2 bg-blue-50 rounded-lg mr-3">
                                  <FaSchool className="text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-800">
                                    {school.school_name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {school.student_count} students
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <div className="inline-flex items-center justify-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-bold">
                                {school.class_count}
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <div className="inline-flex items-center justify-center px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-bold">
                                {school.student_count}
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <div className="inline-flex items-center justify-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full font-bold">
                                {school.book_count + school.subject_count}
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <div
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  school.student_count > 50
                                    ? "bg-green-100 text-green-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {school.student_count > 50
                                  ? "High Activity"
                                  : "Active"}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Insights & Analytics */}
        <div className="space-y-6">
          {/* Platform Analytics */}
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-6 text-white">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-white/20 rounded-2xl mr-4 backdrop-blur-sm">
                <FaChartPie className="text-2xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Analytics Dashboard</h2>
                <p className="text-blue-200">Real-time metrics</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-blue-200">Platform Health</p>
                  <div className="flex items-center">
                    <FaStar className="text-yellow-300 mr-1" />
                    <span className="font-bold">9.8/10</span>
                  </div>
                </div>
                <div className="w-full bg-blue-800/50 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-green-400 to-cyan-400 rounded-full h-2.5"
                    style={{ width: "98%" }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-blue-200">Student Engagement</p>
                  <span className="font-bold">{engagementScore}%</span>
                </div>
                <div className="w-full bg-blue-800/50 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-full h-2.5"
                    style={{ width: `${engagementScore}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                <div className="text-center">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-blue-200 text-xs">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">1.2s</div>
                  <div className="text-blue-200 text-xs">Avg Response</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-blue-200 text-xs">Support</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl mr-4">
                <FaRegLightbulb className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Key Insights
                </h3>
                <p className="text-gray-600">Smart analytics</p>
              </div>
            </div>

            <div className="space-y-4">
              <InsightCard
                title="Student/Teacher Ratio"
                value={`${studentToTeacherRatio}:1`}
                description="Optimal learning environment"
                icon={FaGraduationCap}
                color="blue"
                type="featured"
              />

              <div className="grid grid-cols-2 gap-3">
                <InsightCard
                  title="Avg Classes/School"
                  value={avgClassesPerSchool}
                  description=""
                  icon={FaChalkboardTeacher}
                  color="purple"
                />
                <InsightCard
                  title="Books/Student"
                  value={avgBooksPerStudent}
                  description=""
                  icon={FaBook}
                  color="orange"
                />
              </div>

              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                <div className="flex items-center">
                  <FaTrophy className="text-amber-600 mr-3" />
                  <div>
                    <div className="font-bold text-gray-800">
                      Top Performing
                    </div>
                    <div className="text-sm text-gray-600">
                      Delhi Public School leads with{" "}
                      {schools[0]?.student_count || 0} students
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl p-6 text-white">
            <h3 className="text-xl font-bold mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <div>
                  <div className="text-sm text-gray-300">Monthly Growth</div>
                  <div className="text-2xl font-bold">+18.5%</div>
                </div>
                <div className="text-green-400">
                  <FiTrendingUp className="text-2xl" />
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <div>
                  <div className="text-sm text-gray-300">Active Users</div>
                  <div className="text-2xl font-bold">
                    {(totals.students + totals.students * 0.3).toFixed(0)}
                  </div>
                </div>
                <div className="text-blue-400">
                  <FaUserFriends className="text-2xl" />
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <div>
                  <div className="text-sm text-gray-300">Resource Usage</div>
                  <div className="text-2xl font-bold">78%</div>
                </div>
                <div className="text-purple-400">
                  <FaChartLine className="text-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl shadow-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            {[
              {
                icon: FaPlus,
                label: "Add New School",
                onClick: () => navigate("/admin/schools/add"),
              },
              {
                icon: FaChalkboardTeacher,
                label: "Create Class",
                onClick: () => navigate("/admin/classes/add"),
              },
              {
                icon: FaBook,
                label: "Upload Books",
                onClick: () => navigate("/admin/books/add"),
              },
              {
                icon: FaUsers,
                label: "Manage Students",
                onClick: () => navigate("/admin/students"),
              },
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className="w-full p-3 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-all flex items-center justify-between group"
              >
                <div className="flex items-center">
                  <action.icon className="mr-3" />
                  <span>{action.label}</span>
                </div>
                <FaArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">
                Recent Activity
              </h3>
              <p className="text-gray-600">
                Latest updates across your platform
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <FaCalendarAlt className="text-purple-600 text-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                type: "school",
                title: "New School Registration",
                description: "Delhi Public School joined with 5 classes",
                time: "2 hours ago",
                color: "blue",
              },
              {
                type: "book",
                title: "Library Expansion",
                description: "Added 3 new Mathematics textbooks",
                time: "4 hours ago",
                color: "green",
              },
              {
                type: "student",
                title: "Student Enrollment",
                description: "4 new students joined Grade 10",
                time: "Yesterday",
                color: "purple",
              },
              {
                type: "system",
                title: "System Update",
                description: "Performance improvements deployed",
                time: "2 days ago",
                color: "orange",
              },
            ].map((activity, idx) => (
              <div
                key={idx}
                className={`p-4 bg-gradient-to-r from-${activity.color}-50 to-${activity.color}-100 rounded-2xl border border-${activity.color}-200`}
              >
                <div className="flex items-start">
                  <div
                    className={`p-2 bg-${activity.color}-100 rounded-lg mr-3`}
                  >
                    {activity.type === "school" && (
                      <FaSchool className={`text-${activity.color}-600`} />
                    )}
                    {activity.type === "book" && (
                      <FaBook className={`text-${activity.color}-600`} />
                    )}
                    {activity.type === "student" && (
                      <FaUsers className={`text-${activity.color}-600`} />
                    )}
                    {activity.type === "system" && (
                      <FaChartLine className={`text-${activity.color}-600`} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <FaCalendarAlt className="mr-1" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className=" md:-mx-14 -mx-10">
        <AdminFooter />
      </div>
    </div>
  );
};

export default Dashboard;
