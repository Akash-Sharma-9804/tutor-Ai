import { FaBookOpen, FaSchool, FaChalkboardTeacher, FaCode, FaEdit, FaTrash, FaEye } from "react-icons/fa";

const SubjectCard = ({ subject, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow mr-4">
            <FaBookOpen className="text-white text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
              {subject.name}
            </h3>
            {subject.code && (
              <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                <FaCode className="mr-1" />
                <span>Code: {subject.code}</span>
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
        <button
          onClick={() => onDelete(subject)}
          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Delete Subject"
        >
          <FaTrash />
        </button>
      </div>

      {subject.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Description</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
            {subject.description}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onView(subject)}
          className="flex items-center text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        >
          <FaEye className="mr-2" />
          View Details
        </button>
        <button
          onClick={() => onEdit(subject)}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default SubjectCard;