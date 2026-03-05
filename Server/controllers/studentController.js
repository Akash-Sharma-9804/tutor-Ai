const db = require("../models/db");
const { uploadFileToFTP } = require("../services/uploadToFTP");
const bcrypt = require("bcryptjs");

exports.getStudentProfile = async (req, res) => {
  try {
    const studentId = req.studentId; // from JWT middleware

    const [rows] = await db.query(
  `
  SELECT
    s.id AS studentId,
    s.name AS studentName,
    s.email,
    s.phone,
    s.age,
    s.dob,
    s.gender,
    s.bio,
    s.profile_picture,
    s.created_at,
    sch.name AS schoolName,
    c.class_name AS className,
    s.class_id AS classId
  FROM students s
  JOIN schools sch ON s.school_id = sch.id
  JOIN classes c ON s.class_id = c.id
  WHERE s.id = ?
  `,
  [studentId]
);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch student profile" });
  }
};

// Update student name and phone
exports.updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.studentId;
    const { name, phone, bio } = req.body;

    if (!name && !phone && bio === undefined) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const fields = [];
    const values = [];

    if (name) {
      fields.push("name = ?");
      values.push(name.trim());
    }
    if (phone) {
      fields.push("phone = ?");
      values.push(phone.trim());
    }
    if (bio !== undefined) {
      fields.push("bio = ?");
      values.push(bio.trim());
    }

    values.push(studentId);

    await db.query(
      `UPDATE students SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// Upload profile picture to FTP under /profile-pictures/{studentId}/
exports.uploadProfilePicture = async (req, res) => {
  try {
    const studentId = req.studentId;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const ext = req.file.originalname.split(".").pop().toLowerCase();
    const allowedExts = ["jpg", "jpeg", "png", "webp"];
    if (!allowedExts.includes(ext)) {
      return res.status(400).json({ message: "Only JPG, PNG, WEBP images are allowed" });
    }

    const remoteDir = `/Ai-tutor-Student-profile-pictures/${studentId}`;
    const fileName = `profile.${ext}`; // always overwrite same file per student

    const result = await uploadFileToFTP(
      req.file.buffer,
      fileName,
      remoteDir
    );

    // Save the URL in DB
    await db.query(
      `UPDATE students SET profile_picture = ? WHERE id = ?`,
      [result.url, studentId]
    );

    res.json({
      message: "Profile picture uploaded successfully",
      url: result.url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload profile picture" });
  }
};

// Change student password
exports.changePassword = async (req, res) => {
  try {
    const studentId = req.studentId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    // Fetch current hashed password
    const [rows] = await db.query(
      `SELECT password FROM students WHERE id = ?`,
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query(`UPDATE students SET password = ? WHERE id = ?`, [hashed, studentId]);

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to change password" });
  }
};