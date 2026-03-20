/**
 * voiceRoutes.js — REST routes for voice features
 * Mount as: app.use('/api/voice', require('./routes/voiceRoutes'));
 */

const express = require('express');
const router = express.Router();
const voiceController = require('../controllers/voiceController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// TTS: text → audio stream
router.post('/tts', voiceController.textToSpeech);

// One-shot Q&A (REST fallback)
router.post('/ask', voiceController.askQuestion);

module.exports = router;