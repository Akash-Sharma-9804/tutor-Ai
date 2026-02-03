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

exports.getSchoolDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Get school basic info
    const [schoolRows] = await db.query(
      "SELECT * FROM schools WHERE id = ?",
      [id]
    );

    if (schoolRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    const school = schoolRows[0];

    // Get all classes for this school
    const [classes] = await db.query(
      `SELECT 
        c.*,
        (SELECT COUNT(*) FROM students WHERE class_id = c.id) as student_count,
        (SELECT COUNT(*) FROM subjects WHERE class_id = c.id) as subject_count
      FROM classes c 
      WHERE c.school_id = ? 
      ORDER BY c.class_name`,
      [id]
    );

    // Get all subjects grouped by class
    const [subjectsByClass] = await db.query(
      `SELECT 
        s.*,
        c.class_name
      FROM subjects s
      JOIN classes c ON s.class_id = c.id
      WHERE c.school_id = ?
      ORDER BY c.class_name, s.name`,
      [id]
    );

    // Get all students for this school
    const [students] = await db.query(
      `SELECT 
        s.id,
        s.name,
        s.email,
        s.phone,
        s.status,
        s.created_at,
        c.class_name,
        s.class_id
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.school_id = ?
      ORDER BY s.name`,
      [id]
    );

    // Calculate statistics
    const totalClasses = classes.length;
    const totalStudents = students.length;
    
    // Count total subjects
    const totalSubjects = subjectsByClass.reduce((acc, subject) => {
      return acc + 1;
    }, 0);

    // Group subjects by class for easier display
    const classWithSubjects = classes.map(cls => {
      const classSubjects = subjectsByClass.filter(sub => sub.class_id === cls.id);
      return {
        ...cls,
        subjects: classSubjects,
        subjects_count: classSubjects.length
      };
    });

    // Count students by class
    const studentsByClass = classes.map(cls => {
      const classStudents = students.filter(student => student.class_id === cls.id);
      return {
        class_id: cls.id,
        class_name: cls.class_name,
        student_count: classStudents.length,
        students: classStudents
      };
    });

    res.json({
      success: true,
      data: {
        school,
        statistics: {
          total_classes: totalClasses,
          total_students: totalStudents,
          total_subjects: totalSubjects,
          average_students_per_class: totalClasses > 0 ? (totalStudents / totalClasses).toFixed(1) : 0
        },
        classes: classWithSubjects,
        students_by_class: studentsByClass,
        all_students: students,
        raw_subjects: subjectsByClass
      }
    });
  } catch (error) {
    console.error("Get school details error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch school details" 
    });
  }
};
