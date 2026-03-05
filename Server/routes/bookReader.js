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
// Get detailed AI explanation for current segment
router.post("/chapters/:chapterId/explain-detailed", bookReaderController.explainDetailed);

// Text-to-speech conversion
router.post("/chapters/:chapterId/tts", bookReaderController.textToSpeech);

// Save reading progress
router.post("/chapters/:chapterId/progress", bookReaderController.saveProgress);

// Get reading progress for a chapter
router.get("/chapters/:chapterId/progress", bookReaderController.getProgress);

// One-time: backfill total_segments for a single chapter
router.post("/chapters/:chapterId/backfill-segments", bookReaderController.backfillSegmentCount);

// One-time: backfill total_segments for ALL chapters in a book
router.post("/:bookId/backfill-all-segments", bookReaderController.backfillAllSegments);

// Get per-chapter progress summary for a whole book (Dashboard use)
router.get("/:bookId/progress-summary", bookReaderController.getBookProgressSummary);

router.get("/class/all", authMiddleware, (req, res, next) => {
  console.log("[bookRoutes] GET /class/all hit, studentId:", req.studentId);
  next();
}, bookReaderController.getAllBooksForClass);

module.exports = router;

// Add this to your main app.js:
// app.use("/api/books", require("./routes/bookReader"));