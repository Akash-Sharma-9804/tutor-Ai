import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Bell, 
  LogOut, 
  User, 
  Settings, 
  Moon, 
  Sun,
  ChevronDown,
  Menu,
  X,
  HelpCircle,
  Shield,
  Zap,
  Globe,
  Mail,
  Calendar,
  Activity,
  Users,
  Database
} from "lucide-react";
import { adminLogout } from "../../store/adminAuthSlice";

const AdminHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // State management
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Sample notifications
  const notifications = [
    { id: 1, title: "New School Registered", message: "Springfield High School just registered", time: "5 min ago", read: false },
    { id: 2, title: "System Update", message: "Database maintenance scheduled for tonight", time: "1 hour ago", read: false },
    { id: 3, title: "New Teacher Added", message: "Dr. Sarah Johnson added to Mathematics", time: "2 hours ago", read: true },
    { id: 4, title: "Backup Completed", message: "System backup completed successfully", time: "3 hours ago", read: true },
    { id: 5, title: "API Usage Alert", message: "API calls increased by 40% today", time: "5 hours ago", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle logout
  const handleLogout = () => {
    dispatch(adminLogout());
    navigate("/admin/login", { replace: true });
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Implement search functionality
    }
  };

  return (
    <>
      {/* Header Container */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side: Logo & Mobile Menu */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {showMobileMenu ? (
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block p-2 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="hidden lg:block">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    Admin<span className="text-blue-600 dark:text-blue-400">Pro</span>
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Dashboard v2.1
                  </p>
                </div>
              </div>

              {/* Quick Stats - Desktop Only */}
              <div className="hidden lg:flex items-center gap-6 ml-6">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">99.9%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Uptime</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">2.8k</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Users</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Database className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">1.2M</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">API Calls</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Search & User Controls */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dashboard, users, schools..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-300"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
                  >
                    <Search className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5 text-yellow-500 group-hover:rotate-45 transition-transform" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:rotate-12 transition-transform" />
                  )}
                </button>

                {/* Help */}
                <button
                  onClick={() => navigate("/admin/help")}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hidden sm:block"
                  aria-label="Help"
                >
                  <HelpCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Global Settings */}
                <button
                  onClick={() => navigate("/admin/settings")}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hidden sm:block"
                  aria-label="Global settings"
                >
                  <Globe className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {showNotifications && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowNotifications(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 20, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                        >
                          {/* Header */}
                          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-gray-900 dark:text-white">
                                Notifications
                              </h3>
                              {unreadCount > 0 && (
                                <span className="px-2 py-1 rounded-full bg-blue-500 text-white text-xs font-bold">
                                  {unreadCount} new
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Notifications List */}
                          <div className="max-h-96 overflow-y-auto">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                  !notification.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-lg ${
                                    notification.id === 1 ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" :
                                    notification.id === 2 ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                                    notification.id === 3 ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" :
                                    "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                  }`}>
                                    {notification.id === 1 ? <Zap className="h-4 w-4" /> :
                                     notification.id === 2 ? <Database className="h-4 w-4" /> :
                                     notification.id === 3 ? <Users className="h-4 w-4" /> :
                                     <Activity className="h-4 w-4" />}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                      {notification.title}
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                      <span className="text-xs text-gray-500 dark:text-gray-500">
                                        {notification.time}
                                      </span>
                                      {!notification.read && (
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Footer */}
                          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={() => navigate("/admin/notifications")}
                              className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                              View all notifications
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Profile */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity"></div>
                      <div className="relative w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Super Admin
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        admin@schoolpro.com
                      </p>
                    </div>
                    <ChevronDown className="hidden lg:block h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                  </button>

                  {/* User Menu Dropdown */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 20, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                        >
                          {/* Profile Header */}
                          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-30"></div>
                                <div className="relative w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                  <User className="h-6 w-6 text-white" />
                                </div>
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">
                                  Super Admin
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Administrator
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="p-2">
                            <button
                              onClick={() => navigate("/admin/profile")}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <User className="h-5 w-5" />
                              <span className="text-sm font-medium">My Profile</span>
                            </button>
                            <button
                              onClick={() => navigate("/admin/settings")}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Settings className="h-5 w-5" />
                              <span className="text-sm font-medium">Settings</span>
                            </button>
                            <button
                              onClick={() => navigate("/admin/calendar")}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Calendar className="h-5 w-5" />
                              <span className="text-sm font-medium">Calendar</span>
                            </button>
                            <button
                              onClick={() => navigate("/admin/messages")}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Mail className="h-5 w-5" />
                              <span className="text-sm font-medium">Messages</span>
                              <span className="ml-auto px-2 py-1 rounded-full bg-blue-500 text-white text-xs">
                                3
                              </span>
                            </button>
                          </div>

                          {/* Logout Section */}
                          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                            >
                              <LogOut className="h-5 w-5" />
                              <span className="text-sm font-medium">Logout</span>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-gray-200 dark:border-gray-700"
            >
              <div className="p-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dashboard..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default AdminHeader;