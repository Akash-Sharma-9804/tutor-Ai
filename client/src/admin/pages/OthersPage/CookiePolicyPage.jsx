import { useState } from "react";
import {
  FaCookieBite,
  FaFilter,
  FaShieldAlt,
  FaCogs,
  FaChartLine,
  FaEye,
  FaCheckCircle,
} from "react-icons/fa";
import React from "react";
import AdminFooter from "../../layout/AdminFooter";

const CookiePolicyPage = () => {
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    analytics: true,
    functional: true,
    marketing: false,
  });

  const cookieTypes = [
    {
      id: "necessary",
      name: "Necessary Cookies",
      icon: FaShieldAlt,
      description:
        "Essential for the website to function properly. These cookies cannot be disabled.",
      alwaysActive: true,
      examples: [
        "Session cookies",
        "Security tokens",
        "Authentication cookies",
      ],
    },
    {
      id: "analytics",
      name: "Analytics Cookies",
      icon: FaChartLine,
      description: "Help us understand how visitors interact with our website.",
      examples: [
        "Google Analytics",
        "Visitor tracking",
        "Performance monitoring",
      ],
    },
    {
      id: "functional",
      name: "Functional Cookies",
      icon: FaCogs,
      description: "Enable enhanced functionality and personalization.",
      examples: [
        "Language preferences",
        "Region settings",
        "User interface preferences",
      ],
    },
    {
      id: "marketing",
      name: "Marketing Cookies",
      icon: FaEye,
      description:
        "Used to track visitors across websites to display relevant advertisements.",
      examples: [
        "Advertising networks",
        "Retargeting pixels",
        "Social media plugins",
      ],
    },
  ];

  const handleCookieToggle = (cookieId) => {
    if (cookieId === "necessary") return; // Cannot disable necessary cookies
    setCookiePreferences((prev) => ({
      ...prev,
      [cookieId]: !prev[cookieId],
    }));
  };

  const savePreferences = () => {
    // In a real app, you would save these preferences
    alert("Cookie preferences saved!");
  };

  const acceptAll = () => {
    setCookiePreferences({
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true,
    });
    alert("All cookies accepted!");
  };

  const rejectAll = () => {
    setCookiePreferences({
      necessary: true,
      analytics: false,
      functional: false,
      marketing: false,
    });
    alert("Non-essential cookies rejected!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 md:px-6 lg:px-8 pt-8 pb-0  transition-colors duration-200">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-full mb-4">
          <FaCookieBite className="text-white text-2xl" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">
          Cookie Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Learn about how we use cookies and manage your preferences
        </p>
      </div>

      <div className="flex flex-col w-full h-full">
        {/* Main Content */}

        {/* Cookie Management */}
        

        {/* Sidebar */}
        <div className="">
          <div className="sticky top-8 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 mb-8">
              <div className="    ">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  What Are Cookies?
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Cookies are small text files that are placed on your computer
                  or mobile device when you visit a website. They are widely
                  used to make websites work more efficiently and provide
                  information to the website owners.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-6 mb-3">
                  How We Use Cookies
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We use cookies for various purposes, including:
                </p>
                <ul className="text-gray-700 dark:text-gray-300 mb-6">
                  <li>Authentication and security</li>
                  <li>Remembering your preferences and settings</li>
                  <li>Understanding how you use our platform</li>
                  <li>Improving our services and user experience</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-6 mb-3">
                  Cookie Duration
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Duration
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                          Examples
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          Session Cookies
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          Temporary cookies deleted when you close your browser
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          Login session, shopping cart
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          Persistent Cookies
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          Remain on your device for a set period
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          Language preferences, analytics
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-8 mb-3">
                  Third-Party Cookies
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  We may also use cookies from trusted third-party partners for
                  analytics and advertising purposes. These third parties have
                  their own privacy policies.
                </p>

                <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800/30">
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                    Browser Controls
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Most web browsers allow you to control cookies through their
                    settings preferences. However, limiting cookies may affect
                    your ability to use certain features of our website.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Manage Your Cookie Preferences
          </h2>

          <div className="space-y-6">
            {cookieTypes.map((cookie) => (
              <div
                key={cookie.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex-1 mb-4 md:mb-0">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 flex items-center justify-center mr-4">
                      {React.createElement(cookie.icon, {
                        className: "text-orange-600 dark:text-orange-400",
                      })}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {cookie.name}
                      </h3>
                      {cookie.alwaysActive && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                          Always Active
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {cookie.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cookie.examples.map((example, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {cookie.alwaysActive ? (
                    <div className="flex items-center text-green-600 dark:text-green-400">
                      <FaCheckCircle className="mr-2" />
                      <span className="font-medium">Required</span>
                    </div>
                  ) : (
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cookiePreferences[cookie.id]}
                        onChange={() => handleCookieToggle(cookie.id)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {cookiePreferences[cookie.id] ? "Enabled" : "Disabled"}
                      </span>
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={acceptAll}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 flex-1"
              >
                Accept All Cookies
              </button>
              <button
                onClick={savePreferences}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex-1"
              >
                Save Preferences
              </button>
              <button
                onClick={rejectAll}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 flex-1"
              >
                Reject Non-Essential
              </button>
            </div>
          </div>
        </div>
            {/* Cookie Settings Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                Your Current Settings
              </h3>
              <div className="space-y-3">
                {cookieTypes.map((cookie) => (
                  <div
                    key={cookie.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {cookie.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        cookiePreferences[cookie.id] || cookie.alwaysActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {cookie.alwaysActive
                        ? "Required"
                        : cookiePreferences[cookie.id]
                        ? "Allowed"
                        : "Blocked"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                Quick Links
              </h3>
              <div className="space-y-3">
                <a
                  href="/admin/privacy-policy"
                  className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <FaShieldAlt className="mr-3" />
                  Privacy Policy
                </a>
                <a
                  href="/admin/terms"
                  className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <FaCookieBite className="mr-3" />
                  Terms of Service
                </a>
                <a
                  href="/admin/settings"
                  className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <FaCogs className="mr-3" />
                  Account Settings
                </a>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-2xl border border-orange-200 dark:border-orange-800/30 p-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                Need Help?
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                If you have questions about our cookie policy or need assistance
                managing your preferences, please contact us.
              </p>
              <a
                href="mailto:privacy@aitutor.example.com"
                className="inline-flex items-center text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm"
              >
                privacy@aitutor.example.com
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className=" md:-mx-8 -mx-4">
        <AdminFooter />
      </div>
    </div>
  );
};

export default CookiePolicyPage;
