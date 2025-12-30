// import { BrowserRouter, Routes, Route } from "react-router-dom";

// // ===== Student Imports =====
// import DashboardLayout from "./layouts/DashboardLayout";
// import Login from "./pages/auth/Login";
// import Signup from "./pages/auth/Signup";
// import Dashboard from "./pages/Dashboard";
// import Subjects from "./pages/Subjects";
// import AITutor from "./pages/AITutor";
// import ScanLearn from "./pages/ScanLearn";
// import Tests from "./pages/Tests";
// import Progress from "./pages/Progress";
// import TalkAI from "./pages/TalkAI";
// import Profile from "./pages/Profile";
// import Settings from "./pages/Settings";
// import ProtectedRoute from "./routes/ProtectedRoute";

// // ===== Admin Imports =====
// import AdminLogin from "./admin/auth/AdminLogin";
// import AdminProtectedRoute from "./admin/auth/AdminProtectedRoute";
// import AdminLayout from "./admin/layout/AdminLayout";
// import AdminDashboard from "./admin/pages/Dashboard";
// import Schools from "./admin/pages/Schools";
// import Classes from "./admin/pages/Classes";
// import SubjectsAdmin from "./admin/pages/Subjects";
// import Books from "./admin/pages/Books";
// // import BookDetails from "./admin/pages/BookDetails";
// // import Processing from "./admin/pages/Processing";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>

//         {/* ================= STUDENT AUTH ================= */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />

//         {/* ================= STUDENT APP ================= */}
//         <Route element={<ProtectedRoute />}>
//           <Route path="/" element={<DashboardLayout />}>
//             <Route index element={<Dashboard />} />
//             <Route path="subjects" element={<Subjects />} />
//             <Route path="ai-tutor" element={<AITutor />} />
//             <Route path="scan" element={<ScanLearn />} />
//             <Route path="tests" element={<Tests />} />
//             <Route path="progress" element={<Progress />} />
//             <Route path="talk-ai" element={<TalkAI />} />
//             <Route path="profile" element={<Profile />} />
//             <Route path="settings" element={<Settings />} />
//           </Route>
//         </Route>

//         {/* ================= ADMIN AUTH ================= */}
//         <Route path="/admin/login" element={<AdminLogin />} />

//         {/* ================= ADMIN APP ================= */}
//         <Route element={<AdminProtectedRoute />}>
//           <Route path="/admin" element={<AdminLayout />}>
//             <Route index element={<AdminDashboard />} />
//             <Route path="dashboard" element={<AdminDashboard />} />
//             <Route path="schools" element={<Schools />} />
//             <Route path="classes" element={<Classes />} />
//             <Route path="subjects" element={<SubjectsAdmin />} />
//             <Route path="books" element={<Books />} />
//             {/* <Route path="books/:id" element={<BookDetails />} />
//             <Route path="processing" element={<Processing />} /> */}
//           </Route>
//         </Route>

//       </Routes>
//     </BrowserRouter>
//   );
// }

import { BrowserRouter, Routes, Route } from "react-router-dom";

// ===== Student Imports =====
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import AITutor from "./pages/AITutor";
import ScanLearn from "./pages/ScanLearn";
import Tests from "./pages/Tests";
import Progress from "./pages/Progress";
import TalkAI from "./pages/TalkAI";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ProtectedRoute from "./routes/ProtectedRoute";

// ===== Book Reader Imports =====
import TableOfContents from "./pages/TableOfContents";
import BookReader from "./pages/BookReader";

// ===== Admin Imports =====
import AdminLogin from "./admin/auth/AdminLogin";
import AdminProtectedRoute from "./admin/auth/AdminProtectedRoute";
import AdminLayout from "./admin/layout/AdminLayout";
import AdminDashboard from "./admin/pages/Dashboard";
import Schools from "./admin/pages/Schools";
import Classes from "./admin/pages/Classes";
import SubjectsAdmin from "./admin/pages/Subjects";
import Books from "./admin/pages/Books";
<<<<<<< HEAD
=======
import Users from "./admin/pages/Users";
// import BookDetails from "./admin/pages/BookDetails";
// import Processing from "./admin/pages/Processing";
>>>>>>> e11b28e31b307192f729c0e7dfb0bab0786ffa6f

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= STUDENT AUTH ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ================= STUDENT APP ================= */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="ai-tutor" element={<AITutor />} />
            <Route path="scan" element={<ScanLearn />} />
            <Route path="tests" element={<Tests />} />
            <Route path="progress" element={<Progress />} />
            <Route path="talk-ai" element={<TalkAI />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* ================= BOOK READER (FULL SCREEN) ================= */}
          <Route path="/book/:bookId" element={<TableOfContents />} />
          <Route path="/reader/:chapterId" element={<BookReader />} />
        </Route>

        {/* ================= ADMIN AUTH ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ================= ADMIN APP ================= */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="schools" element={<Schools />} />
            <Route path="classes" element={<Classes />} />
            <Route path="subjects" element={<SubjectsAdmin />} />
            <Route path="books" element={<Books />} />
            <Route path="students" element={<Users />} />
            {/* <Route path="books/:id" element={<BookDetails />} />
            <Route path="processing" element={<Processing />} /> */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}