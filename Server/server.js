require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const dataRoutes = require("./routes/dataRoutes");
const studentRoutes = require("./routes/studentRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const bookRoutes = require("./routes/bookReader");
const adminAuthRoutes = require("./routes/Admin/adminAuthRoutes");
const adminRoutes = require("./routes/Admin/adminRoutes");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/books", bookRoutes);


// Health check
app.get("/", (req, res) => {
  res.send("AI Tutor Backend is running 🚀");
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
