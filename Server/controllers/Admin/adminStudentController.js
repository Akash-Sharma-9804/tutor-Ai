const db = require("../../models/db");

// Get all students with stats
exports.getAllUsers = async (req, res) => {
  try {
    // Get students with their schools
    const [students] = await db.query(`
      SELECT 
        s.id,
        s.name,
        s.email,
        s.phone,
        s.status,
        s.created_at,
        sc.name as school_name,
        sc.state as school_location
      FROM students s
      LEFT JOIN schools sc ON s.school_id = sc.id
      ORDER BY s.created_at DESC
    `);

    // Get statistics - students only, no roles
    const [[total]] = await db.query("SELECT COUNT(*) as count FROM students");
    const [[active]] = await db.query("SELECT COUNT(*) as count FROM students WHERE status = 'active'");
    const [[inactive]] = await db.query("SELECT COUNT(*) as count FROM students WHERE status = 'inactive'");

    res.json({
      success: true,
      data: {
        users: students,
        stats: {
          total: total.count,
          active: active.count,
          inactive: inactive.count,
          avgAttendance: 0 // Will calculate below
        }
      }
    });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: err.message
    });
  }
};

// Get single student by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [[student]] = await db.query(`
      SELECT 
        s.*,
        sc.name as school_name,
        sc.state as school_location,
        sc.email as school_email,
        sc.phone as school_phone
      FROM students s
      LEFT JOIN schools sc ON s.school_id = sc.id
      WHERE s.id = ?
    `, [id]);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Get student's class info if exists
    const [classes] = await db.query(`
      SELECT c.id, c.class_name 
      FROM classes c
      WHERE c.school_id = ?
    `, [student.school_id]);

    res.json({
      success: true,
      data: {
        ...student,
        classes
      }
    });
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student",
      error: err.message
    });
  }
};

// Create new student
exports.createUser = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      school_id, 
      password, 
      status = 'active',
      class_id = null,
      parent_name = null,
      parent_phone = null,
      address = null,
      date_of_birth = null
    } = req.body;

    // Check if student already exists
    const [[existingStudent]] = await db.query(
      "SELECT id FROM students WHERE email = ?",
      [email]
    );

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student with this email already exists"
      });
    }

    // Hash password (you should use bcrypt in production)
    const hashedPassword = password; // In production: await bcrypt.hash(password, 10);

    // Insert student
    const [result] = await db.query(
      `INSERT INTO students (
        name, email, phone, school_id, password, status, class_id, parent_name, 
        parent_phone, address, date_of_birth
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, email, phone, school_id, hashedPassword, status, class_id, parent_name,
        parent_phone, address, date_of_birth
      ]
    );

    // Get created student
    const [[newStudent]] = await db.query(
      `SELECT s.*, sc.name as school_name 
       FROM students s 
       LEFT JOIN schools sc ON s.school_id = sc.id 
       WHERE s.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: newStudent
    });
  } catch (err) {
    console.error("Error creating student:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create student",
      error: err.message
    });
  }
};

// Update student
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      email, 
      phone, 
      school_id, 
      status,
      class_id,
      parent_name,
      parent_phone,
      address,
      date_of_birth
    } = req.body;

    // Check if student exists
    const [[existingStudent]] = await db.query(
      "SELECT id FROM students WHERE id = ?",
      [id]
    );

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Check if email is taken by another student
    if (email) {
      const [[emailStudent]] = await db.query(
        "SELECT id FROM students WHERE email = ? AND id != ?",
        [email, id]
      );

      if (emailStudent) {
        return res.status(400).json({
          success: false,
          message: "Email already taken by another student"
        });
      }
    }

    // Build update query dynamically
    const updateFields = [];
    const values = [];

    if (name) {
      updateFields.push("name = ?");
      values.push(name);
    }
    if (email) {
      updateFields.push("email = ?");
      values.push(email);
    }
    if (phone) {
      updateFields.push("phone = ?");
      values.push(phone);
    }
    if (school_id) {
      updateFields.push("school_id = ?");
      values.push(school_id);
    }
    if (status) {
      updateFields.push("status = ?");
      values.push(status);
    }
    
    if (class_id !== undefined) {
      updateFields.push("class_id = ?");
      values.push(class_id);
    }
    if (parent_name !== undefined) {
      updateFields.push("parent_name = ?");
      values.push(parent_name);
    }
    if (parent_phone !== undefined) {
      updateFields.push("parent_phone = ?");
      values.push(parent_phone);
    }
    if (address !== undefined) {
      updateFields.push("address = ?");
      values.push(address);
    }
    if (date_of_birth !== undefined) {
      updateFields.push("date_of_birth = ?");
      values.push(date_of_birth);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    values.push(id);

    await db.query(
      `UPDATE students SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    );

    // Get updated student
    const [[updatedStudent]] = await db.query(
      `SELECT s.*, sc.name as school_name 
       FROM students s 
       LEFT JOIN schools sc ON s.school_id = sc.id 
       WHERE s.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent
    });
  } catch (err) {
    console.error("Error updating student:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update student",
      error: err.message
    });
  }
};

// Update student status
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'inactive', 'pending', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const [result] = await db.query(
      "UPDATE students SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      message: "Student status updated successfully"
    });
  } catch (err) {
    console.error("Error updating student status:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update student status",
      error: err.message
    });
  }
};

// Delete student
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM students WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.json({
      success: true,
      message: "Student deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete student",
      error: err.message
    });
  }
};

// Get students by school
exports.getUsersBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const [students] = await db.query(`
      SELECT 
        s.id,
        s.name,
        s.email,
        s.phone,
        s.status,
        s.created_at
      FROM students s
      WHERE s.school_id = ?
      ORDER BY s.created_at DESC
    `, [schoolId]);

    // Get school info
    const [[school]] = await db.query(
      "SELECT name, location FROM schools WHERE id = ?",
      [schoolId]
    );

    res.json({
      success: true,
      data: {
        school,
        students
      }
    });
  } catch (err) {
    console.error("Error fetching school students:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch school students",
      error: err.message
    });
  }
};

// Search students
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    const [students] = await db.query(`
      SELECT 
        s.id,
        s.name,
        s.email,
        s.phone,
        s.status,
        s.created_at,
        sc.name as school_name
      FROM students s
      LEFT JOIN schools sc ON s.school_id = sc.id
      WHERE s.name LIKE ? 
         OR s.email LIKE ? 
         OR s.phone LIKE ?
         OR sc.name LIKE ?
      ORDER BY s.created_at DESC
    `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]);

    res.json({
      success: true,
      data: students
    });
  } catch (err) {
    console.error("Error searching students:", err);
    res.status(500).json({
      success: false,
      message: "Failed to search students",
      error: err.message
    });
  }
};

// Get student performance stats
exports.getStudentStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Get student basic info
    const [[student]] = await db.query(
      `SELECT s.*, sc.name as school_name 
       FROM students s 
       LEFT JOIN schools sc ON s.school_id = sc.id 
       WHERE s.id = ?`,
      [id]
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Get attendance history (you might need to create an attendance table)
    

    // Get recent activities
    const [recentActivities] = await db.query(`
      SELECT 
        activity_type,
        description,
        created_at
      FROM student_activities 
      WHERE student_id = ? 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [id]);

    res.json({
      success: true,
      data: {
        student,
        recentActivities,
        stats: {
          recentActivitiesCount: recentActivities.length
        }
      }
    });
  } catch (err) {
    console.error("Error fetching student stats:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student statistics",
      error: err.message
    });
  }
};


