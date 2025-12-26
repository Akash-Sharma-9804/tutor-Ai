import { Link } from "react-router-dom";
import { GraduationCap, User, School, Calendar, Users, Mail, Lock, Sparkles, Target, Clock, Award, ChevronRight, CheckCircle, Globe, BookOpen, Brain } from "lucide-react";
import { useState,useEffect } from "react";
import axios from "axios";

    
export default function Signup() {

    const [form, setForm] = useState({
  name: "",
  email: "",
  password: "",
  schoolName: "",
  className: "",
  age: "",
  gender: ""
});

const handleSignup = async (e) => {
  e.preventDefault();
  try {
    await axios.post("${import.meta.env.VITE_BACKEND_URL}/api/auth/signup", form);
    window.location.href = "/login";
  } catch {
    alert("Signup failed");
  }
};


const [schools, setSchools] = useState([]);

useEffect(() => {
  axios.get("${import.meta.env.VITE_BACKEND_URL}/api/data/schools")
    .then(res => setSchools(res.data))
    .catch(err => console.error(err));
}, []);


//   const dummySchools = [
//     "Delhi Public School",
//     "Kendriya Vidyalaya",
//     "St. Xavier's School",
//     "The Doon School",
//     "Modern School",
//     "St. Mary's Convent",
//     "La Martiniere College",
//     "The Asian School",
//     "Birla Public School",
//     "St. Joseph's Academy",
//     "Ryan International School",
//     "D.A.V. Public School",
//     "Sanskriti School",
//     "Maharaja Sawai Man Singh Vidyalaya",
//     "The Shri Ram School"
//   ];

  const [currentFeature, setCurrentFeature] = useState(0);
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Learning",
      description: "Adaptive learning paths tailored to your strengths and weaknesses",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Personalized Goals",
      description: "Set and track your academic goals with AI guidance",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "24/7 Availability",
      description: "Learn at your own pace, anytime you want",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Proven Results",
      description: "94% of students improve their grades within 3 months",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">AI Tutor</h1>
          </div>
          <Link 
            to="/login" 
            className="text-sm text-white/90 hover:text-white bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm"
          >
            Sign In
          </Link>
        </div>
        
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Start Your AI Learning Journey</h2>
          <p className="text-indigo-100 text-sm">
            Join 50,000+ students achieving academic success
          </p>
        </div>

        {/* Mobile Features Carousel */}
        <div className="mt-8">
          <div className="flex overflow-x-auto gap-3 pb-4 snap-x snap-mandatory -mx-6 px-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex-shrink-0 w-64 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 snap-center"
              >
                <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} w-14 h-14 flex items-center justify-center mb-3`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-indigo-100 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:min-h-screen lg:flex">
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
              <div className="flex items-center gap-3 mb-16">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">AI Tutor</h1>
                  <p className="text-indigo-100 text-sm">Intelligent Learning Platform</p>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="max-w-lg">
                <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                  Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-pink-300">Learning Experience</span>
                </h2>
                <p className="text-xl text-indigo-100 mb-12 leading-relaxed">
                  Join thousands of students who are mastering subjects with our AI-powered personalized tutoring system.
                </p>
                
                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-6 mb-12">
                  {features.map((feature, index) => (
                    <div 
                      key={index}
                      className={`bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer ${
                        currentFeature === index ? 'ring-2 ring-white/50' : ''
                      }`}
                      onMouseEnter={() => setCurrentFeature(index)}
                      onClick={() => setCurrentFeature(index)}
                    >
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} w-12 h-12 flex items-center justify-center mb-3`}>
                        {feature.icon}
                      </div>
                      <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-indigo-100 text-sm">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
           
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8">
            {/* Form Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Student Account</h2>
              <p className="text-gray-500 text-sm sm:text-base">Start your personalized learning journey today</p>
            </div>

            {/* Compact Form */}
            <form className="space-y-5" onSubmit={handleSignup}>
              {/* Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      placeholder="Enter full name"
                      value={form.name}
  onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      placeholder="Age"
                      value={form.age}
  onChange={(e) => setForm({ ...form, age: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-4 w-4 text-gray-400" />
                    </div>
                    <select  value={form.gender}
  onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-sm appearance-none bg-white">
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <School className="h-4 w-4 text-gray-400" />
                    </div>
                    <select  value={form.schoolName}
  onChange={(e) => setForm({ ...form, schoolName: e.target.value })} className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-sm appearance-none bg-white">
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
              </div>

              {/* Class Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class/Grade *
                </label>
                <div className="relative">
                  <select  value={form.className}
  onChange={(e) => setForm({ ...form, className: e.target.value })} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-sm appearance-none bg-white">
                    <option value="">Select class</option>
                    {[6, 7, 8, 9, 10, 11, 12].map((grade) => (
  <option key={grade} value={grade}>
    {grade}
  </option>
))}

                    <option value="college">College/University</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                      value={form.email}
  onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="student@email.com"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <span className="text-xs text-gray-500">At least 8 characters</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="password"
                     value={form.password}
  onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-sm"
                  />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {['Weak', 'Fair', 'Good', 'Strong'].map((level, index) => (
                    <div key={level} className="flex-1">
                      <div className={`h-1 rounded-full transition-all duration-300 ${
                        index === 0 ? 'bg-red-400' : 
                        index === 1 ? 'bg-yellow-400' : 
                        index === 2 ? 'bg-blue-400' : 
                        'bg-gray-300'
                      }`}></div>
                      <span className="text-xs text-gray-500 mt-1 block text-center">{level}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-3">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1 flex-shrink-0"
                />
                <label htmlFor="terms" className="text-xs text-gray-600">
                  By creating an account, you agree to our{" "}
                  <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Create Account & Start Learning
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Social Login */}
            {/* <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <GoogleIcon />
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MicrosoftIcon />
                <span className="text-sm font-medium text-gray-700">Microsoft</span>
              </button>
            </div> */}

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Star Icon Component
function StarIcon() {
  return (
    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

// Google Icon Component
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// Microsoft Icon Component
function MicrosoftIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 23 23">
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#00a4ef" d="M12 1h10v10H12z" />
      <path fill="#7fba00" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  );
}