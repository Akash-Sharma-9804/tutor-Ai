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
import Users from "./admin/pages/Users";
import SchoolDetailsPage from "./admin/pages/SchoolDetailsPage";
import StudentDetailsPage from "./admin/pages/StudentDetailsPage";
import AdminProfilePage from "./admin/pages/AdminProfilePage";
import PrivacyPolicyPage from "./admin/pages/OthersPage/PrivacyPolicyPage";
import TermsOfServicePage from "./admin/pages/OthersPage/TermsOfServicePage";
import CookiePolicyPage from "./admin/pages/OthersPage/CookiePolicyPage";
import DocumentationPage from "./admin/pages/OthersPage/DocumentationPage";
import SettingsPage from "./admin/pages/OthersPage/SettingsPage";
import CalendarPage from "./admin/pages/OthersPage/CalendarPage";
import MessagesPage from "./admin/pages/OthersPage/MessagesPage";
// import BookDetails from "./admin/pages/BookDetails";
// import Processing from "./admin/pages/Processing";

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
            <Route path="profile" element={<AdminProfilePage />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="schools" element={<Schools />} />
            <Route path="schools/:id/details" element={<SchoolDetailsPage />} />
            <Route path="classes" element={<Classes />} />
            <Route path="subjects" element={<SubjectsAdmin />} />
            <Route path="books" element={<Books />} />
            <Route path="students" element={<Users />} />
            <Route
              path="students/:id/details"
              element={<StudentDetailsPage />}
            />


            <Route
              path="privacy-policy"
              element={<PrivacyPolicyPage/>}
            />
            <Route path="terms" element={<TermsOfServicePage />} />
            <Route path="cookie-policy" element={<CookiePolicyPage/>} />
            <Route
              path="documentation"
              element={<DocumentationPage/>}
            />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="messages" element={<MessagesPage />} />

            {/* <Route path="books/:id" element={<BookDetails />} />
            <Route path="processing" element={<Processing />} /> */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
