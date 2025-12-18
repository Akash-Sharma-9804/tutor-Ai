// // pages/Dashboard.jsx - Fixed for Light Mode

// import React from "react"
// import {
//   ArrowRight,
//   BookOpen,
//   Clock,
//   TrendingUp,
//   Calendar,
//   Target,
//   Award,
//   Users,
//   BarChart3,
//   FileText,
//   Video,
//   MessageSquare,
//   Bell,
//   Star,
//   Zap,
//   Trophy,
//   ChevronRight,
//   BookMarked,
//   GraduationCap,
// } from "lucide-react"

// const Dashboard = () => {
//   return (
//     <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-gray-900 dark:text-white">

//       {/* HEADER WITH STUDENT INFO */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Welcome back, Alex! 👋</h1>
//           <p className="text-sm text-gray-600 dark:text-white/60 mt-1">
//             Student ID: STU-2024-001 • Computer Science Major
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
//             <Trophy className="h-4 w-4 text-yellow-400" />
//             <span className="text-sm text-gray-900 dark:text-white">Rank: Top 15%</span>
//           </div>
//           <button className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition border border-gray-200 dark:border-white/10">
//             <Bell className="h-5 w-5 text-gray-900 dark:text-white" />
//           </button>
//         </div>
//       </div>

//       {/* HERO COURSE */}
//       <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-[#0f0f1a] dark:to-[#1b1b2a] border border-gray-200 dark:border-white/10">
//         <div className="absolute top-0 right-0 w-40 h-40 bg-purple-100 dark:bg-white/5 rounded-full -translate-y-20 translate-x-20"></div>
//         <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100 dark:bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
        
//         <div className="relative p-6 sm:p-8 max-w-xl space-y-4">
//           <div className="flex items-center gap-2">
//             <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300">
//               Featured Course
//             </span>
//             <span className="px-3 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
//               <Star className="h-3 w-3 inline mr-1" /> Recommended
//             </span>
//           </div>

//           <h1 className="text-2xl sm:text-3xl font-semibold leading-tight text-gray-900 dark:text-white">
//             The study of the <br /> structure of matter
//           </h1>

//           <p className="text-sm text-gray-600 dark:text-white/60">
//             Continue exploring atomic models, forces, and quantum principles. Next lesson: Quantum Superposition
//           </p>

//           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
//             <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 transition text-white">
//               Continue Course
//               <ArrowRight className="h-4 w-4" />
//             </button>
//             <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-white/70">
//               <span className="flex items-center gap-1">
//                 <Clock className="h-4 w-4" />
//                 45 min left
//               </span>
//               <span className="flex items-center gap-1">
//                 <Users className="h-4 w-4" />
//                 1.2k students
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* QUICK STATS */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <div className="rounded-xl bg-white dark:bg-white/5 p-4 border border-gray-200 dark:border-white/10">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 dark:text-white/60">Active Courses</p>
//               <p className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">4</p>
//             </div>
//             <BookMarked className="h-8 w-8 text-purple-400" />
//           </div>
//           <p className="text-xs text-gray-500 dark:text-white/40 mt-2">2 new this month</p>
//         </div>

//         <div className="rounded-xl bg-white dark:bg-white/5 p-4 border border-gray-200 dark:border-white/10">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 dark:text-white/60">Study Hours</p>
//               <p className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">142</p>
//             </div>
//             <Clock className="h-8 w-8 text-blue-400" />
//           </div>
//           <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-2">
//             <TrendingUp className="h-3 w-3" />
//             +12% this week
//           </div>
//         </div>

//         <div className="rounded-xl bg-white dark:bg-white/5 p-4 border border-gray-200 dark:border-white/10">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 dark:text-white/60">Avg. Score</p>
//               <p className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">94%</p>
//             </div>
//             <Target className="h-8 w-8 text-green-400" />
//           </div>
//           <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-2">
//             <TrendingUp className="h-3 w-3" />
//             +6% improvement
//           </div>
//         </div>

//         <div className="rounded-xl bg-white dark:bg-white/5 p-4 border border-gray-200 dark:border-white/10">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 dark:text-white/60">Streak</p>
//               <p className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">21</p>
//             </div>
//             <Zap className="h-8 w-8 text-yellow-400" />
//           </div>
//           <p className="text-xs text-gray-500 dark:text-white/40 mt-2">🔥 Keep it up!</p>
//         </div>
//       </div>

