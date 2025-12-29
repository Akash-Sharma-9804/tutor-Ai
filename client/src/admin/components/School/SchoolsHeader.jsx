import { FaPlus } from "react-icons/fa";

const SchoolsHeader = ({ onAddSchool }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            School Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and oversee all registered educational institutions
          </p>
        </div>
        <button
          onClick={onAddSchool}
          className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 dark:hover:from-blue-600 dark:hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl flex items-center transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <FaPlus className="mr-2" />
          Add New School
        </button>
      </div>
    </div>
  );
};

export default SchoolsHeader;