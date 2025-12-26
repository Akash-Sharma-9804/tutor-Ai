const express = require("express");
const router = express.Router();
const adminAuth = require("../../middleware/adminAuth");

const dashboard = require("../../controllers/Admin/adminDashboardController");
const schools = require("../../controllers/Admin/adminSchoolController");
const classes = require("../../controllers/Admin/adminClassController");
const subjects = require("../../controllers/Admin/adminSubjectController");
const books = require("../../controllers/Admin/adminBookController");
const multer = require("multer");
const upload = multer();
router.use(adminAuth);

// Dashboard
router.get("/dashboard", dashboard.getDashboardStats);

// Schools
router.get("/schools", schools.list);
router.post("/schools", schools.create);
router.delete("/schools/:id", schools.remove);

// Classes
router.get("/classes", classes.list);
router.post("/classes", classes.create);

// Subjects
router.get("/subjects", subjects.list);          // ?classId=ID
router.post("/subjects", subjects.create);
router.delete("/subjects/:id", subjects.remove);

// Books
router.get("/books", books.list);          // ?subjectId= ?classId= ?schoolId=
router.post("/books", books.create);
router.delete("/books/:id", books.remove);

 // Books Upload + Processing
router.post("/books/upload", upload.single("file"), books.uploadAndProcess);


module.exports = router;
