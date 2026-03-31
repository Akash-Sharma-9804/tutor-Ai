const db = require("../models/db");
const { evaluateAnswer } = require("../services/geminiEvaluator");

// ✅ TEST DASHBOARD — returns worksheets with attempt history per worksheet
exports.getStudentTests = async (req, res) => {
  try {
    const studentId = req.studentId;

    const [subjects] = await db.query(
      `SELECT subject_id FROM student_subjects WHERE student_id = ?`,
      [studentId]
    );
    if (!subjects.length) return res.json({ success: true, data: [] });

    const subjectIds = subjects.map((s) => s.subject_id);

    const [books] = await db.query(
      `SELECT id, subject_id, title FROM books WHERE subject_id IN (?)`,
      [subjectIds]
    );
    const bookIds = books.map((b) => b.id);
    if (!bookIds.length) return res.json({ success: true, data: [] });

    const [tests] = await db.query(
      `SELECT 
        sw.id,
        sw.book_id,
        sw.title,
        sw.worksheet_no,
        sw.total_questions,
        sw.total_marks,
        sw.difficulty,
        sw.created_at,
        b.title AS book_title,
        COUNT(sta.id)          AS attempt_count,
        MAX(sta.percentage)    AS best_percentage,
        MAX(sta.obtained_marks) AS best_marks
       FROM subject_worksheets sw
       JOIN books b ON b.id = sw.book_id
       LEFT JOIN student_test_attempts sta
         ON sta.worksheet_id = sw.id AND sta.student_id = ?
       WHERE sw.book_id IN (?) AND sw.status = 'done'
       GROUP BY sw.id
       ORDER BY sw.created_at DESC`,
      [studentId, bookIds]
    );

    res.json({ success: true, data: tests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// ✅ OPEN TEST (full worksheet)
exports.getTestById = async (req, res) => {
  try {
    const { id } = req.params;

    const [[row]] = await db.query(
      `SELECT * FROM subject_worksheets WHERE id = ? AND status = 'done'`,
      [id]
    );
    if (!row) return res.status(404).json({ success: false });

    let questions = [];
    if (row.questions_json) {
      try { questions = JSON.parse(row.questions_json); } catch {}
    }

    res.json({ success: true, worksheet: { ...row, questions } });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// ✅ SUBMIT TEST — evaluates + stores attempt
exports.submitTest = async (req, res) => {
  try {
    const studentId = req.studentId;
    const { worksheetId, answers } = req.body;

    const [[worksheet]] = await db.query(
      `SELECT * FROM subject_worksheets WHERE id = ?`,
      [worksheetId]
    );
    if (!worksheet) return res.status(404).json({ success: false });

    const questions = JSON.parse(worksheet.questions_json);
    let obtainedMarks = 0;

    const [attemptRes] = await db.query(
      `INSERT INTO student_test_attempts 
       (student_id, worksheet_id, total_marks, obtained_marks, percentage)
       VALUES (?, ?, ?, 0, 0)`,
      [studentId, worksheetId, worksheet.total_marks]
    );
    const attemptId = attemptRes.insertId;

    for (let q of questions) {
      const studentAns = answers[q.q_no] || "";
      const correctAns = q.correct_answer;
      let marks = 0, isCorrect = false, aiScore = 0, reason = "";

      if (q.type === "mcq" || q.type === "fill_in_blank") {
        isCorrect = studentAns.toString().trim().toLowerCase() === correctAns.toString().trim().toLowerCase();
        marks = isCorrect ? q.marks : 0;
        aiScore = isCorrect ? 1 : 0;
      } else {
        const ai = await evaluateAnswer(q.question, correctAns, studentAns);
        aiScore = ai.score;
        reason = ai.reason;
        marks = Math.round(q.marks * aiScore);
        isCorrect = aiScore > 0.6;
      }

      obtainedMarks += marks;

      await db.query(
        `INSERT INTO student_test_answers
         (attempt_id, question_no, student_answer, correct_answer, ai_score, is_correct, marks_awarded, evaluation_reason)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [attemptId, q.q_no, studentAns, correctAns, aiScore, isCorrect, marks, reason]
      );
    }

    const percentage = (obtainedMarks / worksheet.total_marks) * 100;

    await db.query(
      `UPDATE student_test_attempts SET obtained_marks = ?, percentage = ? WHERE id = ?`,
      [obtainedMarks, percentage, attemptId]
    );

    res.json({
      success: true,
      result: { attemptId, obtainedMarks, totalMarks: worksheet.total_marks, percentage },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// ✅ GET ALL ATTEMPTS — for TestAttemptsList page
// Returns every attempt the student has made, with worksheet + subject info
exports.getAllAttempts = async (req, res) => {
  try {
    const studentId = req.studentId;

    const [attempts] = await db.query(
      `SELECT
        sta.id           AS attempt_id,
        sta.worksheet_id,
        sta.obtained_marks,
        sta.total_marks,
        sta.percentage,
        sta.created_at,
        sw.title         AS worksheet_title,
        sw.total_questions,
        b.title          AS book_title
       FROM student_test_attempts sta
       JOIN subject_worksheets sw ON sw.id = sta.worksheet_id
       JOIN books b ON b.id = sw.book_id
       WHERE sta.student_id = ?
       ORDER BY sta.created_at DESC`,
      [studentId]
    );

    res.json({ success: true, attempts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// ✅ GET SINGLE ATTEMPT DETAIL — for TestResult when opened from history
// Returns marks + per-question breakdown including original question text
exports.getAttemptDetail = async (req, res) => {
  try {
    const studentId = req.studentId;
    const { attemptId } = req.params;

    // Verify ownership
    const [[attempt]] = await db.query(
      `SELECT sta.*, sw.title AS worksheet_title, sw.total_questions, sw.questions_json, b.title AS book_title
       FROM student_test_attempts sta
       JOIN subject_worksheets sw ON sw.id = sta.worksheet_id
       JOIN books b ON b.id = sw.book_id
       WHERE sta.id = ? AND sta.student_id = ?`,
      [attemptId, studentId]
    );

    if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found" });

    // Per-question answers
    const [answerRows] = await db.query(
      `SELECT question_no, student_answer, correct_answer, ai_score, is_correct, marks_awarded, evaluation_reason
       FROM student_test_answers
       WHERE attempt_id = ?
       ORDER BY question_no`,
      [attemptId]
    );

    // Enrich with original question text + options + explanation from questions_json
    let questions = [];
    try { questions = JSON.parse(attempt.questions_json || "[]"); } catch {}

    const qMap = {};
    questions.forEach((q) => { qMap[q.q_no] = q; });

    const enrichedAnswers = answerRows.map((a) => {
      const original = qMap[a.question_no] || {};
      return {
        question_no:      a.question_no,
        student_answer:   a.student_answer,
        correct_answer:   a.correct_answer,
        ai_score:         a.ai_score,
        is_correct:       a.is_correct,
        marks_awarded:    a.marks_awarded,
        marks_total:      original.marks || 1,
        evaluation_reason: a.evaluation_reason,
        question_text:    original.question || "",
        question_type:    original.type || "short_answer",
        options:          original.options || null,
        explanation:      original.explanation || "",
      };
    });

    res.json({
      success: true,
      attempt_id:      attempt.id,
      worksheet_id:    attempt.worksheet_id,
      worksheet_title: attempt.worksheet_title,
      book_title:      attempt.book_title,
      obtained_marks:  attempt.obtained_marks,
      total_marks:     attempt.total_marks,
      percentage:      attempt.percentage,
      created_at:      attempt.created_at,
      answers:         enrichedAnswers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// ✅ GET ATTEMPT HISTORY for a single worksheet
exports.getAttemptHistory = async (req, res) => {
  try {
    const studentId = req.studentId;
    const { id } = req.params;

    const [attempts] = await db.query(
      `SELECT id, obtained_marks, total_marks, percentage, created_at
       FROM student_test_attempts
       WHERE student_id = ? AND worksheet_id = ?
       ORDER BY created_at DESC`,
      [studentId, id]
    );

    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};