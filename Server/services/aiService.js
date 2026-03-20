/**
 * aiService.js — Context-aware AI for voice Q&A
 * Uses Gemini streaming to:
 *  1. Detect if a transcript is a question
 *  2. Check if it's relevant to the chapter
 *  3. Stream a short, voice-friendly answer based ONLY on chapter context
 *     Emits sentence chunks as they arrive so TTS can start immediately.
 */

const axios = require('axios');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_URL      = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_STREAM_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:streamGenerateContent`;

// Smart command patterns — detected before hitting Gemini
const REPEAT_COMMANDS = [
  /\brepeat\b/i,
  /\bsay again\b/i,
  /\bdidn.t understand\b/i,
  /\bdon.t understand\b/i,
  /\bexplain again\b/i,
  /\bwhat does (this|that) mean\b/i,
  /\bcould you repeat\b/i,
  /\bsay that again\b/i,
  /\bone more time\b/i,
  /\bplease repeat\b/i,
];

const NAVIGATION_COMMANDS = {
  next:        /\b(next|continue|go on|move on|forward|next segment|next slide)\b/i,
  prev:        /\b(back|previous|go back|repeat section|prev|last one)\b/i,
  pause:       /\b(pause|stop reading|wait|hold on)\b/i,
  stop:        /\b(stop|stop playing|stop it|stop now|be quiet|quiet)\b/i,
  resume:      /\b(resume|start reading|read aloud)\b/i,
  'auto-play': /\b(auto ?play(ing)?|auto-play|play automatically|keep playing|play all|play on|start auto|turn on auto|enable auto|auto mode|automatic(ally)?)\b/i,
};

// ── Sentence splitter ────────────────────────────────────────────────────────
// Splits accumulated text into complete sentences vs. a trailing fragment.
const splitSentences = (text) => {
  // Matches sentence-ending punctuation followed by space or end-of-string
  const sentenceEnd = /[.!?]+(?:\s+|$)/g;
  const sentences = [];
  let lastIndex = 0;
  let match;

  while ((match = sentenceEnd.exec(text)) !== null) {
    sentences.push(text.slice(lastIndex, match.index + match[0].trimEnd().length).trim());
    lastIndex = match.index + match[0].length;
  }

  const remainder = text.slice(lastIndex).trim();
  return { sentences, remainder };
};

// ── Clean AI output for voice ────────────────────────────────────────────────
const cleanForVoice = (text) =>
  text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^[-•]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .replace(/,?\s*but keep reading to learn more\.?/gi, '.')
    .replace(/\.\s*\.$/g, '.')
    .trim();

/**
 * Detect smart commands from transcript.
 * Returns { command: string } or null.
 */
const detectCommand = (text) => {
  if (!text) return null;

  for (const pattern of REPEAT_COMMANDS) {
    if (pattern.test(text)) {
      console.log('[AI] detectCommand: repeat ←', JSON.stringify(text));
      return { command: 'repeat' };
    }
  }

  for (const [cmd, pattern] of Object.entries(NAVIGATION_COMMANDS)) {
    if (pattern.test(text)) {
      console.log('[AI] detectCommand:', cmd, '←', JSON.stringify(text));
      return { command: cmd };
    }
  }

  return null;
};

/**
 * Calls Gemini (non-streaming) with a prompt and returns the text response.
 */
const callGemini = async (prompt, maxTokens = 512) => {
  const res = await axios.post(
    `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: maxTokens },
    }
  );
  return res.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

/**
 * classifyQuery — pure regex, zero Gemini calls, ~0ms latency.
 */
