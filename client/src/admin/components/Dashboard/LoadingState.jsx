import { useEffect, useState } from "react";
import { FaGraduationCap, FaBookOpen, FaSchool, FaChartLine } from "react-icons/fa";

const LoadingState = () => {
  const [text, setText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const loadingText = "Loading your educational insights...";

  useEffect(() => {
    if (textIndex < loadingText.length) {
      const timeout = setTimeout(() => {
        setText(prev => prev + loadingText.charAt(textIndex));
        setTextIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [textIndex]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      
      {/* Main Loading Container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Floating Icons */}
        <div className="relative w-48 h-48 mb-8">
          {[
            { Icon: FaGraduationCap, color: "text-yellow-500", delay: "0s" },
            { Icon: FaBookOpen, color: "text-blue-500", delay: "0.2s" },
            { Icon: FaSchool, color: "text-purple-500", delay: "0.4s" },
            { Icon: FaChartLine, color: "text-green-500", delay: "0.6s" },
          ].map((item, index) => (
            <div
              key={index}
              className={`absolute animate-orbit text-3xl ${item.color}`}
              style={{
                animationDelay: item.delay,
                transform: `rotate(${index * 90}deg) translateX(80px) rotate(-${index * 90}deg)`,
              }}
            >
              <item.Icon className="drop-shadow-lg" />
            </div>
          ))}
          
          {/* Central Spinner */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-32 h-32 border-4 border-transparent border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-green-500 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Text with Typing Effect */}
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            {text}
            <span className="ml-1 animate-blink">|</span>
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Please wait while we prepare your dashboard
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-progress rounded-full"></div>
        </div>

        {/* Dots Animation */}
        <div className="flex space-x-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(80px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        .animate-orbit {
          animation: orbit 8s linear infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingState;