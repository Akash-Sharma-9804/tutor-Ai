 

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require('http');
const { initializeWebSocket } = require('./config/websocket_setup');

const authRoutes = require("./routes/authRoutes");
const dataRoutes = require("./routes/dataRoutes");
const studentRoutes = require("./routes/studentRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const bookRoutes = require("./routes/bookReader");
const adminAuthRoutes = require("./routes/Admin/adminAuthRoutes");
const adminRoutes = require("./routes/Admin/adminRoutes");
const scanRoutes = require('./routes/ScanRoutes');
const chatRoutes = require('./routes/ChatRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Middlewares
app.use(cors({
  origin: [
    "https://aitutor.drillingnwk.com",
    "https://tutor.drillingnwk.com",
    "http://localhost:4000",
    "http://localhost:5173"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
app.use(express.json());

// Initialize WebSocket AFTER creating server and BEFORE routes
initializeWebSocket(server, app);

// Routes
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/books", bookRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/chat', chatRoutes);
app.use("/api/school", schoolRoutes);
// Health check
app.get("/", (req, res) => {
  res.send("AI Tutor Backend is running 🚀");
});

// CRITICAL FIX: Use server.listen() NOT app.listen() for WebSocket to work!
// CRITICAL FIX: Use server.listen() NOT app.listen() for WebSocket to work!
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ WebSocket server ready on ws://localhost:${PORT}`);
  console.log(`✅ API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown handlers
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️ ${signal} received, starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(async () => {
    console.log('✅ HTTP server closed');
    
    // Close database pool
    const db = require('./models/db');
    if (db.closePool) {
      await db.closePool();
    }
    
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});