// Get students by class
exports.getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const [students] = await db.query(`
      SELECT 
        s.id,
        s.name,
        s.email,
        s.phone,
        s.status,
        s.created_at
      FROM students s
      WHERE s.class_id = ?
      ORDER BY s.name
    `, [classId]);

    // Get class info
    const [[classInfo]] = await db.query(
      "SELECT class_name, school_id FROM classes WHERE id = ?",
      [classId]
    );

    res.json({
      success: true,
      data: {
        class: classInfo,
        students
      }
    });
  } catch (err) {
    console.error("Error fetching class students:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch class students",
      error: err.message
    });
  }
};

// @desc    Get detailed student information
// @route   GET /api/students/:id/details
// @access  Private
exports.getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Get student basic info with school and class details
    const [[student]] = await db.query(`
      SELECT 
        s.*,
        sc.id as school_id,
        sc.name as school_name,
        sc.board as school_board,
        sc.country as school_country,
        sc.state as school_state,
        c.id as class_id,
        c.class_name,
        c.school_id as class_school_id
      FROM students s
      LEFT JOIN schools sc ON s.school_id = sc.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
    `, [id]);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    // Get student's subjects from their class
    const [subjects] = await db.query(`
      SELECT 
        sub.id,
        sub.name,
        sub.created_at
      FROM subjects sub
      WHERE sub.class_id = ?
      ORDER BY sub.name
    `, [student.class_id]);

    // Get student's books (if any)
    const [books] = await db.query(`
      SELECT 
        b.id,
        b.title,
        b.author,
        b.board,
        b.subject_id,
        sub.name as subject_name,
        b.created_at
      FROM books b
      LEFT JOIN subjects sub ON b.subject_id = sub.id
      WHERE sub.class_id = ?
      ORDER BY b.created_at DESC
    `, [student.class_id]);

    

    

    

    // Calculate statistics
    const totalSubjects = subjects.length;
    const totalBooks = books.length;
    

    res.json({
      success: true,
      data: {
        student,
        school: {
          id: student.school_id,
          name: student.school_name,
          board: student.school_board,
          country: student.school_country,
          state: student.school_state,
          email: student.school_email,
          phone: student.school_phone
        },
        class: {
          id: student.class_id,
          name: student.class_name
        },
        subjects: {
          list: subjects,
          count: totalSubjects
        },
        books: {
          list: books,
          count: totalBooks
        },
        
        
        
        statistics: {
          days_since_join: Math.floor((new Date() - new Date(student.created_at)) / (1000 * 60 * 60 * 24)),
          age: student.date_of_birth ? calculateAge(student.date_of_birth) : null
        }
      }
    });
  } catch (err) {
    console.error("Error fetching student details:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student details",
      error: err.message
    });
  }
};

// Helper function to calculate age
function calculateAge(dateOfBirth) {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}