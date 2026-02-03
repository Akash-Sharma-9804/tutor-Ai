import { Link } from "react-router-dom";
import {
  GraduationCap,
  User,
  School,
  Phone,
  Calendar,
  Users,
  Mail,
  Lock,
  Sparkles,
  Target,
  Clock,
  Award,
  ChevronRight,
  CheckCircle,
  Globe,
  BookOpen,
  Brain,
  Eye,
  EyeOff,
  Star,
  Rocket,
  Shield,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    schoolName: "",
    className: "",
    age: "",
    gender: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoverStates, setHoverStates] = useState({});
  const [currentFeature, setCurrentFeature] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Floating animation elements
  const [floatingElements] = useState([
    {
      icon: BookOpen,
      color: "text-green-500",
      top: "5%",
      left: "5%",
      delay: "0s",
    },
    {
      icon: Brain,
      color: "text-purple-500",
      top: "15%",
      right: "10%",
      delay: "1s",
    },
    {
      icon: GraduationCap,
      color: "text-blue-500",
      top: "70%",
      left: "8%",
      delay: "2s",
    },
    {
      icon: Award,
      color: "text-yellow-500",
      bottom: "20%",
      right: "7%",
      delay: "3s",
    },
    {
      icon: Rocket,
      color: "text-pink-500",
      top: "40%",
      left: "15%",
      delay: "1.5s",
    },
    {
      icon: Star,
      color: "text-orange-500",
      top: "30%",
      right: "15%",
      delay: "2.5s",
    },
  ]);

  const formRef = useRef(null);

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-white" />,
      title: "AI-Powered Learning",
      description: "Adaptive learning paths tailored to your strengths",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-800 to-cyan-500",
    },
    {
      icon: <Target className="w-8 h-8 text-white" />,
      title: "Personalized Goals",
      description: "Set and track academic goals with AI guidance",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-800 to-pink-500",
    },
    {
      icon: <Clock className="w-8 h-8 text-white" />,
      title: "24/7 Availability",
      description: "Learn at your own pace, anytime",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-800 to-emerald-500",
    },
    {
      icon: <Award className="w-8 h-8 text-white" />,
      title: "Proven Results",
      description: "94% improve grades within 3 months",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-gradient-to-br from-orange-800 to-red-500",
    },
  ];

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/data/schools`)
      .then((res) => setSchools(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    // Calculate password strength
    const strength = calculatePasswordStrength(form.password);
    setPasswordStrength(strength);
  }, [form.password]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 25) return "bg-red-500";
    if (strength < 50) return "bg-orange-500";
    if (strength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 25) return "Weak";
    if (strength < 50) return "Fair";
    if (strength < 75) return "Good";
    return "Strong";
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Add success animation
      setFormSubmitted(true);

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
        form
      );

      // Success animation before redirect
      await new Promise((resolve) => setTimeout(resolve, 1500));
      window.location.href = "/login";
    } catch {
      // Error animation
      formRef.current.classList.add("animate-shake");
      setTimeout(() => {
        formRef.current.classList.remove("animate-shake");
      }, 500);
      alert("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHover = (element, isHovering) => {
    setHoverStates((prev) => ({
      ...prev,
      [element]: isHovering,
    }));
  };

  const handleFeatureClick = (index) => {
    setCurrentFeature(index);
    // Add bounce animation
    const featureElement = document.querySelectorAll(".feature-card")[index];
    featureElement.classList.add("animate-bounce");
    setTimeout(() => {
      featureElement.classList.remove("animate-bounce");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingElements.map((Element, index) => {
          const Icon = Element.icon;
          return (
            <div
              key={index}
              className={`absolute animate-float-slow ${Element.color}`}
              style={{
                top: Element.top,
                left: Element.left,
                right: Element.right,
                bottom: Element.bottom,
                animationDelay: Element.delay,
              }}
            >
              <Icon className="w-8 h-8 opacity-30" />
            </div>
          );
        })}

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Success Animation Overlay */}
      {formSubmitted && (
        <div className="fixed inset-0 bg-green-500/90 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="text-center p-8 bg-white rounded-3xl shadow-2xl max-w-md animate-bounce-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 animate-pulse">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Aboard! 🎉
            </h3>
            <p className="text-gray-600 mb-6">
              Your AI learning adventure is about to begin! Redirecting to
              login...
            </p>
            <div className="w-12 h-12 border-4 border-white border-t-green-500 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 relative overflow-hidden">
        {/* Mobile background animation */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-slide-in-left">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30 hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6 text-white animate-spin-slow" />
              </div>
              <h1 className="text-xl font-bold text-white">AI Tutor</h1>
            </div>
            <Link
              to="/login"
              className="text-sm text-white/90 hover:text-white bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105"
              onMouseEnter={() => handleHover("mobileLogin", true)}
              onMouseLeave={() => handleHover("mobileLogin", false)}
            >
              Sign In
            </Link>
          </div>

          <div className="mt-8 text-center animate-fade-in-up">
            <h2 className="text-2xl font-bold text-white mb-3 animate-gradient-x">
              Start Your AI Learning Adventure
            </h2>
            <p className="text-indigo-100 text-sm">
              Join 50,000+ students achieving success
            </p>
          </div>

          {/* Mobile Features Carousel */}
          <div className="mt-8">
            <div className="flex overflow-x-auto gap-3 pb-4 snap-x snap-mandatory -mx-6 px-6 scrollbar-hide">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="feature-card flex-shrink-0 w-64 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 snap-center hover:bg-white/15 transition-all duration-300"
                >
                  <div
                    className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} w-14 h-14 flex items-center justify-center mb-3 animate-pulse-slow`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-indigo-100 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:min-h-screen lg:flex relative z-10">
        {/* Left Side - Attractive Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

            {/* Animated Orbs */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-12 flex flex-col justify-between h-full">
            {/* Logo */}
            <div>
              <div className="flex items-center gap-3 mb-16 animate-fade-in-up">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30 hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="w-8 h-8 text-white animate-wiggle" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white animate-gradient-x">
                    AI Tutor
                  </h1>
                  <p className="text-indigo-100 text-sm">
                    Intelligent Learning Platform
                  </p>
                </div>
              </div>

              {/* Main Content */}
              <div className="max-w-lg">
                <h2 className="text-5xl font-bold text-white mb-6 leading-tight animate-slide-in-left">
                  Start Your{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-pink-300 animate-gradient-x">
                    Learning Adventure
                  </span>
                </h2>
                <p className="text-xl text-indigo-100 mb-12 leading-relaxed animate-fade-in delay-300">
                  Join thousands of students who are mastering subjects with our
                  AI-powered personalized tutoring system.
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-6 mb-12">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className={`feature-card bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer animate-stagger-children ${
                        currentFeature === index
                          ? "ring-2 ring-white/50 scale-105"
                          : "hover:scale-[1.02]"
                      } ${feature.bgColor}`}
                      onMouseEnter={() => setCurrentFeature(index)}
                      onClick={() => handleFeatureClick(index)}
                    >
                      <div
                        className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} w-12 h-12 flex items-center justify-center mb-3 animate-pulse-slow`}
                      >
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-indigo-100 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 animate-slide-in-up">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1 animate-count-up">
                  50K+
                </div>
                <div className="text-indigo-200 text-sm">Happy Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1 animate-count-up">
                  94%
                </div>
                <div className="text-indigo-200 text-sm">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1 animate-count-up">
                  24/7
                </div>
                <div className="text-indigo-200 text-sm">AI Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div
            ref={formRef}
            className="w-full max-w-full bg-white backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 sm:p-8 transform hover:scale-[1.01] transition-all duration-500 animate-fade-in-up delay-300"
          >
            {/* Decorative corner elements */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-indigo-300 rounded-tl-xl"></div>
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-purple-300 rounded-tr-xl"></div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-blue-300 rounded-bl-xl"></div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-pink-300 rounded-br-xl"></div>

            {/* Form Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl mb-4 animate-pulse-slow shadow-lg">
                <Rocket className="w-7 h-7 text-white animate-bounce-slow" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 animate-gradient-x">
                Start Learning Journey
              </h2>
              <p className="text-gray-500 text-sm sm:text-base">
                Create your account and begin the adventure!
              </p>
            </div>

            {/* Compact Form */}
            <form className="space-y-5" onSubmit={handleSignup}>
              {/* Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-stagger-children">
                <div className="animate-slide-in-right delay-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <User className="w-3 h-3" />
                    Full Name *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      placeholder="Your full name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-sm transition-all duration-300 hover:border-indigo-300"
                      required
                    />
                  </div>
                </div>

                <div className="animate-slide-in-right delay-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Date of Birth *
                  </label>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>

                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e) =>
                        setForm({ ...form, dob: e.target.value })
                      }
                      max={new Date().toISOString().split("T")[0]} // prevent future dates
                      className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl 
                 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
                 focus:outline-none text-sm transition-all duration-300 
                 hover:border-indigo-300"
                      required
                    />
                  </div>
                </div>

                <div className="animate-slide-in-right delay-300">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    Gender *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <select
                      value={form.gender}
                      onChange={(e) =>
                        setForm({ ...form, gender: e.target.value })
                      }
                      className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-sm appearance-none bg-white transition-all duration-300 hover:border-indigo-300"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="animate-slide-in-right delay-400">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    Contact Number *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      placeholder="Your mobile number"
                      value={form.number}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-sm transition-all duration-300 hover:border-indigo-300"
                      required
                    />
                  </div>
                </div>
                <div className="animate-slide-in-right delay-400">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <School className="w-3 h-3" />
                    School *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <School className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <select
                      value={form.schoolName}
                      onChange={(e) =>
                        setForm({ ...form, schoolName: e.target.value })
                      }
                      className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-sm appearance-none bg-white transition-all duration-300 hover:border-indigo-300"
                      required
                    >
                      <option value="">Select school</option>
                      {schools.map((school) => (
                        <option key={school.id} value={school.name}>
                          {school.name}
                        </option>
                      ))}
                      <option value="other">Other school</option>
                    </select>
                  </div>
                </div>
                {/* Class Selection */}
                <div className="animate-slide-in-right delay-500">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <GraduationCap className="w-3 h-3" />
                    Class/Grade *
                  </label>
                  <div className="relative group">
                    <select
                      value={form.className}
                      onChange={(e) =>
                        setForm({ ...form, className: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-sm appearance-none bg-white transition-all duration-300 hover:border-indigo-300"
                      required
                    >
                      <option value="">Select class</option>
                      {[4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                        <option key={grade} value={grade}>
                          Class {grade}
                        </option>
                      ))}
                      <option value="college">College/University</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronRight className="h-4 w-4 text-gray-400 rotate-90 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                  </div>
                </div>
                <div className="animate-slide-in-right delay-600">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    Email Address *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="student@email.com"
                      className="w-full pl-10 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-sm transition-all duration-300 hover:border-indigo-300"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="animate-slide-in-right delay-700">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Lock className="w-3 h-3" />
                      Password *
                    </label>
                    <span className="text-xs text-gray-500">
                      At least 8 characters
                    </span>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder="Create a strong password"
                      className="w-full pl-10 pr-12 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-sm transition-all duration-300 hover:border-indigo-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500 hover:text-indigo-600 transition-colors" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500 hover:text-indigo-600 transition-colors" />
                      )}
                    </button>
                  </div>
                  <div className="mt-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${getPasswordStrengthColor(
                          passwordStrength
                        )}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">
                        Strength:{" "}
                        <span className="font-semibold">
                          {getPasswordStrengthText(passwordStrength)}
                        </span>
                      </span>
                      {passwordStrength >= 75 && (
                        <CheckCircle className="w-4 h-4 text-green-500 animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Email */}

              {/* Terms */}
              <div className="flex items-start space-x-3 animate-fade-in delay-800">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1 flex-shrink-0 hover:scale-110 transition-transform"
                  required
                />
                <label htmlFor="terms" className="text-xs text-gray-600">
                  By creating an account, I agree to the{" "}
                  <a
                    href="#"
                    className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                onMouseEnter={() => handleHover("signupButton", true)}
                onMouseLeave={() => handleHover("signupButton", false)}
                className={`w-full cursor-pointer disabled:cursor-not-allowed bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white py-3.5 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 ${
                  hoverStates.signupButton ? "-translate-y-1 scale-[1.02]" : ""
                } ${
                  isLoading
                    ? "opacity-75 cursor-not-allowed"
                    : "hover:-translate-y-1"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 animate-sparkle" />
                    Start Learning Adventure
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center animate-fade-in delay-900">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">
                Already have an account?
              </span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Login Link */}
            <div className="text-center animate-fade-in delay-1000">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold hover:underline group transition-all duration-300"
                onMouseEnter={() => handleHover("loginLink", true)}
                onMouseLeave={() => handleHover("loginLink", false)}
              >
                <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Sign in to your account
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations to global CSS */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
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
        
        @keyframes slide-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
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
        
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }
        
        @keyframes count-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
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
        
        .animate-slide-in-up {
          animation: slide-in-up 0.5s ease-out;
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
        
        .animate-sparkle {
          animation: sparkle 1s ease-in-out infinite;
        }
        
        .animate-count-up {
          animation: count-up 0.8s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-stagger-children > *:nth-child(1) { animation-delay: 0.1s; }
        .animate-stagger-children > *:nth-child(2) { animation-delay: 0.2s; }
        .animate-stagger-children > *:nth-child(3) { animation-delay: 0.3s; }
        .animate-stagger-children > *:nth-child(4) { animation-delay: 0.4s; }
        
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        
        .animate-bounce {
          animation: bounce 0.5s ease-out;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
