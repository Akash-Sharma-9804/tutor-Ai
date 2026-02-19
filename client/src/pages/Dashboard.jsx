// pages/Dashboard.jsx - Fixed for Light Mode

import { React, useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.warn("⚠️ No token found, skipping subjects fetch");
          return;
        }

        console.log("📡 Fetching subjects...");

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/subjects/subjects`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("✅ Subjects fetched:", response.data);
        setSubjects(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.warn("⚠️ No token found, skipping student profile fetch");
          return;
        }

        console.log("📡 Fetching student profile...");

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/student/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("✅ Student profile fetched:", response.data);
        setStudent(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch student profile:", error);
      }
    };

    fetchStudentProfile();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="px-0 sm:px-6 lg:px-8 pt-6 space-y-6 text-gray-900 dark:text-white"
    >
      <TopHeader student={student} />
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