const QUESTION_PATTERNS = [
  /^(what|who|where|when|why|how|which|whose|whom)\b/i,
  /\b(explain|describe|tell me|what does|what is|what are|what was|what were)\b/i,
  /\b(can you|could you|please explain|what happened|what do you mean|what's the meaning)\b/i,
  /\?\s*$/,
];

const OFF_TOPIC_PATTERNS = [
  /\b(joke|funny|weather|movie|song|cricket|football|recipe)\b/i,
  /\b(capital of|president of|prime minister of|population of)\b/i,
  /\d+\s*[+\-*/]\s*\d+/,
];

const classifyQuery = (transcript) => {
  if (!transcript || transcript.trim().length < 2) {
    return { isQuestion: false, isRelevant: false, cleanedQuery: '' };
  }
  const text = transcript.trim();
  const isQuestion = QUESTION_PATTERNS.some(p => p.test(text));
  if (!isQuestion) return { isQuestion: false, isRelevant: false, cleanedQuery: '' };
  const isOffTopic = OFF_TOPIC_PATTERNS.some(p => p.test(text));
  if (isOffTopic) return { isQuestion: true, isRelevant: false, cleanedQuery: text };
  return { isQuestion: true, isRelevant: true, cleanedQuery: text };
};

/**
 * Streams a voice-friendly answer from Gemini, calling onSentence() for each
 * complete sentence as it arrives and onDone() when fully complete.
 *
 * @param {string}   query
 * @param {string}   visibleText
 * @param {object}   chapterContext  — { title, subject, contentSummary }
 * @param {boolean}  simpler
 * @param {string}   segmentExplanation
 * @param {Function} onSentence      — called with (sentenceText) for each complete sentence
 * @param {Function} onDone          — called with (fullText) when stream ends
 */
const isGarbledSpeech = (text) => {
  if (!text) return true;
  const t = text.trim();
  if (t.length < 4) return true;
  // Single words that are known commands/starters are NOT garbled
  const knownWords = /^(again|next|back|pause|resume|repeat|stop|go|wait|hello|hi|yes|no|okay|ok|sure|please|what|why|how|who|when|where|which|explain|tell|show|describe|help|read|play|continue|forward|prev|previous|start|auto)$/i;
  const words = t.replace(/[.!?]$/, '').split(/\s+/);
  if (words.length === 1 && knownWords.test(words[0])) return false;
  if (words.length <= 2 && knownWords.test(words[0])) return false;
  // Tiny blurb with no vowels = noise
  if (t.length < 6 && !/[aeiou]/i.test(t)) return true;
  // 1-word blurb not in known list and short = garbled
  if (words.length === 1 && t.length < 9 && !knownWords.test(words[0])) return true;
  return false;
};
const generateAnswerStream = async (
  query,
  visibleText,
  chapterContext,
  simpler = false,
  segmentExplanation = '',
  onSentence,
  onDone,
) => {
  const { title, subject, contentSummary } = chapterContext;

  const simpleLang = simpler
    ? 'Use the SIMPLEST possible words. Imagine explaining to a 10-year-old.'
    : 'Use clear, friendly language appropriate for a student.';

  const explanationBlock = segmentExplanation
    ? `\nSIMPLE EXPLANATION OF VISIBLE TEXT (use this to enrich your answer):\n"${segmentExplanation.slice(0, 600)}"\n`
    : '';

  console.log('[AI] generateAnswerStream query:', JSON.stringify(query));
  console.log('[AI] generateAnswerStream visibleText:', JSON.stringify(visibleText?.slice(0, 100)));

  const prompt = `You are Andy, a friendly voice tutor for students.

A student is reading this chapter: "${title}" (${subject || 'General'})

THE EXACT TEXT THE STUDENT IS CURRENTLY READING:
"${visibleText}"
${explanationBlock}
FULL CHAPTER CONTENT FOR REFERENCE:
${contentSummary}

The student asked: "${query}"

Your job: Answer the student's question based on the text above.
- Write exactly 2-3 complete sentences
- ${simpleLang}
- Be direct — no intro phrases like "This question asks..." or "The chapter reveals..."
- Only say "That's not covered here" if the topic truly doesn't appear anywhere in the chapter content
- No markdown, no lists, no asterisks

Speak directly to the student now:`.trim();

  try {
    // Use axios with responseType: 'stream' to consume the SSE stream
    const response = await axios.post(
      `${GEMINI_STREAM_URL}?key=${process.env.GEMINI_API_KEY}&alt=sse`,
      {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
      },
      { responseType: 'stream' }
    );

    let accumulated = '';   // raw text buffer across chunks
    let remainder   = '';   // incomplete sentence carried forward
    let fullAnswer  = '';   // complete answer for onDone

    await new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        try {
          const lines = chunk.toString().split('\n');
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;

            let parsed;
            try { parsed = JSON.parse(jsonStr); } catch { continue; }

            const token = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (!token) continue;

            accumulated += token;
            const working = remainder + accumulated;
            accumulated = '';

            const { sentences, remainder: newRemainder } = splitSentences(working);
            remainder = newRemainder;

            for (const sentence of sentences) {
              const cleaned = cleanForVoice(sentence);
              if (cleaned.length > 3) {
                fullAnswer += (fullAnswer ? ' ' : '') + cleaned;
                console.log('[AI] stream sentence:', JSON.stringify(cleaned));
                onSentence?.(cleaned);
              }
            }
          }
        } catch (e) {
          console.error('[AI] stream parse error:', e.message);
        }
      });

      response.data.on('end', () => {
        // Flush any remaining text that didn't end with punctuation
        let tail = cleanForVoice(remainder);
        if (tail.length > 3) {
          if (!/[.!?]$/.test(tail)) tail += '.';
          fullAnswer += (fullAnswer ? ' ' : '') + tail;
          onSentence?.(tail);
        }
        console.log('[AI] stream complete, full answer:', JSON.stringify(fullAnswer));
        onDone?.(fullAnswer || "I'm having trouble processing that right now. Please try again.");
        resolve();
      });

      response.data.on('error', (err) => {
        console.error('[AI] stream error:', err.message);
        reject(err);
      });
    });

  } catch (e) {
    console.error('[AI] generateAnswerStream error:', e.message);
    const fallback = "I'm having trouble processing that right now. Please try again.";
    onSentence?.(fallback);
    onDone?.(fallback);
  }
};

