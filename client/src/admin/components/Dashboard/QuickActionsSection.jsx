import { 
  FaPlus, 
  FaChalkboardTeacher, 
  FaBook, 
  FaUsers, 
  FaArrowRight 
} from "react-icons/fa";

const QuickActionsSection = ({ navigate }) => {
  const actions = [
    {
      icon: FaPlus,
      label: "Add New School",
      onClick: () => navigate("/admin/schools"),
    },
    {
      icon: FaChalkboardTeacher,
      label: "Create Class",
      onClick: () => navigate("/admin/classes"),
    },
    {
      icon: FaBook,
      label: "Upload Books",
      onClick: () => navigate("/admin/books"),
    },
    {
      icon: FaUsers,
      label: "Manage Students",
      onClick: () => navigate("/admin/students"),
    },
  ];

  return (
    <div className="
      rounded-3xl shadow-2xl p-6 border
      bg-gradient-to-br from-emerald-500 to-teal-500 text-white
      dark:from-emerald-900/30 dark:to-teal-900/30 dark:border-emerald-800
    ">
      <h3 className="text-xl font-bold mb-4">
        Quick Actions
      </h3>

      <div className="space-y-3">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className="
              w-full p-3 rounded-xl flex items-center justify-between group
              backdrop-blur-sm transition-all
              bg-white/20 hover:bg-white/30
              dark:bg-white/10 dark:hover:bg-white/20
            "
          >
            <div className="flex items-center">
              <action.icon className="mr-3" />
              <span>{action.label}</span>
            </div>

            <FaArrowRight className="
              opacity-0 group-hover:opacity-100
              transition-opacity
            " />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsSection;
