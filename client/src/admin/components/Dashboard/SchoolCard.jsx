import { FaSchool, FaEye, FaCrown, FaTrophy } from "react-icons/fa";

const SchoolCard = ({ school, index, navigate }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="
      rounded-2xl shadow-lg hover:shadow-xl border p-5
      transition-all duration-300 hover:-translate-y-1
      bg-gradient-to-br from-white to-gray-50 border-gray-100
      dark:from-gray-800 dark:to-gray-900 dark:border-gray-700
    ">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div
            className={`p-3 rounded-xl shadow-lg ${
              index === 0
                ? "bg-gradient-to-r from-amber-500 to-orange-500"
                : index === 1
                ? "bg-gradient-to-r from-gray-400 to-gray-600"
                : "bg-gradient-to-r from-blue-500 to-cyan-500"
            }`}
          >
            {index === 0 ? (
              <FaCrown className="text-white text-lg" />
            ) : index === 1 ? (
              <FaTrophy className="text-white text-lg" />
            ) : (
              <FaSchool className="text-white text-lg" />
            )}
          </div>

          <div className="ml-3">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">
              {school.school_name}
            </h3>

            <div className="flex items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {school.location}
              </span>

              {index === 0 && (
                <span className="
                  ml-2 px-2 py-0.5 rounded-full text-xs font-medium
                  bg-amber-100 text-amber-700
                  dark:bg-amber-900/30 dark:text-amber-300
                ">
                  Top School
                </span>
              )}
            </div>

            <div className="text-xs mt-1 text-gray-400 dark:text-gray-500">
              Last active: {formatDate(school.last_activity)}
            </div>
          </div>
        </div>

        {/* View Button */}
        <button
          onClick={() => navigate(`/admin/schools/${school.school_id}/details`)}
          className="
            p-2 rounded-lg transition-colors
            text-gray-400 hover:text-blue-600 hover:bg-blue-50
            dark:hover:text-blue-400 dark:hover:bg-blue-900/20
          "
          title="View Details"
        >
          <FaEye />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          {
            value: school.class_count,
            label: "Classes",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            text: "text-blue-700 dark:text-blue-300",
            sub: "text-blue-600 dark:text-blue-400",
          },
          {
            value: school.student_count,
            label: "Students",
            bg: "bg-green-50 dark:bg-green-900/20",
            text: "text-green-700 dark:text-green-300",
            sub: "text-green-600 dark:text-green-400",
          },
          {
            value: school.subject_count,
            label: "Subjects",
            bg: "bg-purple-50 dark:bg-purple-900/20",
            text: "text-purple-700 dark:text-purple-300",
            sub: "text-purple-600 dark:text-purple-400",
          },
          {
            value: school.book_count,
            label: "Books",
            bg: "bg-orange-50 dark:bg-orange-900/20",
            text: "text-orange-700 dark:text-orange-300",
            sub: "text-orange-600 dark:text-orange-400",
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`text-center p-2 rounded-lg ${item.bg}`}
          >
            <div className={`text-xl font-bold ${item.text}`}>
              {item.value}
            </div>
            <div className={`text-xs ${item.sub}`}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Utilization */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600 dark:text-gray-400">
            Utilization
          </span>
          <span className="text-gray-700 dark:text-gray-300">
            {Math.round((school.student_count / 100) * 100)}%
          </span>
        </div>

        <div className="w-full rounded-full h-1.5 bg-gray-200 dark:bg-gray-700">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full h-1.5"
            style={{
              width: `${Math.min(
                (school.student_count / 100) * 100,
                100
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SchoolCard;
