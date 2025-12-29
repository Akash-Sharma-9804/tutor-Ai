import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminAxios from "../api/adminAxios";
import AdminFooter from "../layout/AdminFooter";

// Import Components
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import LoadingState from "../components/Dashboard/LoadingState";
import ErrorState from "../components/Dashboard/ErrorState";
import WelcomeBanner from "../components/Dashboard/WelcomeBanner";
import StatGrid from "../components/Dashboard/StatGrid";
import SchoolPerformance from "../components/Dashboard/SchoolPerformance";
import AnalyticsSection from "../components/Dashboard/AnalyticsSection";
import QuickActionsSection from "../components/Dashboard/QuickActionsSection";
import RecentActivitySection from "../components/Dashboard/RecentActivitySection";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await adminAxios.get("/dashboard");
        if (res.data.success) {
          setStats(res.data.data);
          setError(null);
        } else {
          setError(res.data.message || "Failed to load dashboard data");
        }
      } catch (err) {
        console.error("Dashboard fetch failed", err);
        setError(
          err.response?.data?.message || "Network error. Please try again."
        );
        // Use mock data for demo if API fails
        setStats({
          totals: {
            schools: 12,
            classes: 48,
            subjects: 156,
            books: 420,
            students: 1250,
          },
          schools: [
            {
              school_id: 1,
              school_name: "Delhi Public School",
              location: "New Delhi",
              class_count: 8,
              student_count: 320,
              subject_count: 15,
              book_count: 45,
              avg_attendance: 92.5,
              last_activity: "2024-01-15T10:30:00Z",
            },
            {
              school_id: 2,
              school_name: "St. Mary's Convent",
              location: "Mumbai",
              class_count: 6,
              student_count: 240,
              subject_count: 12,
              book_count: 38,
              avg_attendance: 88.3,
              last_activity: "2024-01-14T15:45:00Z",
            },
          ],
          recentActivity: [
            {
              type: "school",
              title: "New School Registration",
              description: "Greenwood High joined with 4 classes",
              time: "2024-01-15T09:20:00Z",
            },
            {
              type: "student",
              title: "Student Enrollment",
              description: "12 new students joined",
              time: "2024-01-14T14:30:00Z",
            },
            {
              type: "book",
              title: "Library Update",
              description: "Added 5 new Science books",
              time: "2024-01-14T11:15:00Z",
            },
            {
              type: "class",
              title: "Class Created",
              description: "New Class 10-A created",
              time: "2024-01-13T16:45:00Z",
            },
          ],
          platformMetrics: {
            active_students_today: 845,
            avg_daily_attendance: 89.2,
            daily_logins: 913,
          },
          growth: {
            schools: { value: "+12%", trend: "up", change: 2 },
            classes: { value: "+8%", trend: "up", change: 3 },
            subjects: { value: "+15%", trend: "up", change: 5 },
            books: { value: "+23%", trend: "up", change: 7 },
            students: { value: "+18%", trend: "up", change: 12 },
          },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingState />;
  if (error && !stats) return <ErrorState error={error} />;

  const { totals, schools, recentActivity, platformMetrics, growth } = stats;

  // Calculate insights
  const avgClassesPerSchool =
    totals.schools > 0 ? (totals.classes / totals.schools).toFixed(1) : 0;
  const avgBooksPerStudent =
    totals.students > 0 ? (totals.books / totals.students).toFixed(1) : 0;
  const engagementScore = platformMetrics?.avg_daily_attendance || 85;

  const insights = {
    avgClassesPerSchool,
    avgBooksPerStudent,
    engagementScore,
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 dark:bg-gray-900 dark:text-gray-100  bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800
      `}
    >
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <DashboardHeader />

        {/* Welcome Banner */}
        <WelcomeBanner totals={totals} navigate={navigate} />

        {/* Main Stats Grid */}
        <StatGrid totals={totals} growth={growth} navigate={navigate} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Schools & Quick Actions */}
          <div className="lg:col-span-2">
            <SchoolPerformance schools={schools} navigate={navigate} />
          </div>

          {/* Right Column - Insights & Analytics */}
          <div className="space-y-6">
            <AnalyticsSection
              platformMetrics={platformMetrics}
              insights={insights}
              schools={schools}
              totals={totals}
              growth={growth}
            />
          </div>
        </div>

        {/* Recent Activity & Quick Actions Footer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuickActionsSection navigate={navigate} />
          <RecentActivitySection recentActivity={recentActivity} />
        </div>
      </div>

      <div className="">
        <AdminFooter />
      </div>
    </div>
  );
};

export default Dashboard;
