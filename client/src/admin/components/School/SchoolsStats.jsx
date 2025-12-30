import { FaSchool, FaGraduationCap, FaGlobe, FaUsers } from "react-icons/fa";
import { FiTrendingUp } from "react-icons/fi";

const StatCard = ({ label, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600",
    green: "from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600",
    purple: "from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600",
    orange: "from-orange-500 to-amber-500 dark:from-orange-600 dark:to-amber-600",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
        <div
          className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl shadow-md`}
        >
          <Icon className="text-white text-xl" />
        </div>
      </div>
      <div className="mt-3 flex items-center text-green-600 dark:text-green-400 text-sm">
        <FiTrendingUp className="mr-1" />
        <span>+12% from last month</span>
      </div>
    </div>
  );
};

const SchoolsStats = ({ schools }) => {
  const uniqueBoards = [...new Set(schools.map((s) => s.board).filter(Boolean))];
  const uniqueCountries = [...new Set(schools.map((s) => s.country).filter(Boolean))];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      <StatCard
        label="Total Schools"
        value={schools.length}
        icon={FaSchool}
        color="blue"
      />
      <StatCard
        label="Active Boards"
        value={uniqueBoards.length}
        icon={FaGraduationCap}
        color="green"
      />
      <StatCard
        label="Countries"
        value={uniqueCountries.length}
        icon={FaGlobe}
        color="purple"
      />
      <StatCard
        label="Total Students"
        value="1,234"
        icon={FaUsers}
        color="orange"
      />
    </div>
  );
};

export default SchoolsStats;