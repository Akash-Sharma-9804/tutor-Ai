import { 
  FaChartLine, 
  FaSearch, 
  FaBell 
} from "react-icons/fa";

const DashboardHeader = () => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        
        {/* Title */}
        <div>
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-xl mr-3 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700">
              <FaChartLine className="text-white text-xl" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              EduVision Dashboard
            </h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights for educational management
          </p>
        </div>

        {/* Actions */}
        
      </div>
    </div>
  );
};

export default DashboardHeader;
