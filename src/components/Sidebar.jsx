// components/Sidebar.jsx - Updated with props
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  BookOpen,
  Bot,
  Scan,
  ClipboardList,
  BarChart3,
  MessageCircle,
  User,
  Settings,
  ChevronLeft,
  X,
  GraduationCap,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "Subjects", path: "/subjects", icon: BookOpen },
  { name: "AI Tutor", path: "/ai-tutor", icon: Bot },
  { name: "Scan & Learn", path: "/scan", icon: Scan },
  { name: "Tests", path: "/tests", icon: ClipboardList },
  { name: "Progress", path: "/progress", icon: BarChart3 },
  { name: "Talk to AI", path: "/talk-ai", icon: MessageCircle },
  { name: "Profile", path: "/profile", icon: User },
  { name: "Settings", path: "/settings", icon: Settings },
];

const Sidebar = ({ 
  isMobileOpen, 
  setIsMobileOpen, 
  collapsed, 
  setCollapsed,
  toggleSidebar 
}) => {
  // Handle click outside on mobile
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsMobileOpen(false)
    }
  }

  return (
    <>
     
      

      {/* Sidebar */}
    <aside
  className={`fixed left-0 top-0 h-screen bg-white border-r
    z-[60] lg:z-50 transition-all duration-300 ease-in-out

    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
    ${collapsed ? "lg:w-20" : "lg:w-64"}
    w-64 shadow-lg lg:shadow-none
  `}
>

        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b">
          {(!collapsed || isMobileOpen) ? (
            <span className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <span>AI Tutor</span>
            </span>
          ) : (
            <div className="flex items-center justify-center w-full">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
          )}
          <div className="flex items-center gap-2">
            {/* Desktop Collapse Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 hidden lg:block transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft
                className={`w-5 h-5 transition-transform duration-300 ${
                  collapsed && "rotate-180"
                }`}
              />
            </button>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="mt-4 flex flex-col gap-1 px-2 h-[calc(100vh-4rem)] overflow-y-auto">
          {menuItems.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {(!collapsed || isMobileOpen) && (
                <span className="transition-opacity duration-200">{name}</span>
              )}

              {/* Tooltip for collapsed desktop */}
              {collapsed && !isMobileOpen && (
                <span className="absolute left-20 z-50 hidden whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white group-hover:block animate-in fade-in-0 zoom-in-95">
                  {name}
                </span>
              )}
            </NavLink>
          ))}
          
          {/* User Profile Section */}
          <div className={`mt-auto mb-6 px-3 transition-all duration-300 ${
            (!collapsed || isMobileOpen) ? "opacity-100" : "opacity-0"
          }`}>
            <div className="pt-4 border-t">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                  JS
                </div>
                {(!collapsed || isMobileOpen) && (
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">John Student</p>
                    <p className="text-xs text-gray-500 truncate">Grade 12</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;