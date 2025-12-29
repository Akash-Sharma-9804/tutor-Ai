import { FaSchool, FaGraduationCap, FaGlobe, FaMapMarkerAlt, FaCalendarAlt, FaTimes, FaUsers, FaChalkboardTeacher } from "react-icons/fa";

const ViewSchoolModal = ({ school, onEdit, onClose }) => {
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
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">School Details</h2>
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
              <FaSchool className="text-white text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {school.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {school.board && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    <FaGraduationCap className="mr-1" />
                    {school.board}
                  </span>
                )}
                {school.country && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                    <FaGlobe className="mr-1" />
                    {school.country}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Location</p>
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-gray-400 dark:text-gray-500 mr-2" />
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {school.state || "N/A"}, {school.country || "N/A"}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Registered On</p>
              <div className="flex items-center">
                <FaCalendarAlt className="text-gray-400 dark:text-gray-500 mr-2" />
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {formatDate(school.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">School Statistics</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <FaUsers className="text-blue-600 dark:text-blue-400 text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800 dark:text-white">1,234</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Students</p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <FaChalkboardTeacher className="text-green-600 dark:text-green-400 text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800 dark:text-white">89</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Teachers</p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <FaSchool className="text-purple-600 dark:text-purple-400 text-2xl mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800 dark:text-white">45</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Classes</p>
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
              Edit School
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

export default ViewSchoolModal;