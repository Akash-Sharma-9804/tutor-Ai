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
        const [profileRes, subjectsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/student/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/subjects/subjects`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStudent(profileRes.data);
        const rawSubjects = subjectsRes.data;

        // Set subjects immediately so UI renders fast
        setSubjects(rawSubjects.map(s => ({ ...s, progress: 0, progressLoaded: false })));

        // Then enrich with progress in background — one subject at a time to avoid burst
        const enriched = [];
        for (const subject of rawSubjects) {
          try {
            const booksRes = await axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/api/books/subject/${subject.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            const books = booksRes.data;

            if (books.length === 0) {
              enriched.push({ ...subject, progress: 0, progressLoaded: true });
              continue;
            }

            const summaries = await Promise.all(
              books.map(book =>
                axios.get(
                  `${import.meta.env.VITE_BACKEND_URL}/api/books/${book.id}/progress-summary`,
                  { headers: { Authorization: `Bearer ${token}` } }
                ).then(r => r.data)
              )
            );

            // Sum ALL segments across ALL chapters/books for this subject
            let totalSegments = 0;
            let completedSegments = 0;
            summaries.forEach(summary => {
              summary.chapters?.forEach(ch => {
                totalSegments += ch.totalSegments || 0;
                completedSegments += ch.completedSegments || 0;
              });
            });

            const realProgress = totalSegments > 0
              ? Math.round((completedSegments / totalSegments) * 100)
              : 0;

            enriched.push({ ...subject, progress: realProgress, progressLoaded: true });
          } catch {
            enriched.push({ ...subject, progress: 0, progressLoaded: true });
          }

          // Update subjects progressively as each one finishes
          setSubjects([...enriched, ...rawSubjects.slice(enriched.length).map(s => ({ ...s, progress: 0, progressLoaded: false }))]);
        }

        setSubjects(enriched);
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
    
      <HeroBox student={student} />
      <QuickStats subjects={subjects} />
      <CourseSection subjects={subjects} student={student} />
      <DashboardAdditionalSection />
      <div className="  md:-mx-8 -mx-4">
        <Footer />
      </div>
    </motion.div>
  );
};

export default Dashboard;
