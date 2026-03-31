const db = require("../models/db");
const { evaluateAnswer } = require("../services/geminiEvaluator");

// ✅ SUBMIT CHAPTER WORKSHEET — evaluates answers + stores attempt
// POST /api/books/chapters/:chapterId/worksheets/:worksheetId/submit
exports.submitChapterWorksheet = async (req, res) => {
  try {
    const studentId = req.studentId;
    const { chapterId, worksheetId } = req.params;
    const { answers } = req.body; // { [q_no]: "student answer" }

    // 1. Load the worksheet (must belong to this chapter + be done)
    const [[worksheet]] = await db.query(
      `SELECT * FROM chapter_worksheets
       WHERE id = ? AND chapter_id = ? AND status = 'done'`,
      [worksheetId, chapterId]
    );
    if (!worksheet)
      return res
        .status(404)
        .json({ success: false, message: "Worksheet not found" });

    // 2. Parse questions
    let questions = [];
    try {
      questions = JSON.parse(worksheet.questions_json || "[]");
    } catch {
      /* leave empty */
    }
    if (!questions.length)
      return res
        .status(400)
        .json({ success: false, message: "No questions in worksheet" });

    // 3. Create attempt record in the chapter-specific table
    const [attemptRes] = await db.query(
      `INSERT INTO chapter_worksheet_attempts
         (student_id, worksheet_id, chapter_id, total_marks, obtained_marks, percentage)
       VALUES (?, ?, ?, ?, 0, 0)`,
      [studentId, worksheetId, chapterId, worksheet.total_marks]
    );
    const attemptId = attemptRes.insertId;

    // 4. Grade each question
    let obtainedMarks = 0;

    for (const q of questions) {
      const studentAns = (answers[q.q_no] ?? "").toString().trim();
      const correctAns = (q.correct_answer ?? "").toString().trim();
      let marks = 0,
        isCorrect = false,
        aiScore = 0,
        reason = "";

      if (q.type === "mcq" || q.type === "fill_in_blank") {
        // Exact-match grading
        isCorrect = studentAns.toLowerCase() === correctAns.toLowerCase();
        marks = isCorrect ? q.marks || 1 : 0;
        aiScore = isCorrect ? 1 : 0;
      } else {
        // AI grading for short/long answers
        if (studentAns) {
          const ai = await evaluateAnswer(q.question, correctAns, studentAns);
          aiScore = ai.score;
          reason = ai.reason;
          marks = Math.round((q.marks || 1) * aiScore);
          isCorrect = aiScore > 0.6;
        }
        // unanswered written question → 0 marks, no AI call
      }

      obtainedMarks += marks;

      // ✅ Save to chapter_worksheet_answers (not student_test_answers)
      await db.query(
        `INSERT INTO chapter_worksheet_answers
           (attempt_id, question_no, student_answer, correct_answer,
            ai_score, is_correct, marks_awarded, evaluation_reason)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          attemptId,
          q.q_no,
          studentAns,
          correctAns,
          aiScore,
          isCorrect ? 1 : 0,
          marks,
          reason,
        ]
      );
    }

    // 5. Update attempt with final marks
    const percentage =
      worksheet.total_marks > 0
        ? parseFloat(
            ((obtainedMarks / worksheet.total_marks) * 100).toFixed(2)
          )
        : 0;

    await db.query(
      `UPDATE chapter_worksheet_attempts
       SET obtained_marks = ?, percentage = ?
       WHERE id = ?`,
      [obtainedMarks, percentage, attemptId]
    );

    res.json({
      success: true,
      result: {
        attemptId,
        obtainedMarks,
        totalMarks: worksheet.total_marks,
        percentage,
      },
    });
  } catch (err) {
    console.error("submitChapterWorksheet error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ✅ GET ATTEMPT HISTORY for a chapter worksheet
// GET /api/books/chapters/:chapterId/worksheets/:worksheetId/history
exports.getChapterWorksheetHistory = async (req, res) => {
  try {
    const studentId = req.studentId;
    const { worksheetId } = req.params;

    const [attempts] = await db.query(
      `SELECT id, obtained_marks, total_marks, percentage, created_at
       FROM chapter_worksheet_attempts
       WHERE student_id = ? AND worksheet_id = ?
       ORDER BY created_at DESC`,
      [studentId, worksheetId]
    );

    res.json({ success: true, attempts });
  } catch (err) {
    console.error("getChapterWorksheetHistory error:", err);
    res.status(500).json({ success: false });
  }
};

// ✅ GET SINGLE ATTEMPT DETAIL (questions + answers)
// GET /api/books/chapters/:chapterId/worksheets/:worksheetId/attempts/:attemptId
exports.getChapterWorksheetAttemptDetail = async (req, res) => {
  try {
    const studentId = req.studentId;
    const { attemptId } = req.params;

    // Verify the attempt belongs to this student
    const [[attempt]] = await db.query(
      `SELECT * FROM chapter_worksheet_attempts
       WHERE id = ? AND student_id = ?`,
      [attemptId, studentId]
    );
    if (!attempt)
      return res
        .status(404)
        .json({ success: false, message: "Attempt not found" });

    const [answers] = await db.query(
      `SELECT * FROM chapter_worksheet_answers WHERE attempt_id = ? ORDER BY question_no`,
      [attemptId]
    );

    res.json({ success: true, attempt, answers });
  } catch (err) {
    console.error("getChapterWorksheetAttemptDetail error:", err);
    res.status(500).json({ success: false });
  }
};

exports.getChapterWorksheetResult = async (req, res) => {
  try {
    const studentId = req.studentId;
    const { chapterId, worksheetId, attemptId } = req.params;
 
    // 1. Verify attempt belongs to this student + worksheet
    const [[attempt]] = await db.query(
      `SELECT a.*, cw.title AS worksheet_title, cw.questions_json, cw.total_questions
       FROM chapter_worksheet_attempts a
       JOIN chapter_worksheets cw ON cw.id = a.worksheet_id
       WHERE a.id = ? AND a.student_id = ? AND a.worksheet_id = ? AND a.chapter_id = ?`,
      [attemptId, studentId, worksheetId, chapterId]
    );
 
    if (!attempt)
      return res.status(404).json({ success: false, message: "Result not found" });
 
    // 2. Fetch per-question answers with scores
    const [answers] = await db.query(
      `SELECT question_no, student_answer, correct_answer,
              ai_score, is_correct, marks_awarded, evaluation_reason
       FROM chapter_worksheet_answers
       WHERE attempt_id = ?
       ORDER BY question_no ASC`,
      [attemptId]
    );
 
    // 3. Parse original questions (for question text + type + options + marks)
    let questions = [];
    try {
      questions = JSON.parse(attempt.questions_json || "[]");
    } catch {}
 
    // 4. Merge question meta into each answer row
    const questionMap = {};
    for (const q of questions) questionMap[q.q_no] = q;
 
    const enrichedAnswers = answers.map((a) => {
      const q = questionMap[a.question_no] || {};
      return {
        q_no: a.question_no,
        question: q.question || "",
        type: q.type || "unknown",
        options: q.options || null,
        max_marks: q.marks || 1,
        student_answer: a.student_answer,
        correct_answer: a.correct_answer,
        ai_score: a.ai_score,
        is_correct: !!a.is_correct,
        marks_awarded: a.marks_awarded,
        evaluation_reason: a.evaluation_reason,
      };
    });
 
    // 5. Summary stats
    const correctCount = enrichedAnswers.filter((a) => a.is_correct).length;
    const skippedCount = enrichedAnswers.filter(
      (a) => !a.student_answer || a.student_answer.trim() === ""
    ).length;
    const incorrectCount = enrichedAnswers.length - correctCount - skippedCount;
 
    res.json({
      success: true,
      result: {
        attemptId: attempt.id,
        worksheetTitle: attempt.worksheet_title,
        worksheetId: attempt.worksheet_id,
        chapterId: attempt.chapter_id,
        totalMarks: attempt.total_marks,
        obtainedMarks: attempt.obtained_marks,
        percentage: attempt.percentage,
        submittedAt: attempt.created_at,
        totalQuestions: attempt.total_questions,
        correctCount,
        incorrectCount,
        skippedCount,
        answers: enrichedAnswers,
      },
    });
  } catch (err) {
    console.error("getChapterWorksheetResult error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};