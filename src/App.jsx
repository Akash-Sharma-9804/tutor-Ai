// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/Subjects";
import AITutor from "./pages/AITutor";
import ScanLearn from "./pages/ScanLearn";
import Tests from "./pages/Tests";
import Progress from "./pages/Progress";
import TalkAI from "./pages/TalkAI";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/ai-tutor" element={<AITutor />} />
          <Route path="/scan" element={<ScanLearn />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/talk-ai" element={<TalkAI />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}