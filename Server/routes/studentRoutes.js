const express = require("express");
const router = express.Router();
const multer = require("multer");
const studentController = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");

// Multer — store file in memory so we can stream to FTP
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WEBP images are allowed"), false);
    }
  },
});

// Get logged-in student profile
router.get("/me", authMiddleware, studentController.getStudentProfile);

// Update student name and phone
router.put("/me", authMiddleware, studentController.updateStudentProfile);

// Upload / replace profile picture
router.post(
  "/me/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  studentController.uploadProfilePicture
);

// Change password
router.put("/me/password", authMiddleware, studentController.changePassword);

module.exports = router;