const db = require("../../models/db");

/* -------------------- LIST ALL SCHOOLS -------------------- */
exports.listSchools = async (req, res) => {
  try {
    
    
    const [rows] = await db.query(
      "SELECT * FROM schools ORDER BY created_at DESC"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("List schools error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch schools" });
  }
};

/* -------------------- CREATE SCHOOL -------------------- */
exports.createSchool = async (req, res) => {
  try {
    const { name, board, country, state } = req.body;

    if (!name || !board || !country || !state) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    await db.query(
      "INSERT INTO schools (name, board, country, state) VALUES (?, ?, ?, ?)",
      [name, board, country, state]
    );

    res.status(201).json({ success: true, message: "School created successfully" });
  } catch (error) {
    console.error("Create school error:", error);
    res.status(500).json({ success: false, message: "Failed to create school" });
  }
};

/* -------------------- VIEW SINGLE SCHOOL -------------------- */
exports.getSchoolById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM schools WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Get school error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch school" });
  }
};

/* -------------------- UPDATE SCHOOL -------------------- */
exports.updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, board, country, state } = req.body;

    if (!name || !board || !country || !state) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const [result] = await db.query(
      `UPDATE schools 
       SET name = ?, board = ?, country = ?, state = ?
       WHERE id = ?`,
      [name, board, country, state, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    res.json({ success: true, message: "School updated successfully" });
  } catch (error) {
    console.error("Update school error:", error);
    res.status(500).json({ success: false, message: "Failed to update school" });
  }
};

/* -------------------- DELETE SCHOOL -------------------- */
exports.deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM schools WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    res.json({ success: true, message: "School deleted successfully" });
  } catch (error) {
    console.error("Delete school error:", error);
    res.status(500).json({ success: false, message: "Failed to delete school" });
  }
};
