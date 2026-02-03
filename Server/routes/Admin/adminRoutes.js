const express = require("express");
const router = express.Router();
const adminAuth = require("../../middleware/adminAuth");

const dashboardController = require("../../controllers/Admin/adminDashboardController");
const schoolController = require("../../controllers/Admin/adminSchoolController");
const classController = require("../../controllers/Admin/adminClassController");
const subjectController = require("../../controllers/Admin/adminSubjectController");
const bookController = require("../../controllers/Admin/adminBookController");
const userController = require("../../controllers/Admin/adminStudentController");
const profileController = require("../../controllers/Admin/adminAuthController");
const multer = require("multer");
const upload = multer();
router.use(adminAuth);

// Admin Profile Routes (Add these)
router.get("/profile", profileController.getAdminProfile);
router.put("/profile", profileController.updateAdminProfile);
router.put("/profile/password", profileController.changePassword);
router.get("/profile/activity", profileController.getAdminActivity);

// Dashboard
router.get("/dashboard", dashboardController.getDashboardStats);
router.get("/dashboard/insights", dashboardController.getDashboardInsights);

// Schools
router.get("/schools", schoolController.listSchools);
router.post("/schools", schoolController.createSchool);
router.get("/schools/:id", schoolController.getSchoolById);
router.put("/schools/:id", schoolController.updateSchool);
router.delete("/schools/:id", schoolController.deleteSchool);
router.get("/schools/:id/details", schoolController.getSchoolDetails);

// Classes
router.get("/classes", classController.listClasses);
router.get("/classes/statistics", classController.getClassStatistics);
router.get("/classes/:id", classController.getClassById);
router.post("/classes", classController.createClass);
router.put("/classes/:id", classController.updateClass);
router.delete("/classes/:id", classController.deleteClass);
router.get(
  "/classes/schools/:schoolId/classes",
  classController.getClassesBySchool
);

// Subjects
router.get("/subjects", subjectController.listSubjects);
router.get("/subjects/statistics", subjectController.getSubjectStatistics);
router.get("/subjects/:id", subjectController.getSubjectById);
router.post("/subjects", subjectController.createSubject);
router.put("/subjects/:id", subjectController.updateSubject);
router.delete("/subjects/:id", subjectController.deleteSubject);

// Books
router.get("/books", bookController.listBooks);
router.get("/books/statistics", bookController.getBookStatistics);
router.get("/books/:id", bookController.getBookById);
router.get("/books/:id/chapters", bookController.getBookChapters);
router.post("/books", bookController.createBook);
router.post(
  "/books/upload",
  upload.array("chapter_files", 20),
  bookController.uploadAndProcess
);

// Chapter creation endpoint
router.post("/chapters/create", bookController.createChapter);
router.put("/books/:id", bookController.updateBook);
router.delete("/books/:id", bookController.deleteBook);
router.delete("/books/:id/force", bookController.forceDeleteBook);

// Students
router.get("/students", userController.getAllUsers);
router.get("/students/search", userController.searchUsers);
router.get("/students/school/:schoolId", userController.getUsersBySchool);
router.get("/students/:id", userController.getUserById);
router.post("/students", userController.createUser);
router.put("/students/:id", userController.updateUser);
router.put("/students/:id/status", userController.updateUserStatus);
router.delete("/students/:id", userController.deleteUser);
router.get("/students/:id/details", userController.getStudentDetails);

module.exports = router;
