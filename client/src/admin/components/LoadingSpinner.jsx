import { FaSchool, FaPlus } from "react-icons/fa";
const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin h-16 w-16 border-4 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaSchool className="text-2xl text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;