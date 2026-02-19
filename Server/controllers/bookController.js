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
    const { subjectId } = req.params;
     
    const [books] = await db.query(
      `SELECT 
        b.id,
        b.title,
        b.author,
        b.pdf_url,
        b.board,
        b.class_num,
        s.name as subject_name,
        COUNT(DISTINCT bc.id) as chapter_count
      FROM books b
      JOIN subjects s ON b.subject_id = s.id
      LEFT JOIN book_chapters bc ON b.id = bc.book_id
      WHERE b.subject_id = ?
      GROUP BY b.id
      ORDER BY b.created_at DESC`,
      [subjectId]
    );

    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};
