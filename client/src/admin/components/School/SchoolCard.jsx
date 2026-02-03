import { FaSchool, FaTrash, FaEdit, FaMapMarkerAlt, FaCalendarAlt, FaEye, FaUsers, FaChalkboardTeacher, FaBook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SchoolCard = ({ school, onView, onEdit, onDelete }) => {
  const navigate = useNavigate(); // Add this hook

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewDetails = () => {
    // Navigate to school details page instead of opening modal
    navigate(`/admin/schools/${school.id}/details`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow mr-4">
            <FaSchool className="text-white text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1 line-clamp-1">
              {school.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {school.board && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  {school.board}
                </span>
              )}
              {school.country && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                  {school.country}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onDelete(school)}
          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Delete School"
        >
          <FaTrash />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Location</p>
          <div className="flex items-center">
            <FaMapMarkerAlt className="text-gray-400 dark:text-gray-500 mr-2" />
            <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
              {school.state || "N/A"}, {school.country || "N/A"}
            </span>
          </div>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Registered</p>
          <div className="flex items-center">
            <FaCalendarAlt className="text-gray-400 dark:text-gray-500 mr-2" />
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {formatDate(school.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* School Stats (if available) */}
      {school.statistics && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <FaChalkboardTeacher className="text-blue-500 mr-1 text-sm" />
              <span className="font-bold text-gray-800 dark:text-white">
                {school.statistics.total_classes || 0}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Classes</p>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <FaBook className="text-green-500 mr-1 text-sm" />
              <span className="font-bold text-gray-800 dark:text-white">
                {school.statistics.total_subjects || 0}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Subjects</p>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <FaUsers className="text-purple-500 mr-1 text-sm" />
              <span className="font-bold text-gray-800 dark:text-white">
                {school.statistics.total_students || 0}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Students</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={handleViewDetails} // Changed to use navigation
          className="flex cursor-pointer items-center text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <FaEye className="mr-2" />
          View Details
        </button>
        <button
          onClick={() => onEdit(school)}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default SchoolCard;