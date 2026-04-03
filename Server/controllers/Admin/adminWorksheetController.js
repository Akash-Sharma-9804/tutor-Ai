/**
 * adminWorksheetController.js
 * Handles worksheet generation and retrieval for book chapters.
 *
 * Routes:
 *   POST   /admin/books/:bookId/chapters/:chapterId/worksheets        → generateWorksheet
 *   GET    /admin/books/:bookId/chapters/:chapterId/worksheets        → listWorksheets
 *   GET    /admin/books/:bookId/chapters/:chapterId/worksheets/:id    → getWorksheet
 *   DELETE /admin/books/:bookId/chapters/:chapterId/worksheets/:id    → deleteWorksheet
 */

const db = require("../../models/db");
const { generateWorksheet } = require("../../services/worksheetService");

// ── Helper: verify book + chapter exist and belong together ───────────────────
const resolveChapter = async (bookId, chapterId) => {
  const [[chapter]] = await db.query(
    `SELECT bc.*, 
            b.title as book_title,
            b.board, b.class_num,
            s.name as subject_name,
            c.id as school_id,
            cl.id as class_id
     FROM book_chapters bc
     JOIN books b ON b.id = bc.book_id
     LEFT JOIN subjects s ON b.subject_id = s.id
     LEFT JOIN classes cl ON s.class_id = cl.id
     LEFT JOIN schools c ON cl.school_id = c.id
     WHERE bc.id = ? AND bc.book_id = ?`,
    [chapterId, bookId]
  );
  return chapter || null;
};

