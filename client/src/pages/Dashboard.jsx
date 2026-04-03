// pages/Dashboard.jsx - Fixed for Light Mode

import { React, useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import TopHeader from "../components/Dashboard/TopHeader";
import HeroBox from "../components/Dashboard/HeroBox";
import QuickStats from "../components/Dashboard/QuickStats";
import CourseSection from "../components/Dashboard/CourseSection";
import Footer from "../components/Footer/Footer";
import DashboardAdditionalSection from "../components/Dashboard/DashboardAdditionalSection";

const Dashboard = () => {
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [subjectWorksheetsBySubject, setSubjectWorksheetsBySubject] = useState({});
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Prevent double-fetch from React StrictMode or re-renders
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        setLoadingDashboard(true);

        // Fetch student profile and subjects in parallel
        const [profileRes, subjectsRes, statsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subjects/subjects-with-progress`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subjects/dashboard-stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStudent(profileRes.data);
        setStats(statsRes.data);
        setSubjects(subjectsRes.data.map(s => ({
          ...s,
          progressLoaded: true,
        })));
        // Extract subjectWorksheetsBySubject from stats
        if (statsRes.data && statsRes.data.worksheets && statsRes.data.worksheets.subjectWorksheetsBySubject) {
          setSubjectWorksheetsBySubject(statsRes.data.worksheets.subjectWorksheetsBySubject);
        }
      } catch (error) {
        console.error("❌ Dashboard fetch failed:", error);
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="px-0 sm:px-6 lg:px-8 pt-8 space-y-6 text-gray-900 dark:text-white"
    >
    
      <HeroBox student={student} subjects={subjects} />
      <QuickStats subjects={subjects} stats={stats} />
      <CourseSection subjects={subjects} student={student} stats={stats} subjectWorksheetsBySubject={subjectWorksheetsBySubject} loading={loadingDashboard} />
      <DashboardAdditionalSection />
      <div className="  md:-mx-8 -mx-4">
        <Footer />
      </div>
    </motion.div>
  );
};

export default Dashboard;
