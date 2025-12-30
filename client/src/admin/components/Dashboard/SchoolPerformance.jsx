import { FaSchool, FaChalkboardTeacher, FaTable } from "react-icons/fa";
import { FiUsers, FiBookOpen } from "react-icons/fi";
import SchoolCard from "./SchoolCard";

const SchoolPerformance = ({ schools, navigate }) => {
  return (
    <div className="
      rounded-3xl shadow-2xl p-6 border mb-6
      bg-white/80 backdrop-blur-sm border-gray-100
      dark:bg-gray-800/50 dark:border-gray-700
    ">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            School Performance
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Ranked by student engagement
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/schools")}
          className="
            px-4 py-2.5 font-medium rounded-xl shadow-sm transition-all
            bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700
            hover:from-blue-100 hover:to-blue-200 hover:text-blue-700 dark:hover:text-white
            dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-800 dark:hover:to-gray-900 dark:text-gray-300 dark:hover:bg-gray-600
          "
        >
          <FaTable className="inline mr-2" />
          Full Report
        </button>
      </div>

      {/* Empty State */}
      {!schools || schools.length === 0 ? (
        <div className="text-center py-12">
          <div className="
            w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4
            bg-gradient-to-r from-blue-100 to-cyan-100
            dark:from-blue-900/20 dark:to-cyan-900/20
          ">
            <FaSchool className="text-4xl text-blue-400" />
          </div>

          <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
            No Schools Registered
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start building your educational network
          </p>

          <button
            onClick={() => navigate("/admin/schools/add")}
            className="
              px-6 py-3 font-bold rounded-xl text-white
              bg-gradient-to-r from-blue-600 to-cyan-600
              hover:from-blue-700 hover:to-cyan-700
              transition-all shadow-lg hover:shadow-xl
            "
          >
            Add First School
          </button>
        </div>
      ) : (
        <>
          {/* Top Schools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {schools.slice(0, 2).map((school, index) => (
              <SchoolCard
                key={school.school_id}
                school={school}
                index={index}
                navigate={navigate}
              />
            ))}
          </div>

          {/* Table */}
          <div className="
            rounded-2xl shadow-lg overflow-hidden border
            bg-gradient-to-br from-gray-50 to-white border-gray-200
            dark:from-gray-800 dark:to-gray-900 dark:border-gray-700
          ">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="
                    bg-gradient-to-r from-gray-100 to-gray-200
                    dark:from-gray-800 dark:to-gray-900
                  ">
                    {[
                      "Rank",
                      "School",
                      "Classes",
                      "Students",
                      "Resources",
                      "Status",
                    ].map((h, i) => (
                      <th
                        key={i}
                        className="p-4 text-left font-bold text-gray-700 dark:text-gray-300"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {schools.map((school, index) => (
                    <tr
                      key={school.school_id}
                      className="
                        border-t transition-colors
                        border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50
                        dark:border-gray-700 dark:hover:bg-gray-800/50
                      "
                    >
                      {/* Rank */}
                      <td className="p-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0
                              ? "bg-gradient-to-r from-amber-500 to-orange-500"
                              : index === 1
                              ? "bg-gradient-to-r from-gray-400 to-gray-600"
                              : "bg-gradient-to-r from-blue-500 to-cyan-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </td>

                      {/* School */}
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="p-2 rounded-lg mr-3 bg-blue-50 dark:bg-blue-900/30">
                            <FaSchool className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 dark:text-white">
                              {school.school_name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {school.student_count} students
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Classes */}
                      <td className="p-4 text-center">
                        <span className="px-3 py-1.5 rounded-full font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {school.class_count}
                        </span>
                      </td>

                      {/* Students */}
                      <td className="p-4 text-center">
                        <span className="px-3 py-1.5 rounded-full font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          {school.student_count}
                        </span>
                      </td>

                      {/* Resources */}
                      <td className="p-4 text-center">
                        <span className="px-3 py-1.5 rounded-full font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                          {school.book_count + school.subject_count}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            school.student_count > 50
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          }`}
                        >
                          {school.student_count > 50
                            ? "High Activity"
                            : "Active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SchoolPerformance;
