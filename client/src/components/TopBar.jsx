// components/TopBar.jsx - Updated for Tailwind v4
import React, { useState, useEffect, useRef } from 'react'
import { Menu, Bell, Search, ChevronDown, Sun, Moon, Calendar, X } from "lucide-react"
import axios from "axios";

const TopBar = ({ setIsMobileOpen, darkMode, toggleDarkMode, sidebarCollapsed }) => {

  const [student, setStudent] = useState(null);

  const [searchOpen, setSearchOpen] = useState(false)


 useEffect(() => {
  const fetchStudentProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("⚠️ No token found, skipping student profile fetch");
        return;
      }

      console.log("📡 Fetching student profile...");

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/student/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Student profile fetched:", response.data);
      setStudent(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch student profile:", error);
    }
  };

  fetchStudentProfile();
}, []);



  const [notifications] = useState([
    { id: 1, message: "Math test tomorrow", time: "2 hours ago", unread: true },
    { id: 2, message: "AI Tutor has responded", time: "5 hours ago", unread: true },
    { id: 3, message: "New assignment uploaded", time: "1 day ago", unread: false },
    { id: 4, message: "Chemistry quiz completed", time: "2 days ago", unread: false },
  ])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount] = useState(notifications.filter(n => n.unread).length)
  const [isDesktop, setIsDesktop] = useState(false)
  
  const searchRef = useRef(null)
  const notificationsRef = useRef(null)

  // Check if desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchOpen && searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false)
      }
      if (showNotifications && notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [searchOpen, showNotifications])

  const getFormattedDate = () => {
    const date = new Date()
    const options = { weekday: 'long', month: 'long', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  return (
    <div className="h-16 bg-[#F8FAFC] dark:bg-[#181818] border-b border-gray-200 dark:border-white/10 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 lg:hidden transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Date Display */}
            <div className={`hidden lg:flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 transition-all duration-300 ${
              sidebarCollapsed ? 'ml-0' : 'ml-2'
            }`}>
              <Calendar className="h-4 w-4" />
              <span className="whitespace-nowrap">
                Today: {getFormattedDate()}
              </span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              {searchOpen ? (
                <div className="absolute right-0 top-12 sm:top-auto sm:relative w-64 sm:w-72 bg-white dark:bg-[#1f1f1f] rounded-lg shadow-lg border border-gray-200 dark:border-white/10 sm:shadow-none sm:border-0 z-50">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search courses, subjects..."
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-[#262626] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <button
                      onClick={() => setSearchOpen(false)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 hidden sm:flex transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1f1f1f] rounded-xl shadow-xl border border-gray-200 dark:border-white/10 z-50">
                  <div className="p-4 border-b dark:border-white/10 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors ${
                          notification.unread ? 'bg-blue-50 dark:bg-blue-500/10' : ''
                        }`}
                        onClick={() => setShowNotifications(false)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            notification.unread 
                              ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' 
                              : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                          }`}>
                            <Bell className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-gray-100">{notification.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                          </div>
                          {notification.unread && (
                            <div className="h-2 w-2 bg-blue-500 rounded-full mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t dark:border-white/10">
                    <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2">
              <div className={`hidden sm:flex flex-col items-end transition-all duration-300 ${
                sidebarCollapsed && isDesktop ? 'opacity-0 w-0' : 'opacity-100'
              }`}>
               <p className="text-sm font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
  {student?.studentName || "Student"}
</p>
<p className="text-xs text-gray-500 dark:text-gray-400">
  Class {student?.className || "-"} • {student?.schoolName || ""}
</p>

              </div>
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
  {student?.studentName
    ? student.studentName.split(" ").map(n => n[0]).join("").slice(0, 2)
    : "ST"}
</div>

                  <ChevronDown className={`h-4 w-4 text-gray-600 dark:text-gray-300 transition-all duration-300 ${
                    sidebarCollapsed ? 'hidden' : 'block'
                  } group-hover:rotate-180 transition-transform`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Date Display */}
        <div className="lg:hidden bg-white dark:bg-[#181818] py-2 border-t border-gray-100 dark:border-white/10">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>{getFormattedDate()}</span>
            </div>
            <button 
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopBar