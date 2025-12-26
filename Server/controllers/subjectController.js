const db = require("../models/db");

exports.getSubjectsForStudent = async (req, res) => {
  try {
    const studentId = req.studentId;

    const [rows] = await db.query(
      `
      SELECT DISTINCT
        sub.id,
        sub.name
      FROM students s
      JOIN classes c ON s.class_id = c.id
      JOIN subjects sub ON sub.class_id = c.id
      WHERE s.id = ?
      `,
      [studentId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
};
