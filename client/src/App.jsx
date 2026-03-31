import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ===== Student Imports =====
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import CompleteProfile from "./pages/auth/CompleteProfile";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import AITutor from "./pages/AITutor";
import ScanLearn from "./pages/ScanLearn";
import Progress from "./pages/Progress";
import TalkAI from "./pages/TalkAI";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ProtectedRoute from "./routes/ProtectedRoute";
import HomePage from "./pages/HomePage";

// ===== Test Flow =====
import TestDashboard from "./pages/TestDashboard";
import SubjectTests from "./pages/SubjectTests";
import TestPlayer from "./pages/TestPlayer";
import TestResult from "./pages/TestResult";
import TestAttemptsList from "./pages/TestAttemptsList"; // NEW
import WorksheetResult from "./pages/WorksheetResult";
// ===== Book Reader Imports =====
import TableOfContents from "./pages/TableOfContents";
import LineByLineReader from "./pages/LineByLineReader";
import ChapterWorksheets from "./pages/ChapterWorksheets";
import WorksheetPlayer from "./pages/WorksheetPlayer";

// ===== Admin Imports =====
import AdminLogin from "./admin/auth/AdminLogin";
import AdminProtectedRoute from "./admin/auth/AdminProtectedRoute";
import AdminLayout from "./admin/layout/AdminLayout";
import AdminDashboard from "./admin/pages/Dashboard";
import Schools from "./admin/pages/Schools";
import Classes from "./admin/pages/Classes";
import SubjectsAdmin from "./admin/pages/Subjects";
import Books from "./admin/pages/Books";
import Worksheets from "./admin/pages/Worksheets";
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC HOME ================= */}
        <Route path="/home" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />

        {/* ================= STUDENT AUTH ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />

        {/* ================= STUDENT APP ================= */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="ai-tutor" element={<AITutor />} />
            <Route path="scan" element={<ScanLearn />} />
            <Route path="tests" element={<TestDashboard />} />
            <Route path="progress" element={<Progress />} />
            <Route path="talk-ai" element={<TalkAI />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
   <Route path="/book/:bookId" element={<TableOfContents />} />
            {/* ─── Test pages that live inside the dashboard layout ─── */}
            <Route path="tests/subject" element={<SubjectTests />} />
            <Route path="tests/attempts" element={<TestAttemptsList />} /> {/* NEW */}
          <Route path="/chapter/:chapterId/worksheets/:bookId" element={<ChapterWorksheets />} />
          </Route>

          {/* ─── Full-screen (no sidebar) ─── */}
          <Route path="/test/:id" element={<TestPlayer />} />
          <Route path="/test/:id/result" element={<TestResult />} />
           <Route
            path="/chapter/:chapterId/worksheet/:worksheetId/attempts/:attemptId/result"
            element={<WorksheetResult />}
          />
 

          {/* ================= BOOK READER ================= */}
       
          <Route path="/reader/:chapterId" element={<LineByLineReader />} />
          <Route path="/chapter/:chapterId/worksheet/:id" element={<WorksheetPlayer />} />
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
            <Route path="worksheets" element={<Worksheets />} />
            <Route path="students" element={<Users />} />
            <Route path="students/:id/details" element={<StudentDetailsPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="terms" element={<TermsOfServicePage />} />
            <Route path="cookie-policy" element={<CookiePolicyPage />} />
            <Route path="documentation" element={<DocumentationPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="messages" element={<MessagesPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}