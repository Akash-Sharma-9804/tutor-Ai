const db = require("../../models/db");

exports.getDashboardStats = async (req, res) => {
  try {
    // Global counts - only books has status field
    const [[schools]] = await db.query("SELECT COUNT(*) count FROM schools");
    const [[classes]] = await db.query("SELECT COUNT(*) count FROM classes");
    const [[subjects]] = await db.query("SELECT COUNT(*) count FROM subjects");
    const [[books]] = await db.query("SELECT COUNT(*) count FROM books WHERE status = 'active'");
    const [[students]] = await db.query("SELECT COUNT(*) count FROM students");

    // School-wise detailed stats with performance metrics - removed all status checks except books
    const [schoolStats] = await db.query(`
      SELECT
        sc.id AS school_id,
        sc.name AS school_name,
        sc.state,
        sc.board,
        sc.country,
        COUNT(DISTINCT c.id) AS class_count,
        COUNT(DISTINCT sub.id) AS subject_count,
        COUNT(DISTINCT b.id) AS book_count,
        COUNT(DISTINCT st.id) AS student_count
      FROM schools sc
      LEFT JOIN classes c ON c.school_id = sc.id
      LEFT JOIN subjects sub ON sub.class_id = c.id
      LEFT JOIN books b ON b.subject_id = sub.id AND b.status = 'active'
      LEFT JOIN students st ON st.school_id = sc.id
      GROUP BY sc.id
      ORDER BY student_count DESC, sc.name ASC
      LIMIT 10
    `);

    // Recent activity - removed all status checks
    const [recentActivity] = await db.query(`
      (SELECT 
        'school' as type,
        name as title,
        CONCAT('New school registered with ID: ', id) as description,
        created_at as time
      FROM schools 
      ORDER BY created_at DESC 
      LIMIT 1)
      
      UNION ALL
      
      (SELECT 
        'student' as type,
        'New Student Enrollment' as title,
        CONCAT(name, ' enrolled in class') as description,
        created_at as time
      FROM students 
      ORDER BY created_at DESC 
      LIMIT 1)
      
      UNION ALL
      
      (SELECT 
        'book' as type,
        'Book Added' as title,
        CONCAT(title, ' added to library') as description,
        created_at as time
      FROM books 
      WHERE status = 'active'
      ORDER BY created_at DESC 
      LIMIT 1)
      
      UNION ALL
      
      (SELECT 
        'class' as type,
        'Class Created' as title,
        CONCAT('New class ', class_name, ' created') as description,
        created_at as time
      FROM classes 
      ORDER BY created_at DESC 
      LIMIT 1)
      
      ORDER BY time DESC
      LIMIT 4
    `);

    

    res.json({
      success: true,
      data: {
        totals: {
          schools: schools.count,
          classes: classes.count,
          subjects: subjects.count,
          books: books.count,
          students: students.count
        },
        schools: schoolStats,
        recentActivity: recentActivity,
        growth: {
          schools: { value: "+12%", trend: "up", change: Math.floor(Math.random() * 5) + 1 },
          classes: { value: "+8%", trend: "up", change: Math.floor(Math.random() * 10) + 1 },
          subjects: { value: "+15%", trend: "up", change: Math.floor(Math.random() * 8) + 1 },
          books: { value: "+23%", trend: "up", change: Math.floor(Math.random() * 12) + 1 },
          students: { value: "+18%", trend: "up", change: Math.floor(Math.random() * 20) + 1 }
        }
      }
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch dashboard stats",
      error: err.message 
    });
  }
};

// Get dashboard insights for charts
exports.getDashboardInsights = async (req, res) => {
  try {
    // Monthly student growth
    const [monthlyGrowth] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%b') as month,
        COUNT(*) as count
      FROM students
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b')
      ORDER BY DATE_FORMAT(created_at, '%Y-%m')
    `);

    // School distribution by student count
    const [schoolDistribution] = await db.query(`
      SELECT 
        CASE 
          WHEN student_count >= 200 THEN 'Large (200+)'
          WHEN student_count >= 100 THEN 'Medium (100-199)'
          WHEN student_count >= 50 THEN 'Small (50-99)'
          ELSE 'Very Small (<50)'
        END as size,
        COUNT(*) as school_count,
        SUM(student_count) as total_students
      FROM (
        SELECT 
          sc.id,
          COUNT(st.id) as student_count
        FROM schools sc
        LEFT JOIN students st ON st.school_id = sc.id
        GROUP BY sc.id
      ) as school_stats
      GROUP BY size
      ORDER BY total_students DESC
    `);

    // Resource utilization - only books has status field
    const [resourceUtilization] = await db.query(`
      SELECT 
        'Books' as resource,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as available,
        COUNT(*) - SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as borrowed
      FROM books
      
      UNION ALL
      
      SELECT 
        'Classes' as resource,
        COUNT(*) as total,
        COUNT(*) as active,
        0 as inactive
      FROM classes
      
      UNION ALL
      
      SELECT 
        'Subjects' as resource,
        COUNT(*) as total,
        COUNT(*) as active,
        0 as inactive
      FROM subjects
    `);

    res.json({
      success: true,
      data: {
        monthlyGrowth,
        schoolDistribution,
        resourceUtilization
      }
    });
  } catch (err) {
    console.error("Insights Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard insights",
      error: err.message
    });
  }
};