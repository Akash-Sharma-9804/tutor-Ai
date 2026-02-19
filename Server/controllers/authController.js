const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models/db");

exports.signup = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim();
    const password = req.body.password;
    const schoolName = req.body.schoolName?.trim();
    const className = String(req.body.className).trim();
    const gender = req.body.gender;
    const dob = req.body.dob;
    const phone = req.body.phone;
    const calculateAge = (dob) => {
      const birthDate = new Date(dob);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return age;
    };

    const age = calculateAge(dob);

    // Check if email exists
    const [existing] = await db.query(
      "SELECT id FROM students WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Find or create school
    let [school] = await db.query("SELECT id FROM schools WHERE name = ?", [
      schoolName,
    ]);

    if (school.length === 0) {
      const [result] = await db.query(
        "INSERT INTO schools (name, board, country, state) VALUES (?,?,?,?)",
        [schoolName, board, country, state]
      );
      school = [{ id: result.insertId }];
    }

    const schoolId = school[0].id;

    // Find or create class
    let [cls] = await db.query(
      "SELECT id FROM classes WHERE school_id = ? AND class_name = ?",
      [schoolId, className]
    );

    if (cls.length === 0) {
      const [result] = await db.query(
        "INSERT INTO classes (school_id, class_name) VALUES (?,?)",
        [schoolId, className]
      );
      cls = [{ id: result.insertId }];
    }

    const classId = cls[0].id;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const [studentResult] = await db.query(
      `INSERT INTO students
       (name, email, password, school_id, class_id, age, gender, dob, phone)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [name, email, hashedPassword, schoolId, classId, age, gender, dob, phone]
    );

    const token = jwt.sign(
      { studentId: studentResult.insertId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Signup successful",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    const [rows] = await db.query("SELECT * FROM students WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const student = rows[0];

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ studentId: student.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

exports.logout = async (req, res) => {
  // JWT is stateless — just respond OK
  res.json({ message: "Logged out successfully" });
};
