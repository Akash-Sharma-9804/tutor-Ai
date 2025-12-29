const db = require("../../models/db");

// @desc    Get all subjects with filters
// @route   GET /api/subjects
// @access  Private
exports.listSubjects = async (req, res) => {
  try {
    const { school_id, class_id, search } = req.query;
    let query = `
      SELECT 
        s.*,
        c.class_name,
        sc.name as school_name,
        sc.id as school_id,
        c.id as class_id
      FROM subjects s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN schools sc ON c.school_id = sc.id
      WHERE 1=1
    `;
    const params = [];

    if (school_id) {
      query += ' AND sc.id = ?';
      params.push(school_id);
    }

    if (class_id) {
      query += ' AND c.id = ?';
      params.push(class_id);
    }

    if (search) {
      query += ' AND (s.name LIKE ? OR c.class_name LIKE ? OR sc.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY s.created_at DESC';

    const [rows] = await db.query(query, params);
    
    res.status(200).json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single subject by ID
// @route   GET /api/subjects/:id
// @access  Private
exports.getSubjectById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        s.*,
        c.class_name,
        c.school_id,
        sc.name as school_name,
        sc.board,
        sc.country,
        sc.state
      FROM subjects s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN schools sc ON c.school_id = sc.id
      WHERE s.id = ?
      `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private
exports.createSubject = async (req, res) => {
  try {
    const { class_id, name } = req.body;

    // Validate required fields
    if (!class_id || !name) {
      return res.status(400).json({
        success: false,
        message: 'Class ID and subject name are required'
      });
    }

    // Validate class exists
    const [classCheck] = await db.query(
      'SELECT id, class_name FROM classes WHERE id = ?',
      [class_id]
    );

    if (classCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if subject already exists in this class
    const [existingSubject] = await db.query(
      'SELECT id FROM subjects WHERE class_id = ? AND LOWER(name) = LOWER(?)',
      [class_id, name]
    );

    if (existingSubject.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Subject already exists in this class'
      });
    }

    

    // Create subject
    const [result] = await db.query(
      'INSERT INTO subjects (class_id, name) VALUES (?, ?)',
      [class_id, name]
    );

    // Get the created subject with details
    const [newSubject] = await db.query(
      `
      SELECT 
        s.*,
        c.class_name,
        c.school_id,
        sc.name as school_name
      FROM subjects s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN schools sc ON c.school_id = sc.id
      WHERE s.id = ?
      `,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: newSubject[0]
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private
exports.updateSubject = async (req, res) => {
  try {
    const { name } = req.body;
    const subjectId = req.params.id;

    // Check if subject exists
    const [existingSubject] = await db.query(
      'SELECT * FROM subjects WHERE id = ?',
      [subjectId]
    );

    if (existingSubject.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Prepare update fields
    const updateFields = {};
    const updateValues = [];

    if (name !== undefined) {
      // Check for duplicate subject name in the same class
      const [duplicateCheck] = await db.query(
        'SELECT id FROM subjects WHERE class_id = ? AND LOWER(name) = LOWER(?) AND id != ?',
        [existingSubject[0].class_id, name, subjectId]
      );

      if (duplicateCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Subject name already exists in this class'
        });
      }
      updateFields.name = name;
      updateValues.push(name);
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
    
    updateValues.push(subjectId);

    await db.query(
      `UPDATE subjects SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    // Get updated subject
    const [updatedSubject] = await db.query(
      `
      SELECT 
        s.*,
        c.class_name,
        sc.name as school_name
      FROM subjects s
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN schools sc ON c.school_id = sc.id
      WHERE s.id = ?
      `,
      [subjectId]
    );

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: updatedSubject[0]
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private
exports.deleteSubject = async (req, res) => {
  try {
    const subjectId = req.params.id;

    // Check if subject exists
    const [existingSubject] = await db.query(
      'SELECT * FROM subjects WHERE id = ?',
      [subjectId]
    );

    if (existingSubject.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Delete the subject
    await db.query('DELETE FROM subjects WHERE id = ?', [subjectId]);

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get subject statistics
// @route   GET /api/subjects/statistics
// @access  Private
exports.getSubjectStatistics = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_subjects,
        COUNT(DISTINCT class_id) as classes_with_subjects,
        (SELECT COUNT(*) FROM subjects WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as subjects_last_7_days,
        COUNT(DISTINCT LEFT(LOWER(name), 1)) as starting_letters
      FROM subjects
    `);

    const [popularSubjects] = await db.query(`
      SELECT 
        name,
        COUNT(*) as class_count,
        (SELECT GROUP_CONCAT(DISTINCT c.class_name SEPARATOR ', ') 
         FROM classes c 
         WHERE c.id IN (SELECT class_id FROM subjects WHERE name = s.name)) as classes_list
      FROM subjects s
      GROUP BY name
      ORDER BY class_count DESC
      LIMIT 10
    `);

    res.status(200).json({
      success: true,
      data: {
        statistics: stats[0],
        popularSubjects: popularSubjects
      }
    });
  } catch (error) {
    console.error('Error fetching subject statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};