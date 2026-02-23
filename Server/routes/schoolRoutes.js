
const express = require("express");
const router = express.Router();
const schoolController = require("../controllers/SchoolController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/:id", schoolController.getSchoolById);

module.exports = router;


