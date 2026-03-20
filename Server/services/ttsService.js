/**
 * ttsService.js — Deepgram TTS, per-sentence streaming
 *
 * KEY CHANGE: onChunk fires the INSTANT a sentence finishes synthesizing —
 * no waiting for earlier sentences. The client receives chunks with an index
 * and handles ordering in its play queue.
 *
 * This means sentence 0 always starts playing as soon as Deepgram finishes it,
 * regardless of sentences 1 and 2 (which run in parallel).
 */

const axios = require('axios');

const DEEPGRAM_TTS_URL = 'https://api.deepgram.com/v1/speak';
const DEEPGRAM_MODEL   = 'aura-2-mars-en';
const MAX_CONCURRENT   = 3;
const TTS_TIMEOUT_MS   = 8000;

// ── Core ─────────────────────────────────────────────────────────────────────
const synthesizeSpeech = async (text, { voice } = {}, retries = 1) => {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) throw new Error('DEEPGRAM_API_KEY not set');
  if (!text?.trim()) throw new Error('Empty text');

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await axios.post(
        DEEPGRAM_TTS_URL,
        { text: text.trim() },
        {
          params:       { model: voice || DEEPGRAM_MODEL },
          headers: {
            Authorization:  `Token ${apiKey}`,
            Accept:         'audio/mpeg',
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
          timeout:      TTS_TIMEOUT_MS,
        }
      );
      return Buffer.from(res.data);
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 300));
    }
  }
};

// ── Streaming TTS ─────────────────────────────────────────────────────────────
/**
 * createTTSStream({ onChunk, onDone, onError, voice })
 *
 * onChunk(audioBuffer, index) — fires immediately when that sentence is ready
 *                               (may be out of order! client reorders by index)
 * onDone()                    — all sentences synthesized
 * onError(err, index)
 */
const createTTSStream = ({ onChunk, onDone, onError, voice } = {}) => {
  let nextIndex = 0;
  let inFlight  = 0;
  let inputDone = false;
  let doneCount = 0;
  const queue   = [];

  const checkDone = () => {
    if (inputDone && doneCount === nextIndex) onDone?.();
  };

  const synthesizeOne = async ({ text, index }) => {
    const t0 = Date.now();
    try {
      console.log(`[TTS] ▶ [${index}] "${text.slice(0, 55)}..."`);
      const buf = await synthesizeSpeech(text, { voice });
      console.log(`[TTS] ✓ [${index}] ${buf.length}B in ${Date.now() - t0}ms`);
      // Fire immediately — don't wait for previous chunks
      onChunk?.(buf, index);
    } catch (err) {
      console.error(`[TTS] ✗ [${index}]`, err.message);
      onError?.(err, index);
      onChunk?.(Buffer.alloc(0), index); // advance client queue
    } finally {
      inFlight--;
      doneCount++;
      drainQueue();
      checkDone();
    }
  };

  const drainQueue = () => {
    while (queue.length && inFlight < MAX_CONCURRENT) {
      inFlight++;
      synthesizeOne(queue.shift());
    }
  };

  return {
    push(text) {
      if (!text?.trim()) return;
      queue.push({ text: text.trim(), index: nextIndex++ });
      drainQueue();
    },
    end() {
      inputDone = true;
      if (inFlight === 0 && queue.length === 0) checkDone();
    },
  };
};

// ── REST helper ───────────────────────────────────────────────────────────────
const streamSpeechToResponse = async (text, res, options = {}) => {
  try {
    const buf = await synthesizeSpeech(text, options);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buf.length);
    res.setHeader('Cache-Control', 'no-cache');
    res.end(buf);
  } catch (err) {
    console.error('[TTS] streamSpeechToResponse:', err.message);
    if (!res.headersSent) res.status(500).json({ error: 'TTS failed' });
  }
};

module.exports = { synthesizeSpeech, createTTSStream, streamSpeechToResponse };