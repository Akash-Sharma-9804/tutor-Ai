const bcrypt = require("bcrypt");
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwt = require("jsonwebtoken");
const db = require("../models/db");
const nodemailer = require("nodemailer");

// Email transporter — custom SMTP (email.quantumedu.in)
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,       // email.quantumedu.in
  port: parseInt(process.env.MAILTRAP_PORT) || 587,
  secure: false,                          // false for port 587 (STARTTLS)
  auth: {
    user: process.env.MAIL_USER,          // support@officemom.me
    pass: process.env.MAIL_PASS,          // Quantumhash@2026
  },
  tls: {
    rejectUnauthorized: false,            // allow self-signed certs if any
  },
});

// Verify transporter on startup (optional — remove in production if noisy)
transporter.verify((err) => {
  if (err) console.error("❌ Mail transporter error:", err.message);
  else     console.log("✅ Mail transporter ready via", process.env.MAILTRAP_HOST);
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
      from: `"QuantumEdu" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your password reset code — QuantumEdu",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Reset Password — QuantumEdu</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">

  <!--[preheader]-->
  <span style="display:none;max-height:0;overflow:hidden;">
    Your QuantumEdu reset code: ${otp} — valid for 10 minutes.
  </span>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:48px 16px;">
    <tr><td align="center">

      <!-- Card wrapper -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
        style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;
               box-shadow:0 4px 32px rgba(0,0,0,0.08);">

        <!-- ── Accent top bar -->
        <tr>
          <td style="height:3px;background:linear-gradient(90deg,#2563eb 0%,#6d28d9 100%);font-size:0;">&nbsp;</td>
        </tr>

        <!-- ── Header -->
        <tr>
          <td style="padding:36px 44px 28px;border-bottom:1px solid #f3f4f6;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <!-- Logo mark -->
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:36px;height:36px;background:#2563eb;border-radius:9px;
                                 text-align:center;vertical-align:middle;">
                        <span style="font-size:20px;line-height:36px;display:block;">🧠</span>
                      </td>
                      <td style="padding-left:10px;font-size:17px;font-weight:700;
                                 color:#0f172a;letter-spacing:-0.3px;vertical-align:middle;">
                        QuantumEdu
                      </td>
                    </tr>
                  </table>
                </td>
                <td align="right" style="font-size:11px;color:#94a3b8;vertical-align:middle;">
                  Password Reset
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── Body -->
        <tr>
          <td style="padding:36px 44px;">

            <!-- Greeting -->
            <p style="margin:0 0 6px;font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">
              Hi ${student.name},
            </p>
            <p style="margin:0 0 32px;font-size:14px;color:#64748b;line-height:1.7;">
              We received a request to reset your password. Use the code below — 
              it's valid for <span style="color:#0f172a;font-weight:600;">10 minutes</span> only.
            </p>

            <!-- ── OTP block (single selectable text) -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
              style="margin-bottom:32px;">
              <tr>
                <td align="center"
                  style="background:#f8faff;border:1.5px solid #dbeafe;
                         border-radius:14px;padding:32px 24px;">

                  <p style="margin:0 0 12px;font-size:11px;font-weight:600;
                             color:#94a3b8;letter-spacing:0.12em;text-transform:uppercase;">
                    One-Time Password
                  </p>

                  <!-- THE OTP — single <td>, fully copyable -->
                  <p style="margin:0 0 16px;font-family:'Courier New',Courier,monospace;
                             font-size:40px;font-weight:800;letter-spacing:10px;
                             color:#1d4ed8;user-select:all;-webkit-user-select:all;">
                    ${otp}
                  </p>

                  <!-- Expiry pill -->
                  <span style="display:inline-block;background:#fef9ee;border:1px solid #fde68a;
                               border-radius:100px;padding:5px 14px;
                               font-size:12px;font-weight:600;color:#92400e;">
                    ⏱ Expires in 10 minutes
                  </span>

                </td>
              </tr>
            </table>

            <!-- Steps -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
              style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:28px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 14px;font-size:11px;font-weight:700;color:#94a3b8;
                             letter-spacing:0.1em;text-transform:uppercase;">
                    Next steps
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                    ${[
                      ["1", "#2563eb", "Go back to the QuantumEdu reset page"],
                      ["2", "#4f46e5", "Enter the 6-digit code above"],
                      ["3", "#7c3aed", "Create your new password"],
                    ].map(([n, c, t]) => `
                    <tr>
                      <td valign="middle" style="width:26px;padding-bottom:10px;">
                        <span style="display:inline-block;width:22px;height:22px;background:${c};
                                     border-radius:50%;text-align:center;line-height:22px;
                                     font-size:11px;font-weight:700;color:#fff;">
                          ${n}
                        </span>
                      </td>
                      <td style="padding-left:10px;padding-bottom:10px;
                                 font-size:13px;color:#475569;line-height:1.5;">
                        ${t}
                      </td>
                    </tr>`).join("")}
                  </table>
                </td>
              </tr>
            </table>

            <!-- Warning -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#fffbeb;border-left:3px solid #f59e0b;
                           border-radius:0 8px 8px 0;padding:14px 18px;">
                  <p style="margin:0;font-size:13px;color:#78350f;line-height:1.65;">
                    <strong>Never share this code.</strong> QuantumEdu will never ask for your OTP.
                    If you didn't request this, your account is safe — you can ignore this email.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- ── Footer -->
        <tr>
          <td style="padding:22px 44px 28px;border-top:1px solid #f3f4f6;text-align:center;">
            <p style="margin:0 0 10px;font-size:12px;color:#94a3b8;line-height:1.65;">
              Need help?&nbsp;
              <a href="mailto:${process.env.MAIL_USER}"
                 style="color:#2563eb;text-decoration:none;font-weight:500;">
                ${process.env.MAIL_USER}
              </a>
            </p>
            <p style="margin:0;font-size:11px;color:#cbd5e1;line-height:1.7;">
              © ${new Date().getFullYear()} QuantumEdu &nbsp;·&nbsp; AI Learning for Class 1–12<br/>
              This is an automated email — do not reply.
            </p>
          </td>
        </tr>

        <!-- ── Accent bottom bar -->
        <tr>
          <td style="height:3px;background:linear-gradient(90deg,#2563eb 0%,#6d28d9 100%);font-size:0;">&nbsp;</td>
        </tr>

      </table>
      <!-- /Card -->

    </td></tr>
  </table>

</body>
</html>`,
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