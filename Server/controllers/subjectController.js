const db = require("../models/db");

// Get subjects for student:
// - Class 11/12 → only their selected subjects from student_subjects table
// - Other classes → all subjects for their class
exports.getSubjectsForStudent = async (req, res) => {
  try {
    const studentId = req.studentId;

    // Get student's class name
    const [[student]] = await db.query(
      `SELECT c.class_name FROM students s JOIN classes c ON s.class_id = c.id WHERE s.id = ?`,
      [studentId]
    );

    if (!student) return res.status(404).json({ message: "Student not found" });

    const className = student.class_name; // e.g. "11", "12", "Class 11", etc.
    const isUpperSecondary = /^(11|12)(\s*[\(\s]*(Science|Arts|Commerce)[\)]*)?$/i.test(className?.trim());

    let rows;

    if (isUpperSecondary) {
      // Only show subjects the student explicitly selected
      [rows] = await db.query(
        `SELECT s.id, s.name
         FROM subjects s
         JOIN student_subjects ss ON s.id = ss.subject_id
         WHERE ss.student_id = ?
         ORDER BY s.name`,
        [studentId]
      );
    } else {
      // Show all subjects for their class
      [rows] = await db.query(
        `SELECT DISTINCT sub.id, sub.name
         FROM students s
         JOIN classes c ON s.class_id = c.id
         JOIN subjects sub ON sub.class_id = c.id
         WHERE s.id = ?
         ORDER BY sub.name`,
        [studentId]
      );
    }

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
};

// Get all subjects available for a class (used during signup subject selection)
exports.getSubjectsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const [rows] = await db.query(
      `SELECT id, name FROM subjects WHERE class_id = ? ORDER BY name`,
      [classId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch class subjects" });
  }
};

/**
 * GET /api/subjects/subjects-with-progress
 * Returns all subjects for a student WITH real reading progress
 * Single endpoint replacing: /subjects + /books/subject/:id + /books/:id/progress-summary
 */
exports.getSubjectsWithProgress = async (req, res) => {
  try {
    const studentId = req.studentId;

    // Step 1: Get student class
    const [[student]] = await db.query(
      `SELECT c.class_name FROM students s JOIN classes c ON s.class_id = c.id WHERE s.id = ?`,
      [studentId]
    );
    if (!student) return res.status(404).json({ message: "Student not found" });

    const isUpperSecondary = /^(11|12)(\s*[\(\s]*(Science|Arts|Commerce)[\)]*)?$/i.test(student.class_name?.trim());

    // Step 2: Get subjects
    let subjects;
    if (isUpperSecondary) {
      [subjects] = await db.query(
        `SELECT s.id, s.name FROM subjects s
         JOIN student_subjects ss ON s.id = ss.subject_id
         WHERE ss.student_id = ? ORDER BY s.name`,
        [studentId]
      );
    } else {
      [subjects] = await db.query(
        `SELECT DISTINCT sub.id, sub.name FROM students s
         JOIN classes c ON s.class_id = c.id
         JOIN subjects sub ON sub.class_id = c.id
         WHERE s.id = ? ORDER BY sub.name`,
        [studentId]
      );
    }

    if (subjects.length === 0) return res.json([]);

    const subjectIds = subjects.map(s => s.id);
    const subjectPlaceholders = subjectIds.map(() => '?').join(',');

    // Step 3: Get all books for all subjects in ONE query
    const [books] = await db.query(
      `SELECT b.id, b.title, b.subject_id,
              COUNT(DISTINCT bc.id) as chapter_count
       FROM books b
       LEFT JOIN book_chapters bc ON bc.book_id = b.id
       WHERE b.subject_id IN (${subjectPlaceholders})
       GROUP BY b.id`,
      subjectIds
    );

    if (books.length === 0) {
      // No books yet — return subjects with 0 progress
      return res.json(subjects.map(s => ({ ...s, progress: 0, totalSegments: 0, completedSegments: 0 })));
    }

    const bookIds = books.map(b => b.id);
    const bookPlaceholders = bookIds.map(() => '?').join(',');

    // Step 4: Get all chapter segment totals and student progress in TWO queries
    const [chapterTotals] = await db.query(
      `SELECT id as chapter_id, book_id, total_segments
       FROM book_chapters
       WHERE book_id IN (${bookPlaceholders})`,
      bookIds
    );

    const [completedCounts] = await db.query(
      `SELECT chapter_id, COUNT(DISTINCT segment_id) as completed
       FROM reading_progress_segments
       WHERE user_id = ? AND chapter_id IN (${chapterTotals.map(() => '?').join(',')}) AND completed = 1
       GROUP BY chapter_id`,
      [studentId, ...chapterTotals.map(c => c.chapter_id)]
    );

    // Step 5: Build lookup maps
    const bookToSubject = {};
    books.forEach(b => { bookToSubject[b.id] = b.subject_id; });

    const chapterToBook = {};
    chapterTotals.forEach(c => { chapterToBook[c.chapter_id] = c.book_id; });

    const completedMap = {};
    completedCounts.forEach(r => { completedMap[r.chapter_id] = r.completed; });

    // ✅ Calculate progress per book using EXACT same logic as getBookProgressSummary:
    //    - compute percent per chapter: Math.min(100, round(done / total * 100))
    //    - skip chapters with total_segments === 0
    //    - overallPercent = average of chapter percents (only chapters with content)
    const bookProgressMap = {};

    books.forEach(book => {
      const bookChapters = chapterTotals.filter(c => c.book_id === book.id);

      const chaptersWithProgress = bookChapters.map(ch => {
        const total = ch.total_segments || 0;
        const doneRaw = completedMap[ch.chapter_id] || 0;
        const done = Math.min(doneRaw, total);
        const percent = total > 0
          ? Math.min(100, Math.round((done / total) * 100))
          : 0;
        return { total, percent };
      });

      // Only average chapters that actually have segments (mirrors progress-summary filter)
      const chaptersWithContent = chaptersWithProgress.filter(c => c.total > 0);
      const overallPercent = chaptersWithContent.length > 0
        ? Math.min(100, Math.round(
            chaptersWithContent.reduce((sum, c) => sum + c.percent, 0) /
            chaptersWithContent.length
          ))
        : 0;

      bookProgressMap[book.id] = overallPercent;
    });

    // Step 6: Aggregate subject progress — average overallPercent across all books in subject
    const subjectProgressPercent = {};

    subjectIds.forEach(id => {
      const subjectBooks = books.filter(b => b.subject_id === id);

      if (subjectBooks.length === 0) {
        subjectProgressPercent[id] = 0;
        return;
      }

      const total = subjectBooks.reduce((sum, b) => sum + (bookProgressMap[b.id] || 0), 0);
      subjectProgressPercent[id] = Math.round(total / subjectBooks.length);
    });

    // ✅ Count worksheets per subject
const [worksheetCounts] = await db.query(
  `SELECT b.subject_id, COUNT(w.id) as total
   FROM books b
   JOIN book_chapters bc ON bc.book_id = b.id
   JOIN chapter_worksheets w ON w.chapter_id = bc.id
   WHERE b.subject_id IN (${subjectPlaceholders})
   GROUP BY b.subject_id`,
  subjectIds
);

// ✅ Count chapters per subject
const chapterCountBySubject = {};

chapterTotals.forEach(ch => {
  const subjectId = bookToSubject[ch.book_id];
  if (!subjectId) return;

  chapterCountBySubject[subjectId] =
    (chapterCountBySubject[subjectId] || 0) + 1;
});

const worksheetCountBySubject = {};
worksheetCounts.forEach(w => {
  worksheetCountBySubject[w.subject_id] = w.total;
});

    // Step 7: Build final response
    const result = subjects.map(s => {
  const percent = subjectProgressPercent[s.id] || 0;

  return {
    id: s.id,
    name: s.name,

    // ✅ correct progress (like progress-summary)
    progress: percent,

    // ✅ optional: keep these as 0 or remove if not needed
    totalSegments: 0,
    completedSegments: 0,

    totalChapters: chapterCountBySubject[s.id] || 0,
    totalWorksheets: worksheetCountBySubject[s.id] || 0,
  };
});

    res.json(result);
  } catch (err) {
    console.error("Failed to fetch subjects with progress:", err);
    res.status(500).json({ message: "Failed to fetch subjects with progress" });
  }
};

/**
 * GET /api/subjects/dashboard-stats
 * Returns real stats: study hours, streak, lessons completed, avg progress
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const studentId = req.studentId;

    // Total time spent reading (in seconds)
    const [[timeRow]] = await db.query(
      `SELECT COALESCE(SUM(time_spent_seconds), 0) as total_seconds
       FROM reading_progress_segments
       WHERE user_id = ?`,
      [studentId]
    );

    // Total completed segments (lessons)
    const [[totalLessonsRow]] = await db.query(
      `SELECT COUNT(*) as total FROM reading_progress_segments
       WHERE user_id = ? AND completed = 1`,
      [studentId]
    );

    // Completed segments THIS week
    const [[weekLessonsRow]] = await db.query(
      `SELECT COUNT(*) as total FROM reading_progress_segments
       WHERE user_id = ? AND completed = 1
       AND last_read_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [studentId]
    );

    // Completed segments TODAY
    const [[todayLessonsRow]] = await db.query(
      `SELECT COUNT(*) as total FROM reading_progress_segments
       WHERE user_id = ? AND completed = 1
       AND DATE(last_read_at) = CURDATE()`,
      [studentId]
    );

    // Time spent TODAY (seconds)
    const [[todayTimeRow]] = await db.query(
      `SELECT COALESCE(SUM(time_spent_seconds), 0) as seconds
       FROM reading_progress_segments
       WHERE user_id = ? AND DATE(last_read_at) = CURDATE()`,
      [studentId]
    );

    // Time spent THIS WEEK (seconds)
    const [[weekTimeRow]] = await db.query(
      `SELECT COALESCE(SUM(time_spent_seconds), 0) as seconds
       FROM reading_progress_segments
       WHERE user_id = ? AND last_read_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [studentId]
    );

    // Calculate streak — count consecutive days with activity going back from today
    const [activityDays] = await db.query(
      `SELECT DISTINCT DATE(last_read_at) as activity_date
       FROM reading_progress_segments
       WHERE user_id = ? AND completed = 1
       ORDER BY activity_date DESC`,
      [studentId]
    );

    let streak = 0;
    if (activityDays.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < activityDays.length; i++) {
        const actDate = new Date(activityDays[i].activity_date);
        actDate.setHours(0, 0, 0, 0);
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        if (actDate.getTime() === expectedDate.getTime()) {
          streak++;
        } else {
          break;
        }
      }
    }

    // Last 7 days activity for streak bar (true/false per day)
    const [last7] = await db.query(
      `SELECT DISTINCT DATE(last_read_at) as activity_date
       FROM reading_progress_segments
       WHERE user_id = ? AND completed = 1
       AND last_read_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [studentId]
    );
    const activeDatesSet = new Set(last7.map(r => new Date(r.activity_date).toDateString()));
    const weekDays = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      weekDays.push({
        label: d.toLocaleDateString('en', { weekday: 'short' }),
        active: activeDatesSet.has(d.toDateString()),
      });
    }

    const totalSeconds = timeRow.total_seconds;
    const todaySeconds = todayTimeRow.seconds;
    const weekSeconds = weekTimeRow.seconds;

    res.json({
      studyHours: {
        total: Math.round((totalSeconds / 3600) * 10) / 10,        // e.g. 4.2
        today: Math.round((todaySeconds / 3600) * 10) / 10,
        thisWeek: Math.round((weekSeconds / 3600) * 10) / 10,
      },
      lessons: {
        total: totalLessonsRow.total,
        thisWeek: weekLessonsRow.total,
        today: todayLessonsRow.total,
      },
      streak: {
        current: streak,
        weekDays,                                                    // [{label, active}]
      },
    });
  } catch (err) {
    console.error("Failed to fetch dashboard stats:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

/**
 * GET /api/subjects/worksheet-progress
 * Returns subject_worksheet_progress rows for the logged-in student
 */
exports.getSubjectWorksheetProgress = async (req, res) => {
  try {
    const studentId = req.studentId;
    const [rows] = await db.query(
      `SELECT subject_id, total_marks, obtained_marks, percentage,
              worksheets_attempted, worksheets_total, updated_at
       FROM subject_worksheet_progress
       WHERE student_id = ?`,
      [studentId]
    );
    // Return as a map { subjectId: { percentage, ... } } for easy frontend lookup
    const map = {};
    rows.forEach(r => { map[r.subject_id] = r; });
    res.json(map);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch worksheet progress" });
  }
};

// Save student's selected subjects (called after signup for class 11/12)
exports.saveStudentSubjects = async (req, res) => {
  try {
    const studentId = req.studentId;
    const { subjectIds } = req.body;

    if (!Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({ message: "No subjects provided" });
    }

    // Clear existing selections first
    await db.query(`DELETE FROM student_subjects WHERE student_id = ?`, [studentId]);

    // Insert new selections
    const values = subjectIds.map((sid) => [studentId, sid]);
    await db.query(`INSERT INTO student_subjects (student_id, subject_id) VALUES ?`, [values]);

    res.json({ message: "Subjects saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save subjects" });
  }
};