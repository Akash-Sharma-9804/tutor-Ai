/**
 * adminSubjectWorksheetController.js
 * Generates and manages subject-level worksheets (cross-chapter, max 30 questions, ~100 marks).
 *
 * DB table: subject_worksheets
 *   id, book_id, title, worksheet_no, status, questions_json,
 *   total_questions, total_marks, source_chapters, difficulty,
 *   error_message, generated_at, created_at
 *
 * Routes (register in adminRoutes.js):
 *   POST   /admin/books/:bookId/subject-worksheets          → generateSubjectWorksheet
 *   GET    /admin/books/:bookId/subject-worksheets          → listSubjectWorksheets
 *   GET    /admin/books/:bookId/subject-worksheets/:id      → getSubjectWorksheet
 *   DELETE /admin/books/:bookId/subject-worksheets/:id      → deleteSubjectWorksheet
 */

const db = require("../../models/db");
const { generateSubjectWorksheet } = require("../../services/subjectWorksheetService");

// ── Helper: resolve book with full context ────────────────────────────────────
const resolveBook = async (bookId) => {
  const [[book]] = await db.query(
    `SELECT b.*,
            s.name  AS subject_name,
            cl.id   AS class_id,
            sc.id   AS school_id, sc.name AS school_name
     FROM books b
     LEFT JOIN subjects s  ON b.subject_id = s.id
     LEFT JOIN classes  cl ON s.class_id   = cl.id
     LEFT JOIN schools  sc ON cl.school_id = sc.id
     WHERE b.id = ?`,
    [bookId]
  );
  return book || null;
};