//       {/* GRID 1 */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//         {/* MY COURSES */}
//         <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#14141f] border border-gray-200 dark:border-white/10 p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Courses</h2>
//             <button className="text-sm text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white flex items-center gap-1">
//               View all <ChevronRight className="h-4 w-4" />
//             </button>
//           </div>

//           <div className="space-y-4">
//             {[
//               { 
//                 name: "Economics Fundamentals", 
//                 progress: 100, 
//                 hours: "120h", 
//                 status: "Completed",
//                 category: "Business",
//                 icon: <BarChart3 className="h-5 w-5" />,
//                 color: "bg-green-500"
//               },
//               { 
//                 name: "Quantum Physics", 
//                 progress: 20, 
//                 hours: "18h", 
//                 status: "In Progress",
//                 category: "Science",
//                 icon: <Target className="h-5 w-5" />,
//                 color: "bg-purple-500"
//               },
//               { 
//                 name: "First Aid Certification", 
//                 progress: 74, 
//                 hours: "64h", 
//                 status: "In Progress",
//                 category: "Health",
//                 icon: <FileText className="h-5 w-5" />,
//                 color: "bg-red-500"
//               },
//               { 
//                 name: "Web Development", 
//                 progress: 45, 
//                 hours: "32h", 
//                 status: "In Progress",
//                 category: "Technology",
//                 icon: <Video className="h-5 w-5" />,
//                 color: "bg-blue-500"
//               },
//             ].map((course) => (
//               <div
//                 key={course.name}
//                 className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent"
//               >
//                 <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center">
//                   <div className={`h-10 w-10 rounded-lg ${course.color} flex items-center justify-center`}>
//                     <div className="text-white">
//                       {course.icon}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex-1">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <p className="font-medium text-gray-900 dark:text-white">{course.name}</p>
//                       <span className="text-xs text-gray-500 dark:text-white/50">{course.category} • {course.hours}</span>
//                     </div>
//                     <span className={`text-xs px-3 py-1 rounded-full ${course.status === "Completed"
//                         ? "bg-green-500/20 text-green-700 dark:text-green-400"
//                         : "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
//                       }`}>
//                       {course.status}
//                     </span>
//                   </div>

//                   <div className="mt-3">
//                     <div className="flex justify-between text-xs text-gray-500 dark:text-white/50 mb-1">
//                       <span>Progress</span>
//                       <span>{course.progress}%</span>
//                     </div>
//                     <div className="h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
//                       <div
//                         className={`h-full ${course.color} rounded-full`}
//                         style={{ width: `${course.progress}%` }}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* LEARNING ACTIVITY & UPCOMING */}
//         <div className="space-y-6">
//           {/* LEARNING ACTIVITY */}
//           <div className="rounded-2xl bg-white dark:bg-[#14141f] border border-gray-200 dark:border-white/10 p-6 space-y-4">
//             <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Activity</h2>

//             <div className="rounded-xl bg-purple-500/20 p-4 border border-purple-200 dark:border-purple-500/30">
//               <p className="text-sm text-gray-600 dark:text-white/60">Study Time Today</p>
//               <p className="text-3xl font-semibold mt-1 text-gray-900 dark:text-white">4.2h</p>
//               <div className="flex items-center justify-between text-sm mt-2">
//                 <span className="text-gray-600 dark:text-white/60">Goal: 3h</span>
//                 <span className="text-green-600 dark:text-green-400">✓ Goal achieved</span>
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-4 border border-gray-100 dark:border-transparent">
//                 <p className="text-sm text-gray-600 dark:text-white/60">Lessons Watched</p>
//                 <p className="text-xl font-semibold mt-1 text-gray-900 dark:text-white">12</p>
//               </div>
//               <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-4 border border-gray-100 dark:border-transparent">
//                 <p className="text-sm text-gray-600 dark:text-white/60">Quizzes Taken</p>
//                 <p className="text-xl font-semibold mt-1 text-gray-900 dark:text-white">3</p>
//               </div>
//             </div>
            
//             <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-4 border border-gray-100 dark:border-transparent">
//               <p className="text-sm text-gray-600 dark:text-white/60">Weekly Streak</p>
//               <div className="flex items-center justify-between">
//                 <p className="text-xl font-semibold mt-1 text-gray-900 dark:text-white">7 Days</p>
//                 <span className="text-yellow-400">🔥</span>
//               </div>
//             </div>
//           </div>