/**
 * Non-streaming fallback (kept for backward compat / reExplain).
 */
const generateAnswer = async (query, visibleText, chapterContext, simpler = false, segmentExplanation = '') => {
  let fullText = '';
  await generateAnswerStream(
    query, visibleText, chapterContext, simpler, segmentExplanation,
    () => {},                     // discard per-sentence callback
    (done) => { fullText = done; }
  );
  return fullText;
};

/**
 * Re-explains the current section in simpler terms (for "explain again" command).
 * Streaming version — calls onSentence for each sentence.
 */
const reExplainSectionStream = async (visibleText, chapterContext, onSentence, onDone) => {
  const { title, subject } = chapterContext;

  const prompt = `You are a friendly voice tutor.

The student is reading from "${title}" (${subject || 'textbook'}).

They want a simpler explanation of:
"${visibleText}"

Give a SHORT, simple re-explanation in 2-3 sentences.
Write for VOICE — no lists, no markdown, no symbols.
Use everyday language. Be warm but concise.`.trim();

  try {
    const response = await axios.post(
      `${GEMINI_STREAM_URL}?key=${process.env.GEMINI_API_KEY}&alt=sse`,
      {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
      },
      { responseType: 'stream' }
    );

    let remainder  = '';
    let fullAnswer = '';

    await new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;
          let parsed;
          try { parsed = JSON.parse(jsonStr); } catch { continue; }
          const token = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (!token) continue;

          const working = remainder + token;
          const { sentences, remainder: newRemainder } = splitSentences(working);
          remainder = newRemainder;

          for (const s of sentences) {
            const cleaned = cleanForVoice(s);
            if (cleaned.length > 3) {
              fullAnswer += (fullAnswer ? ' ' : '') + cleaned;
              onSentence?.(cleaned);
            }
          }
        }
      });

      response.data.on('end', () => {
        let tail = cleanForVoice(remainder);
        if (tail.length > 3) {
          if (!/[.!?]$/.test(tail)) tail += '.';
          fullAnswer += ' ' + tail; onSentence?.(tail);
        }
        onDone?.(fullAnswer || 'Let me try again. ' + visibleText);
        resolve();
      });

      response.data.on('error', reject);
    });
  } catch (e) {
    console.error('[AI] reExplainSectionStream error:', e.message);
    const fallback = 'Let me try again. ' + visibleText;
    onSentence?.(fallback);
    onDone?.(fallback);
  }
};

// Keep non-streaming version for legacy callers
const reExplainSection = async (visibleText, chapterContext) => {
  let result = '';
  await reExplainSectionStream(visibleText, chapterContext, () => {}, (done) => { result = done; });
  return result;
};

/**
 * Summarizes chapter content into a compact string for use as AI context.
 */
const summarizeChapterContent = (contentJson) => {
  if (!contentJson) return '';

  const lines = [];

  const extractItem = (item) => {
    if (!item) return;
    if (item.text)         lines.push(item.text);
    if (item.explanation)  lines.push(item.explanation);
    if (item.subheading)   lines.push('[' + item.subheading + ']');
    if (item.problem)      lines.push(item.problem);
    if (item.solution)     lines.push(item.solution);
    if (item.equation)     lines.push('Equation: ' + item.equation);
    if (item.final_result) lines.push(item.final_result);
    if (item.speakers && item.text) lines.push(item.speakers + ': ' + item.text);
    if (Array.isArray(item.derivation)) {
      item.derivation.forEach(step => { if (step.step) lines.push(step.step); });
    }
  };

  if (contentJson.sections) {
    for (const section of contentJson.sections) {
      if (section.title || section.heading) lines.push('[Section: ' + (section.title || section.heading) + ']');
      for (const item of section.content || []) extractItem(item);
    }
  }
  if (contentJson.pages) {
    for (const page of contentJson.pages) {
      for (const para of page.paragraphs || page.content || []) extractItem(para);
    }
  }
  if (Array.isArray(contentJson)) contentJson.forEach(extractItem);
  if (contentJson.content && Array.isArray(contentJson.content)) contentJson.content.forEach(extractItem);

  const result = lines.join('\n').slice(0, 4000);
  console.log('[AI] summarizeChapterContent:', lines.length, 'items,', result.length, 'chars');
  return result;
};

module.exports = {
  detectCommand,
  classifyQuery,
  isGarbledSpeech,
  generateAnswer,
  generateAnswerStream,
  reExplainSection,
  reExplainSectionStream,
  summarizeChapterContent,
};