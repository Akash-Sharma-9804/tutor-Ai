/**
 * voiceSocket.js — Real-time Voice Interaction via Socket.IO
 *
 * Streaming pipeline:
 *   STT transcript
 *     → classifyQuery (regex, ~0ms)
 *     → generateAnswerStream (Gemini SSE)
 *         ↓ per sentence
 *     → createTTSStream (Deepgram, up to 3 concurrent)
 *         ↓ per MP3 chunk (in order)
 *     → 'voice:answer_chunk' { text, audioBase64, index, isFinal }
 *
 * Client emits:
 *   'voice:join'           { chapterId, visibleText, currentSegment }
 *   'voice:audio_chunk'    { data: <base64 PCM16> }
 *   'voice:update_context' { visibleText, currentSegment }
 *   'voice:end_session'
 *
 * Server emits:
 *   'voice:ready'              { chapterTitle }
 *   'voice:partial_transcript' { text }
 *   'voice:final_transcript'   { text }
 *   'voice:command'            { command }
 *   'voice:processing'
 *   'voice:answer_chunk'       { text, audioBase64, index, isFinal }   ← NEW (streaming)
 *   'voice:answer'             { text, audioBase64, isRepeat, isOffTopic } ← legacy (off-topic / cached)
 *   'voice:error'              { message }
 */

const { createSTTSession } = require('../services/sttService');
const { synthesizeSpeech, createTTSStream } = require('../services/ttsService');
const {
  detectCommand,
  classifyQuery,
  isGarbledSpeech,
  generateAnswerStream,
  reExplainSectionStream,
  summarizeChapterContent,
} = require('../services/aiService');
const db = require('../models/db');
const axios = require('axios');

// ── Response cache ──────────────────────────────────────────────────────────
// Cache stores { text } only; audio is NOT cached (re-synthesized on hit for
// simplicity, but could be extended to cache audio too).
const responseCache = new Map();
const CACHE_MAX = 100;
const addToCache = (key, value) => {
  if (responseCache.size >= CACHE_MAX) responseCache.delete(responseCache.keys().next().value);
  responseCache.set(key, value);
};

// ── Load chapter context ─────────────────────────────────────────────────────
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
    } catch (e) {
      console.warn('[voiceSocket] Could not load chapter content:', e.message);
    }
  }
  console.log('[voiceSocket] Chapter context loaded:', chapter.chapter_title, '| summary:', contentSummary.length, 'chars');
  return { title: chapter.chapter_title, subject: chapter.subject_name, contentSummary };
};

