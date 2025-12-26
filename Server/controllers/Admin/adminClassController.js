const db = require("../../models/db");

exports.list = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM classes");
  res.json(rows);
};

exports.create = async (req, res) => {
  await db.query("INSERT INTO classes (class_name) VALUES (?)", [
    req.body.class_name
  ]);
  res.json({ success: true });
};
