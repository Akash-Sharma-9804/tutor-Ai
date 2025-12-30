import { FaArrowRight } from "react-icons/fa";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const StatCard = ({
  label,
  value,
  icon: Icon,
  onClick,
  color = "blue",
  subText,
  trend,
}) => {
  const colorConfigs = {
    blue: {
      gradient: "from-blue-500 to-cyan-400",
      border: "border-blue-200 dark:border-blue-800/50",
    },
    purple: {
      gradient: "from-purple-500 to-pink-400",
      border: "border-purple-200 dark:border-purple-800/50",
    },
    green: {
      gradient: "from-emerald-500 to-teal-400",
      border: "border-emerald-200 dark:border-emerald-800/50",
    },
    orange: {
      gradient: "from-orange-500 to-amber-400",
      border: "border-orange-200 dark:border-orange-800/50",
    },
    indigo: {
      gradient: "from-indigo-500 to-blue-400",
      border: "border-indigo-200 dark:border-indigo-800/50",
    },
  };

  const config = colorConfigs[color] || colorConfigs.blue;

  return (
    <div
      onClick={onClick}
      className="
        group cursor-pointer relative overflow-hidden rounded-3xl p-6 border
        bg-white border-gray-100 hover:border-blue-200
        dark:bg-gray-800/50 dark:border-gray-700 dark:hover:border-blue-500/30
        shadow-2xl hover:shadow-3xl
        transition-all duration-500 hover:-translate-y-2
      "
    >
      {/* Animated background blobs */}
      <div
        className={`absolute -top-24 -right-24 w-48 h-48 rounded-full
          bg-gradient-to-r ${config.gradient}
          opacity-5 group-hover:opacity-10 group-hover:scale-125
          transition-all duration-500`}
      />
      <div
        className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full
          bg-gradient-to-r ${config.gradient}
          opacity-5 group-hover:opacity-10 group-hover:scale-125
          transition-all duration-500`}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div
            className={`p-4 rounded-2xl shadow-lg bg-gradient-to-br ${config.gradient}
              group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="text-2xl text-white" />
          </div>

          {trend && (
            <div
              className={`flex items-center px-3 py-1.5 rounded-full border
                bg-white dark:bg-gray-800/50 ${config.border}`}
            >
              {trend.trend === "up" ? (
                <FiTrendingUp className="text-green-500 mr-1.5" />
              ) : (
                <FiTrendingDown className="text-red-500 mr-1.5" />
              )}
              <span
                className={`text-sm font-bold ${
                  trend.trend === "up"
                    ? "text-green-700 dark:text-green-400"
                    : "text-red-700 dark:text-red-400"
                }`}
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>

        {/* Value */}
        <p className="text-5xl font-bold mb-2 text-gray-800 dark:text-white">
          {value.toLocaleString()}
        </p>

        {/* Label */}
        <p className="font-semibold text-lg text-gray-600 dark:text-gray-300">
          {label}
        </p>

        {/* Sub text */}
        {subText && (
          <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
            {subText}
          </p>
        )}

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between">
          <div className="
            flex items-center font-medium
            text-gray-600 dark:text-gray-400
            group-hover:text-blue-500 transition-colors
          ">
            <span className="group-hover:underline">Explore</span>
            <FaArrowRight className="ml-2 group-hover:translate-x-2 transition-transform duration-300" />
          </div>

          <div className="text-xs text-gray-400 dark:text-gray-500">
            Live data
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
