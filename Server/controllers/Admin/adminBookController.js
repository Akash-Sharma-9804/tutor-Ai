const db = require("../../models/db");

// const { uploadFileToFTP } = require("../../services/uploadToFTP");
const { uploadFileToFTP, processBookFromPDF } = require("../../services/bookProcessingService");



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
    const { subject_id, title, author } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "File required" });

    // Upload to FTP
    const ftpRes = await uploadFileToFTP(file.buffer, file.originalname, "/books/uploads");

    // Process text + store embeddings in Qdrant
    const processRes = await processBookFromPDF(ftpRes.url, null);

    res.json({
      success: true,
      file: ftpRes,
      processed: processRes
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload or processing failed" });
  }
};
