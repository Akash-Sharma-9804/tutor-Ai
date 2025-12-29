const db = require("../../models/db");
const { uploadFileToFTP } = require("../../services/uploadToFTP");
const { processBookFromPDF } = require("../../services/bookProcessingService");

// GET books (by subject OR class OR school)
exports.list = async (req, res) => {
  try {
    const { subjectId } = req.query;

    if (!subjectId) {
      return res.status(400).json({ message: "subjectId is required" });
    }

    const [rows] = await db.query(
      `
      SELECT 
        b.id,
        b.title,
        b.author,
        b.pdf_url,
        s.name AS subject,
        c.class_name AS class_name,
        sc.name AS school
      FROM books b
      JOIN subjects s ON b.subject_id = s.id
      JOIN classes c ON s.class_id = c.id
      JOIN schools sc ON c.school_id = sc.id
      WHERE s.id = ?
      ORDER BY b.created_at DESC
      `,
      [subjectId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

// ADD book
exports.create = async (req, res) => {
  try {
    const { subject_id, title, author, pdf_url } = req.body;

    if (!subject_id || !title) {
      return res.status(400).json({ message: "subject_id and title required" });
    }

    await db.query(
      "INSERT INTO books (subject_id, title, author, pdf_url) VALUES (?, ?, ?, ?)",
      [subject_id, title, author || null, pdf_url || null]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add book" });
  }
};

// DELETE book
exports.remove = async (req, res) => {
  try {
    await db.query("DELETE FROM books WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete book" });
  }
};

exports.uploadAndProcess = async (req, res) => {
  try {
    const { subject_id, title, author, school_id, class_id } = req.body;
    console.log("📘 [ADMIN] Upload Request Received:", req.body);

    const file = req.file;
    if (!file) return res.status(400).json({ message: "File required" });

    // Extract metadata (with fallbacks for backward compatibility)
    let { board, class_num, subject_name } = req.body;
    
    // If metadata not provided, try to fetch from database
    if (!board || !class_num || !subject_name) {
      console.log("⚠️ Metadata not provided, fetching from database...");
      
      const [subjectRows] = await db.query(
        `SELECT 
          s.name as subject_name,
          s.subject_name as subject_name_alt,
          c.class_name,
          sc.name as school_name
         FROM subjects s
         JOIN classes c ON s.class_id = c.id
         JOIN schools sc ON c.school_id = sc.id
         WHERE s.id = ?`,
        [subject_id]
      );

      if (subjectRows.length > 0) {
        const meta = subjectRows[0];
        
        // Extract subject name
        subject_name = subject_name || meta.subject_name || meta.subject_name_alt || "Unknown";
        
        // Extract class number from class_name (e.g., "Class 8" -> 8)
        const classMatch = meta.class_name?.match(/\d+/);
        class_num = class_num || (classMatch ? classMatch[0] : class_id);
        
        // Try to detect board from school name
        if (!board) {
          const schoolName = meta.school_name || "";
          if (schoolName.includes("CBSE")) board = "CBSE";
          else if (schoolName.includes("ICSE")) board = "ICSE";
          else if (schoolName.includes("IB")) board = "IB";
          else board = "CBSE"; // Default
        }
        
        console.log("✅ Extracted metadata:", { board, class_num, subject_name });
      } else {
        // Last resort defaults
        board = board || "CBSE";
        class_num = class_num || class_id;
        subject_name = subject_name || "Unknown";
        console.log("⚠️ Using default metadata:", { board, class_num, subject_name });
      }
    }

    // Upload PDF to FTP
    console.log("📤 Uploading PDF to FTP...");
    const ftpRes = await uploadFileToFTP(
      file.buffer, 
      file.originalname, 
      "/books/uploads"
    );
    console.log("✅ PDF uploaded:", ftpRes.url);

    // Save book record to database
    console.log("💾 Saving book record to database...");
    const [insertResult] = await db.query(
      "INSERT INTO books (subject_id, title, author, pdf_url, board, class_num) VALUES (?, ?, ?, ?, ?, ?)",
      [subject_id, title, author || null, ftpRes.url, board, class_num]
    );
    const bookId = insertResult.insertId;
    console.log("✅ Book record saved with ID:", bookId);

    // Prepare book metadata for processing
    const bookMetadata = {
      board: board,
      class: parseInt(class_num),
      subject: subject_name,
      book_id: bookId
    };

    console.log("📋 Processing with metadata:", bookMetadata);

    // Process book: OCR → Structure → Chunk → Embed → Store
    console.log("🚀 Starting book processing pipeline...");
    const processRes = await processBookFromPDF(
      ftpRes.url, 
      bookId, 
      bookMetadata,
      db
    );
    console.log("🎯 Book processed successfully!");

    // Verification
    console.log("\n🔍 Verifying database records...");
    
    const [bookRows] = await db.query(
      "SELECT * FROM books WHERE id = ?", 
      [bookId]
    );
    console.log("📚 Book record:", bookRows.length > 0 ? "✅ Found" : "❌ Missing");

    const [chapterRows] = await db.query(
      "SELECT * FROM book_chapters WHERE book_id = ?",
      [bookId]
    );
    console.log("📖 Chapters saved:", chapterRows.length);

    // Log chapter details
    if (chapterRows.length > 0) {
      console.log("\n📋 Chapter Details:");
      chapterRows.forEach(ch => {
        console.log(`   Ch ${ch.chapter_no}: ${ch.chapter_title}`);
        console.log(`   JSON Path: ${ch.content_json_path}`);
      });
    }

    res.json({
      success: true,
      book_id: bookId,
      pdf_url: ftpRes.url,
      chapters_created: processRes.chapters,
      total_pages: processRes.total_pages,
      metadata: bookMetadata,
      chapters: chapterRows.map(ch => ({
        chapter_no: ch.chapter_no,
        title: ch.chapter_title,
        content_path: ch.content_json_path
      }))
    });

  } catch (err) {
    console.error("❌ Upload or processing failed:", err);
    res.status(500).json({ 
      message: "Upload or processing failed",
      error: err.message 
    });
  }
};