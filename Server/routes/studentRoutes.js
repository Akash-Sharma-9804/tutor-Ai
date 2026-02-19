const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");

// Get logged-in student profile
router.get("/me", authMiddleware, studentController.getStudentProfile);

module.exports = router;
