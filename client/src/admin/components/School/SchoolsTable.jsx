import { FaSchool, FaEye, FaEdit, FaTrash, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";

const SchoolsTable = ({ schools, onView, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">All Schools</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">School Name</th>
              <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Board</th>
              <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Location</th>
              <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Registered</th>
              <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr
                key={school.id}
                className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg mr-3">
                      <FaSchool className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-bold text-gray-800 dark:text-white truncate max-w-[200px]">
                      {school.name}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    {school.board || "Not specified"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                      {school.state || "N/A"}, {school.country || "N/A"}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatDate(school.created_at)}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onView(school.id)}
                      className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => onEdit(school)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => onDelete(school)}
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

export default SchoolsTable;