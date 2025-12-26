const db = require("../../models/db");

exports.getDashboardStats = async (req, res) => {
  try {
    /* Global counts */
    const [[schools]] = await db.query("SELECT COUNT(*) count FROM schools");
    const [[classes]] = await db.query("SELECT COUNT(*) count FROM classes");
    const [[subjects]] = await db.query("SELECT COUNT(*) count FROM subjects");
    const [[books]] = await db.query("SELECT COUNT(*) count FROM books");
    const [[students]] = await db.query("SELECT COUNT(*) count FROM students");

    /* School-wise detailed stats */
    const [schoolStats] = await db.query(`
      SELECT
        sc.id AS school_id,
        sc.name AS school_name,
        COUNT(DISTINCT c.id) AS class_count,
        COUNT(DISTINCT s.id) AS subject_count,
        COUNT(DISTINCT b.id) AS book_count,
        COUNT(DISTINCT st.id) AS student_count
      FROM schools sc
      LEFT JOIN classes c ON c.school_id = sc.id
      LEFT JOIN subjects s ON s.class_id = c.id
      LEFT JOIN books b ON b.subject_id = s.id
      LEFT JOIN students st ON st.school_id = sc.id
      GROUP BY sc.id
      ORDER BY sc.name
    `);

    res.json({
      totals: {
        schools: schools.count,
        classes: classes.count,
        subjects: subjects.count,
        books: books.count,
        students: students.count
      },
      schools: schoolStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};
