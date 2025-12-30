const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, bookController.getAllBooks);
router.get("/subject/:subjectId", authMiddleware, bookController.getBooksBySubject);

module.exports = router;
