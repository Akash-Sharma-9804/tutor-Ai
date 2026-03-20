/**
 * voiceController.js — REST endpoints for voice features
 *
 * POST /api/voice/tts        — Convert text to audio (for narration)
 * POST /api/voice/ask        — One-shot voice Q&A (non-WebSocket fallback)
 */

const { synthesizeSpeech, streamSpeechToResponse } = require('../services/ttsService');
const {
  detectCommand,
  classifyQuery,
  generateAnswer,
  reExplainSection,
  summarizeChapterContent,
} = require('../services/aiService');
const db = require('../models/db');
const axios = require('axios');

const loadChapterContext = async (chapterId) => {
  const [rows] = await db.query(
    `SELECT bc.chapter_title, bc.content_json_path, b.board, b.class_num, s.name as subject_name
     FROM book_chapters bc
     JOIN books b ON bc.book_id = b.id
     JOIN subjects s ON b.subject_id = s.id
     WHERE bc.id = ?`,
    [chapterId]
  );
  if (!rows[0]) throw new Error('Chapter not found');
  const chapter = rows[0];
  let contentSummary = '';
  if (chapter.content_json_path) {
    try {
      const res = await axios.get(chapter.content_json_path, { timeout: 8000 });
      contentSummary = summarizeChapterContent(res.data);
    } catch (_) {}
  }
  return { title: chapter.chapter_title, subject: chapter.subject_name, contentSummary };
};

/**
 * POST /api/voice/tts
 * Body: { text, voice? }
 * Streams audio/mpeg back
 */
exports.textToSpeech = async (req, res) => {
  const { text, voice } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  try {
    await streamSpeechToResponse(text, res, { voice });
  } catch (err) {
    console.error('[voiceController] TTS error:', err.message);
    if (!res.headersSent) res.status(500).json({ error: 'TTS failed' });
  }
};

/**
 * POST /api/voice/ask
 * Body: { chapterId, question, visibleText }
 * Returns: { answer, audioBase64 }
 * REST fallback for environments without WebSocket
 */
exports.askQuestion = async (req, res) => {
  const { chapterId, question, visibleText = '' } = req.body;
  if (!chapterId || !question) {
    return res.status(400).json({ error: 'chapterId and question are required' });
  }

  try {
    const chapterContext = await loadChapterContext(chapterId);

    // Check for smart commands
    const commandResult = detectCommand(question);
    if (commandResult?.command === 'repeat') {
      const answer = await reExplainSection(visibleText, chapterContext);
      const audioBuffer = await synthesizeSpeech(answer);
      return res.json({ answer, audioBase64: audioBuffer.toString('base64'), isRepeat: true });
    }

    // Classify
    const classification = await classifyQuery(question, chapterContext.title, visibleText);

    if (!classification.isQuestion || !classification.isRelevant) {
      const msg = classification.isQuestion
        ? 'Please ask questions related to this chapter.'
        : '';
      if (!msg) return res.json({ answer: null });
      const audioBuffer = await synthesizeSpeech(msg);
      return res.json({ answer: msg, audioBase64: audioBuffer.toString('base64'), isOffTopic: true });
    }

    const answer = await generateAnswer(
      classification.cleanedQuery || question,
      visibleText,
      chapterContext
    );
    const audioBuffer = await synthesizeSpeech(answer);
    res.json({ answer, audioBase64: audioBuffer.toString('base64') });
  } catch (err) {
    console.error('[voiceController] askQuestion error:', err.message);
    res.status(500).json({ error: 'Failed to process question' });
  }
};