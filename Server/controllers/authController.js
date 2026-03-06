const bcrypt = require("bcrypt");
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwt = require("jsonwebtoken");
const db = require("../models/db");
const nodemailer = require("nodemailer");

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

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
      return res.status(400).json({ message: "This email is already registered. Please login instead." });
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
       (name, email, password, school_id, class_id, age, gender, dob, phone, auth_provider, password_set, profile_complete)
       VALUES (?,?,?,?,?,?,?,?,?,'local', TRUE, TRUE)`,
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
      return res.status(404).json({ message: "No account found with this email. Please sign up first." });
    }

    const student = rows[0];

    // If account was created via Google, block password login
    if (student.auth_provider === "google" && !student.password_set) {
      return res.status(400).json({ message: "This account uses Google Sign-In. Please login with Google." });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password. Please try again." });
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

exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email } = ticket.getPayload();

    let [rows] = await db.query("SELECT * FROM students WHERE email = ?", [email]);

    let student;
    let isNewUser = false;
    if (rows.length === 0) {
      // Brand new user — create account
      const [result] = await db.query(
        "INSERT INTO students (name, email, password, auth_provider, password_set, school_id, class_id, age, gender, dob, phone) VALUES (?, ?, ?, 'google', FALSE, NULL, NULL, NULL, NULL, NULL, NULL)",
        [name, email, "GOOGLE_AUTH"]
      );
      student = { id: result.insertId, name, email, auth_provider: "google", password_set: false, school_id: null };
      isNewUser = true;
    } else {
      student = rows[0];
      // Email exists but was registered with local password — block Google login
      if (student.auth_provider === "local") {
        return res.status(400).json({
          message: "This email is already registered with a password. Please login with your email and password instead.",
        });
      }
      // Returning Google user — just log them in
    }

    const jwtToken = jwt.sign(
      { studentId: student.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token: jwtToken,
      isNewUser,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        auth_provider: student.auth_provider || "google",
        password_set: student.password_set ?? false,
        profile_complete: !!(student.school_id && student.class_id && student.gender && student.dob),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Google authentication failed" });
  }
};

// ===================== FORGOT PASSWORD =====================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [rows] = await db.query("SELECT * FROM students WHERE email = ?", [email]);
    if (rows.length === 0) {
      // Don't reveal if email exists - security best practice
      return res.json({ message: "If this email exists, an OTP has been sent." });
    }

    const student = rows[0];

    // Block Google-only users from password reset (they have no password)
    if (student.auth_provider === "google" && !student.password_set) {
      return res.status(400).json({
        message: "This account uses Google Sign-In. Please login with Google.",
      });
    }

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.query(
      "UPDATE students SET reset_otp = ?, reset_otp_expires = ? WHERE email = ?",
      [otp, expires, email]
    );

    await transporter.sendMail({
      from: `"AI Tutor" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP - AI Tutor",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #f9fafb; border-radius: 12px;">
          <h2 style="color: #4f46e5; text-align: center;">🔐 Password Reset</h2>
          <p style="color: #374151;">Hello <strong>${student.name}</strong>,</p>
          <p style="color: #374151;">Your OTP to reset your password is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #4f46e5; background: #e0e7ff; padding: 16px 24px; border-radius: 12px;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: "If this email exists, an OTP has been sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM students WHERE email = ? AND reset_otp = ? AND reset_otp_expires > NOW()",
      [email, otp]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified", valid: true });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM students WHERE email = ? AND reset_otp = ? AND reset_otp_expires > NOW()",
      [email, otp]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE students SET password = ?, reset_otp = NULL, reset_otp_expires = NULL, password_set = TRUE WHERE email = ?",
      [hashedPassword, email]
    );

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Password reset failed" });
  }
};

// For Google users to complete their profile (school, class, gender, dob, phone)
exports.completeGoogleProfile = async (req, res) => {
  try {
    const { studentId, schoolName, className, gender, dob, phone } = req.body;

    const calculateAge = (dob) => {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return age;
    };
    const age = calculateAge(dob);

    // Find or create school
    let [school] = await db.query("SELECT id FROM schools WHERE name = ?", [schoolName]);
    if (school.length === 0) {
      return res.status(400).json({ message: "School not found. Please select a valid school." });
    }
    const schoolId = school[0].id;

    // Find class
    let [cls] = await db.query(
      "SELECT id FROM classes WHERE school_id = ? AND class_name = ?",
      [schoolId, className]
    );
    if (cls.length === 0) {
      return res.status(400).json({ message: "Class not found for selected school." });
    }
    const classId = cls[0].id;

    await db.query(
      `UPDATE students SET school_id=?, class_id=?, age=?, gender=?, dob=?, phone=?, profile_complete=TRUE WHERE id=?`,
      [schoolId, classId, age, gender, dob, phone, studentId]
    );

    const [updated] = await db.query("SELECT * FROM students WHERE id = ?", [studentId]);
    const s = updated[0];
    res.json({
      message: "Profile completed successfully",
      student: {
        id: s.id,
        name: s.name,
        email: s.email,
        school_id: s.school_id,
        class_id: s.class_id,
        gender: s.gender,
        dob: s.dob,
        profile_complete: true,
        auth_provider: s.auth_provider,
        password_set: s.password_set,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to complete profile" });
  }
};

// For Google users who want to SET a password for the first time
exports.setPassword = async (req, res) => {
  try {
    const studentId = req.studentId; // from auth middleware
    const { newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE students SET password = ?, password_set = TRUE WHERE id = ?",
      [hashedPassword, studentId]
    );

    res.json({ message: "Password set successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to set password" });
  }
};