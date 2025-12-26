const db = require("../../models/db");

exports.list = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM schools");
  res.json(rows);
};

exports.create = async (req, res) => {
  await db.query("INSERT INTO schools (name) VALUES (?)", [req.body.name]);
  res.json({ success: true });
};

exports.remove = async (req, res) => {
  await db.query("DELETE FROM schools WHERE id = ?", [req.params.id]);
  res.json({ success: true });
};
