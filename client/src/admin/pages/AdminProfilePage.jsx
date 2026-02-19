import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUserShield,
  FaEnvelope,
  FaUser,
  FaKey,
  FaHistory,
  FaSave,
  FaEye,
  FaEyeSlash,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaBell,
  FaLock
} from "react-icons/fa";
import adminAxios from "../api/adminAxios";
import LoadingSpinner from "../components/LoadingSpinner";
import AdminFooter from "../layout/AdminFooter";

const AdminProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    is_active: true,
    created_at: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchActivityLogs();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await adminAxios.get("/profile");
      setProfile(res.data.data);
      setFormData({
        name: res.data.data.name,
        email: res.data.data.email
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setErrors({ fetch: "Failed to load profile data" });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const res = await adminAxios.get("/profile/activity");
      setActivityLogs(res.data.data);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    return newErrors;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    return newErrors;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateProfileForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      setUpdating(true);
      setErrors({});
      setSuccess("");
      
      const res = await adminAxios.put("/profile", formData);
      
      setSuccess("Profile updated successfully!");
      setProfile(prev => ({
        ...prev,
        name: formData.name,
        email: formData.email
      }));
      
      // Show success message for 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: "Failed to update profile" });
      }
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    const validationErrors = validatePasswordForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      setChangingPassword(true);
      setErrors({});
      setSuccess("");
      
      const res = await adminAxios.put("/profile/password", passwordData);
      
      setSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      // Show success message for 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      
      if (error.response?.data?.message) {
        setErrors({ passwordSubmit: error.response.data.message });
      } else {
        setErrors({ passwordSubmit: "Failed to change password" });
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'super_admin':
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case 'admin':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case 'moderator':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 md:px-6 lg:px-8 pt-8 pb-0  transition-colors duration-200">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Admin Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <FaUserShield className="text-white text-5xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                {profile.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">{profile.email}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(profile.role)}`}>
                  {profile.role?.replace('_', ' ') || 'Admin'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  profile.is_active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {profile.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <FaUserShield className="mr-2 text-blue-500" />
                Account Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <FaUser className="text-gray-400 dark:text-gray-500 mr-3 w-5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                    <p className="text-gray-800 dark:text-gray-200">{profile.name}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaEnvelope className="text-gray-400 dark:text-gray-500 mr-3 w-5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-gray-800 dark:text-gray-200">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaShieldAlt className="text-gray-400 dark:text-gray-500 mr-3 w-5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                    <p className="text-gray-800 dark:text-gray-200">{profile.role?.replace('_', ' ') || 'Admin'}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-400 dark:text-gray-500 mr-3 w-5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                    <p className="text-gray-800 dark:text-gray-200">{formatDate(profile.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FaLock className="text-gray-400 dark:text-gray-500 mr-3 w-5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Password Change</p>
                    <p className="text-gray-800 dark:text-gray-200">
                      {formatDate(profile.updated_at || profile.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Tips */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-2xl border border-blue-200 dark:border-blue-800/30 p-6">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
              <FaShieldAlt className="mr-2 text-blue-500" />
              Security Tips
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Use a strong, unique password</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Change your password regularly</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Never share your credentials</span>
              </li>
              <li className="flex items-start">
                <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Log out after each session</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
                  activeTab === "profile"
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                }`}
              >
                <FaUser className="inline mr-2" />
                Edit Profile
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
                  activeTab === "password"
                    ? "border-b-2 border-red-500 text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                }`}
              >
                <FaKey className="inline mr-2" />
                Change Password
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`flex-1 px-6 py-3 text-center font-medium transition-colors ${
                  activeTab === "activity"
                    ? "border-b-2 border-purple-500 text-purple-600 dark:text-purple-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                }`}
              >
                <FaHistory className="inline mr-2" />
                Activity Log
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg">
                  <div className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-3" />
                    <span className="text-green-800 dark:text-green-300 font-medium">{success}</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {(errors.submit || errors.passwordSubmit) && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
                  <div className="flex items-center">
                    <FaExclamationTriangle className="text-red-500 mr-3" />
                    <span className="text-red-800 dark:text-red-300 font-medium">
                      {errors.submit || errors.passwordSubmit}
                    </span>
                  </div>
                </div>
              )}

              {/* Profile Edit Tab */}
              {activeTab === "profile" && (
                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Personal Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaUser className="text-gray-400" />
                            </div>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.name
                                  ? 'border-red-300 dark:border-red-700'
                                  : 'border-gray-300 dark:border-gray-600'
                              } bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200`}
                              placeholder="Enter your full name"
                            />
                          </div>
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaEnvelope className="text-gray-400" />
                            </div>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.email
                                  ? 'border-red-300 dark:border-red-700'
                                  : 'border-gray-300 dark:border-gray-600'
                              } bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200`}
                              placeholder="Enter your email address"
                            />
                          </div>
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="submit"
                        disabled={updating}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <FaSave className="mr-2" />
                        {updating ? "Updating..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Password Change Tab */}
              {activeTab === "password" && (
                <form onSubmit={handlePasswordUpdate}>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Change Password
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        For security reasons, please enter your current password to set a new one.
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaLock className="text-gray-400" />
                            </div>
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              name="currentPassword"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.currentPassword
                                  ? 'border-red-300 dark:border-red-700'
                                  : 'border-gray-300 dark:border-gray-600'
                              } bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200`}
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showCurrentPassword ? (
                                <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                              ) : (
                                <FaEye className="text-gray-400 hover:text-gray-600" />
                              )}
                            </button>
                          </div>
                          {errors.currentPassword && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currentPassword}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaKey className="text-gray-400" />
                            </div>
                            <input
                              type={showNewPassword ? "text" : "password"}
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.newPassword
                                  ? 'border-red-300 dark:border-red-700'
                                  : 'border-gray-300 dark:border-gray-600'
                              } bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200`}
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showNewPassword ? (
                                <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                              ) : (
                                <FaEye className="text-gray-400 hover:text-gray-600" />
                              )}
                            </button>
                          </div>
                          {errors.newPassword && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaKey className="text-gray-400" />
                            </div>
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.confirmPassword
                                  ? 'border-red-300 dark:border-red-700'
                                  : 'border-gray-300 dark:border-gray-600'
                              } bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200`}
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showConfirmPassword ? (
                                <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                              ) : (
                                <FaEye className="text-gray-400 hover:text-gray-600" />
                              )}
                            </button>
                          </div>
                          {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <button
                          type="submit"
                          disabled={changingPassword}
                          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          <FaKey className="mr-2" />
                          {changingPassword ? "Updating Password..." : "Change Password"}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordData({
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: ""
                            });
                            setErrors({});
                          }}
                          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* Activity Log Tab */}
              {activeTab === "activity" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Recent Activity
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      View your recent account activities and access logs.
                    </p>
                    
                    {activityLogs.length > 0 ? (
                      <div className="space-y-3">
                        {activityLogs.map((activity) => (
                          <div 
                            key={activity.id} 
                            className="flex items-start p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="flex-shrink-0 mr-4">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                                {activity.action === 'login' ? (
                                  <FaLock className="text-blue-600 dark:text-blue-400" />
                                ) : (
                                  <FaUser className="text-green-600 dark:text-green-400" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-800 dark:text-white">
                                  {activity.description}
                                </h4>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(activity.timestamp)}
                                </span>
                              </div>
                              <div className="flex items-center mt-2">
                                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                                  {activity.action}
                                </span>
                                {activity.ip_address && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-3">
                                    IP: {activity.ip_address}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FaHistory className="text-4xl text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No activity logs found</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={fetchActivityLogs}
                      className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Refresh Activity Logs
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Security Notice */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 rounded-2xl border border-yellow-200 dark:border-yellow-800/30 p-6">
            <div className="flex items-start">
              <FaBell className="text-yellow-600 dark:text-yellow-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                  Account Security Notice
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  For security reasons, please remember to log out when using shared computers. 
                  If you notice any suspicious activity on your account, please contact the 
                  system administrator immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className=" md:-mx-8 -mx-4">
        <AdminFooter/>
      </div>
    </div>
  );
};

export default AdminProfilePage;