//           {/* UPCOMING DEADLINES */}
//           <div className="rounded-2xl bg-white dark:bg-[#14141f] border border-gray-200 dark:border-white/10 p-6 space-y-4">
//             <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h2>

//             <div className="space-y-3">
//               {[
//                 { 
//                   title: "Quantum Mechanics Assignment", 
//                   type: "Assignment", 
//                   date: "Today · 4:00 PM",
//                   priority: "high"
//                 },
//                 { 
//                   title: "Physics Mid-term Quiz", 
//                   type: "Quiz", 
//                   date: "Tomorrow",
//                   priority: "medium"
//                 },
//                 { 
//                   title: "Economics Project", 
//                   type: "Project", 
//                   date: "Feb 28",
//                   priority: "low"
//                 },
//               ].map((item, i) => (
//                 <div
//                   key={i}
//                   className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent"
//                 >
//                   <div>
//                     <p className="font-medium text-sm text-gray-900 dark:text-white">{item.title}</p>
//                     <p className="text-xs text-gray-500 dark:text-white/50">{item.type}</p>
//                   </div>
//                   <span className={`text-xs px-2 py-1 rounded-full ${item.priority === 'high' ? 'bg-red-500/20 text-red-700 dark:text-red-400' : item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' : 'bg-blue-500/20 text-blue-700 dark:text-blue-400'}`}>
//                     {item.date}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* GRID 2 */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

//         {/* UPCOMING LEARNING */}
//         <div className="rounded-2xl bg-white dark:bg-[#14141f] border border-gray-200 dark:border-white/10 p-6 space-y-4">
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Learning</h2>
//             <button className="text-sm text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white">
//               View calendar
//             </button>
//           </div>

//           {[
//             { 
//               title: "Quantum Mechanics", 
//               type: "Live Lesson", 
//               date: "Today · 4:00 PM",
//               instructor: "Dr. Smith",
//               icon: <Video className="h-4 w-4" />
//             },
//             { 
//               title: "Physics Quiz", 
//               type: "Test", 
//               date: "Tomorrow · 10:00 AM",
//               instructor: "Prof. Johnson",
//               icon: <FileText className="h-4 w-4" />
//             },
//             { 
//               title: "Study Group: Economics", 
//               type: "Group Session", 
//               date: "Feb 27 · 2:00 PM",
//               instructor: "Peer-led",
//               icon: <Users className="h-4 w-4" />
//             },
//           ].map((item, i) => (
//             <div
//               key={i}
//               className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent"
//             >
//               <div className="flex items-center gap-3">
//                 <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
//                   <div className="text-purple-600 dark:text-purple-400">{item.icon}</div>
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
//                   <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/50">
//                     <span>{item.type}</span>
//                     <span>•</span>
//                     <span>{item.instructor}</span>
//                   </div>
//                 </div>
//               </div>
//               <span className="text-sm text-gray-500 dark:text-white/50 flex items-center gap-1">
//                 <Calendar className="h-4 w-4" />
//                 {item.date}
//               </span>
//             </div>
//           ))}
//         </div>

//         {/* PERFORMANCE & RECOMMENDATIONS */}
//         <div className="space-y-6">
//           {/* PERFORMANCE SNAPSHOT */}
//           <div className="rounded-2xl bg-white dark:bg-[#14141f] border border-gray-200 dark:border-white/10 p-6 space-y-4">
//             <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Snapshot</h2>

//             <div className="rounded-xl bg-purple-500/20 p-4 border border-purple-200 dark:border-purple-500/30">
//               <p className="text-sm text-gray-600 dark:text-white/60">Average Score</p>
//               <p className="text-3xl font-semibold mt-1 text-gray-900 dark:text-white">88%</p>
//               <div className="flex items-center gap-2 text-sm mt-2">
//                 <span className="text-gray-600 dark:text-white/60">Class average: 76%</span>
//                 <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
//                   <TrendingUp className="h-3 w-3" /> +12%
//                 </span>
//               </div>
//             </div>

//             <div className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-white/5 p-4 border border-gray-100 dark:border-transparent">
//               <div className="flex items-center gap-3">
//                 <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
//                 <div>
//                   <p className="font-medium text-gray-900 dark:text-white">Weekly Improvement</p>
//                   <p className="text-sm text-gray-600 dark:text-white/60">Compared to last week</p>
//                 </div>
//               </div>
//               <span className="text-green-600 dark:text-green-400 font-semibold">+6%</span>
//             </div>

