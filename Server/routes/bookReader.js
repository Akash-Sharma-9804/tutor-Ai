// routes/bookReader.js

const express = require("express");
const router = express.Router();
const bookReaderController = require("../controllers/bookReaderController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

router.get("/", authMiddleware, bookReaderController.getAllBooks);
// Get all books for a subject
router.get("/subject/:subjectId", bookReaderController.getBooksBySubject);

// Get table of contents (all chapters) for a book
router.get("/:bookId/chapters", bookReaderController.getBookChapters);

// Get full chapter content with pages and paragraphs
router.get("/chapters/:chapterId/content", bookReaderController.getChapterContent);

// Get AI explanation for a section
router.post("/chapters/:chapterId/explain", bookReaderController.explainSection);

// Text-to-speech conversion
router.post("/chapters/:chapterId/tts", bookReaderController.textToSpeech);

// Save reading progress
router.post("/chapters/:chapterId/progress", bookReaderController.saveProgress);

// Get reading progress
router.get("/chapters/:chapterId/progress", bookReaderController.getProgress);

module.exports = router;

// Add this to your main app.js:
// app.use("/api/books", require("./routes/bookReader"));