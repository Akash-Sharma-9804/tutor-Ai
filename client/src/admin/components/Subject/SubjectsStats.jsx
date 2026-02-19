import { FaBookOpen, FaLayerGroup, FaSchool, FaChalkboardTeacher } from "react-icons/fa";
import { FiTrendingUp } from "react-icons/fi";

const StatCard = ({ label, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    purple: "from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600",
    blue: "from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600",
    green: "from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600",
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
      {trend && (
        <div className="mt-3 flex items-center text-green-600 dark:text-green-400 text-sm">
          <FiTrendingUp className="mr-1" />
          <span>+8% from last month</span>
        </div>
      )}
    </div>
  );
};

const SubjectsStats = ({ subjects, filteredSubjects }) => {
  const uniqueClasses = [...new Set(subjects.map(s => s.class_id).filter(Boolean))];
  const uniqueSchools = [...new Set(subjects.map(s => s.school_id).filter(Boolean))];
  const uniqueSubjects = [...new Set(subjects.map(s => s.name))];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      <StatCard
        label="Total Subjects"
        value={subjects.length}
        icon={FaBookOpen}
        color="purple"
        trend={true}
      />
      <StatCard
        label="Filtered Subjects"
        value={filteredSubjects.length}
        icon={FaLayerGroup}
        color="blue"
      />
      <StatCard
        label="Classes Covered"
        value={uniqueClasses.length}
        icon={FaChalkboardTeacher}
        color="green"
        trend={true}
      />
      <StatCard
        label="Schools"
        value={uniqueSchools.length}
        icon={FaSchool}
        color="orange"
      />
    </div>
  );
};

export default SubjectsStats;