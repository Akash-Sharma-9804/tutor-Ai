import { FaPlus, FaBookOpen } from "react-icons/fa";

const SubjectsHeader = ({ onAddSubject, disabled }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg mr-4">
            <FaBookOpen className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Subject Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage curriculum subjects for each class
            </p>
          </div>
        </div>
        <button
          onClick={onAddSubject}
          disabled={disabled}
          className={`mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center transform hover:-translate-y-0.5 active:translate-y-0 ${
            disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-600 dark:hover:to-pink-600'
          }`}
        >
          <FaPlus className="mr-2" />
          Add New Subject
        </button>
      </div>
    </div>
  );
};

export default SubjectsHeader;