// ── POST /books/:bookId/chapters/:chapterId/worksheets ────────────────────────
// Triggers Gemini generation and saves result to chapter_worksheets
exports.generateWorksheet = async (req, res) => {
  const { bookId, chapterId } = req.params;
 
  // ── Accept new type_config payload ────────────────────────────────────────
  // type_config: { mcq: {count, marks}, fill_in_blank: {count, marks}, ... }
  // Falls back to legacy question_count if type_config not sent
  const difficulty = req.body.difficulty || "mixed";
  const totalMarksSent = req.body.total_marks || 0;
 
  let typeConfig;
 
  if (req.body.type_config && typeof req.body.type_config === "object") {
    // New UI path — full config
    typeConfig = req.body.type_config;
  } else {
    // Legacy path — distribute evenly across all 4 types
    const questionCount = parseInt(req.body.question_count) || 20;
    const each = Math.floor(questionCount / 4);
    typeConfig = {
      mcq:           { count: each,                             marks: 1 },
      fill_in_blank: { count: each,                             marks: 1 },
      short_answer:  { count: each,                             marks: 3 },
      long_answer:   { count: questionCount - each * 3,         marks: 5 },
    };
  }
 
  // Validate totals
  const totalQuestions = Object.values(typeConfig).reduce((s, v) => s + (v.count || 0), 0);
  if (totalQuestions < 1) {
    return res.status(400).json({ success: false, message: "Enable at least one question type with count > 0." });
  }
  if (totalQuestions > 50) {
    return res.status(400).json({ success: false, message: "Total questions cannot exceed 50." });
  }
 
  try {
    const chapter = await resolveChapter(bookId, chapterId);
    if (!chapter) {
      return res.status(404).json({ success: false, message: "Chapter not found for this book" });
    }
 
    const [[{ count }]] = await db.query(
      "SELECT COUNT(*) as count FROM chapter_worksheets WHERE chapter_id = ?",
      [chapterId]
    );
    const worksheetNo = parseInt(count) + 1;
    const title = `${chapter.chapter_title || `Chapter ${chapter.chapter_no}`} — Worksheet #${worksheetNo}`;
 
    const [insertResult] = await db.query(
      `INSERT INTO chapter_worksheets 
       (chapter_id, book_id, worksheet_no, title, status) 
       VALUES (?, ?, ?, ?, 'generating')`,
      [chapterId, bookId, worksheetNo, title]
    );
    const worksheetId = insertResult.insertId;
 
    const [[ocrRow]] = await db.query(
      "SELECT ocr_json FROM book_chapter_ocr WHERE book_id = ? AND chapter_no = ?",
      [bookId, chapter.chapter_no]
    );
 
    let result;
    try {
      result = await generateWorksheet(
        chapter,
        {
          id: bookId,
          title: chapter.book_title,
          board: chapter.board,
          class_num: chapter.class_num,
          subject_name: chapter.subject_name,
        },
        ocrRow?.ocr_json || null,
        typeConfig,
        difficulty
      );
    } catch (genError) {
      await db.query(
        `UPDATE chapter_worksheets SET status = 'error', error_message = ? WHERE id = ?`,
        [genError.message.slice(0, 499), worksheetId]
      );
      return res.status(500).json({ success: false, message: genError.message, worksheet_id: worksheetId });
    }
 
    // Save with total_marks
    await db.query(
      `UPDATE chapter_worksheets 
       SET status = 'done',
           questions_json = ?,
           total_questions = ?,
           total_marks = ?,
           generated_at = NOW()
       WHERE id = ?`,
      [JSON.stringify(result.questions), result.total, result.totalMarks, worksheetId]
    );
 
    res.status(201).json({
      success: true,
      message: `Worksheet generated: ${result.total} questions · ${result.totalMarks} marks`,
      data: {
        id: worksheetId,
        worksheet_no: worksheetNo,
        title,
        total_questions: result.total,
        total_marks: result.totalMarks,
        source: result.source,
        status: "done",
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[Worksheet] generateWorksheet error:", error);
    res.status(500).json({ success: false, message: "Failed to generate worksheet", error: error.message });
  }
};

// ── GET /books/:bookId/chapters/:chapterId/worksheets ─────────────────────────
// List all worksheets for a chapter
exports.listWorksheets = async (req, res) => {
  const { bookId, chapterId } = req.params;

  try {
    const chapter = await resolveChapter(bookId, chapterId);
    if (!chapter) {
      return res.status(404).json({ success: false, message: "Chapter not found" });
    }

    const [rows] = await db.query(
      `SELECT 
         id, chapter_id, book_id, worksheet_no, title,
         status, total_questions, error_message,
         generated_at, created_at
       FROM chapter_worksheets
       WHERE chapter_id = ? AND book_id = ?
       ORDER BY worksheet_no DESC`,
      [chapterId, bookId]
    );

    res.json({
      success: true,
      chapter: {
        id: chapter.id,
        chapter_no: chapter.chapter_no,
        chapter_title: chapter.chapter_title,
        book_title: chapter.book_title,
        school_id: chapter.school_id,
        class_id: chapter.class_id,
      },
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error("[Worksheet] listWorksheets error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch worksheets" });
  }
};

// ── GET /books/:bookId/chapters/:chapterId/worksheets/:id ─────────────────────
// Get single worksheet with full questions_json
exports.getWorksheet = async (req, res) => {
  const { bookId, chapterId, id } = req.params;

  try {
    const [[row]] = await db.query(
      `SELECT 
         cw.*,
         bc.chapter_no, bc.chapter_title,
         b.title as book_title, b.board, b.class_num,
         s.name as subject_name,
         cl.id as class_id,
         sc.id as school_id, sc.name as school_name
       FROM chapter_worksheets cw
       JOIN book_chapters bc ON bc.id = cw.chapter_id
       JOIN books b ON b.id = cw.book_id
       LEFT JOIN subjects s ON b.subject_id = s.id
       LEFT JOIN classes cl ON s.class_id = cl.id
       LEFT JOIN schools sc ON cl.school_id = sc.id
       WHERE cw.id = ? AND cw.chapter_id = ? AND cw.book_id = ?`,
      [id, chapterId, bookId]
    );

    if (!row) {
      return res.status(404).json({ success: false, message: "Worksheet not found" });
    }

    let questions = [];
    if (row.questions_json) {
      try {
        questions = JSON.parse(row.questions_json);
      } catch {
        questions = [];
      }
    }

    res.json({
      success: true,
      data: {
        id: row.id,
        worksheet_no: row.worksheet_no,
        title: row.title,
        status: row.status,
        total_questions: row.total_questions,
        error_message: row.error_message,
        generated_at: row.generated_at,
        created_at: row.created_at,
        chapter: {
          id: row.chapter_id,
          chapter_no: row.chapter_no,
          chapter_title: row.chapter_title,
        },
        book: {
          id: row.book_id,
          title: row.book_title,
          board: row.board,
          class_num: row.class_num,
          subject_name: row.subject_name,
          school_id: row.school_id,
          school_name: row.school_name,
          class_id: row.class_id,
        },
        questions,
      },
    });
  } catch (error) {
    console.error("[Worksheet] getWorksheet error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch worksheet" });
  }
};

// ── PUT /books/:bookId/chapters/:chapterId/worksheets/:id ─────────────────────
// Update title and/or worksheet_no
exports.updateWorksheet = async (req, res) => {
  const { bookId, chapterId, id } = req.params;
  const { title, worksheet_no } = req.body;

  if (!title && worksheet_no === undefined) {
    return res.status(400).json({ success: false, message: "Provide at least title or worksheet_no to update." });
  }

  try {
    const [[row]] = await db.query(
      "SELECT id FROM chapter_worksheets WHERE id = ? AND chapter_id = ? AND book_id = ?",
      [id, chapterId, bookId]
    );
    if (!row) return res.status(404).json({ success: false, message: "Worksheet not found" });

    const fields = [];
    const values = [];
    if (title !== undefined)        { fields.push("title = ?");        values.push(title.trim()); }
    if (worksheet_no !== undefined) { fields.push("worksheet_no = ?"); values.push(Number(worksheet_no)); }
    values.push(id);

    await db.query(`UPDATE chapter_worksheets SET ${fields.join(", ")} WHERE id = ?`, values);

    res.json({ success: true, message: "Worksheet updated successfully" });
  } catch (error) {
    console.error("[Worksheet] updateWorksheet error:", error);
    res.status(500).json({ success: false, message: "Failed to update worksheet" });
  }
};

// ── DELETE /books/:bookId/chapters/:chapterId/worksheets/:id ──────────────────
exports.deleteWorksheet = async (req, res) => {
  const { bookId, chapterId, id } = req.params;

  try {
    const [[row]] = await db.query(
      "SELECT id FROM chapter_worksheets WHERE id = ? AND chapter_id = ? AND book_id = ?",
      [id, chapterId, bookId]
    );

    if (!row) {
      return res.status(404).json({ success: false, message: "Worksheet not found" });
    }

    await db.query("DELETE FROM chapter_worksheets WHERE id = ?", [id]);

    res.json({ success: true, message: "Worksheet deleted successfully" });
  } catch (error) {
    console.error("[Worksheet] deleteWorksheet error:", error);
    res.status(500).json({ success: false, message: "Failed to delete worksheet" });
  }
};

// ── GET /books/:bookId/worksheets (all worksheets for a book) ─────────────────
// Bonus: list all worksheets across all chapters for a book — useful for overview
exports.listBookWorksheets = async (req, res) => {
  const { bookId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT 
         cw.id, cw.chapter_id, cw.book_id, cw.worksheet_no,
         cw.title, cw.status, cw.total_questions,
         cw.error_message, cw.generated_at, cw.created_at,
         bc.chapter_no, bc.chapter_title,
         sc.id as school_id, sc.name as school_name,
         cl.id as class_id, cl.class_name
       FROM chapter_worksheets cw
       JOIN book_chapters bc ON bc.id = cw.chapter_id
       JOIN books b ON b.id = cw.book_id
       LEFT JOIN subjects s ON b.subject_id = s.id
       LEFT JOIN classes cl ON s.class_id = cl.id
       LEFT JOIN schools sc ON cl.school_id = sc.id
       WHERE cw.book_id = ?
       ORDER BY bc.chapter_no ASC, cw.worksheet_no DESC`,
      [bookId]
    );

    res.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    console.error("[Worksheet] listBookWorksheets error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch worksheets" });
  }
};