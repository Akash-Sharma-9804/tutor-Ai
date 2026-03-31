// routes/bookReader.js

const express = require("express");
const router = express.Router();
const bookReaderController = require("../controllers/bookReaderController");
const studentTestController = require("../controllers/studentTestController");
const chapterWorksheetController = require("../controllers/chapterWorksheetController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authMiddleware);

router.get("/", bookReaderController.getAllBooks);

// Get all books for a subject
router.get("/subject/:subjectId", bookReaderController.getBooksBySubject);

// Get table of contents (all chapters) for a book
router.get("/:bookId/chapters", bookReaderController.getBookChapters);

// ✅ Get worksheets for a chapter
router.get("/chapters/:chapterId/worksheets", bookReaderController.getChapterWorksheets);

// ✅ Get single worksheet
router.get("/chapters/:chapterId/worksheets/:worksheetId", bookReaderController.getWorksheetById);

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

router.get("/class/all", (req, res, next) => {
  console.log("[bookRoutes] GET /class/all hit, studentId:", req.studentId);
  next();
}, bookReaderController.getAllBooksForClass);

// ── Subject Worksheets (student_test_attempts / student_test_answers) ──────────
// Dashboard: all worksheets with attempt summary
router.get("/tests", studentTestController.getStudentTests);

// History: all attempts the student has ever made
router.get("/tests/attempts", studentTestController.getAllAttempts);

// Single attempt detail (for result page loaded from history)
router.get("/tests/attempt/:attemptId", studentTestController.getAttemptDetail);

// Open a single worksheet to attempt
router.get("/tests/:id", studentTestController.getTestById);

// Attempt history for one worksheet
router.get("/tests/:id/history", studentTestController.getAttemptHistory);

// Submit answers
router.post("/tests/:id/submit", studentTestController.submitTest);


// ── Chapter Worksheets (chapter_worksheet_attempts / chapter_worksheet_answers) ─
// Submit a chapter worksheet attempt
router.post(
  "/chapters/:chapterId/worksheets/:worksheetId/submit",
  chapterWorksheetController.submitChapterWorksheet
);

// Attempt history for a chapter worksheet
router.get(
  "/chapters/:chapterId/worksheets/:worksheetId/history",
  chapterWorksheetController.getChapterWorksheetHistory
);

// Single attempt detail (questions + student answers + scores)
router.get(
  "/chapters/:chapterId/worksheets/:worksheetId/attempts/:attemptId",
  chapterWorksheetController.getChapterWorksheetAttemptDetail
);

router.get(
  "/chapters/:chapterId/worksheets/:worksheetId/attempts/:attemptId/result",
  chapterWorksheetController.getChapterWorksheetResult
);

module.exports = router;

// Add this to your main app.js:
// app.use("/api/books", require("./routes/bookReader"));