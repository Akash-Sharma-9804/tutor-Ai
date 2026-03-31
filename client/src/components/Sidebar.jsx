// components/Sidebar.jsx - Ultra smooth with no scrollbar flicker
import React from 'react';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import axios from "axios";

import {
  Home, BookOpen, Bot, Scan, FileText, BarChart3, MessageSquare,
  User, Settings, ChevronLeft, ChevronRight, LogOut, Sparkles, Menu
} from 'lucide-react';

const Sidebar = ({
  isMobileOpen,
  setIsMobileOpen,
  collapsed,
  setCollapsed,
  toggleSidebar,
  darkMode,
  toggleDarkMode
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

const handleLogout = async () => {
  try {
    const token = localStorage.getItem("token");

    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch (err) {
    // even if backend fails, logout locally
  }

  dispatch(logout());
  setIsMobileOpen(false);
navigate("/login", { replace: true });

};

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: BookOpen, label: 'Subjects', path: '/subjects' },
    { icon: Bot, label: 'AI Tutor', path: '/ai-tutor' },
    { icon: Scan, label: 'Scan & Learn', path: '/scan' },
    { icon: FileText, label: 'Tests & Quizzes', path: '/tests' },
    { icon: BarChart3, label: 'Progress', path: '/progress' },
    // { icon: MessageSquare, label: 'Talk with AI', path: '/talk-ai' },
  ];

  const bottomItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    // { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: LogOut, label: 'Logout', action: 'logout' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen z-40 transition-all duration-300 ease-in-out
        lg:flex flex-col hidden
        ${collapsed ? 'w-20' : 'w-64'}
        bg-[#F8FAFC] dark:bg-[#181818]
        border-r border-gray-200 dark:border-white/10
        overflow-y-hidden
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center flex-shrink-0">
                <img
    src="/logo3.png"
    alt="QuantumEdu Logo"
    className="w-10 h-10 object-contain"
  />
              </div>
              {!collapsed && (
                <div className="flex flex-col flex-shrink-0">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">QuantumEdu</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Your personal Educator</p>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={toggleSidebar}
                className="p-1 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            )}
          </div>
        </div>

        {/* Menu Items - no scrollbar needed */}
        <div className="flex-1 py-4 px-3 overflow-y-visible">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.path;

              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`
                    flex items-center gap-3 px-4 py-3 cursor-pointer w-full rounded-xl
                    transition-colors duration-200
                    ${isActive
                      ? 'bg-blue-200 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Items */}
        <div className="p-4 border-t border-gray-200 dark:border-white/10 flex-shrink-0">
          <nav className="space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.action === "logout") {
                      handleLogout();
                    } else {
                      navigate(item.path);
                    }
                  }}
                  className={`
                    w-full
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    text-gray-700 dark:text-gray-300 
                    hover:bg-gray-100 dark:hover:bg-white/10
                    transition-colors duration-200
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Floating Open Button for Desktop (when collapsed) */}
      {collapsed && (
        <button
          onClick={toggleSidebar}
          className="fixed left-20 top-1/2 -translate-y-1/2 z-50 hidden lg:flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group"
        >
          <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        </button>
      )}

      {/* Mobile Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen z-50 transition-transform duration-300 ease-in-out
        lg:hidden flex flex-col w-64
        bg-white dark:bg-[#181818]
        border-r border-gray-200 dark:border-white/10
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        overflow-y-hidden
      `}>
        {/* Mobile Header */}
        <div className="p-6 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl   flex items-center justify-center flex-shrink-0">
                    <img
    src="/logo3.png"
    alt="QuantumEdu Logo"
    className="w-10 h-10 object-contain"
  />
              </div>
              <div className="flex flex-col flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">QuantumEdu</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Learning Platform</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Items - no scrollbar needed */}
        <div className="flex-1 py-4 px-3 overflow-y-visible">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.path;

              return (
                <a
                  key={item.label}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                    setIsMobileOpen(false);
                  }}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200
                    ${isActive
                      ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Mobile Bottom Items */}
        <div className="p-4 border-t border-gray-200 dark:border-white/10 flex-shrink-0">
          <nav className="space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  onClick={() => {
                    if (item.action === "logout") {
                      handleLogout();
                    } else {
                      navigate(item.path);
                      setIsMobileOpen(false);
                    }
                  }}
                  className="flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200 w-full"
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Open Button */}
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      )}
    </>
  );
};

export default Sidebar;