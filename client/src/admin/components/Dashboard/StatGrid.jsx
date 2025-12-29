import {
  FaSchool,
  FaChalkboardTeacher,
  FaBookOpen,
  FaBook,
  FaUserFriends,
} from "react-icons/fa";
import {
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";
import StatCard from "./StatCard";

const StatGrid = ({ totals, growth, navigate }) => {
  const stats = [
    {
      label: "Schools",
      value: totals.schools,
      icon: FaSchool,
      onClick: () => navigate("/admin/schools"),
      color: "blue",
      subText: "Educational Institutions",
      trend: growth.schools
    },
    {
      label: "Classes",
      value: totals.classes,
      icon: FaChalkboardTeacher,
      onClick: () => navigate("/admin/classes"),
      color: "purple",
      subText: "Active Learning Sessions",
      trend: growth.classes
    },
    {
      label: "Subjects",
      value: totals.subjects,
      icon: FaBookOpen,
      onClick: () => navigate("/admin/subjects"),
      color: "green",
      subText: "Curriculum Areas",
      trend: growth.subjects
    },
    {
      label: "Books",
      value: totals.books,
      icon: FaBook,
      onClick: () => navigate("/admin/books"),
      color: "orange",
      subText: "Learning Resources",
      trend: growth.books
    },
    {
      label: "Students",
      value: totals.students,
      icon: FaUserFriends,
      onClick: () => navigate("/admin/students"),
      color: "indigo",
      subText: "Active Learners",
      trend: growth.students
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          {...stat}
        />
      ))}
    </div>
  );
};

export default StatGrid;