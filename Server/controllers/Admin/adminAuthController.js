const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../models/db");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Admin Login",req.body);
    const [rows] = await db.query(
      "SELECT * FROM admins WHERE email = ? AND is_active = 1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const admin = rows[0];

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { adminId: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Admin login failed" });
  }
};
