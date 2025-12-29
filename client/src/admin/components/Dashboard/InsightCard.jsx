const COLOR_MAP = {
  blue: {
    normal: `
      from-blue-100 to-cyan-100 border-blue-200 text-blue-700
      dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-800 dark:text-blue-300
    `,
    featured: `
      from-blue-100 to-cyan-100 border-blue-200
      dark:from-blue-900/30 dark:to-cyan-900/20 dark:border-blue-700
    `,
  },
  purple: {
    normal: `
      from-purple-100 to-pink-100 border-purple-200 text-purple-700
      dark:from-purple-900/20 dark:to-pink-900/20 dark:border-purple-800 dark:text-purple-300
    `,
    featured: `
      from-purple-100 to-pink-100 border-purple-200
      dark:from-purple-900/30 dark:to-pink-900/20 dark:border-purple-700
    `,
  },
  green: {
    normal: `
      from-emerald-100 to-teal-100 border-emerald-200 text-emerald-700
      dark:from-emerald-900/20 dark:to-teal-900/20 dark:border-emerald-800 dark:text-emerald-300
    `,
    featured: `
      from-emerald-100 to-teal-100 border-emerald-200
      dark:from-emerald-900/30 dark:to-teal-900/20 dark:border-emerald-700
    `,
  },
  orange: {
    normal: `
      from-orange-100 to-amber-100 border-orange-200 text-orange-700
      dark:from-orange-900/20 dark:to-amber-900/20 dark:border-orange-800 dark:text-orange-300
    `,
    featured: `
      from-orange-100 to-amber-100 border-orange-200
      dark:from-orange-900/30 dark:to-amber-900/20 dark:border-orange-700
    `,
  },
  indigo: {
    normal: `
      from-indigo-100 to-blue-100 border-indigo-200 text-indigo-700
      dark:from-indigo-900/20 dark:to-blue-900/20 dark:border-indigo-800 dark:text-indigo-300
    `,
    featured: `
      from-indigo-100 to-blue-100 border-indigo-200
      dark:from-indigo-900/30 dark:to-blue-900/20 dark:border-indigo-700
    `,
  },
};

const InsightCard = ({
  title,
  value,
  description,
  icon: Icon,
  color = "blue",
  type = "normal",
}) => {
  const styles = COLOR_MAP[color] || COLOR_MAP.blue;

  if (type === "featured") {
    return (
      <div
        className={`
          bg-gradient-to-br ${styles.featured}
          rounded-2xl p-5 border-2 shadow-lg
        `}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="
            p-3 rounded-xl shadow
            bg-white dark:bg-gray-800
          ">
            <Icon className="text-xl text-gray-800 dark:text-white" />
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-gray-800 dark:text-white">
              {value}
            </div>
            <div className="text-sm opacity-75 text-gray-600 dark:text-gray-300">
              {title}
            </div>
          </div>
        </div>

        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`
        bg-gradient-to-r ${styles.normal}
        rounded-xl p-4 border
      `}
    >
      <div className="flex items-center">
        <div className="
          p-2 rounded-lg shadow mr-3
          bg-white dark:bg-gray-800
        ">
          <Icon className="text-lg text-gray-800 dark:text-white" />
        </div>

        <div>
          <div className="font-bold text-lg">
            {value}
          </div>
          <div className="text-sm opacity-75">
            {title}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
