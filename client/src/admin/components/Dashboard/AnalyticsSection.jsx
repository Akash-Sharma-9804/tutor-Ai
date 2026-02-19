import { 
  FaChartPie, 
  FaStar, 
  FaRegLightbulb, 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaBook, 
  FaTrophy, 
  FaChartLine,
  FaUserFriends 
} from "react-icons/fa";
import { FiTrendingUp } from "react-icons/fi";
import InsightCard from "./InsightCard";

const AnalyticsSection = ({
  platformMetrics,
  insights,
  schools,
  totals,
  growth,
}) => {
  return (
    <>
      {/* Platform Analytics */}
      <div className="
        rounded-3xl shadow-2xl p-6 border
        bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white
        dark:from-blue-900/30 dark:via-purple-900/30 dark:to-gray-800
        dark:border-gray-700
      ">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-2xl mr-4 bg-white/20 dark:bg-white/10 backdrop-blur-sm">
            <FaChartPie className="text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Analytics Dashboard</h2>
            <p className="text-blue-200 dark:text-blue-300">Real-time metrics</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Platform Health */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-blue-200 dark:text-blue-300">
                Platform Health
              </p>
              <div className="flex items-center">
                <FaStar className="text-yellow-300 mr-1" />
                <span className="font-bold">9.8/10</span>
              </div>
            </div>
            <div className="w-full rounded-full h-2.5 bg-blue-800/50">
              <div
                className="bg-gradient-to-r from-green-400 to-cyan-400 rounded-full h-2.5"
                style={{ width: "98%" }}
              />
            </div>
          </div>

          {/* Engagement */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-blue-200 dark:text-blue-300">
                Student Engagement
              </p>
              <span className="font-bold">
                {insights.engagementScore}%
              </span>
            </div>
            <div className="w-full rounded-full h-2.5 bg-blue-800/50">
              <div
                className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-full h-2.5"
                style={{ width: `${insights.engagementScore}%` }}
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
            {[
              ["100%", "Uptime"],
              ["1.2s", "Avg Response"],
              ["24/7", "Support"],
            ].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-bold">{v}</div>
                <div className="text-blue-200 dark:text-blue-300 text-xs">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="
        rounded-3xl shadow-2xl p-6 border
        bg-white/80 backdrop-blur-sm border-gray-100
        dark:bg-gray-800/50 dark:border-gray-700
      ">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl mr-4">
            <FaRegLightbulb className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Key Insights
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Smart analytics
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <InsightCard
            title="Avg Classes/School"
            value={insights.avgClassesPerSchool}
            description="Average classes per institution"
            icon={FaChalkboardTeacher}
            color="blue"
            type="featured"
          />

          <div className="grid grid-cols-2 gap-3">
            <InsightCard
              title="Books/Student"
              value={insights.avgBooksPerStudent}
              icon={FaBook}
              color="orange"
            />
            <InsightCard
              title="Engagement"
              value={`${insights.engagementScore}%`}
              icon={FaGraduationCap}
              color="purple"
            />
          </div>

          <div className="
            p-3 rounded-xl border
            bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200
            dark:from-amber-900/20 dark:to-orange-900/20 dark:border-amber-800
          ">
            <div className="flex items-center">
              <FaTrophy className="text-amber-600 dark:text-amber-400 mr-3" />
              <div>
                <div className="font-bold text-gray-800 dark:text-white">
                  Top Performing
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {schools[0]?.school_name || "No data"} leads with{" "}
                  {schools[0]?.student_count || 0} students
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="
        rounded-3xl shadow-2xl p-6 border
        bg-gradient-to-br from-gray-800 to-gray-900 text-white
        dark:border-gray-700
      ">
        <h3 className="text-xl font-bold mb-4">
          Performance Metrics
        </h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 rounded-xl bg-white/10 backdrop-blur-sm">
            <div>
              <div className="text-sm text-gray-300">Monthly Growth</div>
              <div className="text-2xl font-bold">
                +{growth.students.value}
              </div>
            </div>
            <FiTrendingUp className="text-2xl text-green-400" />
          </div>

          <div className="flex justify-between items-center p-3 rounded-xl bg-white/10 backdrop-blur-sm">
            <div>
              <div className="text-sm text-gray-300">Active Users Today</div>
              <div className="text-2xl font-bold">
                {platformMetrics?.active_students_today || 0}
              </div>
            </div>
            <FaUserFriends className="text-2xl text-blue-400" />
          </div>

          <div className="flex justify-between items-center p-3 rounded-xl bg-white/10 backdrop-blur-sm">
            <div>
              <div className="text-sm text-gray-300">
                Avg Daily Attendance
              </div>
              <div className="text-2xl font-bold">
                {platformMetrics?.avg_daily_attendance || 0}%
              </div>
            </div>
            <FaChartLine className="text-2xl text-purple-400" />
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalyticsSection;
