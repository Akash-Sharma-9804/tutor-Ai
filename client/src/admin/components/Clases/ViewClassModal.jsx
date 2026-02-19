import { FaChalkboardTeacher, FaSchool, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaTimes, FaGraduationCap } from "react-icons/fa";

const ViewClassModal = ({ classData, onEdit, onClose }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Class Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow mr-4">
              <FaChalkboardTeacher className="text-white text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {classData.class_name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {classData.school_name && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    <FaSchool className="mr-1" />
                    {classData.school_name}
                  </span>
                )}
                {classData.student_count > 0 && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                    <FaUsers className="mr-1" />
                    {classData.student_count} students
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">School Information</p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <FaSchool className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {classData.school_name || "Not assigned"}
                  </span>
                </div>
                {classData.board && (
                  <div className="flex items-center">
                    <FaGraduationCap className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{classData.board}</span>
                  </div>
                )}
                {classData.country && (
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {classData.state || classData.country}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Class Information</p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Created: {formatDate(classData.created_at)}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaUsers className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {classData.student_count || 0} students enrolled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={onEdit}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 dark:hover:from-blue-600 dark:hover:to-cyan-600 transition-all"
            >
              Edit Class
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewClassModal;