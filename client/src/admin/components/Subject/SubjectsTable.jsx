import { FaBookOpen, FaSchool, FaChalkboardTeacher, FaCode, FaEye, FaEdit, FaTrash } from "react-icons/fa";

const SubjectsTable = ({ subjects, onView, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">All Subjects</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Subject</th>
              <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Code</th>
              <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Class</th>
              <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">School</th>
              <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr
                key={subject.id}
                className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg mr-3">
                      <FaBookOpen className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 dark:text-white block">
                        {subject.name}
                      </span>
                      {subject.description && (
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px] block">
                          {subject.description}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {subject.code ? (
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                      <FaCode className="mr-1" />
                      {subject.code}
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">-</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    <FaChalkboardTeacher className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {subject.class_name}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    <FaSchool className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                      {subject.school_name}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onView(subject)}
                      className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => onEdit(subject)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => onDelete(subject)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubjectsTable;