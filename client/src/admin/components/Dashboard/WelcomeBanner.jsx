import { FaPlus } from "react-icons/fa";

const WelcomeBanner = ({ totals, navigate }) => {
  return (
    <div className="
      rounded-3xl p-6 shadow-xl mb-6 text-white
      bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
      dark:from-blue-800 dark:via-purple-800 dark:to-gray-900
    ">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        
        {/* Text */}
        <div>
          <h2 className="text-2xl font-bold mb-2">
            Welcome to Educational Excellence! 🎓
          </h2>
          <p className="text-blue-100 dark:text-blue-200">
            You're managing {totals.schools} institutions with{" "}
            {totals.students.toLocaleString()} students
          </p>
        </div>

        {/* Button */}
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => navigate("/admin/schools")}
            className="
              px-6 py-3 font-bold rounded-xl flex items-center
              bg-white text-blue-600 hover:bg-gray-100
              dark:text-gray-900 cursor-pointer
              transition-all shadow-lg hover:shadow-xl
            "
          >
            <FaPlus className="mr-2" />
            Add New School
          </button>
        </div>

      </div>
    </div>
  );
};

export default WelcomeBanner;
