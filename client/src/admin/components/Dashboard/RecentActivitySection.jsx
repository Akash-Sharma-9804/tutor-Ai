import { 
  FaCalendarAlt, 
  FaSchool, 
  FaUserFriends, 
  FaBook, 
  FaChalkboardTeacher 
} from "react-icons/fa";

const ICONS = {
  school: FaSchool,
  student: FaUserFriends,
  book: FaBook,
  class: FaChalkboardTeacher,
};

const COLOR_STYLES = {
  school: {
    card: "from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900/20 dark:to-blue-900/10 dark:border-blue-800",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    icon: "text-blue-600 dark:text-blue-400",
  },
  student: {
    card: "from-green-50 to-green-100 border-green-200 dark:from-green-900/20 dark:to-green-900/10 dark:border-green-800",
    iconBg: "bg-green-100 dark:bg-green-900/30",
    icon: "text-green-600 dark:text-green-400",
  },
  book: {
    card: "from-purple-50 to-purple-100 border-purple-200 dark:from-purple-900/20 dark:to-purple-900/10 dark:border-purple-800",
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    icon: "text-purple-600 dark:text-purple-400",
  },
  class: {
    card: "from-orange-50 to-orange-100 border-orange-200 dark:from-orange-900/20 dark:to-orange-900/10 dark:border-orange-800",
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    icon: "text-orange-600 dark:text-orange-400",
  },
};

const RecentActivitySection = ({ recentActivity }) => {
  return (
    <div className="
      lg:col-span-2 rounded-3xl shadow-2xl p-6 border
      bg-white/80 backdrop-blur-sm border-gray-100
      dark:bg-gray-800/50 dark:border-gray-700
    ">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            Recent Activity
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Latest updates across your platform
          </p>
        </div>
        <div className="
          p-3 rounded-xl
          bg-gradient-to-r from-purple-50 to-pink-50
          dark:from-purple-900/20 dark:to-pink-900/20
        ">
          <FaCalendarAlt className="text-purple-600 dark:text-purple-400 text-xl" />
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recentActivity?.length > 0 ? (
          recentActivity.map((activity, idx) => {
            const Icon = ICONS[activity.type] || FaSchool;
            const styles = COLOR_STYLES[activity.type] || COLOR_STYLES.school;

            return (
              <div
                key={idx}
                className={`
                  p-4 rounded-2xl border bg-gradient-to-r
                  ${styles.card}
                `}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg mr-3 ${styles.iconBg}`}>
                    <Icon className={styles.icon} />
                  </div>

                  <div>
                    <h4 className="font-bold mb-1 text-gray-800 dark:text-white">
                      {activity.title}
                    </h4>
                    <p className="text-sm mb-2 text-gray-600 dark:text-gray-400">
                      {activity.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <FaCalendarAlt className="mr-1" />
                      {new Date(activity.time).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State */
          <div className="col-span-2 text-center py-8">
            <div className="
              w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4
              bg-gray-100 dark:bg-gray-700
            ">
              <FaCalendarAlt className="text-2xl text-gray-400" />
            </div>
            <h4 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">
              No Recent Activity
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Activity will appear here as it happens
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivitySection;
