const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subjectController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/subjects", authMiddleware, subjectController.getSubjectsForStudent);

module.exports = router;
