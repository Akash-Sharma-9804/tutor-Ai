const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subjectController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/subjects", authMiddleware, subjectController.getSubjectsForStudent);
router.get("/subjects-with-progress", authMiddleware, subjectController.getSubjectsWithProgress);
router.get("/dashboard-stats", authMiddleware, subjectController.getDashboardStats);
router.get("/class/:classId", subjectController.getSubjectsByClass);
router.post("/student/select", authMiddleware, subjectController.saveStudentSubjects);
router.get("/worksheet-progress", authMiddleware, subjectController.getSubjectWorksheetProgress);

module.exports = router;