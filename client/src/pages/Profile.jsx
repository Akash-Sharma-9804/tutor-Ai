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
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import Footer from "../components/Footer/Footer";

export default function Profile() {
  // State for student data
  const [student, setStudent] = useState({
    name: "Loading...",
    grade: "...",
    studentId: "...",
    email: "...",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    joinDate: "January 2023",
    bio: "Passionate learner excelling in Science and Mathematics. Always eager to explore new concepts with AI-powered tools.",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Default&backgroundColor=06b6d4",
    streak: 14,
    totalHours: 342,
    rank: 12,
    totalStudents: 1564,
  });
  
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", bio: "", dob: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [picLoading, setPicLoading] = useState(false);
  const [picError, setPicError] = useState("");
  const [pwModal, setPwModal] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

  // Fetch student profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, statsRes, subjectsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/me`, { headers }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subjects/dashboard-stats`, { headers }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subjects/subjects-with-progress`, { headers }),
        ]);

        const profileData = profileRes.data;
        const stats = statsRes.data;

      const avatarUrl = profileData.gender === 'Male' ? '/man-profile.jpg' : '/female-profile.jpg';

        setStudent({
          name: profileData.studentName || "Student",
          grade: `Class ${profileData.className}` || "N/A",
          studentId: `STU-${profileData.studentId}`,
          email: profileData.email || "N/A",
          phone: profileData.phone || "N/A",
          location: profileData.schoolName || "N/A",
          age: profileData.age || "N/A",
          gender: profileData.gender || "N/A",
          dob: profileData.dob ? new Date(profileData.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "N/A",
          dobRaw: profileData.dob ? new Date(profileData.dob).toISOString().split("T")[0] : "",
          joinDate: profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : "N/A",
          bio: profileData.bio || "Passionate learner exploring new concepts with AI-powered tools.",
          avatar: profileData.profile_picture || avatarUrl,
          streak: stats.streak.current,
          totalHours: stats.studyHours.total,
          lessonsTotal: stats.lessons.total,
          rank: null,
          authProvider: profileData.auth_provider || "local",
          passwordSet: profileData.password_set ?? true,
        });

        setEditForm({
          name: profileData.studentName || "",
          phone: profileData.phone || "",
          bio: profileData.bio || "",
          dob: profileData.dob ? new Date(profileData.dob).toISOString().split("T")[0] : "",
        });

        // Map real subjects with progress
        const mappedSubjects = subjectsRes.data.map((s, i) => ({
          name: s.name,
          score: s.progress,
          progress: s.progress,
          totalChapters: s.totalChapters,
          color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
          icon: SUBJECT_ICONS[i % SUBJECT_ICONS.length],
        }));
        setSubjects(mappedSubjects);

      } catch (err) {
        console.error("Failed to fetch student profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const [subjects, setSubjects] = useState([]);

  const SUBJECT_COLORS = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-lime-500 to-green-500",
    "from-orange-500 to-yellow-500",
    "from-rose-500 to-red-500",
  ];
  const SUBJECT_ICONS = ["📖", "🔬", "🧪", "🧬", "📚", "🏛️", "➗", "⚛️", "🌍", "💻"];
  // Dynamic achievements derived from real stats
  const achievements = [
    student.streak >= 7 && {
      title: `${student.streak}-Day Streak`,
      desc: `${student.streak} days of consistent learning`,
      icon: <TrendingUp className="h-5 w-5" />,
      date: "Today",
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
    },
    student.lessonsTotal >= 10 && {
      title: "Active Learner",
      desc: `Completed ${student.lessonsTotal} lessons so far`,
      icon: <Zap className="h-5 w-5" />,
      date: "Ongoing",
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
    },
    student.totalHours >= 1 && {
      title: `${student.totalHours}h Studied`,
      desc: "Total reading time logged on the platform",
      icon: <Clock className="h-5 w-5" />,
      date: "All time",
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
    },
    subjects.length > 0 && {
      title: "Multi-Subject",
      desc: `Enrolled in ${subjects.length} subject${subjects.length > 1 ? "s" : ""}`,
      icon: <BookOpen className="h-5 w-5" />,
      date: "Active",
      color: "bg-gradient-to-r from-yellow-500 to-amber-500",
    },
  ].filter(Boolean);

  // Deadlines — no backend yet, show empty state
  const deadlines = [];

  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");
    const isGoogleNewPassword = student.authProvider === "google" && !student.passwordSet;
    if (!isGoogleNewPassword && !pwForm.current) { setPwError("Enter your current password."); return; }
    if (pwForm.next.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError("New passwords do not match."); return; }
    setPwLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/student/me/password`,
        { currentPassword: pwForm.current, newPassword: pwForm.next },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPwSuccess(isGoogleNewPassword ? "Password set! You can now login with email too." : "Password changed successfully!");
      setPwForm({ current: "", next: "", confirm: "" });
      if (isGoogleNewPassword) {
        setStudent(prev => ({ ...prev, passwordSet: true }));
      }
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleEditSave = async () => {
    setEditError("");
    if (!editForm.name.trim()) {
      setEditError("Name cannot be empty.");
      return;
    }
    setEditLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/student/me`,
        { name: editForm.name, phone: editForm.phone, bio: editForm.bio, dob: editForm.dob },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudent(prev => ({
        ...prev,
        name: editForm.name,
        phone: editForm.phone,
        bio: editForm.bio,
        dobRaw: editForm.dob,
        dob: editForm.dob ? new Date(editForm.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : prev.dob,
      }));
      setEditModal(false);
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleProfilePicture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPicError("");
    setPicLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("profilePicture", file);
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/student/me/profile-picture`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );
      setStudent(prev => ({ ...prev, avatar: res.data.url + `?t=${Date.now()}` }));
    } catch (err) {
      setPicError(err.response?.data?.message || "Failed to upload picture.");
    } finally {
      setPicLoading(false);
    }
  };

 if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                    className="relative w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 shadow-xl object-cover"
                  />
                  <label className={`absolute bottom-2 right-2 p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${picLoading ? 'opacity-60 pointer-events-none' : ''}`}>
                    {picLoading ? (
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleProfilePicture}
                    />
                  </label>
                </motion.div>
                {picError && (
                  <p className="text-xs text-red-500 mt-2 max-w-[130px] text-center">{picError}</p>
                )}
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
                      onClick={() => { setEditError(""); setEditModal(true); }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setPwError(""); setPwSuccess(""); setPwModal(true); }}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-2 shadow hover:shadow-md transition-shadow"
                    >
                      <Lock className="h-4 w-4" />
                      Password
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
                          {student.totalHours ?? 0}h
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
                          {student.streak ?? 0}
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
                          {student.lessonsTotal ?? 0}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Lessons Done
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
                  {deadlines.length} Pending
                </span>
              </div>

              <div className="space-y-4">
                {deadlines.length === 0 && (
                  <p className="text-center text-gray-400 dark:text-gray-500 py-6 text-sm">
                    No upcoming deadlines
                  </p>
                )}
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

      {/* Edit Profile Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                  <Edit2 className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
              </div>
              <button
                onClick={() => setEditModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Profile Picture Preview */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-16 h-16 rounded-2xl border-2 border-gray-200 dark:border-gray-600 object-cover shadow"
                  />
                  <label className={`absolute -bottom-1 -right-1 p-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow cursor-pointer ${picLoading ? 'opacity-60 pointer-events-none' : ''}`}>
                    {picLoading ? (
                      <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                    ) : (
                      <Camera className="h-3 w-3" />
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleProfilePicture}
                    />
                  </label>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Profile Picture</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">JPG, PNG or WEBP · Max 5MB</p>
                  {picError && <p className="text-xs text-red-500 mt-1">{picError}</p>}
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <div className="relative">
                  <textarea
                    value={editForm.bio}
                    onChange={e => {
                      if (e.target.value.length <= 200)
                        setEditForm(prev => ({ ...prev, bio: e.target.value }))
                    }}
                    placeholder="Tell something about yourself..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                  />
                  <span className={`absolute bottom-3 right-3 text-xs ${editForm.bio.length >= 190 ? 'text-orange-400' : 'text-gray-400'}`}>
                    {editForm.bio.length}/200
                  </span>
                </div>
              </div>

              {/* Date of Birth Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={editForm.dob}
                    onChange={e => setEditForm(prev => ({ ...prev, dob: e.target.value }))}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Read-only info note */}
              <p className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900/30 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700">
                ℹ️ Email, class, and school details can only be updated by your school administrator.
              </p>

              {/* Error */}
              {editError && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 border border-red-200 dark:border-red-800">
                  {editError}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setEditModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEditSave}
                disabled={editLoading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {editLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Saving...
                  </>
                ) : "Save Changes"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Change / Set Password Modal */}
      {pwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {student.authProvider === "google" && !student.passwordSet ? "Set Password" : "Change Password"}
                  </h2>
                  {student.authProvider === "google" && !student.passwordSet && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      You signed in with Google. Set a password to also login with email.
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setPwModal(false); setPwForm({ current: "", next: "", confirm: "" }); setPwError(""); setPwSuccess(""); }}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Current Password */}
            {[
                ...(student.authProvider === "google" && !student.passwordSet
                  ? []
                  : [{ key: "current", label: "Current Password", placeholder: "Enter current password" }]),
                { key: "next",    label: "New Password",     placeholder: "Min. 6 characters" },
                { key: "confirm", label: "Confirm New Password", placeholder: "Re-enter new password" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPw[key] ? "text" : "password"}
                      value={pwForm[key]}
                      onChange={e => setPwForm(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(prev => ({ ...prev, [key]: !prev[key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPw[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}

              {/* Strength hint */}
              {pwForm.next && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => {
                      const len = pwForm.next.length;
                      const hasUpper = /[A-Z]/.test(pwForm.next);
                      const hasNum = /[0-9]/.test(pwForm.next);
                      const hasSymbol = /[^A-Za-z0-9]/.test(pwForm.next);
                      const strength = [len >= 6, hasUpper, hasNum, hasSymbol].filter(Boolean).length;
                      const colors = ["bg-red-400","bg-orange-400","bg-yellow-400","bg-green-500"];
                      return (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength - 1] : "bg-gray-200 dark:bg-gray-700"}`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {(() => {
                      const len = pwForm.next.length;
                      const hasUpper = /[A-Z]/.test(pwForm.next);
                      const hasNum = /[0-9]/.test(pwForm.next);
                      const hasSymbol = /[^A-Za-z0-9]/.test(pwForm.next);
                      const strength = [len >= 6, hasUpper, hasNum, hasSymbol].filter(Boolean).length;
                      return ["Too weak","Fair","Good","Strong"][strength - 1] || "Too weak";
                    })()}
                  </p>
                </div>
              )}

              {/* Error / Success */}
              {pwError && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 border border-red-200 dark:border-red-800">
                  {pwError}
                </p>
              )}
              {pwSuccess && (
                <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 border border-green-200 dark:border-green-800">
                  ✅ {pwSuccess}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => { setPwModal(false); setPwForm({ current: "", next: "", confirm: "" }); setPwError(""); setPwSuccess(""); }}
                className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleChangePassword}
                disabled={pwLoading || !!pwSuccess}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {pwLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Updating...
                  </>
                ) : "Update Password"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <div className="  md:-mx-8 -mx-4">
        <Footer />
      </div>
    </motion.div>
  );
}