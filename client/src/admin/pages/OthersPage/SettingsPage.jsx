import { useState, useEffect } from "react";
import { 
  FaCogs, 
  FaBell, 
  FaShieldAlt, 
  FaPalette, 
  FaPlug, 
  FaSave,
  FaEye,
  FaEyeSlash,
  FaUpload,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import AdminFooter from "../../layout/AdminFooter";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [settings, setSettings] = useState({
    general: {
      site_name: "AI Tutor",
      site_url: "https://aitutor.example.com",
      admin_email: "admin@aitutor.example.com",
      timezone: "UTC",
      date_format: "YYYY-MM-DD",
      time_format: "24h",
      items_per_page: 20,
      maintenance_mode: false
    },
    notifications: {
      email_notifications: true,
      push_notifications: true,
      student_registrations: true,
      new_messages: true,
      system_alerts: true,
      weekly_reports: false,
      monthly_summary: true
    },
    security: {
      login_attempts: 5,
      session_timeout: 30,
      password_expiry: 90,
      two_factor_auth: false,
      ip_whitelist: ["192.168.1.1", "10.0.0.1"],
      ssl_enforced: true,
      audit_logging: true
    },
    appearance: {
      theme: "light",
      primary_color: "#3B82F6",
      secondary_color: "#10B981",
      logo_url: "",
      favicon_url: "",
      custom_css: "",
      sidebar_collapsed: false
    },
    integrations: {
      google_analytics: "",
      facebook_pixel: "",
      smtp_host: "smtp.gmail.com",
      smtp_port: "587",
      smtp_secure: true,
      smtp_username: "",
      smtp_password: "",
      payment_gateway: "stripe",
      stripe_key: "",
      stripe_secret: ""
    }
  });

  const timezones = [
    "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "Europe/London", "Europe/Paris", "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney"
  ];

  const themes = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "auto", label: "Auto (System)" }
  ];

  const dateFormats = [
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2024-01-15)" },
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY (15/01/2024)" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY (01/15/2024)" },
    { value: "DD MMM YYYY", label: "DD MMM YYYY (15 Jan 2024)" }
  ];

  useEffect(() => {
    // Load saved settings from API
    const loadSettings = async () => {
      try {
        // const res = await adminAxios.get("/settings");
        // setSettings(res.data.data);
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    };
    loadSettings();
  }, []);

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (section, field, index, value) => {
    const newArray = [...settings[section][field]];
    newArray[index] = value;
    handleInputChange(section, field, newArray);
  };

  const addIpAddress = () => {
    const newIpList = [...settings.security.ip_whitelist, ""];
    handleInputChange("security", "ip_whitelist", newIpList);
  };

  const removeIpAddress = (index) => {
    const newIpList = settings.security.ip_whitelist.filter((_, i) => i !== index);
    handleInputChange("security", "ip_whitelist", newIpList);
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError("");
      
      // Validate settings
      if (!settings.general.site_name.trim()) {
        throw new Error("Site name is required");
      }
      
      if (!settings.general.admin_email.trim() || !/\S+@\S+\.\S+/.test(settings.general.admin_email)) {
        throw new Error("Valid admin email is required");
      }

      // Save to API
      // await adminAxios.put("/settings", settings);
      
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm("Are you sure you want to reset all settings to default values?")) {
      setSettings({
        general: {
          site_name: "AI Tutor",
          site_url: "https://aitutor.example.com",
          admin_email: "admin@aitutor.example.com",
          timezone: "UTC",
          date_format: "YYYY-MM-DD",
          time_format: "24h",
          items_per_page: 20,
          maintenance_mode: false
        },
        notifications: {
          email_notifications: true,
          push_notifications: true,
          student_registrations: true,
          new_messages: true,
          system_alerts: true,
          weekly_reports: false,
          monthly_summary: true
        },
        security: {
          login_attempts: 5,
          session_timeout: 30,
          password_expiry: 90,
          two_factor_auth: false,
          ip_whitelist: ["192.168.1.1", "10.0.0.1"],
          ssl_enforced: true,
          audit_logging: true
        },
        appearance: {
          theme: "light",
          primary_color: "#3B82F6",
          secondary_color: "#10B981",
          logo_url: "",
          favicon_url: "",
          custom_css: "",
          sidebar_collapsed: false
        },
        integrations: {
          google_analytics: "",
          facebook_pixel: "",
          smtp_host: "smtp.gmail.com",
          smtp_port: "587",
          smtp_secure: true,
          smtp_username: "",
          smtp_password: "",
          payment_gateway: "stripe",
          stripe_key: "",
          stripe_secret: ""
        }
      });
      setSuccess("Settings reset to defaults!");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: FaCogs },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "security", label: "Security", icon: FaShieldAlt },
    { id: "appearance", label: "Appearance", icon: FaPalette },
    { id: "integrations", label: "Integrations", icon: FaPlug }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site Name *
                </label>
                <input
                  type="text"
                  value={settings.general.site_name}
                  onChange={(e) => handleInputChange("general", "site_name", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  placeholder="Enter site name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site URL
                </label>
                <input
                  type="url"
                  value={settings.general.site_url}
                  onChange={(e) => handleInputChange("general", "site_url", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Email *
                </label>
                <input
                  type="email"
                  value={settings.general.admin_email}
                  onChange={(e) => handleInputChange("general", "admin_email", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timezone
                </label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => handleInputChange("general", "timezone", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Format
                </label>
                <select
                  value={settings.general.date_format}
                  onChange={(e) => handleInputChange("general", "date_format", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  {dateFormats.map(format => (
                    <option key={format.value} value={format.value}>{format.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Items Per Page
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={settings.general.items_per_page}
                  onChange={(e) => handleInputChange("general", "items_per_page", parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            <div className="flex items-center">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.general.maintenance_mode}
                  onChange={(e) => handleInputChange("general", "maintenance_mode", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maintenance Mode
                </span>
              </label>
              <span className="ml-3 text-xs text-gray-500 dark:text-gray-400">
                When enabled, only administrators can access the site
              </span>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Notification Preferences
            </h3>
            
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white capitalize">
                      {key.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive notifications for {key.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleInputChange("notifications", key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Failed Login Attempts Before Lockout
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.security.login_attempts}
                  onChange={(e) => handleInputChange("security", "login_attempts", parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={settings.security.session_timeout}
                  onChange={(e) => handleInputChange("security", "session_timeout", parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password Expiry (days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={settings.security.password_expiry}
                  onChange={(e) => handleInputChange("security", "password_expiry", parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Set to 0 for no expiry
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Require 2FA for all administrators
                  </p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security.two_factor_auth}
                    onChange={(e) => handleInputChange("security", "two_factor_auth", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    Enforce SSL
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Redirect all HTTP traffic to HTTPS
                  </p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security.ssl_enforced}
                    onChange={(e) => handleInputChange("security", "ssl_enforced", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    Audit Logging
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Log all administrative actions
                  </p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security.audit_logging}
                    onChange={(e) => handleInputChange("security", "audit_logging", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
            </div>

            {/* IP Whitelist */}
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white mb-3">
                IP Whitelist
              </h4>
              <div className="space-y-3">
                {settings.security.ip_whitelist.map((ip, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={ip}
                      onChange={(e) => handleArrayChange("security", "ip_whitelist", index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      placeholder="e.g., 192.168.1.1"
                    />
                    <button
                      onClick={() => removeIpAddress(index)}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={addIpAddress}
                  className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                >
                  + Add IP Address
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Only these IP addresses will be allowed to access the admin panel (leave empty to allow all)
              </p>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Theme
                </label>
                <div className="flex gap-3">
                  {themes.map(theme => (
                    <button
                      key={theme.value}
                      onClick={() => handleInputChange("appearance", "theme", theme.value)}
                      className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                        settings.appearance.theme === theme.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sidebar Behavior
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.appearance.sidebar_collapsed}
                    onChange={(e) => handleInputChange("appearance", "sidebar_collapsed", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Collapsed by default
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={settings.appearance.primary_color}
                    onChange={(e) => handleInputChange("appearance", "primary_color", e.target.value)}
                    className="w-12 h-12 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.appearance.primary_color}
                    onChange={(e) => handleInputChange("appearance", "primary_color", e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={settings.appearance.secondary_color}
                    onChange={(e) => handleInputChange("appearance", "secondary_color", e.target.value)}
                    className="w-12 h-12 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.appearance.secondary_color}
                    onChange={(e) => handleInputChange("appearance", "secondary_color", e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="#10B981"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo
                </label>
                <div className="flex items-center gap-4">
                  {settings.appearance.logo_url ? (
                    <img 
                      src={settings.appearance.logo_url} 
                      alt="Logo" 
                      className="w-16 h-16 object-contain bg-gray-100 dark:bg-gray-700 rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <FaUpload className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={settings.appearance.logo_url}
                      onChange={(e) => handleInputChange("appearance", "logo_url", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      placeholder="Enter logo URL or upload"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Recommended: 200x60px, PNG format
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Favicon
                </label>
                <div className="flex items-center gap-4">
                  {settings.appearance.favicon_url ? (
                    <img 
                      src={settings.appearance.favicon_url} 
                      alt="Favicon" 
                      className="w-10 h-10 object-contain bg-gray-100 dark:bg-gray-700 rounded-lg"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <FaUpload className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={settings.appearance.favicon_url}
                      onChange={(e) => handleInputChange("appearance", "favicon_url", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      placeholder="Enter favicon URL or upload"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Recommended: 32x32px, ICO format
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom CSS
              </label>
              <textarea
                value={settings.appearance.custom_css}
                onChange={(e) => handleInputChange("appearance", "custom_css", e.target.value)}
                rows="8"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-mono text-sm"
                placeholder="/* Enter custom CSS here */"
              />
            </div>
          </div>
        );

      case "integrations":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Google Analytics ID
                  </label>
                  <input
                    type="text"
                    value={settings.integrations.google_analytics}
                    onChange={(e) => handleInputChange("integrations", "google_analytics", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="UA-XXXXXXXXX-X"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Facebook Pixel ID
                  </label>
                  <input
                    type="text"
                    value={settings.integrations.facebook_pixel}
                    onChange={(e) => handleInputChange("integrations", "facebook_pixel", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="1234567890"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Email Settings (SMTP)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={settings.integrations.smtp_host}
                    onChange={(e) => handleInputChange("integrations", "smtp_host", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={settings.integrations.smtp_port}
                    onChange={(e) => handleInputChange("integrations", "smtp_port", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="587"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    value={settings.integrations.smtp_username}
                    onChange={(e) => handleInputChange("integrations", "smtp_username", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SMTP Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={settings.integrations.smtp_password}
                      onChange={(e) => handleInputChange("integrations", "smtp_password", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => {
                        const input = document.querySelector('input[type="password"]');
                        if (input.type === 'password') {
                          input.type = 'text';
                        } else {
                          input.type = 'password';
                        }
                      }}
                    >
                      <FaEye className="text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.integrations.smtp_secure}
                      onChange={(e) => handleInputChange("integrations", "smtp_secure", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Use SSL/TLS
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Payment Gateway
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stripe Public Key
                  </label>
                  <input
                    type="text"
                    value={settings.integrations.stripe_key}
                    onChange={(e) => handleInputChange("integrations", "stripe_key", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="pk_live_..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stripe Secret Key
                  </label>
                  <input
                    type="password"
                    value={settings.integrations.stripe_secret}
                    onChange={(e) => handleInputChange("integrations", "stripe_secret", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="sk_live_..."
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 md:px-6 lg:px-8 pt-8 pb-0  transition-colors duration-200">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">
            System Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure and customize your AI Tutor platform
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-3" />
              <span className="text-green-800 dark:text-green-300 font-medium">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-3" />
              <span className="text-red-800 dark:text-red-300 font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {renderTabContent()}
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <FaSave className="mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
              
              <button
                onClick={resetToDefaults}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Reset to Defaults
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        <div className=" md:-mx-8 -mx-4">
          <AdminFooter/>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;