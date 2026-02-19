import { FaBookOpen, FaPlus, FaFilter, FaSchool } from "react-icons/fa";

const EmptyState = ({ totalSubjects, hasSchoolSelected, hasClassSelected, onAddSubject, onSelectSchool }) => {
  if (totalSubjects === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12 text-center">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaBookOpen className="text-3xl md:text-4xl text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">
          No Subjects Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          Get started by selecting a school and class, then add your first subject
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onSelectSchool}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 dark:hover:from-blue-600 dark:hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
          >
            <FaSchool className="mr-2" />
            Select School First
          </button>
        </div>
      </div>
    );
  }

  if (!hasSchoolSelected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12 text-center">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaFilter className="text-3xl md:text-4xl text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Select a School
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          Please select a school from the dropdown above to view subjects
        </p>
      </div>
    );
  }

  if (!hasClassSelected) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12 text-center">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaFilter className="text-3xl md:text-4xl text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Select a Class
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
          Please select a class from the dropdown above to view subjects
        </p>
        <button
          onClick={onAddSubject}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center mx-auto"
        >
          <FaPlus className="mr-2" />
          Add New Subject
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12 text-center">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
        <FaBookOpen className="text-3xl md:text-4xl text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2">
        No Subjects Found
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
        No subjects match your search criteria. Try adjusting your filters or add a new subject.
      </p>
      <button
        onClick={onAddSubject}
        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center mx-auto"
      >
        <FaPlus className="mr-2" />
        Add Your First Subject
      </button>
    </div>
  );
};

export default EmptyState;