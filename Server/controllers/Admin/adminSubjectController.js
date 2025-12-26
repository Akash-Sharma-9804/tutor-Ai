const db = require("../../models/db");

// GET subjects by class
exports.list = async (req, res) => {
  try {
    const { schoolId, classId } = req.query;

    if (!schoolId || !classId) {
      return res
        .status(400)
        .json({ message: "schoolId and classId are required" });
    }

    const [rows] = await db.query(
      `
      SELECT 
        s.id,
        s.name AS subject_name,
        c.class_name,
        sc.name AS school_name
      FROM subjects s
      JOIN classes c ON s.class_id = c.id
      JOIN schools sc ON c.school_id = sc.id
      WHERE c.id = ? AND sc.id = ?
      ORDER BY s.created_at DESC
      `,
      [classId, schoolId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch subjects" });
  }
};

// ADD subject
exports.create = async (req, res) => {
  try {
    const { class_id, name } = req.body;

    if (!class_id || !name) {
      return res.status(400).json({ message: "class_id and name are required" });
    }

    await db.query(
      "INSERT INTO subjects (class_id, name) VALUES (?, ?)",
      [class_id, name]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create subject" });
  }
};

// DELETE subject
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM subjects WHERE id = ?", [id]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete subject" });
  }
};
