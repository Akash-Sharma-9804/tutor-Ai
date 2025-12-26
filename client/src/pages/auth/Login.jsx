import { Link,useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, Lock, Mail } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { loginSuccess } from "../../store/authSlice";
import { useDispatch } from "react-redux";



export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const dispatch = useDispatch();
const navigate = useNavigate();
  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post("http://localhost:4000/api/auth/login", {
      email,
      password,
    });

    dispatch(
      loginSuccess({
        token: res.data.token,
        student: res.data.student,
      })
    );

    navigate("/", { replace: true });
  } catch (err) {
    console.error("Login error:", err);
    alert(err.response?.data?.message || "Login failed");
  }
};


  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Left side - Brand/Info */}
      <div className="md:w-1/2 flex flex-col justify-center p-8 md:p-12 lg:p-20">
        <div className="max-w-md mx-auto md:ml-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-100 rounded-2xl">
              <Sparkles className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI Tutor
            </h1>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Welcome Back, <span className="text-indigo-600">Student!</span>
          </h2>
          {/* Spline 3D Design */}
          <div className="relative w-full h-[300px] md:h-[380px] lg:h-[420px] mb-8 hidden md:block">
            <iframe
              src="https://my.spline.design/100followersfocus-6Aip30f9E9yIuXhZbtXpoiVm/"
              frameBorder="0"
              className="w-full h-full rounded-2xl"
              loading="lazy"
              allow="fullscreen"
            />
            <div className=" absolute bg-[#090314] w-38 h-10 rounded-2xl bottom-5 right-4"></div>
          </div>

          <p className="text-lg text-gray-600 mb-10">
            Continue your personalized learning journey with AI-powered tutoring tailored just for you.
          </p>

          {/* <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-700">Personalized lesson plans</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-gray-700">AI-powered explanations</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Progress tracking & analytics</span>
            </div>
          </div> */}
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Student Login
            </h2>
            <p className="text-gray-500">
              Sign in to continue your learning journey
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="student@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-200"
                />

              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-all duration-200"
                />

              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Login to AI Tutor
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                <span className="text-gray-700 font-medium">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="text-gray-700 font-medium">GitHub</span>
              </button>
            </div>
          </form>

          <p className="text-center text-gray-600 mt-8">
            New to AI Tutor?{" "}
            <Link
              to="/signup"
              className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline ml-1"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}