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

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private
exports.getAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;

    const [[admin]] = await db.query(
      `SELECT id, name, email, role, is_active, created_at
       FROM admins 
       WHERE id = ?`,
      [adminId]
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Remove sensitive data
    const { password, ...adminData } = admin;

    res.status(200).json({
      success: true,
      data: adminData
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin profile",
      error: error.message
    });
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private
exports.updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { name, email } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required"
      });
    }

    // Check if email already exists (excluding current admin)
    const [[existingAdmin]] = await db.query(
      "SELECT id FROM admins WHERE email = ? AND id != ?",
      [email, adminId]
    );

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Email already in use by another admin"
      });
    }

    // Update admin
    const [result] = await db.query(
      `UPDATE admins 
       SET name = ?, email = ? 
       WHERE id = ?`,
      [name, email, adminId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Get updated admin data
    const [[updatedAdmin]] = await db.query(
      `SELECT id, name, email, role, is_active, created_at
       FROM admins 
       WHERE id = ?`,
      [adminId]
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedAdmin
    });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message
    });
  }
};

// @desc    Change admin password
// @route   PUT /api/admin/profile/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required"
      });
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match"
      });
    }

    // Check password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Get current admin with password
    const [[admin]] = await db.query(
      "SELECT password FROM admins WHERE id = ?",
      [adminId]
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.query(
      `UPDATE admins 
       SET password = ? 
       WHERE id = ?`,
      [hashedPassword, adminId]
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message
    });
  }
};

// @desc    Get admin activity logs
// @route   GET /api/admin/profile/activity
// @access  Private
exports.getAdminActivity = async (req, res) => {
  try {
    const adminId = req.admin.id;

    // You can create an admin_activity_logs table if you want to track admin activities
    // For now, we'll return a mock response or you can implement it later
    const activityLogs = [
      {
        id: 1,
        action: "login",
        description: "Logged into admin panel",
        timestamp: new Date().toISOString(),
        ip_address: "192.168.1.1"
      },
      {
        id: 2,
        action: "update_profile",
        description: "Updated profile information",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        ip_address: "192.168.1.1"
      }
    ];

    res.status(200).json({
      success: true,
      data: activityLogs,
      count: activityLogs.length
    });
  } catch (error) {
    console.error("Error fetching admin activity:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity logs",
      error: error.message
    });
  }
};
