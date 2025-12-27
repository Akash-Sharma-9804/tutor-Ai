import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Shield, 
  UserCog,
  Key,
  AlertCircle,
  Loader2,
  Building2,
  Sparkles,
  BarChart3,
  Users,
  Settings,
  CheckCircle,
  Globe,
  ShieldCheck,
  Zap,
  ArrowRight,
  Cloud,
  Cpu,
  Database,
  Server
} from "lucide-react";
import { adminLoginSuccess } from "../../store/adminAuthSlice";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Features carousel data
  const features = [
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Real-time insights and comprehensive data visualization",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "User Management",
      description: "Complete control over user roles and permissions",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "System Control",
      description: "Configure and optimize platform settings",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <ShieldCheck className="h-8 w-8" />,
      title: "Security Dashboard",
      description: "Monitor and manage security protocols",
      color: "from-orange-500 to-yellow-500"
    }
  ];

  // Auto rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/auth/login`,
        { email, password }
      );

      dispatch(
        adminLoginSuccess({
          token: res.data.token,
          admin: res.data.admin,
        })
      );

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem("adminRememberMe", "true");
        localStorage.setItem("adminEmail", email);
      } else {
        localStorage.removeItem("adminRememberMe");
        localStorage.removeItem("adminEmail");
      }

      // Success animation before navigation
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 800);
      
    } catch (err) {
      setError(err.response?.data?.message || "Admin login failed. Please check your credentials.");
      
      // Shake animation on error
      const form = document.getElementById("login-form");
      form.classList.add("shake");
      setTimeout(() => form.classList.remove("shake"), 500);
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email on component mount
  useEffect(() => {
    const remembered = localStorage.getItem("adminRememberMe");
    if (remembered === "true") {
      const savedEmail = localStorage.getItem("adminEmail");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Cloud className="h-12 w-12 text-white/20" />
          </motion.div>
          <motion.div
            className="absolute top-1/3 right-1/4"
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          >
            <Cpu className="h-10 w-10 text-white/20" />
          </motion.div>
          <motion.div
            className="absolute bottom-1/4 left-1/3"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
          >
            <Database className="h-14 w-14 text-white/20" />
          </motion.div>
          <motion.div
            className="absolute bottom-1/3 right-1/3"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Server className="h-16 w-16 text-white/15" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo & Brand */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3"
          >
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin<span className="text-cyan-300">Pro</span></h1>
              <p className="text-sm text-blue-100">Enterprise Platform</p>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm mb-4">
                  <Sparkles className="h-4 w-4" />
                  Enterprise Edition v2.1
                </span>
                <h2 className="text-5xl font-bold mb-4 leading-tight">
                  Welcome to <span className="text-cyan-300">Admin</span> Dashboard
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                  Manage your platform with powerful tools and real-time insights
                </p>
              </div>

              {/* Features Carousel */}
              <div className="relative h-48">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <div className={`p-6 rounded-2xl bg-gradient-to-br ${features[activeFeature].color} bg-opacity-20 backdrop-blur-sm border border-white/20`}>
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-white/20">
                          {features[activeFeature].icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-2">{features[activeFeature].title}</h3>
                          <p className="text-blue-100">{features[activeFeature].description}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Feature Indicators */}
                <div className="absolute -bottom-10 left-0 flex gap-2">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveFeature(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === activeFeature 
                          ? 'w-8 bg-white' 
                          : 'w-2 bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">99.9%</div>
                  <div className="text-sm text-blue-200">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">256-bit</div>
                  <div className="text-sm text-blue-200">Encryption</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">24/7</div>
                  <div className="text-sm text-blue-200">Monitoring</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">ISO 27001</div>
                  <div className="text-sm text-blue-200">Certified</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-blue-200">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                Global Data Centers
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                High Performance
              </span>
            </div>
            <div>© {new Date().getFullYear()} AdminPro Inc.</div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Admin<span className="text-blue-600 dark:text-blue-400">Pro</span>
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enterprise Platform</p>
              </div>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Card Header */}
            <div className="pt-10 pb-6 px-8 text-center relative">
              
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Admin Login
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your credentials to access the dashboard
              </p>
            </div>

            {/* Form */}
            <form id="login-form" onSubmit={handleLogin} className="px-8 pb-8">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800/30"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Admin Email
                  </div>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 text-gray-900 dark:text-white group-hover:border-gray-400 dark:group-hover:border-gray-500"
                    placeholder="admin@company.com"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Password
                  </div>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 text-gray-900 dark:text-white group-hover:border-gray-400 dark:group-hover:border-gray-500"
                    placeholder="••••••••"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-8">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`relative w-5 h-5 rounded border-2 transition-all duration-300 ${
                    rememberMe 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'
                  }`}>
                    {rememberMe && (
                      <CheckCircle className="absolute inset-0 h-full w-full text-white p-0.5" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group flex items-center gap-1"
                  onClick={() => {/* Add forgot password functionality */}}
                  disabled={loading}
                >
                  Forgot password?
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Login Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className={`w-full py-4 px-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-3 group ${
                  loading
                    ? "bg-gradient-to-r from-blue-400 to-purple-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <span>Access Dashboard</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>

              {/* Security Note */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <span>Enterprise-grade security</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    SSL/TLS encrypted
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Mobile Stats */}
          <div className="lg:hidden mt-8 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">99.9%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Uptime</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">256-bit</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Encryption</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add custom styles for shake animation */}
      <style jsx>{`
        .shake {
          animation: shake 0.5s ease-in-out;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;