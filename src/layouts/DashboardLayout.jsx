// layouts/DashboardLayout.jsx - Updated for Tailwind v4
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { Home, BookOpen, Bot, Scan, BarChart3 } from "lucide-react";

const DashboardLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) return JSON.parse(savedMode);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Save dark mode preference and update DOM
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Handle sidebar state for desktop
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Close mobile sidebar when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call initially

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : 'light'}`}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#121212]">
        {/* Dark overlay when sidebar is open on mobile */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          toggleSidebar={toggleSidebar}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
          {/* TopBar with dynamic margin based on sidebar state */}
          <div
            className={`fixed top-0 right-0 z-50 transition-all duration-300 ease-in-out
              ${sidebarCollapsed ? "lg:left-20" : "lg:left-64"}
              left-0
            `}
          >
            <TopBar
              setIsMobileOpen={setIsMobileOpen}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              sidebarCollapsed={sidebarCollapsed}
            />
          </div>

          {/* Main Content with dynamic padding */}
          <main
            className={`flex-1 pt-20 p-4 sm:p-6 lg:p-8 lg:pt-12 overflow-y-auto transition-all duration-300 ease-in-out
              ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}
            `}
          >
            <div className="w-full space-y-6">
              <Outlet />
            </div>
          </main>

          {/* Mobile Bottom Navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#181818] border-t border-gray-200 dark:border-gray-700 z-40 shadow-lg">
            <div className="flex justify-around items-center h-16">
              {[
                { icon: Home, label: "Home", path: "/" },
                { icon: BookOpen, label: "Subjects", path: "/subjects" },
                { icon: Bot, label: "AI", path: "/ai-tutor" },
                { icon: Scan, label: "Scan", path: "/scan" },
                { icon: BarChart3, label: "Progress", path: "/progress" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors active:text-blue-600"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs mt-1">{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;