// ── Per-socket voice session ─────────────────────────────────────────────────
const handleVoiceSession = (socket) => {
  let sttSession      = null;
  let chapterId       = null;
  let chapterContext  = null;
  let visibleText     = '';
  let currentSegment  = null;
  let lastProcessedText = '';
  let lastProcessedAt   = 0;
  let lastCommandText   = '';
  let lastCommandAt     = 0;
  let reconnectTimer    = null;

  // Chunk buffering for early-arriving audio
  let pendingChunks = [];
  let sttReady      = false;

  // Track active streaming pipeline so we can abort on new question
  let activeStream = null; // { cancel: () => void }

  const emit = (event, data) => socket.emit(event, data ?? {});

  const flushPendingChunks = () => {
    if (!pendingChunks.length) return;
    console.log(`[voiceSocket] Flushing ${pendingChunks.length} buffered chunks`);
    for (const buf of pendingChunks) sttSession.sendAudio(buf);
    pendingChunks = [];
  };

  // ── Cancel any in-flight streaming pipeline ────────────────────────────────
  const cancelActiveStream = () => {
    if (activeStream) {
      activeStream.cancel();
      activeStream = null;
    }
  };

  // ── Main streaming pipeline ───────────────────────────────────────────────
  /**
   * Runs the AI-stream → TTS-stream pipeline for a single question.
   * Emits 'voice:answer_chunk' for each sentence as audio arrives.
   * Emits the last chunk with isFinal=true so the client knows it's done.
   *
   * @param {string} query        — the user's question
   * @param {string} contextText  — enriched visible text
   */
  const runStreamingPipeline = (query, contextText) => {
    let cancelled   = false;
    let sentenceIdx = 0;
    let sentenceTexts = [];   // accumulate sentence texts in order
    let finalText   = '';
    const cacheKey  = `${chapterId}:${query.toLowerCase().trim()}`;

    // Track how many chunks are still pending so we know when to mark isFinal
    let aiDone      = false;
    let ttsExpected = 0;   // sentences pushed to TTS
    let ttsEmitted  = 0;   // audio chunks emitted

    const checkAndMarkFinal = () => {
      if (aiDone && ttsEmitted === ttsExpected && ttsExpected > 0) {
        emit('voice:answer_done', { text: finalText, totalChunks: ttsExpected });
        addToCache(cacheKey, { text: finalText });
        activeStream = null;
      }
    };

    // TTS stream: receives sentence buffers in order
    const ttsStream = createTTSStream({
      onChunk: (audioBuffer, index) => {
        if (cancelled) return;
        ttsEmitted++;
        const sentText = sentenceTexts[index] || '';
        console.log(`[voiceSocket] Chunk [${index}] ${audioBuffer.length}B (${ttsEmitted}/${ttsExpected})`);
        emit('voice:answer_chunk', {
          text:        sentText,
          audioBase64: audioBuffer.length ? audioBuffer.toString('base64') : null,
          index,
          isFinal:     false,
        });
      },
      onError: (err) => {
        if (!cancelled) {
          console.error('[voiceSocket] TTS stream error:', err.message);
          emit('voice:error', { message: 'Audio synthesis error. Please try again.' });
        }
      },
      onDone: () => {
        // onChunk with isFinal handles completion; this is a safety net
        checkAndMarkFinal();
      },
    });

    // AI stream: feeds sentences to TTS as they arrive
    generateAnswerStream(
      query,
      contextText,
      chapterContext,
      false,
      currentSegment?.explanation || '',
      // onSentence
      (sentence) => {
        if (cancelled) return;
        sentenceTexts.push(sentence);
        finalText += (finalText ? ' ' : '') + sentence;
        ttsExpected++;

        // Emit text immediately (so UI can show it before audio)
        emit('voice:answer_text_chunk', { text: sentence, index: sentenceTexts.length - 1 });

        ttsStream.push(sentence);
      },
      // onDone
      (fullText) => {
        if (cancelled) return;
        finalText = fullText; // ensure consistent
        aiDone = true;
        ttsStream.end();
        checkAndMarkFinal(); // handles edge case of 0 sentences
      },
    ).catch((err) => {
      if (!cancelled) {
        console.error('[voiceSocket] AI stream error:', err.message);
        emit('voice:error', { message: 'Could not generate answer. Please try again.' });
      }
    });

    return {
      cancel: () => {
        cancelled = true;
        console.log('[voiceSocket] Pipeline cancelled for:', JSON.stringify(query.slice(0, 40)));
      },
    };
  };

  // ── Transcript → pipeline ─────────────────────────────────────────────────
  const processTranscript = async (text) => {
    if (!text || text.trim().length < 3) return;

    // Commands always fire instantly, bypass dedup
    const isCmd = !!detectCommand(text);
    if (!isCmd) {
      const normalized = text.trim().toLowerCase().replace(/[.!?,]/g, '');
      const now = Date.now();
      if (normalized === lastProcessedText && (now - lastProcessedAt) < 2500) {
        console.log('[voiceSocket] Dedup skip:', JSON.stringify(text));
        return;
      }
      lastProcessedText = normalized;
      lastProcessedAt   = now;
    }

    // Cancel any previous in-flight answer
    cancelActiveStream();

    // Garbled check: only if not a command
    if (!isCmd && isGarbledSpeech(text)) {
      console.log('[voiceSocket] Garbled speech:', JSON.stringify(text));
      const sorry = "Sorry, I didn't catch that. Could you say it again?";
      emit('voice:stop_narration');
      emit('voice:processing');
      synthesizeSpeech(sorry)
        .then(a => emit('voice:answer', { text: sorry, audioBase64: a.toString('base64'), isGarbled: true }))
        .catch(() => emit('voice:answer', { text: sorry, audioBase64: null, isGarbled: true }));
      return;
    }

    try {
      // 1. Command handling (isCmd already computed above)
      const commandResult = isCmd ? detectCommand(text) : null;
      if (commandResult) {
        // Per-command dedup: same command within 600ms = duplicate fire, skip
        const cmdNow = Date.now();
        if (commandResult.command === lastCommandText && (cmdNow - lastCommandAt) < 600) {
          console.log('[voiceSocket] Command dedup skip:', commandResult.command);
          return;
        }
        lastCommandText = commandResult.command;
        lastCommandAt   = cmdNow;
        emit('voice:command', { command: commandResult.command });

        if (commandResult.command === 'repeat' && visibleText && chapterContext) {
          emit('voice:stop_narration');
          emit('voice:processing');
          let sentIdx = 0;
          let fullText = '';
          let aiDone = false;
          let ttsExpected = 0, ttsEmitted = 0;
          const sentenceTexts = [];

          const ttsStream = createTTSStream({
            onChunk: (buf, idx) => {
              ttsEmitted++;
              emit('voice:answer_chunk', {
                text:        sentenceTexts[idx] || '',
                audioBase64: buf.length ? buf.toString('base64') : null,
                index:       idx,
                isFinal:     false,
                isRepeat:    true,
              });
            },
            onDone: () => {
              emit('voice:answer_done', { text: fullText, totalChunks: ttsExpected, isRepeat: true });
            },
            onError: (err) => emit('voice:error', { message: 'Could not re-explain. ' + err.message }),
          });

          const segEx = currentSegment?.explanation || '';
          reExplainSectionStream(
            segEx || visibleText,
            chapterContext,
            (sentence) => {
              sentenceTexts.push(sentence);
              fullText += (fullText ? ' ' : '') + sentence;
              ttsExpected++;
              emit('voice:answer_text_chunk', { text: sentence, index: sentenceTexts.length - 1, isRepeat: true });
              ttsStream.push(sentence);
            },
            () => { aiDone = true; ttsStream.end(); }
          ).catch(() => emit('voice:error', { message: 'Could not re-explain. Please try again.' }));
        }
        return;
      }

      // 2. Cache hit — stream cached text through TTS
      const cacheKey = `${chapterId}:${text.toLowerCase().trim()}`;
      if (responseCache.has(cacheKey)) {
        const cached = responseCache.get(cacheKey);
        emit('voice:processing');

        // Sentence-split cached text and stream through TTS
        const sentences = cached.text
          .split(/(?<=[.!?])\s+/)
          .map(s => s.trim())
          .filter(s => s.length > 3);

        let ttsEmitted = 0;
        const tts = createTTSStream({
          onChunk: (buf, idx) => {
            ttsEmitted++;
            emit('voice:answer_chunk', {
              text:        sentences[idx] || '',
              audioBase64: buf.length ? buf.toString('base64') : null,
              index:       idx,
              isFinal:     false,
              fromCache:   true,
            });
          },
          onDone: () => {
            emit('voice:answer_done', { text: cached.text, totalChunks: sentences.length, fromCache: true });
          },
          onError: () => emit('voice:error', { message: 'Audio error on cached response.' }),
        });

        for (const s of sentences) {
          emit('voice:answer_text_chunk', { text: s, index: sentences.indexOf(s), fromCache: true });
          tts.push(s);
        }
        tts.end();
        return;
      }

      // 3. Classify query
      const classification = classifyQuery(text);
      if (!classification.isQuestion) {
        emit('voice:done');
        return;
      }

      if (!classification.isRelevant) {
        const msg = 'Please ask questions related to this chapter.';
        emit('voice:processing');
        try {
          const audioBuffer = await synthesizeSpeech(msg);
          emit('voice:answer', { text: msg, audioBase64: audioBuffer.toString('base64'), isOffTopic: true });
        } catch {
          emit('voice:answer', { text: msg, audioBase64: null, isOffTopic: true });
        }
        return;
      }

      // 4. Build context string
      let contextText = visibleText;
      if (currentSegment) {
        const seg = currentSegment;
        const parts = [];
        if (seg.text)        parts.push(seg.text);
        if (seg.explanation) parts.push('Explanation: ' + seg.explanation);
        if (seg.problem)     parts.push('Example: ' + seg.problem);
        if (seg.solution)    parts.push('Solution: ' + seg.solution);
        if (seg.equation)    parts.push('Equation: ' + seg.equation);
        if (seg.speakers && seg.text) parts.push(seg.speakers + ' says: ' + seg.text);
        if (parts.length) contextText = parts.join(' | ');
      }

      emit('voice:stop_narration'); // stop readAloud/autoplay before AI answer
      emit('voice:processing');

      // 5. Launch streaming pipeline
      console.log('[voiceSocket] Starting streaming pipeline for:', JSON.stringify(text.slice(0, 60)));
      activeStream = runStreamingPipeline(classification.cleanedQuery || text, contextText);

    } catch (err) {
      console.error('[voiceSocket] processTranscript error:', err.message);
      emit('voice:error', { message: 'Could not generate answer. Please try again.' });
    }
  };

  // ── voice:join ────────────────────────────────────────────────────────────
  socket.on('voice:join', async ({ chapterId: cId, visibleText: vt, currentSegment: seg } = {}) => {
    clearTimeout(reconnectTimer);
    if (sttSession) {
      console.log('[voiceSocket] Re-join: terminating previous STT session');
      sttSession.terminate();
      sttSession = null;
    }
    cancelActiveStream();

    chapterId      = cId;
    visibleText    = vt || '';
    currentSegment = seg || null;
    sttReady       = false;
    pendingChunks  = [];

    try {
      chapterContext = await loadChapterContext(chapterId);

      sttSession = createSTTSession({
        onTranscript: ({ type, text }) => {
          if (type === 'partial') {
            emit('voice:partial_transcript', { text });
          } else if (type === 'final' && text) {
            emit('voice:final_transcript', { text });
            processTranscript(text);
          }
        },
        onError: (err) => emit('voice:error', { message: err.message }),
        onClose: (code) => {
          sttReady = false;
          console.log('[voiceSocket] STT closed code=' + code + ' socket=' + socket.id);
          if ((code === 1005 || code === 1006) && socket.connected && chapterContext) {
            clearTimeout(reconnectTimer);
            reconnectTimer = setTimeout(async () => {
              // Skip if voice:join already created a fresh session
              if (!socket.connected || (sttSession && sttSession.isConnected)) return;
              console.log('[voiceSocket] STT auto-reconnecting...');
              try {
                if (sttSession) { try { sttSession.terminate(); } catch(_){} sttSession = null; }
                sttSession = createSTTSession({
                  onTranscript: ({ type, text }) => {
                    if (type === 'partial') emit('voice:partial_transcript', { text });
                    else if (type === 'final' && text) { emit('voice:final_transcript', { text }); processTranscript(text); }
                  },
                  onError: (e) => emit('voice:error', { message: e.message }),
                  onClose: (c) => { sttReady = false; },
                });
                await sttSession.connect();
                sttReady = true;
                console.log('[voiceSocket] STT reconnected OK');
              } catch (e) { console.error('[voiceSocket] STT reconnect failed:', e.message); }
            }, 800);
          }
        },
      });

      await sttSession.connect();
      sttReady = true;
      flushPendingChunks();

      emit('voice:ready', { chapterTitle: chapterContext.title });
      console.log(`[voiceSocket] Ready: socket=${socket.id} chapter=${chapterId}`);
    } catch (e) {
      console.error('[voiceSocket] Join error:', e.message);
      emit('voice:error', { message: 'Could not start voice session: ' + e.message });
    }
  });

  // ── voice:audio_chunk ─────────────────────────────────────────────────────
  let chunkCount = 0;
  socket.on('voice:audio_chunk', ({ data } = {}) => {
    if (!data) return;
    const buf = Buffer.from(data, 'base64');

    if (!sttReady || !sttSession?.isConnected) {
      pendingChunks.push(buf);
      if (pendingChunks.length === 1) console.log('[voiceSocket] Buffering audio (STT not ready)...');
      return;
    }

    try {
      sttSession.sendAudio(buf);
      chunkCount++;
      if (chunkCount === 1 || chunkCount % 100 === 0) {
        console.log(`[voiceSocket] Forwarded ${chunkCount} chunks to STT`);
      }
    } catch (e) {
      console.error('[voiceSocket] Audio send error:', e.message);
    }
  });

  socket.on('voice:update_context', ({ visibleText: vt, currentSegment: seg } = {}) => {
    if (vt  !== undefined) visibleText    = vt;
    if (seg !== undefined) currentSegment = seg;
  });

  socket.on('voice:interrupt', () => {
    cancelActiveStream();
    lastProcessedText = '';
    lastProcessedAt   = 0;
    lastCommandText   = '';
    lastCommandAt     = 0;
    emit('voice:interrupted', { reason: 'user-interrupt' });
  });

  socket.on('voice:end_session', () => {
    sttReady = false;
    pendingChunks = [];
    cancelActiveStream();
    if (sttSession) { sttSession.terminate(); sttSession = null; }
  });

  socket.on('disconnect', () => {
    sttReady = false;
    pendingChunks = [];
    cancelActiveStream();
    if (sttSession) sttSession.terminate();
    console.log('[voiceSocket] Disconnected:', socket.id);
  });
};

// ── Register on Socket.IO instance ───────────────────────────────────────────
const registerVoiceSocket = (io) => {
  io.on('connection', (socket) => handleVoiceSession(socket));
  console.log('✅ Voice socket handlers registered');
};

module.exports = { registerVoiceSocket };