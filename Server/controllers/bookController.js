const db = require("../models/db");



exports.getAllBooks = async (req, res) => {
  try {
    const [rows] = await db.query(  
        `select id, title, pdf_url from books`
    );
    res.json(rows);
    } catch (err) {
    res.status(500).json({ message: "Failed to fetch books" });
  } 
};

exports.getBooksBySubject = async (req, res) => {
  try {
    const subjectId = req.params.subjectId;

    const [rows] = await db.query(
      `
      SELECT id, title, pdf_url
      FROM books
      WHERE subject_id = ?
      `,
      [subjectId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch books" });
  }
};
