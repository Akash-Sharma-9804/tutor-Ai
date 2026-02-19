import { useState } from "react";
import {
  FaBook,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaFileAlt,
  FaQuestionCircle,
  FaSearch,
  FaVideo,
  FaDownload,
} from "react-icons/fa";
import React from "react";
import AdminFooter from "../../layout/AdminFooter";

const DocumentationPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("getting-started");

  const categories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: FaBook,
      color: "from-blue-500 to-cyan-500",
      articles: [
        { id: "welcome", title: "Welcome to AI Tutor", duration: "5 min" },
        { id: "dashboard", title: "Dashboard Overview", duration: "10 min" },
        { id: "setup", title: "Initial Setup Guide", duration: "15 min" },
        { id: "navigation", title: "Navigation Basics", duration: "8 min" },
      ],
    },
    {
      id: "school-management",
      title: "School Management",
      icon: FaGraduationCap,
      color: "from-green-500 to-emerald-500",
      articles: [
        { id: "add-school", title: "Adding a New School", duration: "12 min" },
        { id: "manage-schools", title: "Managing Schools", duration: "10 min" },
        { id: "school-stats", title: "School Statistics", duration: "8 min" },
      ],
    },
    {
      id: "class-management",
      title: "Class Management",
      icon: FaChalkboardTeacher,
      color: "from-purple-500 to-pink-500",
      articles: [
        { id: "create-class", title: "Creating Classes", duration: "10 min" },
        {
          id: "assign-teachers",
          title: "Assigning Teachers",
          duration: "8 min",
        },
        { id: "class-settings", title: "Class Settings", duration: "6 min" },
      ],
    },
    {
      id: "student-management",
      title: "Student Management",
      icon: FaUserGraduate,
      color: "from-orange-500 to-yellow-500",
      articles: [
        {
          id: "enroll-students",
          title: "Enrolling Students",
          duration: "15 min",
        },
        {
          id: "student-progress",
          title: "Tracking Progress",
          duration: "12 min",
        },
        {
          id: "attendance",
          title: "Attendance Management",
          duration: "10 min",
        },
      ],
    },
    {
      id: "content-management",
      title: "Content Management",
      icon: FaFileAlt,
      color: "from-red-500 to-pink-500",
      articles: [
        { id: "upload-books", title: "Uploading Books", duration: "20 min" },
        {
          id: "manage-content",
          title: "Managing Educational Content",
          duration: "15 min",
        },
        {
          id: "content-approval",
          title: "Content Approval Process",
          duration: "10 min",
        },
      ],
    },
  ];

  const tutorials = [
    {
      id: 1,
      title: "Complete System Walkthrough",
      duration: "45 min",
      type: "video",
    },
    {
      id: 2,
      title: "Advanced Analytics Guide",
      duration: "30 min",
      type: "article",
    },
    { id: 3, title: "Bulk Import Tutorial", duration: "25 min", type: "video" },
    {
      id: 4,
      title: "API Integration Guide",
      duration: "40 min",
      type: "article",
    },
  ];

  const faqs = [
    {
      question: "How do I reset a student's password?",
      answer: "Go to Student Management → Select Student → Reset Password",
    },
    {
      question: "Can I export student data?",
      answer: "Yes, use the Export feature in Student Management",
    },
    {
      question: "How do I add multiple schools?",
      answer: "Use the bulk import feature or add them individually",
    },
    {
      question: "Is there a mobile app?",
      answer: "Yes, available on iOS and Android",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 md:px-6 lg:px-8 pt-8 pb-0  transition-colors duration-200">
      <div className=" mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
            <FaBook className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">
            Documentation & Help Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Comprehensive guides, tutorials, and resources for AI Tutor
            administrators
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation, tutorials, and FAQs..."
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Quick Start Guides */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Quick Start Guides
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                      <FaGraduationCap className="text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">School Setup</h3>
                      <p className="text-blue-100">
                        Complete setup in 15 minutes
                      </p>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
                    Start Guide
                  </button>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                      <FaUserGraduate className="text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">Student Onboarding</h3>
                      <p className="text-purple-100">Bulk import tutorial</p>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-white text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-colors">
                    Start Guide
                  </button>
                </div>
              </div>
            </div>

            {/* Documentation Categories */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Documentation Categories
                </h2>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {categories.length} categories
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border transition-all duration-300 cursor-pointer hover:shadow-xl ${
                      activeCategory === category.id
                        ? "border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20"
                        : "border-gray-100 dark:border-gray-700"
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mr-4`}
                        >
                          {React.createElement(category.icon, {
                            className: "text-white text-lg",
                          })}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 dark:text-white">
                            {category.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {category.articles.length} articles
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {category.articles.map((article) => (
                          <div
                            key={article.id}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
                          >
                            <span className="text-gray-700 dark:text-gray-300">
                              {article.title}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {article.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Tutorials */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Video Tutorials
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tutorials.map((tutorial) => (
                  <div
                    key={tutorial.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-3">
                            <FaVideo className="text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white">
                              {tutorial.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {tutorial.duration}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                          {tutorial.type}
                        </span>
                      </div>
                      <button className="w-full mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        Watch Tutorial
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* FAQs */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <FaQuestionCircle className="mr-2 text-blue-500" />
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                    >
                      <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                        {faq.question}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Downloads */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                  Downloads & Resources
                </h3>
                <div className="space-y-3">
                  <a
                    href="#"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <FaDownload className="text-gray-400 mr-3" />
                      <span className="text-gray-700 dark:text-gray-300">
                        User Manual PDF
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      2.4 MB
                    </span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <FaDownload className="text-gray-400 mr-3" />
                      <span className="text-gray-700 dark:text-gray-300">
                        API Documentation
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      1.8 MB
                    </span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <FaDownload className="text-gray-400 mr-3" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Templates Pack
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      5.2 MB
                    </span>
                  </a>
                </div>
              </div>

              {/* Support Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-2xl border border-green-200 dark:border-green-800/30 p-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                  Need More Help?
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  Our support team is available 24/7 to assist you with any
                  questions or issues.
                </p>
                <div className="space-y-3">
                  <a
                    href="mailto:support@aitutor.example.com"
                    className="block px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Email Support
                  </a>
                  <a
                    href="tel:+15551234567"
                    className="block px-4 py-2 bg-white text-green-600 text-center rounded-lg border border-green-600 hover:bg-green-50 transition-colors"
                  >
                    Call Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className=" md:-mx-8 -mx-4">
          <AdminFooter />
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;
