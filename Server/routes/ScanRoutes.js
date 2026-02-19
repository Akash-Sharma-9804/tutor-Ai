const express = require("express");
const router = express.Router();
const scanController = require("../controllers/ScanController");
const multer = require("multer");
const path = require("path");

// Configure multer for file upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPG, PNG, PDF, and WEBP files are allowed."
      )
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

/**
 * @route   POST /api/scans/upload
 * @desc    Upload a homework/document scan for AI processing
 * @access  Private (requires authentication)
 * @body    { student_id, school_id, class_id } + multipart file
 */
router.post(
  "/upload",
  upload.single("file"), // 'file' is the field name in the form
  scanController.uploadScan
);

/**
 * @route   GET /api/scans/history/:student_id
 * @desc    Get scan upload history for a student
 * @access  Private
 * @query   limit (default: 20), offset (default: 0)
 */
router.get("/history/:student_id", scanController.getScanHistory);

/**
 * @route   GET /api/scans/:scan_id
 * @desc    Get detailed information about a specific scan including AI response
 * @access  Private
 */
router.get("/:scan_id", scanController.getScanDetails);

/**
 * @route   DELETE /api/scans/:scan_id
 * @desc    Delete a scan record
 * @access  Private
 * @body    { student_id } - for authorization
 */
router.delete("/:scan_id", scanController.deleteScan);

/**
 * @route   GET /api/scans/stats/:student_id
 * @desc    Get scan statistics for a student (total, this month, success rate)
 * @access  Private
 */
router.get("/stats/:student_id", scanController.getScanStats);

module.exports = router;