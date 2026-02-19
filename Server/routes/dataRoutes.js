const express = require("express");
const router = express.Router();
const db = require("../models/db");

// Get all schools
router.get("/schools", async (req, res) => {
  const [rows] = await db.query("SELECT id, name FROM schools");
  res.json(rows);
});

// Get classes by school
router.get("/classes/:schoolId", async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, class_name FROM classes WHERE school_id = ?",
    [req.params.schoolId]
  );
  res.json(rows);
});

// Get subjects by class
router.get("/subjects/:classId", async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, name FROM subjects WHERE class_id = ?",
    [req.params.classId]
  );
  res.json(rows);
});

// Get books by subject
router.get("/books/:subjectId", async (req, res) => {
  const [rows] = await db.query(
    "SELECT title, author, pdf_url FROM books WHERE subject_id = ?",
    [req.params.subjectId]
  );
  res.json(rows);
});

module.exports = router;
