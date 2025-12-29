import { NavLink } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  School, 
  Users, 
  BookOpen, 
  BookText, 
  Cpu,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Shield,
  UserCog,
  Menu,
  X,
  Home,
  FileText,
  Calendar,
  Bell,
  HelpCircle,
  Database
} from "lucide-react";

const menuItems = [
  { 
    name: "Dashboard", 
    path: "/admin/dashboard", 
    icon: <LayoutDashboard className="h-5 w-5" />,
    badge: null
  },
  { 
    name: "Schools", 
    path: "/admin/schools", 
    icon: <School className="h-5 w-5" />,
    badge: "12"
  },
  { 
    name: "Classes", 
    path: "/admin/classes", 
    icon: <Users className="h-5 w-5" />,
    badge: "48"
  },
  { 
    name: "Subjects", 
    path: "/admin/subjects", 
    icon: <BookOpen className="h-5 w-5" />,
    badge: "15"
  },
  { 
    name: "Books", 
    path: "/admin/books", 
    icon: <BookText className="h-5 w-5" />,
    badge: "24"
  },
  { 
    name: "Processing", 
    path: "/admin/processing", 
    icon: <Cpu className="h-5 w-5" />,
    badge: "3",
    badgeColor: "bg-orange-500"
  },
];

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block h-screen sticky top-0 ${
        isCollapsed ? "w-20" : "w-64"
      } transition-all duration-300 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-r border-gray-200 dark:border-gray-800`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    Admin<span className="text-blue-600 dark:text-blue-400">Pro</span>
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">v2.1</p>
                </div>
              </div>
            )}

            {isCollapsed && (
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 mx-auto">
                <Shield className="h-6 w-6 text-white" />
              </div>
            )}

            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => {
                const baseClasses = "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300";
                const activeClasses = isActive 
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800";
                
                return `${baseClasses} ${activeClasses}`;
              }}
            >
              <div>
                {item.icon}
              </div>
              
              {!isCollapsed && (
                <span className="flex-1 text-sm font-medium">
                  {item.name}
                </span>
              )}

              {!isCollapsed && item.badge && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.badgeColor || "bg-blue-500"
                } text-white font-bold`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-64 z-50 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-r border-gray-200 dark:border-gray-800 shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      Admin<span className="text-blue-600 dark:text-blue-400">Pro</span>
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      v2.1 • Enterprise
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-4 space-y-2">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) => {
                      const baseClasses = "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300";
                      const activeClasses = isActive 
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800";
                      
                      return `${baseClasses} ${activeClasses}`;
                    }}
                  >
                    <div>
                      {item.icon}
                    </div>
                    <span className="flex-1 text-sm font-medium">
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.badgeColor || "bg-blue-500"
                      } text-white font-bold`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;