// ── POST /books/:bookId/subject-worksheets ────────────────────────────────────
exports.generateSubjectWorksheet = async (req, res) => {
  const { bookId } = req.params;

  const difficulty   = req.body.difficulty || "mixed";
  const chapterIds   = Array.isArray(req.body.chapter_ids) && req.body.chapter_ids.length > 0
    ? req.body.chapter_ids.map(Number)
    : null; // null = all chapters

  let typeConfig;
  if (req.body.type_config && typeof req.body.type_config === "object") {
    typeConfig = req.body.type_config;
  } else {
    // Sensible default for a 100-mark paper (30 questions)
    typeConfig = {
      mcq:           { count: 10, marks: 1  },
      fill_in_blank: { count: 5,  marks: 2  },
      short_answer:  { count: 10, marks: 4  },
      long_answer:   { count: 5,  marks: 8  },
    };
  }

  // Validate
  const totalQuestions = Object.values(typeConfig).reduce((s, v) => s + (v.count || 0), 0);
  if (totalQuestions < 1) {
    return res.status(400).json({ success: false, message: "Enable at least one question type with count > 0." });
  }
  if (totalQuestions > 30) {
    return res.status(400).json({ success: false, message: "Subject worksheets are capped at 30 questions." });
  }

  try {
    const book = await resolveBook(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    // Fetch chapters (filtered or all)
    let chaptersQuery = `
      SELECT bc.*, b.title AS book_title, b.board, b.class_num,
             s.name AS subject_name
      FROM book_chapters bc
      JOIN books b ON b.id = bc.book_id
      LEFT JOIN subjects s ON b.subject_id = s.id
      WHERE bc.book_id = ?`;
    const queryParams = [bookId];

    if (chapterIds) {
      chaptersQuery += ` AND bc.id IN (${chapterIds.map(() => "?").join(",")})`;
      queryParams.push(...chapterIds);
    }
    chaptersQuery += " ORDER BY bc.chapter_no ASC";

    const [chapters] = await db.query(chaptersQuery, queryParams);
    if (!chapters.length) {
      return res.status(404).json({ success: false, message: "No chapters found for this book / selection." });
    }

    // Fetch existing chapter worksheets (for richer context)
    const [existingWorksheets] = await db.query(
      `SELECT cw.chapter_id, cw.questions_json, cw.total_questions
       FROM chapter_worksheets cw
       WHERE cw.book_id = ? AND cw.status = 'done'
       ${chapterIds ? `AND cw.chapter_id IN (${chapterIds.map(() => "?").join(",")})` : ""}
       ORDER BY cw.chapter_id, cw.worksheet_no ASC`,
      chapterIds ? [bookId, ...chapterIds] : [bookId]
    );

    // Worksheet numbering
    const [[{ count }]] = await db.query(
      "SELECT COUNT(*) AS count FROM subject_worksheets WHERE book_id = ?",
      [bookId]
    );
    const worksheetNo = parseInt(count) + 1;
    const chapLabel   = chapterIds
      ? `Ch. ${chapters.map(c => c.chapter_no).join(", ")}`
      : "All Chapters";
    const title = `${book.title} — Subject Worksheet #${worksheetNo} (${chapLabel})`;

    // Insert placeholder
    const [insertResult] = await db.query(
      `INSERT INTO subject_worksheets
         (book_id, worksheet_no, title, status, source_chapters, difficulty)
       VALUES (?, ?, ?, 'generating', ?, ?)`,
      [bookId, worksheetNo, title, JSON.stringify(chapterIds || "all"), difficulty]
    );
    const worksheetId = insertResult.insertId;

    // Fetch OCR rows for each chapter
    const [ocrRows] = await db.query(
      `SELECT chapter_no, ocr_json FROM book_chapter_ocr WHERE book_id = ?`,
      [bookId]
    );
    const ocrMap = Object.fromEntries(ocrRows.map(r => [r.chapter_no, r.ocr_json]));

    let result;
    try {
      result = await generateSubjectWorksheet(
        book,
        chapters,
        existingWorksheets,
        ocrMap,
        typeConfig,
        difficulty
      );
    } catch (genError) {
      await db.query(
        `UPDATE subject_worksheets SET status = 'error', error_message = ? WHERE id = ?`,
        [genError.message.slice(0, 499), worksheetId]
      );
      return res.status(500).json({ success: false, message: genError.message, worksheet_id: worksheetId });
    }

    await db.query(
      `UPDATE subject_worksheets
       SET status          = 'done',
           questions_json  = ?,
           total_questions = ?,
           total_marks     = ?,
           generated_at    = NOW()
       WHERE id = ?`,
      [JSON.stringify(result.questions), result.total, result.totalMarks, worksheetId]
    );

    res.status(201).json({
      success: true,
      message: `Subject worksheet generated: ${result.total} questions · ${result.totalMarks} marks`,
      data: {
        id:              worksheetId,
        worksheet_no:    worksheetNo,
        title,
        total_questions: result.total,
        total_marks:     result.totalMarks,
        source:          result.source,
        chapters_used:   result.chaptersUsed,
        status:          "done",
        generated_at:    new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[SubjectWorksheet] generateSubjectWorksheet error:", error);
    res.status(500).json({ success: false, message: "Failed to generate subject worksheet", error: error.message });
  }
};

// ── GET /books/:bookId/subject-worksheets ─────────────────────────────────────
exports.listSubjectWorksheets = async (req, res) => {
  const { bookId } = req.params;
  try {
    const book = await resolveBook(bookId);
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });

    const [rows] = await db.query(
      `SELECT id, book_id, worksheet_no, title, status,
              total_questions, total_marks, source_chapters,
              difficulty, error_message, generated_at, created_at
       FROM subject_worksheets
       WHERE book_id = ?
       ORDER BY worksheet_no DESC`,
      [bookId]
    );

    res.json({
      success: true,
      book: {
        id:           book.id,
        title:        book.title,
        board:        book.board,
        class_num:    book.class_num,
        subject_name: book.subject_name,
        school_id:    book.school_id,
        class_id:     book.class_id,
      },
      data:  rows,
      count: rows.length,
    });
  } catch (error) {
    console.error("[SubjectWorksheet] listSubjectWorksheets error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch subject worksheets" });
  }
};

// ── GET /books/:bookId/subject-worksheets/:id ─────────────────────────────────
exports.getSubjectWorksheet = async (req, res) => {
  const { bookId, id } = req.params;
  try {
    const [[row]] = await db.query(
      `SELECT sw.*,
              b.title AS book_title, b.board, b.class_num,
              s.name  AS subject_name,
              cl.id   AS class_id,
              sc.id   AS school_id, sc.name AS school_name
       FROM subject_worksheets sw
       JOIN books b     ON b.id        = sw.book_id
       LEFT JOIN subjects s  ON b.subject_id = s.id
       LEFT JOIN classes  cl ON s.class_id   = cl.id
       LEFT JOIN schools  sc ON cl.school_id = sc.id
       WHERE sw.id = ? AND sw.book_id = ?`,
      [id, bookId]
    );

    if (!row) return res.status(404).json({ success: false, message: "Subject worksheet not found" });

    let questions = [];
    if (row.questions_json) {
      try { questions = JSON.parse(row.questions_json); } catch { questions = []; }
    }

    res.json({
      success: true,
      data: {
        id:              row.id,
        worksheet_no:    row.worksheet_no,
        title:           row.title,
        status:          row.status,
        total_questions: row.total_questions,
        total_marks:     row.total_marks,
        source_chapters: (() => { try { return JSON.parse(row.source_chapters); } catch { return row.source_chapters; } })(),
        difficulty:      row.difficulty,
        error_message:   row.error_message,
        generated_at:    row.generated_at,
        created_at:      row.created_at,
        book: {
          id:           row.book_id,
          title:        row.book_title,
          board:        row.board,
          class_num:    row.class_num,
          subject_name: row.subject_name,
          school_id:    row.school_id,
          school_name:  row.school_name,
          class_id:     row.class_id,
        },
        questions,
      },
    });
  } catch (error) {
    console.error("[SubjectWorksheet] getSubjectWorksheet error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch subject worksheet" });
  }
};

// ── DELETE /books/:bookId/subject-worksheets/:id ──────────────────────────────
exports.deleteSubjectWorksheet = async (req, res) => {
  const { bookId, id } = req.params;
  try {
    const [[row]] = await db.query(
      "SELECT id FROM subject_worksheets WHERE id = ? AND book_id = ?",
      [id, bookId]
    );
    if (!row) return res.status(404).json({ success: false, message: "Subject worksheet not found" });

    await db.query("DELETE FROM subject_worksheets WHERE id = ?", [id]);
    res.json({ success: true, message: "Subject worksheet deleted successfully" });
  } catch (error) {
    console.error("[SubjectWorksheet] deleteSubjectWorksheet error:", error);
    res.status(500).json({ success: false, message: "Failed to delete subject worksheet" });
  }
};