import { FaSchool, FaPlus } from "react-icons/fa";

const EmptyState = ({ schoolsCount, onAddSchool }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12 text-center">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
        <FaSchool className="text-3xl md:text-4xl text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">
        {schoolsCount === 0 ? "No Schools Yet" : "No Schools Found"}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
        {schoolsCount === 0
          ? "Get started by adding your first school to the system"
          : "No schools match your search criteria. Try adjusting your filters."}
      </p>
      <button
        onClick={onAddSchool}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 dark:hover:from-blue-600 dark:hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center mx-auto"
      >
        <FaPlus className="mr-2" />
        {schoolsCount === 0 ? "Add Your First School" : "Add New School"}
      </button>
    </div>
  );
};

export default EmptyState;