import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, Lock, Mail, Eye, EyeOff, GraduationCap, Brain, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { loginSuccess } from "../../store/authSlice";
import { useDispatch } from "react-redux";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoverStates, setHoverStates] = useState({
    loginButton: false,
    googleButton: false
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Floating animation elements
  const [floatingElements] = useState([
    { icon: BookOpen, color: "text-green-500", top: "10%", left: "5%", delay: "0s" },
    { icon: Brain, color: "text-purple-500", top: "20%", right: "10%", delay: "1s" },
    { icon: GraduationCap, color: "text-blue-500", top: "60%", left: "8%", delay: "2s" },
    { icon: Trophy, color: "text-yellow-500", bottom: "15%", right: "7%", delay: "3s" },
  ]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        {
          email,
          password,
        }
      );

      dispatch(
        loginSuccess({
          token: res.data.token,
          student: res.data.student,
        })
      );

      // Add success animation before navigating
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      // Add shake animation for error
      document.querySelector("form").classList.add("animate-shake");
      setTimeout(() => {
        document.querySelector("form").classList.remove("animate-shake");
      }, 500);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHover = (button, isHovering) => {
    setHoverStates(prev => ({
      ...prev,
      [button]: isHovering
    }));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingElements.map((Element, index) => {
          const Icon = Element.icon;
          return (
            <div
              key={index}
              className={`absolute animate-float ${Element.color}`}
              style={{
                top: Element.top,
                left: Element.left,
                right: Element.right,
                bottom: Element.bottom,
                animationDelay: Element.delay,
              }}
            >
              <Icon className="w-8 h-8 opacity-20" />
            </div>
          );
        })}
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Left side - Brand/Info */}
      <div className="md:w-1/2 flex flex-col justify-center p-6 md:p-8 lg:p-12 xl:p-20 relative z-10">
        <div className="max-w-md mx-auto md:ml-auto animate-fade-in-up">
          <div className="flex items-center gap-3 mb-8 animate-bounce-in">
            <div className="p-3 bg-indigo-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
              <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
              AI Tutor
            </h1>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-slide-in-left">
            Welcome Back, <span className="text-indigo-600 animate-color-change">Young Learner!</span>
          </h2>

          <p className="text-lg text-gray-600 mb-10 animate-fade-in delay-300">
            Continue your amazing learning adventure with your AI friend who makes studying fun!
          </p>

          <div className="space-y-4 animate-stagger-children">
            <div className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:translate-x-2">
              <div className="p-2 bg-green-100 rounded-lg shadow-inner">
                <BookOpen className="w-5 h-5 text-green-600 animate-wiggle" />
              </div>
              <span className="text-gray-700 font-medium">Fun lesson plans just for you!</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:translate-x-2 delay-75">
              <div className="p-2 bg-purple-100 rounded-lg shadow-inner">
                <Brain className="w-5 h-5 text-purple-600 animate-spin-slow" />
              </div>
              <span className="text-gray-700 font-medium">Smart AI helper for hard questions</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:translate-x-2 delay-150">
              <div className="p-2 bg-blue-100 rounded-lg shadow-inner">
                <Trophy className="w-5 h-5 text-blue-600 animate-bounce" />
              </div>
              <span className="text-gray-700 font-medium">Earn stars and badges!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="md:w-1/2 flex items-center justify-center p-4 md:p-8 relative z-10">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 md:p-8 lg:p-10 transform hover:scale-[1.01] transition-all duration-500 animate-fade-in-up delay-500">
          {/* Decorative corner elements */}
          <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-indigo-300 rounded-tl-xl"></div>
          <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-purple-300 rounded-tr-xl"></div>
          <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-blue-300 rounded-bl-xl"></div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-pink-300 rounded-br-xl"></div>

          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-4 animate-pulse-slow">
              <Lock className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Student Login
            </h2>
            <p className="text-gray-500 animate-pulse">
              Sign in to continue your learning adventure! ✨
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2 animate-slide-in-right delay-200">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 animate-bounce-slow" />
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="email"
                  placeholder="student@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all duration-300 hover:border-indigo-300 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 animate-slide-in-right delay-300">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 animate-bounce-slow delay-100" />
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all duration-300 hover:border-indigo-300 shadow-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 hover:text-indigo-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 hover:text-indigo-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              onMouseEnter={() => handleHover('loginButton', true)}
              onMouseLeave={() => handleHover('loginButton', false)}
              className={`w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white py-3.5 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 ${
                hoverStates.loginButton ? '-translate-y-1 scale-[1.02]' : ''
              } ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-1'}`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 animate-sparkle" />
                  Login to AI Tutor
                </span>
              )}
            </button>

            <div className="relative my-6 animate-fade-in delay-500">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onMouseEnter={() => handleHover('googleButton', true)}
                onMouseLeave={() => handleHover('googleButton', false)}
                className={`flex items-center justify-center gap-3 py-3.5 border-2 border-gray-200 rounded-xl transition-all duration-300 ${
                  hoverStates.googleButton 
                    ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200 shadow-md scale-[1.02]' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 bg-white rounded-lg shadow-inner transition-transform duration-300 ${
                  hoverStates.googleButton ? 'scale-110' : ''
                }`}>
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="w-5 h-5"
                  />
                </div>
                <span className="text-gray-700 font-medium">Continue with Google</span>
              </button>
            </div>
          </form>

          <p className="text-center text-gray-600 mt-8 animate-fade-in delay-700">
            New to AI Tutor?{" "}
            <Link
              to="/signup"
              className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline ml-1 transition-all duration-300 hover:tracking-wider"
            >
              Start your adventure!
            </Link>
          </p>
        </div>
      </div>

      {/* Add custom animations to global CSS */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(5deg); }
          75% { transform: rotate(-5deg); }
        }
        
        @keyframes color-change {
          0% { color: #4f46e5; }
          50% { color: #7c3aed; }
          100% { color: #4f46e5; }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out infinite;
        }
        
        .animate-color-change {
          animation: color-change 3s ease-in-out infinite;
        }
        
        .animate-sparkle {
          animation: sparkle 1s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animate-stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
        .animate-stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
        .animate-stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
        
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}