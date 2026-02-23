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