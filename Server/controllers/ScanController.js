const db = require("../models/db");
const { uploadFileToFTP } = require("../services/uploadToFTP");
const {
  processHomeworkWithRetry,
} = require("../services/ScanProcessingService");

/**
 * Upload and process homework scan
 * POST /api/scans/upload
 */
const uploadScan = async (req, res) => {
  try {
    const { student_id } = req.body;

    // Validation - only need student_id now
    if (!student_id) {
      return res.status(400).json({
        success: false,
        message: "student_id is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const file = req.file;
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    const fileSizeKB = Math.round(file.size / 1024);

    console.log(`📤 Processing scan upload: ${file.originalname}`);

    // Determine actual page count for PDFs (max 15 pages)
    let actualPages = 1;
    if (fileExtension === 'pdf') {
      try {
        const pdfParse = require("pdf-parse").default;
        const pdfData = await pdfParse(file.buffer);
        const totalPagesInPDF = pdfData.numpages;
        actualPages = Math.min(totalPagesInPDF, 15); // Max 15 pages
        
        if (totalPagesInPDF > 15) {
          console.log(`📄 PDF has ${totalPagesInPDF} pages, will process only first 15 pages`);
        } else {
          console.log(`📄 PDF has ${totalPagesInPDF} pages, will process all ${actualPages} pages`);
        }
      } catch (error) {
        console.warn("⚠️ Could not determine PDF page count, defaulting to 1:", error.message);
        actualPages = 1;
      }
    }

    // Get student info including school_id and class_id
    const [studentInfo] = await db.executeQuery(
      "SELECT school_id, class_id FROM students WHERE id = ?",
      [student_id]
    );

    if (!studentInfo || studentInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const { school_id, class_id } = studentInfo[0];

    // Get class number for the AI prompt
    const [classInfo] = await db.executeQuery(
      "SELECT class_name FROM classes WHERE id = ?",
      [class_id]
    );

    if (!classInfo || classInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Extract class number (e.g., "Class 10" -> "10")
    const className = classInfo[0].class_name;
    const classNumber = className.match(/\d+/)?.[0] || "10";

    // Step 1: Upload file to FTP
    console.log("☁️ Uploading to FTP...");
    const ftpResult = await uploadFileToFTP(
      file.buffer,
      file.originalname,
      "/books/scan-uploads"
    );

    if (!ftpResult.success) {
      throw new Error("Failed to upload file to FTP");
    }

    console.log(`✅ File uploaded to FTP: ${ftpResult.url}`);

    // Step 2: Insert into database (status: processing)
    const [insertResult] = await db.executeQuery(
      `INSERT INTO scan_uploads 
       (student_id, school_id, class_id, original_filename, ftp_file_path, 
        file_type, file_size_kb, total_pages, processing_status, ai_model) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'processing', ?)`,
      [
        student_id,
        school_id,
        class_id,
        file.originalname,
        ftpResult.url,
        fileExtension,
        fileSizeKB,
        actualPages,
        process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
      ]
    );

    const scanId = insertResult.insertId;
    console.log(`🆔 Scan record created with ID: ${scanId}`);

    // Step 3: Return immediately and process in background
    console.log("🤖 Starting background AI processing...");

    // Return success response immediately
    res.status(200).json({
      success: true,
      message: "Scan uploaded successfully. Processing in background...",
      data: {
        scan_id: scanId,
        file_url: ftpResult.url,
        status: "processing",
        pages: actualPages,
      },
    });

    // Process in background (don't await)
    processHomeworkWithRetry(
      file.buffer,
      fileExtension,
      classNumber,
      actualPages
    )
      .then(async (aiResult) => {
        // Update database with success
        await db.executeQuery(
          `UPDATE scan_uploads 
           SET ai_response = ?, 
               processing_status = 'completed', 
               processed_at = NOW() 
           WHERE id = ?`,
          [aiResult.response, scanId]
        );

        console.log(`✅ Homework processed successfully for scan ID: ${scanId}`);
      })
      .catch(async (aiError) => {
        console.error("❌ AI processing failed:", aiError.message);

        // Update database with failure
        await db.executeQuery(
          `UPDATE scan_uploads 
           SET processing_status = 'failed', 
               error_message = ?, 
               retry_count = retry_count + 1,
               processed_at = NOW() 
           WHERE id = ?`,
          [aiError.message, scanId]
        );
      });

  } catch (error) {
    console.error("❌ Upload scan error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload scan",
    });
  }
};

/**
 * Get scan history for a student
 * GET /api/scans/history/:student_id
 */
const getScanHistory = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    if (!student_id) {
      return res.status(400).json({
        success: false,
        message: "student_id is required",
      });
    }

    const [scans] = await db.executeQuery(
      `SELECT 
         s.id,
         s.original_filename,
         s.ftp_file_path,
         s.file_type,
         s.file_size_kb,
         s.total_pages,
         s.processing_status,
         s.uploaded_at,
         s.processed_at,
         c.class_name
       FROM scan_uploads s
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE s.student_id = ?
       ORDER BY s.uploaded_at DESC
       LIMIT ? OFFSET ?`,
      [student_id, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const [countResult] = await db.executeQuery(
      "SELECT COUNT(*) as total FROM scan_uploads WHERE student_id = ?",
      [student_id]
    );

    return res.status(200).json({
      success: true,
      data: {
        scans: scans,
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error("❌ Get scan history error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve scan history",
    });
  }
};

/**
 * Get detailed scan information including AI response
 * GET /api/scans/:scan_id
 */
const getScanDetails = async (req, res) => {
  try {
    const { scan_id } = req.params;

    if (!scan_id) {
      return res.status(400).json({
        success: false,
        message: "scan_id is required",
      });
    }

    const [scans] = await db.executeQuery(
      `SELECT 
         s.*,
         c.class_name,
         st.name as student_name,
         st.email as student_email
       FROM scan_uploads s
       LEFT JOIN classes c ON s.class_id = c.id
       LEFT JOIN students st ON s.student_id = st.id
       WHERE s.id = ?`,
      [scan_id]
    );

    if (!scans || scans.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Scan not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: scans[0],
    });
  } catch (error) {
    console.error("❌ Get scan details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve scan details",
    });
  }
};

/**
 * Delete a scan
 * DELETE /api/scans/:scan_id
 */
const deleteScan = async (req, res) => {
  try {
    const { scan_id } = req.params;
    const { student_id } = req.body;

    if (!scan_id || !student_id) {
      return res.status(400).json({
        success: false,
        message: "scan_id and student_id are required",
      });
    }

    // Verify ownership
    const [scan] = await db.executeQuery(
      "SELECT id FROM scan_uploads WHERE id = ? AND student_id = ?",
      [scan_id, student_id]
    );

    if (!scan || scan.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Scan not found or unauthorized",
      });
    }

    // Delete from database
    await db.executeQuery("DELETE FROM scan_uploads WHERE id = ?", [scan_id]);

    return res.status(200).json({
      success: true,
      message: "Scan deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete scan error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete scan",
    });
  }
};

/**
 * Get scan statistics for a student
 * GET /api/scans/stats/:student_id
 */
const getScanStats = async (req, res) => {
  try {
    const { student_id } = req.params;

    if (!student_id) {
      return res.status(400).json({
        success: false,
        message: "student_id is required",
      });
    }

    // Total scans
    const [totalResult] = await db.executeQuery(
      "SELECT COUNT(*) as total FROM scan_uploads WHERE student_id = ?",
      [student_id]
    );

    // This month scans
    const [monthResult] = await db.executeQuery(
      `SELECT COUNT(*) as total FROM scan_uploads 
       WHERE student_id = ? 
       AND MONTH(uploaded_at) = MONTH(CURRENT_DATE()) 
       AND YEAR(uploaded_at) = YEAR(CURRENT_DATE())`,
      [student_id]
    );

    // Success rate
    const [successResult] = await db.executeQuery(
      `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN processing_status = 'completed' THEN 1 ELSE 0 END) as completed
       FROM scan_uploads 
       WHERE student_id = ?`,
      [student_id]
    );

    const total = successResult[0].total || 0;
    const completed = successResult[0].completed || 0;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        total_scans: totalResult[0].total,
        this_month: monthResult[0].total,
        success_rate: successRate,
      },
    });
  } catch (error) {
    console.error("❌ Get scan stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve scan statistics",
    });
  }
};

module.exports = {
  uploadScan,
  getScanHistory,
  getScanDetails,
  deleteScan,
  getScanStats,
};                                                                                                                                   