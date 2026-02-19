const db = require("../../models/db");

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
exports.listClasses = async (req, res) => {
  try {
    let query = `
      SELECT c.*, s.name as school_name 
      FROM classes c
      LEFT JOIN schools s ON c.school_id = s.id
    `;
    const params = [];

    // Filter by school_id if provided
    if (req.query.school_id) {
      query += ' WHERE c.school_id = ?';
      params.push(req.query.school_id);
    }

    // Add sorting
    query += ' ORDER BY c.created_at DESC';

    const [rows] = await db.query(query, params);
    
    res.status(200).json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single class by ID
// @route   GET /api/classes/:id
// @access  Private
exports.getClassById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, s.name as school_name, s.board, s.country, s.state
       FROM classes c
       LEFT JOIN schools s ON c.school_id = s.id
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private
exports.createClass = async (req, res) => {
  try {
    const { school_id, class_name } = req.body;

    // Validate required fields
    if (!school_id || !class_name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide school_id and class_name'
      });
    }

    // Validate school exists
    const [schoolCheck] = await db.query(
      'SELECT id FROM schools WHERE id = ?',
      [school_id]
    );

    if (schoolCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'School not found'
      });
    }

    // Check if class already exists for this school
    const [existingClass] = await db.query(
      'SELECT id FROM classes WHERE school_id = ? AND class_name = ?',
      [school_id, class_name]
    );

    if (existingClass.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Class already exists for this school'
      });
    }

    // Create class
    const [result] = await db.query(
      'INSERT INTO classes (school_id, class_name) VALUES (?, ?)',
      [school_id, class_name]
    );

    // Get the created class
    const [newClass] = await db.query(
      `SELECT c.*, s.name as school_name 
       FROM classes c
       LEFT JOIN schools s ON c.school_id = s.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass[0]
    });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update a class
// @route   PUT /api/classes/:id
// @access  Private
exports.updateClass = async (req, res) => {
  try {
    const { school_id, class_name } = req.body;
    const classId = req.params.id;

    // Check if class exists
    const [existingClass] = await db.query(
      'SELECT * FROM classes WHERE id = ?',
      [classId]
    );

    if (existingClass.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Prepare update fields
    const updateFields = {};
    const updateValues = [];

    if (school_id !== undefined) {
      // Validate school exists if changing school_id
      const [schoolCheck] = await db.query(
        'SELECT id FROM schools WHERE id = ?',
        [school_id]
      );

      if (schoolCheck.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'School not found'
        });
      }
      updateFields.school_id = school_id;
      updateValues.push(school_id);
    }

    if (class_name !== undefined) {
      // Check for duplicate class name in the same school
      const currentSchoolId = school_id || existingClass[0].school_id;
      const [duplicateCheck] = await db.query(
        'SELECT id FROM classes WHERE school_id = ? AND class_name = ? AND id != ?',
        [currentSchoolId, class_name, classId]
      );

      if (duplicateCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Class name already exists for this school'
        });
      }
      updateFields.class_name = class_name;
      updateValues.push(class_name);
    }

    // If no fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Build update query
    const setClause = Object.keys(updateFields)
      .map(field => `${field} = ?`)
      .join(', ');
    
    updateValues.push(classId);

    await db.query(
      `UPDATE classes SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    // Get updated class
    const [updatedClass] = await db.query(
      `SELECT c.*, s.name as school_name 
       FROM classes c
       LEFT JOIN schools s ON c.school_id = s.id
       WHERE c.id = ?`,
      [classId]
    );

    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data: updatedClass[0]
    });
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Private
exports.deleteClass = async (req, res) => {
  try {
    const classId = req.params.id;

    // Check if class exists
    const [existingClass] = await db.query(
      'SELECT * FROM classes WHERE id = ?',
      [classId]
    );

    if (existingClass.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if class has any students (optional - depends on your business logic)
    const [studentCheck] = await db.query(
      'SELECT id FROM students WHERE class_id = ? LIMIT 1',
      [classId]
    );

    if (studentCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete class with existing students. Please reassign or remove students first.'
      });
    }

    // Delete the class
    await db.query('DELETE FROM classes WHERE id = ?', [classId]);

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get classes by school ID
// @route   GET /api/schools/:schoolId/classes
// @access  Private
exports.getClassesBySchool = async (req, res) => {
  try {
    const schoolId = req.params.schoolId;

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

// @desc    Get class statistics
// @route   GET /api/classes/statistics
// @access  Private
exports.getClassStatistics = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_classes,
        COUNT(DISTINCT school_id) as schools_with_classes,
        (SELECT COUNT(*) FROM classes WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as classes_last_7_days,
        (SELECT COUNT(*) FROM students) as total_students,
        (SELECT COUNT(*) FROM students WHERE class_id IS NOT NULL) as assigned_students
      FROM classes
    `);

    const [topSchools] = await db.query(`
      SELECT s.id, s.name, s.board, s.country, COUNT(c.id) as class_count
      FROM schools s
      LEFT JOIN classes c ON s.id = c.school_id
      GROUP BY s.id, s.name, s.board, s.country
      ORDER BY class_count DESC
      LIMIT 5
    `);

    res.status(200).json({
      success: true,
      data: {
        statistics: stats[0],
        topSchools: topSchools
      }
    });
  } catch (error) {
    console.error('Error fetching class statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};