import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaSchool,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaArrowLeft,
  FaChalkboardTeacher,
  FaBook,
  FaUsers,
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaUserGraduate,
  FaClipboardList,
} from "react-icons/fa";
import adminAxios from "../api/adminAxios";
import LoadingSpinner from "../components/LoadingSpinner";
import AdminFooter from "../layout/AdminFooter";

const SchoolDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState(null);
  const [expandedClass, setExpandedClass] = useState(null);

  useEffect(() => {
    fetchSchoolDetails();
  }, [id]);

  const fetchSchoolDetails = async () => {
    try {
      setLoading(true);
      const res = await adminAxios.get(`/schools/${id}/details`);
      setSchool(res.data.data);
    } catch (error) {
      console.error("Error fetching school details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleEditSchool = () => {
    navigate(`/admin/schools/${id}/edit`);
  };

  const handleViewClass = (classId) => {
    navigate(`/admin/classes/${classId}`);
  };

  const handleViewStudent = (studentId) => {
    navigate(`/admin/students/${studentId}/details`);
  };

  const toggleClassExpansion = (classId) => {
    if (expandedClass === classId) {
      setExpandedClass(null);
    } else {
      setExpandedClass(classId);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading school details..." />;
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            School not found
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 md:px-6 lg:px-8 pt-8 pb-0  transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={handleBack}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaArrowLeft className="text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              School Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete information about {school.school.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleEditSchool}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FaEdit className="mr-2" />
            Edit School
          </button>
        </div>
      </div>

      {/* School Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-shrink-0">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <FaSchool className="text-white text-3xl" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {school.school.name}
                </h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    {school.school.board}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                    {school.school.country}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Location
                </p>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-gray-400 dark:text-gray-500 mr-2" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {school.school.state}, {school.school.country}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Registered Date
                </p>
                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-400 dark:text-gray-500 mr-2" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {new Date(school.school.created_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Total Classes
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {school.statistics.total_classes}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FaChalkboardTeacher className="text-blue-600 dark:text-blue-400 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Total Subjects
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {school.statistics.total_subjects}
              </h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FaBook className="text-green-600 dark:text-green-400 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Total Students
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {school.statistics.total_students}
              </h3>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FaUsers className="text-purple-600 dark:text-purple-400 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Avg. Students/Class
              </p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {school.statistics.average_students_per_class}
              </h3>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <FaClipboardList className="text-yellow-600 dark:text-yellow-400 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Classes & Subjects Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Classes Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <FaChalkboardTeacher className="mr-2 text-blue-500" />
              Classes ({school.statistics.total_classes})
            </h3>
            <button
              onClick={() => navigate(`/admin/classes?school_id=${id}`)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {school.classes.map((cls) => (
              <div
                key={cls.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleClassExpansion(cls.id)}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {cls.class_name.replace(/\D/g, "") || cls.id}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">
                        {cls.class_name}
                      </h4>
                      <div className="flex gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center">
                          <FaBook className="mr-1" /> {cls.subjects_count}{" "}
                          subjects
                        </span>
                        <span className="flex items-center">
                          <FaUsers className="mr-1" /> {cls.student_count}{" "}
                          students
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {expandedClass === cls.id ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </button>
                </div>

                {expandedClass === cls.id && (
                  <div className="mt-4 pl-13">
                    <div className="mb-3">
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subjects in this class:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {cls.subjects && cls.subjects.length > 0 ? (
                          cls.subjects.map((subject) => (
                            <span
                              key={subject.id}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                            >
                              {subject.name}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            No subjects assigned
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewClass(cls.id);
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        View Class
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/subjects?class_id=${cls.id}`);
                        }}
                        className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Manage Subjects
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {school.classes.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <FaChalkboardTeacher className="text-4xl mx-auto" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                No classes have been created for this school yet.
              </p>
              <button
                onClick={() => navigate(`/admin/classes/new?school_id=${id}`)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Class
              </button>
            </div>
          )}
        </div>

        {/* Students Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
              <FaUsers className="mr-2 text-purple-500" />
              Students ({school.statistics.total_students})
            </h3>
            <button
              onClick={() => navigate(`/admin/students?school_id=${id}`)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {school.students_by_class.map((classGroup) => (
              <div
                key={classGroup.class_id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    {classGroup.class_name || "Unassigned"}
                  </h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {classGroup.student_count} students
                  </span>
                </div>

                {classGroup.students &&
                  classGroup.students.slice(0, 2).map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-3">
                          <FaUserGraduate className="text-purple-600 dark:text-purple-400 text-sm" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewStudent(student.id)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View
                      </button>
                    </div>
                  ))}

                {classGroup.student_count > 2 && (
                  <div className="mt-2 text-center">
                    <button
                      onClick={() =>
                        navigate(
                          `/admin/students?class_id=${classGroup.class_id}`
                        )
                      }
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      + {classGroup.student_count - 2} more students
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {school.statistics.total_students === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <FaUsers className="text-4xl mx-auto" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                No students have been enrolled in this school yet.
              </p>
              <button
                onClick={() => navigate(`/admin/students/new?school_id=${id}`)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enroll First Student
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate(`/admin/classes/new?school_id=${id}`)}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
          >
            <div className="flex items-center mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                <FaChalkboardTeacher className="text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium text-gray-800 dark:text-white">
                Add New Class
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create a new class for this school
            </p>
          </button>

          <button
            onClick={() => navigate(`/admin/students/new?school_id=${id}`)}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
          >
            <div className="flex items-center mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                <FaUserGraduate className="text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-medium text-gray-800 dark:text-white">
                Enroll Student
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add a new student to this school
            </p>
          </button>

          <button
            onClick={() => navigate(`/admin/subjects/new?school_id=${id}`)}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
          >
            <div className="flex items-center mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                <FaBook className="text-green-600 dark:text-green-400" />
              </div>
              <span className="font-medium text-gray-800 dark:text-white">
                Add Subject
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create a new subject for classes
            </p>
          </button>
        </div>
      </div>
      <div className=" md:-mx-8 -mx-4">
        <AdminFooter/>
      </div>
    </div>
  );
};

export default SchoolDetailsPage;