//             <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-4 border border-gray-100 dark:border-transparent">
//               <p className="text-sm text-gray-600 dark:text-white/60 mb-2">Course Performance</p>
//               <div className="space-y-2">
//                 {[
//                   { name: "Physics", score: 92, trend: "up" },
//                   { name: "Economics", score: 88, trend: "up" },
//                   { name: "Mathematics", score: 85, trend: "stable" },
//                 ].map((course, i) => (
//                   <div key={i} className="flex items-center justify-between">
//                     <span className="text-sm text-gray-900 dark:text-white">{course.name}</span>
//                     <div className="flex items-center gap-2">
//                       <span className="font-medium text-gray-900 dark:text-white">{course.score}%</span>
//                       {course.trend === "up" && <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />}
//                       {course.trend === "stable" && <span className="text-gray-400 dark:text-white/60">—</span>}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* QUICK ACTIONS */}
//           <div className="rounded-2xl bg-white dark:bg-[#14141f] border border-gray-200 dark:border-white/10 p-6">
//             <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
//             <div className="grid grid-cols-2 gap-3">
//               <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent">
//                 <MessageSquare className="h-5 w-5 mb-2 text-gray-900 dark:text-white" />
//                 <span className="text-sm text-gray-900 dark:text-white">Messages</span>
//               </button>
//               <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent">
//                 <BookOpen className="h-5 w-5 mb-2 text-gray-900 dark:text-white" />
//                 <span className="text-sm text-gray-900 dark:text-white">Library</span>
//               </button>
//               <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent">
//                 <Award className="h-5 w-5 mb-2 text-gray-900 dark:text-white" />
//                 <span className="text-sm text-gray-900 dark:text-white">Achievements</span>
//               </button>
//               <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent">
//                 <GraduationCap className="h-5 w-5 mb-2 text-gray-900 dark:text-white" />
//                 <span className="text-sm text-gray-900 dark:text-white">Certificates</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Dashboard

// pages/Dashboard.jsx - Fixed for Light Mode

import React from "react"
import {
  ArrowRight,
  BookOpen,
  Clock,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Users,
  BarChart3,
  FileText,
  Video,
  MessageSquare,
  Bell,
  Star,
  Zap,
  Trophy,
  ChevronRight,
  BookMarked,
  GraduationCap,
} from "lucide-react"

