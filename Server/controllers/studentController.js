const db = require("../models/db");

exports.getStudentProfile = async (req, res) => {
  try {
    const studentId = req.studentId; // from JWT middleware

    const [rows] = await db.query(
      `
      SELECT
        s.id AS studentId,
        s.name AS studentName,
        s.email,
        s.age,
        s.gender,
        sch.name AS schoolName,
        c.class_name AS className
      FROM students s
      JOIN schools sch ON s.school_id = sch.id
      JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
      `,
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch student profile" });
  }
};
