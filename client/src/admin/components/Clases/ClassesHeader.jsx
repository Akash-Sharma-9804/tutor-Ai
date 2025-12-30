import { FaPlus, FaChalkboardTeacher } from "react-icons/fa";

const ClassesHeader = ({ onAddClass }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg mr-4">
            <FaChalkboardTeacher className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Class Management
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Organize and manage classes across all schools
            </p>
          </div>
        </div>
        <button
          onClick={onAddClass}
          className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 dark:hover:from-blue-600 dark:hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl flex items-center transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <FaPlus className="mr-2" />
          Add New Class
        </button>
      </div>
    </div>
  );
};

export default ClassesHeader;