const Dashboard = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-gray-900 dark:text-white">

      {/* HEADER WITH STUDENT INFO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900  ">Welcome back, Alex! 👋</h1>
          <p className="text-sm  text-gray-900    mt-1">
            Student ID: STU-2024-001 • Computer Science Major
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 dark:bg-white/5 border border-yellow-200  ">
            <Trophy className="h-4 w-4 text-yellow-600 " />
            <span className="text-sm text-gray-900 ">Rank: Top 15%</span>
          </div>
          <button className="p-2 rounded-lg bg-blue-50 dark:bg-white/5 hover:bg-blue-100 dark:hover:bg-white/10 transition border border-blue-200 dark:border-white/10">
            <Bell className="h-5 w-5 text-blue-600  " />
          </button>
        </div>
      </div>

      {/* HERO COURSE */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-[#0f0f1a] dark:to-[#1b1b2a] border border-gray-200 dark:border-white/10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-100 dark:bg-white/5 rounded-full -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100 dark:bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
        
        <div className="relative p-6 sm:p-8 max-w-xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300">
              Featured Course
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
              <Star className="h-3 w-3 inline mr-1" /> Recommended
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold leading-tight text-gray-900 dark:text-white">
            The study of the <br /> structure of matter
          </h1>

          <p className="text-sm text-gray-600 dark:text-white/60">
            Continue exploring atomic models, forces, and quantum principles. Next lesson: Quantum Superposition
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 transition text-white">
              Continue Course
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-white/70">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                45 min left
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                1.2k students
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-yellow-200   p-4 border border-gray-200   ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-white/60">Active Courses</p>
              <p className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">4</p>
            </div>
            <BookMarked className="h-8 w-8 text-purple-500 dark:text-purple-400" />
          </div>
          <p className="text-xs text-gray-500 dark:text-white/40 mt-2">2 new this month</p>
        </div>

        <div className="rounded-xl bg-white dark:bg-white/5 p-4 border border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-white/60">Study Hours</p>
              <p className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">142</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-2">
            <TrendingUp className="h-3 w-3" />
            +12% this week
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-white/5 p-4 border border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-white/60">Avg. Score</p>
              <p className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">94%</p>
            </div>
            <Target className="h-8 w-8 text-green-500 dark:text-green-400" />
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-2">
            <TrendingUp className="h-3 w-3" />
            +6% improvement
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-white/5 p-4 border border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-white/60">Streak</p>
              <p className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">21</p>
            </div>
            <Zap className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
          </div>
          <p className="text-xs text-gray-500 dark:text-white/40 mt-2">🔥 Keep it up!</p>
        </div>
      </div>

      {/* GRID 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* MY COURSES */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#14141f] border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Courses</h2>
            <button className="text-sm text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white flex items-center gap-1">
              View all <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {[
              { 
                name: "Economics Fundamentals", 
                progress: 100, 
                hours: "120h", 
                status: "Completed",
                category: "Business",
                icon: <BarChart3 className="h-5 w-5" />,
                color: "bg-green-500"
              },
              { 
                name: "Quantum Physics", 
                progress: 20, 
                hours: "18h", 
                status: "In Progress",
                category: "Science",
                icon: <Target className="h-5 w-5" />,
                color: "bg-purple-500"
              },
              { 
                name: "First Aid Certification", 
                progress: 74, 
                hours: "64h", 
                status: "In Progress",
                category: "Health",
                icon: <FileText className="h-5 w-5" />,
                color: "bg-red-500"
              },
              { 
                name: "Web Development", 
                progress: 45, 
                hours: "32h", 
                status: "In Progress",
                category: "Technology",
                icon: <Video className="h-5 w-5" />,
                color: "bg-blue-500"
              },
            ].map((course) => (
              <div
                key={course.name}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent"
              >
                <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                  <div className={`h-10 w-10 rounded-lg ${course.color} flex items-center justify-center`}>
                    <div className="text-white">
                      {course.icon}
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{course.name}</p>
                      <span className="text-xs text-gray-500 dark:text-white/50">{course.category} • {course.hours}</span>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full ${course.status === "Completed"
                        ? "bg-green-500/20 text-green-700 dark:text-green-400"
                        : "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                      }`}>
                      {course.status}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-white/50 mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${course.color} rounded-full`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LEARNING ACTIVITY & UPCOMING */}
        <div className="space-y-6">
          {/* LEARNING ACTIVITY */}
          <div className="rounded-2xl bg-white dark:bg-[#14141f] border border-gray-200 dark:border-white/10 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Activity</h2>

            <div className="rounded-xl bg-purple-500/20 p-4 border border-purple-200 dark:border-purple-500/30">
              <p className="text-sm text-gray-600 dark:text-white/60">Study Time Today</p>
              <p className="text-3xl font-semibold mt-1 text-gray-900 dark:text-white">4.2h</p>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600 dark:text-white/60">Goal: 3h</span>
                <span className="text-green-600 dark:text-green-400">✓ Goal achieved</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-4 border border-gray-100 dark:border-transparent">
                <p className="text-sm text-gray-600 dark:text-white/60">Lessons Watched</p>
                <p className="text-xl font-semibold mt-1 text-gray-900 dark:text-white">12</p>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-4 border border-gray-100 dark:border-transparent">
                <p className="text-sm text-gray-600 dark:text-white/60">Quizzes Taken</p>
                <p className="text-xl font-semibold mt-1 text-gray-900 dark:text-white">3</p>
              </div>
            </div>
            
            <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-4 border border-gray-100 dark:border-transparent">
              <p className="text-sm text-gray-600 dark:text-white/60">Weekly Streak</p>
              <div className="flex items-center justify-between">
                <p className="text-xl font-semibold mt-1 text-gray-900 dark:text-white">7 Days</p>
                <span className="text-yellow-400">🔥</span>
              </div>
            </div>
          </div>

          {/* UPCOMING DEADLINES */}
          <div className="rounded-2xl bg-white dark:bg-[#14141f] border border-gray-200 dark:border-white/10 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h2>

            <div className="space-y-3">
              {[
                { 
                  title: "Quantum Mechanics Assignment", 
                  type: "Assignment", 
                  date: "Today · 4:00 PM",
                  priority: "high"
                },
                { 
                  title: "Physics Mid-term Quiz", 
                  type: "Quiz", 
                  date: "Tomorrow",
                  priority: "medium"
                },
                { 
                  title: "Economics Project", 
                  type: "Project", 
                  date: "Feb 28",
                  priority: "low"
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent"
                >
                  <div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-white/50">{item.type}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${item.priority === 'high' ? 'bg-red-500/20 text-red-700 dark:text-red-400' : item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' : 'bg-blue-500/20 text-blue-700 dark:text-blue-400'}`}>
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GRID 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* UPCOMING LEARNING */}
        <div className="rounded-2xl bg-white dark:bg-[#14141f] border border-gray-200 dark:border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Learning</h2>
            <button className="text-sm text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white">
              View calendar
            </button>
          </div>

          {[
            { 
              title: "Quantum Mechanics", 
              type: "Live Lesson", 
              date: "Today · 4:00 PM",
              instructor: "Dr. Smith",
              icon: <Video className="h-4 w-4" />
            },
            { 
              title: "Physics Quiz", 
              type: "Test", 
              date: "Tomorrow · 10:00 AM",
              instructor: "Prof. Johnson",
              icon: <FileText className="h-4 w-4" />
            },
            { 
              title: "Study Group: Economics", 
              type: "Group Session", 
              date: "Feb 27 · 2:00 PM",
              instructor: "Peer-led",
              icon: <Users className="h-4 w-4" />
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <div className="text-purple-600 dark:text-purple-400">{item.icon}</div>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/50">
                    <span>{item.type}</span>
                    <span>•</span>
                    <span>{item.instructor}</span>
                  </div>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-white/50 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {item.date}
              </span>
            </div>
          ))}
        </div>

        {/* PERFORMANCE & RECOMMENDATIONS */}
        <div className="space-y-6">
          {/* PERFORMANCE SNAPSHOT */}
          <div className="rounded-2xl bg-white dark:bg-[#14141f] border border-gray-200 dark:border-white/10 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Snapshot</h2>

            <div className="rounded-xl bg-purple-500/20 p-4 border border-purple-200 dark:border-purple-500/30">
              <p className="text-sm text-gray-600 dark:text-white/60">Average Score</p>
              <p className="text-3xl font-semibold mt-1 text-gray-900 dark:text-white">88%</p>
              <div className="flex items-center gap-2 text-sm mt-2">
                <span className="text-gray-600 dark:text-white/60">Class average: 76%</span>
                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +12%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-white/5 p-4 border border-gray-100 dark:border-transparent">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Weekly Improvement</p>
                  <p className="text-sm text-gray-600 dark:text-white/60">Compared to last week</p>
                </div>
              </div>
              <span className="text-green-600 dark:text-green-400 font-semibold">+6%</span>
            </div>

            <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-4 border border-gray-100 dark:border-transparent">
              <p className="text-sm text-gray-600 dark:text-white/60 mb-2">Course Performance</p>
              <div className="space-y-2">
                {[
                  { name: "Physics", score: 92, trend: "up" },
                  { name: "Economics", score: 88, trend: "up" },
                  { name: "Mathematics", score: 85, trend: "stable" },
                ].map((course, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 dark:text-white">{course.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">{course.score}%</span>
                      {course.trend === "up" && <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />}
                      {course.trend === "stable" && <span className="text-gray-400 dark:text-white/60">—</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="rounded-2xl bg-white dark:bg-[#14141f] border border-gray-200 dark:border-white/10 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent">
                <MessageSquare className="h-5 w-5 mb-2 text-gray-900 dark:text-white" />
                <span className="text-sm text-gray-900 dark:text-white">Messages</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent">
                <BookOpen className="h-5 w-5 mb-2 text-gray-900 dark:text-white" />
                <span className="text-sm text-gray-900 dark:text-white">Library</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent">
                <Award className="h-5 w-5 mb-2 text-gray-900 dark:text-white" />
                <span className="text-sm text-gray-900 dark:text-white">Achievements</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition border border-gray-100 dark:border-transparent">
                <GraduationCap className="h-5 w-5 mb-2 text-gray-900 dark:text-white" />
                <span className="text-sm text-gray-900 dark:text-white">Certificates</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard