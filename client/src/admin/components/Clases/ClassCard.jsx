import { FaChalkboardTeacher, FaSchool, FaUsers, FaCalendarAlt, FaEdit, FaTrash, FaEye } from "react-icons/fa";

const ClassCard = ({ classData, onView, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow mr-4">
            <FaChalkboardTeacher className="text-white text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
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
        <button
          onClick={() => onDelete(classData)}
          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Delete Class"
        >
          <FaTrash />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">School</p>
          <div className="flex items-center">
            <FaSchool className="text-gray-400 dark:text-gray-500 mr-2" />
            <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
              {classData.school_name || "Not assigned"}
            </span>
          </div>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created</p>
          <div className="flex items-center">
            <FaCalendarAlt className="text-gray-400 dark:text-gray-500 mr-2" />
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {formatDate(classData.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onView(classData)}
          className="flex items-center text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <FaEye className="mr-2" />
          View Details
        </button>
        <button
          onClick={() => onEdit(classData)}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default ClassCard;