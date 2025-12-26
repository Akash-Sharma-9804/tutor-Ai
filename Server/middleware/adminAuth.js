const jwt = require("jsonwebtoken");
const db = require("../models/db");

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.adminId) {
      return res.status(401).json({ message: "Invalid admin token" });
    }

    const [rows] = await db.query(
      "SELECT id, role FROM admins WHERE id = ? AND is_active = 1",
      [decoded.adminId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: "Admin not allowed" });
    }

    req.admin = rows[0]; // attach admin to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized admin" });
  }
};

module.exports = adminAuth;
