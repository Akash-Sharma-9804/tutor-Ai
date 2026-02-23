

const db = require("../models/db");

 


exports.getSchoolById = async (req, res) => {
  try {
    const schoolId = req.params.id;

    // Validate school exists
    const [schoolCheck] = await db.query(
      'SELECT id, name FROM schools WHERE id = ?',
      [schoolId]
    );

    if (schoolCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    const [classes] = await db.query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM students WHERE class_id = c.id) as student_count
       FROM classes c 
       WHERE c.school_id = ? 
       ORDER BY c.class_name`,
      [schoolId]
    );

    res.status(200).json({
      success: true,
      data: classes,
      school: schoolCheck[0],
      count: classes.length
    });
  } catch (error) {
    console.error('Error fetching classes by school:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};