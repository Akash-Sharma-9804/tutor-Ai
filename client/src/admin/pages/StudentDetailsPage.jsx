import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaUserGraduate,
  FaSchool,
  FaChalkboardTeacher,
  FaBook,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaUsers,
  FaChartLine,
  FaHistory,
  FaCheckCircle,
  FaClock,
  FaPercentage,
  FaCommentDots,
  FaPaperPlane,
  FaEdit,
  FaTrash,
  FaExclamationCircle,
  FaUserFriends,
  FaFileAlt,
  FaCertificate,
} from "react-icons/fa";
import adminAxios from "../api/adminAxios";
import LoadingSpinner from "../components/LoadingSpinner";
import AdminFooter from "../layout/AdminFooter";

const StudentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const res = await adminAxios.get(`/students/${id}/details`);
      setStudentData(res.data.data);
    } catch (error) {
      console.error("Error fetching student details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      setSendingMessage(true);
      // Here you would integrate with your messaging API
      console.log("Sending message to student:", {
        studentId: id,
        studentName: studentData?.student?.name,
        message: message,
      });

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert(`Message sent to ${studentData?.student?.name}`);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleEditStudent = () => {
    navigate(`/admin/students/${id}/edit`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading student details..." />;
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Student not found
          </h2>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const {
    student,
    school,
    class: studentClass,
    subjects,
    books,
    activities,
    performance,
    attendance,
  } = studentData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 md:px-6 lg:px-8 pt-8 pb-0  transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaArrowLeft className="text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              Student Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete information about {student.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/messages?student=${id}`)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <FaCommentDots className="mr-2" />
            View Messages
          </button>
          <button
            onClick={handleEditStudent}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FaEdit className="mr-2" />
            Edit Student
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Info & Quick Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Student Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <FaUserGraduate className="text-white text-4xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                {student.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {studentClass?.name || "Not assigned to a class"}
              </p>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  student.status === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : student.status === "inactive"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                }`}
              >
                {student.status?.toUpperCase()}
              </span>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <FaUserGraduate className="mr-2 text-blue-500" />
                Personal Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-center">
                  <FaEnvelope className="text-gray-400 dark:text-gray-500 mr-3 w-5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      {student.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaPhone className="text-gray-400 dark:text-gray-500 mr-3 w-5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Phone
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      {student.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                {student.date_of_birth && (
                  <div className="flex items-center">
                    <FaBirthdayCake className="text-gray-400 dark:text-gray-500 mr-3 w-5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Date of Birth
                      </p>
                      <p className="text-gray-800 dark:text-gray-200">
                        {formatDate(student.date_of_birth)}
                        {studentData.statistics.age && (
                          <span className="ml-2 text-gray-500 dark:text-gray-400">
                            ({studentData.statistics.age} years old)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {student.parent_name && (
                  <div className="flex items-center">
                    <FaUserFriends className="text-gray-400 dark:text-gray-500 mr-3 w-5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Parent/Guardian
                      </p>
                      <p className="text-gray-800 dark:text-gray-200">
                        {student.parent_name}
                      </p>
                      {student.parent_phone && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {student.parent_phone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {student.address && (
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-gray-400 dark:text-gray-500 mr-3 w-5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Address
                      </p>
                      <p className="text-gray-800 dark:text-gray-200 text-sm">
                        {student.address}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-400 dark:text-gray-500 mr-3 w-5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Joined
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      {formatDate(student.created_at)}
                      {studentData.statistics.days_since_join > 0 && (
                        <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">
                          ({studentData.statistics.days_since_join} days ago)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* School & Class Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
              <FaSchool className="mr-2 text-blue-500" />
              School & Class Information
            </h3>

            <div className="space-y-4">
              <div
                onClick={() => navigate(`/admin/schools/${school.id}/details`)}
                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center mb-2">
                  <FaSchool className="text-blue-500 mr-2" />
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    School
                  </h4>
                </div>
                <p className="text-gray-800 dark:text-gray-200">
                  {school.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {school.board} • {school.state}, {school.country}
                </p>
                {school.email && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {school.email}
                  </p>
                )}
              </div>

              {studentClass && (
                <div
                  onClick={() => navigate(`/admin/classes/${studentClass.id}`)}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center mb-2">
                    <FaChalkboardTeacher className="text-green-500 mr-2" />
                    <h4 className="font-medium text-gray-800 dark:text-white">
                      Class
                    </h4>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200">
                    {studentClass.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {subjects.count} subjects • {books.count} books available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Message */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
              <FaCommentDots className="mr-2 text-purple-500" />
              Send Quick Message
            </h3>

            <div className="space-y-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Type a message to ${student.name}...`}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
              />

              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !message.trim()}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane className="mr-2" />
                {sendingMessage ? "Sending..." : "Send Message"}
              </button>

              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Messages will be delivered to the student's registered email or
                notification center
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Performance & Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
                  activeTab === "overview"
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                }`}
              >
                <FaChartLine className="inline mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab("progress")}
                className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
                  activeTab === "progress"
                    ? "border-b-2 border-green-500 text-green-600 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                }`}
              >
                <FaCheckCircle className="inline mr-2" />
                Progress
              </button>
              <button
                onClick={() => setActiveTab("activities")}
                className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
                  activeTab === "activities"
                    ? "border-b-2 border-purple-500 text-purple-600 dark:text-purple-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                }`}
              >
                <FaHistory className="inline mr-2" />
                Activities
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Performance Stats */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Performance Overview
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 p-4 rounded-xl">
                        <div className="flex items-center">
                          <FaBook className="text-blue-500 mr-3 text-xl" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Books Accessed
                            </p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">
                              {performance?.books_accessed || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 p-4 rounded-xl">
                        <div className="flex items-center">
                          <FaFileAlt className="text-green-500 mr-3 text-xl" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Subjects
                            </p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">
                              {subjects.count || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 p-4 rounded-xl">
                        <div className="flex items-center">
                          <FaCertificate className="text-purple-500 mr-3 text-xl" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Quizzes Passed
                            </p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">
                              {performance?.quizzes_passed || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 p-4 rounded-xl">
                        <div className="flex items-center">
                          <FaPercentage className="text-yellow-500 mr-3 text-xl" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Avg. Score
                            </p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">
                              {performance?.avg_quiz_score || 0}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Stats */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Attendance
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Attendance Rate
                          </p>
                          <p className="text-3xl font-bold text-gray-800 dark:text-white">
                            {attendance?.statistics.percentage}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Last 30 Days
                          </p>
                          <p className="text-lg font-semibold text-gray-800 dark:text-white">
                            {attendance?.statistics.present} /{" "}
                            {attendance?.statistics.total} days
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full"
                          style={{
                            width: `${attendance?.statistics.percentage}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Available Books */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Available Books
                      </h3>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {books.count} books available
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {books.list.slice(0, 4).map((book) => (
                        <div
                          key={book.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex items-start">
                            <FaBook className="text-blue-500 mt-1 mr-3" />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 dark:text-white mb-1">
                                {book.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {book.author} • {book.subject_name}
                              </p>
                              <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                {book.board}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {books.count > 4 && (
                      <button
                        onClick={() =>
                          navigate(`/admin/books?class=${studentClass?.id}`)
                        }
                        className="w-full mt-4 px-4 py-2 text-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        View All {books.count} Books →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Progress Tab */}
              {activeTab === "progress" && (
                <div className="space-y-6">
                  {/* Subjects Progress */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Subjects Progress
                    </h3>
                    <div className="space-y-3">
                      {subjects.list.map((subject, index) => {
                        const progress = Math.floor(Math.random() * 100); // Mock data - replace with real progress
                        return (
                          <div
                            key={subject.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <FaFileAlt className="text-green-500 mr-3" />
                                <span className="font-medium text-gray-800 dark:text-white">
                                  {subject.name}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                {progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Achievements */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Recent Achievements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mr-3">
                            <FaCertificate className="text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-white">
                              Quick Learner
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Completed 5 books in a week
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3">
                            <FaCheckCircle className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-white">
                              Perfect Attendance
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              30 days straight
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Activities Tab */}
              {activeTab === "activities" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Recent Activities
                    </h3>
                    <div className="space-y-3">
                      {activities.recent.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                        >
                          <div className="flex-shrink-0 mr-3">
                            {activity.activity_type === "login" ? (
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <FaUserGraduate className="text-blue-600 dark:text-blue-400 text-sm" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <FaBook className="text-green-600 dark:text-green-400 text-sm" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 dark:text-gray-200 mb-1">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDateTime(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attendance History */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Attendance History
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-4 bg-gray-100 dark:bg-gray-800 p-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        <div>Date</div>
                        <div>Status</div>
                        <div>Notes</div>
                        <div>Time</div>
                      </div>
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {attendance?.records.map((record, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-4 p-3 text-sm hover:bg-white dark:hover:bg-gray-800"
                          >
                            <div className="text-gray-800 dark:text-gray-200">
                              {formatDate(record.date)}
                            </div>
                            <div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  record.status === "present"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                }`}
                              >
                                {record.status?.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                              {record.notes || "-"}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              09:00 AM
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions & Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Administrative Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate(`/admin/students/${id}/attendance`)}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
              >
                <div className="flex items-center mb-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                    <FaCalendarAlt className="text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium text-gray-800 dark:text-white">
                    Manage Attendance
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  View and update attendance records
                </p>
              </button>

              <button
                onClick={() => navigate(`/admin/students/${id}/progress`)}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
              >
                <div className="flex items-center mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                    <FaChartLine className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium text-gray-800 dark:text-white">
                    View Progress Reports
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Detailed performance analytics
                </p>
              </button>

              <button
                onClick={() => navigate(`/admin/students/${id}/notifications`)}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
              >
                <div className="flex items-center mb-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                    <FaCommentDots className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="font-medium text-gray-800 dark:text-white">
                    Send Notifications
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Schedule alerts and reminders
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className=" md:-mx-8 -mx-4">
        <AdminFooter />
      </div>
    </div>
  );
};

export default StudentDetailsPage;
