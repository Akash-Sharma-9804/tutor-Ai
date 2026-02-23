const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subjectController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/subjects", authMiddleware, subjectController.getSubjectsForStudent);
router.get("/class/:classId", subjectController.getSubjectsByClass); // no auth needed at signup
router.post("/student/select", authMiddleware, subjectController.saveStudentSubjects);

module.exports = router;