import { FaBookOpen, FaSchool, FaChalkboardTeacher, FaCode, FaCalendarAlt, FaTimes, FaGraduationCap } from "react-icons/fa";

const ViewSubjectModal = ({ subject, onEdit, onClose }) => {
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
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Subject Details</h2>
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
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow mr-4">
              <FaBookOpen className="text-white text-2xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {subject.name}
              </h3>
              {subject.code && (
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                  <FaCode className="mr-2" />
                  <span className="font-mono">Code: {subject.code}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {subject.class_name && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    <FaChalkboardTeacher className="mr-1" />
                    {subject.class_name}
                  </span>
                )}
                {subject.school_name && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                    <FaSchool className="mr-1" />
                    {subject.school_name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {subject.description && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</p>
              <p className="text-gray-700 dark:text-gray-300">
                {subject.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Class Information</p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <FaChalkboardTeacher className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {subject.class_name}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaSchool className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {subject.school_name}
                  </span>
                </div>
                {subject.board && (
                  <div className="flex items-center">
                    <FaGraduationCap className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{subject.board}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Subject Information</p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    Created: {formatDate(subject.created_at)}
                  </span>
                </div>
                {subject.updated_at && (
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Updated: {formatDate(subject.updated_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={onEdit}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600 transition-all"
            >
              Edit Subject
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

export default ViewSubjectModal;