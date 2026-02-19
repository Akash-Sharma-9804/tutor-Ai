const express = require("express");
const router = express.Router();
const chatController = require("../controllers/ChatController");
const multer = require("multer");
const path = require("path");

// Configure multer for file upload in chat
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, PDF, and WEBP files are allowed."));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

// Message endpoint with optional file upload
router.post("/message", upload.single("file"), chatController.sendChatMessage);

// Text-to-speech endpoint
router.post("/tts", chatController.textToSpeech);

// Other routes
router.get("/:chat_id", chatController.getChatMessage);
router.get("/history/:student_id", chatController.getChatHistory);

// Conversation routes
router.post("/conversation/new", chatController.createNewConversation);
router.get("/conversations/:student_id", chatController.getConversations);
router.get("/conversation/:conversation_id/messages", chatController.getConversationMessages);
router.get("/stream/:chat_id", chatController.streamChatResponse);

// Conversation management
router.delete("/conversation/:conversation_id", chatController.deleteConversation);
router.put("/conversation/:conversation_id", chatController.renameConversation);

module.exports = router;