/**
 * subjectWorksheetService.js
 * Generates subject-level (cross-chapter) worksheets using Gemini.
 *
 * FIX: Generates each question TYPE in a separate Gemini call (batched),
 * then merges results. This avoids the maxOutputTokens truncation that
 * caused JSON parse failures when asking for 30 questions in one shot.
 *
 * Token budget per batch call: 16384 (safe for ~10 long-answer questions).
 */

const axios = require("axios");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_URL   = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent`;
const MAX_TOKENS   = 16384;  // bumped from 8192 — covers a full type-batch safely
const CALL_TIMEOUT = 120000; // 2 min per batch call

// ── OCR text extractor ────────────────────────────────────────────────────────
const extractTextFromOcr = (ocrJson) => {
  try {
    const parsed = typeof ocrJson === "string" ? JSON.parse(ocrJson) : ocrJson;
    if (!parsed) return "";
    const lines = [];
    const pages = parsed.pages || parsed;
    if (Array.isArray(pages)) {
      for (const page of pages) {
        if (page.markdown) lines.push(page.markdown);
        else if (page.text) lines.push(page.text);
      }
    }
    return lines.join("\n").slice(0, 3000);
  } catch {
    return typeof ocrJson === "string" ? ocrJson.slice(0, 3000) : "";
  }
};

// ── Extract concise summary block from a chapter row ─────────────────────────
const extractChapterSummaryText = (chapter) => {
  if (!chapter.summary_json) return "";
  try {
    const s = typeof chapter.summary_json === "string"
      ? JSON.parse(chapter.summary_json)
      : chapter.summary_json;
    const parts = [];
    if (s.summary)         parts.push(`Summary: ${s.summary}`);
    if (s.key_points?.length)
      parts.push(`Key Points:\n${s.key_points.join("\n")}`);
    if (s.definitions?.length)
      parts.push(`Definitions:\n${s.definitions.map(d => `${d.term}: ${d.definition}`).join("\n")}`);
    return parts.join("\n\n").slice(0, 2000);
  } catch {
    return "";
  }
};

// ── Sample existing questions (for Gemini to avoid duplication) ───────────────
const sampleExistingQuestions = (existingWorksheets, maxPerChapter = 4) => {
  const byChapter = {};
  for (const ws of existingWorksheets) {
    if (!byChapter[ws.chapter_id]) byChapter[ws.chapter_id] = [];
    try {
      const qs = JSON.parse(ws.questions_json || "[]");
      byChapter[ws.chapter_id].push(...qs);
    } catch {}
  }
  const samples = [];
  for (const [, qs] of Object.entries(byChapter)) {
    const total  = qs.length;
    const picked = [];
    if (total <= maxPerChapter) {
      picked.push(...qs);
    } else {
      const step = Math.floor(total / maxPerChapter);
      for (let i = 0; i < maxPerChapter; i++) picked.push(qs[i * step]);
    }
    samples.push(...picked.map(q => ({ type: q.type, question: q.question })));
  }
  return samples;
};

// ── Build prompt for a single question type ───────────────────────────────────
/**
 * Smaller focused prompt → smaller output → no truncation.
 * Each call generates only ONE type (e.g. "10 MCQ questions").
 */
const buildBatchPrompt = ({
  typeKey, typeLabel, count, marks, startQNo,
  chapterContent, sampleQuestionsText,
  bookTitle, subjectName, classNum, board,
  difficulty, chapterList,
}) => {
  const TYPE_SCHEMA = {
    mcq:
      `{ "q_no": ${startQNo}, "type": "mcq", "chapter_ref": "Ch.X", "difficulty": "easy", "marks": ${marks}, ` +
      `"question": "...", "options": {"A":"...","B":"...","C":"...","D":"..."}, "correct_answer": "A", "explanation": "one line or null" }`,
    fill_in_blank:
      `{ "q_no": ${startQNo}, "type": "fill_in_blank", "chapter_ref": "Ch.X", "difficulty": "easy", "marks": ${marks}, ` +
      `"question": "The ___ is ...", "correct_answer": "key term", "explanation": "one line or null" }`,
    short_answer:
      `{ "q_no": ${startQNo}, "type": "short_answer", "chapter_ref": "Ch.X", "difficulty": "medium", "marks": ${marks}, ` +
      `"question": "...", "correct_answer": "2-3 complete sentences.", "explanation": null }`,
    long_answer:
      `{ "q_no": ${startQNo}, "type": "long_answer", "chapter_ref": "Ch.X", "difficulty": "hard", "marks": ${marks}, ` +
      `"question": "...", "correct_answer": "4-6 complete sentences with detail.", "explanation": null }`,
  };

  const difficultyInstruction = difficulty === "mixed"
    ? "Mix difficulties: ~40% easy, ~40% medium, ~20% hard."
    : `All questions must be ${difficulty} difficulty.`;

  const chapterRefs = chapterList.map(c => `Ch.${c.chapter_no}`).join(", ");
  const typeSpecificRules = {
    mcq:           "Exactly 4 options (A, B, C, D). One correct answer only.",
    fill_in_blank: "ONE blank per question (use ___). Answer must be a single key term or short phrase.",
    short_answer:  "Expected answer: 2-3 complete, clear sentences.",
    long_answer:   "Expected answer: 4-6 complete sentences with explanation and detail.",
  }[typeKey] || "";

  return `You are an expert ${board || "CBSE"} Class ${classNum || ""} ${subjectName || "General"} teacher.

Book: "${bookTitle}" | Available chapters: ${chapterRefs}

CHAPTER CONTENT:
${chapterContent}

${sampleQuestionsText}

TASK: Generate EXACTLY ${count} ${typeLabel} question${count !== 1 ? "s" : ""}.
- Number them from ${startQNo} to ${startQNo + count - 1} (q_no field)
- Spread across different chapters — use "chapter_ref" field (e.g. "Ch.1", "Ch.2")
- Each question is worth exactly ${marks} mark${marks !== 1 ? "s" : ""}
- ${difficultyInstruction}
- ${typeSpecificRules}
- Do NOT repeat any existing questions shown above
- Base all questions strictly on the chapter content provided

Return ONLY a valid JSON array of exactly ${count} object${count !== 1 ? "s" : ""}. No markdown fences, no preamble, no trailing text.

Schema for each object:
${TYPE_SCHEMA[typeKey] || TYPE_SCHEMA.short_answer}`;
};

// ── Gemini API call ───────────────────────────────────────────────────────────
const callGemini = async (prompt) => {
  const res = await axios.post(
    `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: MAX_TOKENS },
    },
    { timeout: CALL_TIMEOUT }
  );
  return res.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

// ── JSON parser with partial-rescue fallback ──────────────────────────────────
/**
 * If Gemini still truncates (e.g. very long answers), the partial rescue
 * extracts all COMPLETE JSON objects from the truncated array,
 * so we don't throw away good questions just because the last one was cut off.
 */
const parseQuestionsJson = (raw, typeKey) => {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // Attempt 1: clean parse
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) return { questions: parsed, rescued: false };
  } catch {}

  // Attempt 2: partial rescue — walk character by character, extract complete objects
  try {
    const objects = [];
    let depth = 0, start = -1, inString = false, escape = false;
    for (let i = 0; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (escape)     { escape = false; continue; }
      if (ch === "\\") { escape = true;  continue; }
      if (ch === '"')  { inString = !inString; continue; }
      if (inString)    continue;
      if (ch === "{") {
        if (depth === 0) start = i;
        depth++;
      } else if (ch === "}") {
        depth--;
        if (depth === 0 && start !== -1) {
          try {
            const obj = JSON.parse(cleaned.slice(start, i + 1));
            if (obj && obj.question) objects.push(obj);
          } catch {}
          start = -1;
        }
      }
    }
    if (objects.length > 0) {
      console.warn(`[SubjectWorksheet] ⚠ Partial rescue for "${typeKey}": recovered ${objects.length} objects`);
      return { questions: objects, rescued: true };
    }
  } catch {}

  console.error(`[SubjectWorksheet] ✗ JSON parse failed for type="${typeKey}"`);
  console.error(`[SubjectWorksheet] Raw (first 600):`, raw.slice(0, 600));
  return null;
};

// ── Generate one type-batch with retries ──────────────────────────────────────
const generateBatch = async (promptArgs, typeKey) => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`[SubjectWorksheet] Batch "${typeKey}" attempt ${attempt}`);
    try {
      const raw    = await callGemini(buildBatchPrompt(promptArgs));
      const result = parseQuestionsJson(raw, typeKey);
      if (result && result.questions.length > 0) {
        if (result.rescued) {
          console.warn(`[SubjectWorksheet] Rescued ${result.questions.length}/${promptArgs.count} for "${typeKey}" — consider reducing count or answer length`);
        }
        return result.questions;
      }
    } catch (err) {
      console.error(`[SubjectWorksheet] Batch "${typeKey}" attempt ${attempt} threw:`, err.message);
    }
    console.warn(`[SubjectWorksheet] Batch "${typeKey}" attempt ${attempt} failed, retrying…`);
  }
  return null;
};

// ── Main exported function ────────────────────────────────────────────────────
/**
 * @param {object}   book               - book row with subject_name, class_num, board
 * @param {object[]} chapters           - array of book_chapters rows (with summary_json)
 * @param {object[]} existingWorksheets - chapter_worksheets rows { chapter_id, questions_json }
 * @param {object}   ocrMap             - { [chapter_no]: ocrJson }
 * @param {object}   typeConfig         - { mcq:{count,marks}, fill_in_blank:{count,marks}, ... }
 * @param {string}   difficulty         - "mixed"|"easy"|"medium"|"hard"
 * @returns {{ questions, total, totalMarks, source, chaptersUsed, failedTypes? }}
 */
const generateSubjectWorksheet = async (
  book,
  chapters,
  existingWorksheets,
  ocrMap,
  typeConfig = {
    mcq:           { count: 10, marks: 1 },
    fill_in_blank: { count: 5,  marks: 2 },
    short_answer:  { count: 10, marks: 4 },
    long_answer:   { count: 5,  marks: 8 },
  },
  difficulty = "mixed"
) => {
  // ── Build shared chapter content ──────────────────────────────────────────
  const chapterBlocks = chapters.map(ch => {
    const summaryText = extractChapterSummaryText(ch);
    const ocrSnippet  = !summaryText ? extractTextFromOcr(ocrMap[ch.chapter_no] || "") : "";
    return { chapter_no: ch.chapter_no, chapter_title: ch.chapter_title || `Chapter ${ch.chapter_no}`, summaryText, ocrSnippet };
  });

  const hasAnySummary = chapterBlocks.some(b => b.summaryText);
  const hasAnyOcr     = chapterBlocks.some(b => b.ocrSnippet);
  if (!hasAnySummary && !hasAnyOcr) {
    throw new Error("No content available for the selected chapters. Please process chapters first.");
  }

  const source = hasAnySummary
    ? (existingWorksheets.length > 0 ? "hybrid_with_worksheets" : "summary")
    : "ocr";

  // Keep per-chapter content capped tightly so batch prompts stay small
  const chapterContent = chapterBlocks
    .map(ch => `=== Chapter ${ch.chapter_no}: ${ch.chapter_title} ===\n${(ch.summaryText || ch.ocrSnippet).slice(0, 1500)}`)
    .join("\n\n");

  const sampleQuestions     = sampleExistingQuestions(existingWorksheets, 4);
  const sampleQuestionsText = sampleQuestions.length > 0
    ? "EXISTING QUESTIONS (do NOT repeat — topic reference only):\n" +
      sampleQuestions.map(q => `  [${q.type}] ${q.question}`).join("\n")
    : "";

  const totalQuestions = Object.values(typeConfig).reduce((s, v) => s + (v.count || 0), 0);
  const totalMarks     = Object.values(typeConfig).reduce((s, v) => s + ((v.count || 0) * (v.marks || 0)), 0);

  console.log(
    `[SubjectWorksheet] Generating ${totalQuestions}Q / ${totalMarks}M for book "${book.title}" ` +
    `across ${chapters.length} chapters · source: ${source} · existing samples: ${sampleQuestions.length}`
  );

  const TYPE_LABELS = {
    mcq:           "Multiple Choice (MCQ)",
    fill_in_blank: "Fill-in-the-Blank",
    short_answer:  "Short Answer",
    long_answer:   "Long Answer",
  };

  // ── Run each type as a separate Gemini call (sequential) ─────────────────
  const allQuestions = [];
  let   qNo          = 1;
  const failedTypes  = [];

  for (const [typeKey, { count, marks }] of Object.entries(typeConfig).filter(([, v]) => v.count > 0)) {
    const promptArgs = {
      typeKey,
      typeLabel:          TYPE_LABELS[typeKey] || typeKey,
      count,
      marks,
      startQNo:           qNo,
      chapterContent,
      sampleQuestionsText,
      bookTitle:          book.title,
      subjectName:        book.subject_name,
      classNum:           book.class_num,
      board:              book.board,
      difficulty,
      chapterList:        chapters,
    };

    const batch = await generateBatch(promptArgs, typeKey);

    if (!batch) {
      console.error(`[SubjectWorksheet] ❌ All attempts failed for "${typeKey}" — skipping`);
      failedTypes.push(typeKey);
      qNo += count; // keep q_no sequence for remaining types
      continue;
    }

    // Normalise: re-number sequentially, enforce type and marks
    const numbered = batch.slice(0, count).map((q, i) => ({
      ...q,
      q_no:  qNo + i,
      type:  typeKey,
      marks: q.marks ?? marks,
    }));
    allQuestions.push(...numbered);
    qNo += count;

    console.log(`[SubjectWorksheet] ✅ "${typeKey}" → ${numbered.length}/${count} questions`);
  }

  if (allQuestions.length === 0) {
    throw new Error("Gemini failed to generate any questions. Please retry.");
  }

  if (failedTypes.length > 0) {
    console.warn(`[SubjectWorksheet] Partial result — failed types: ${failedTypes.join(", ")}`);
  }

  const actualTotalMarks = allQuestions.reduce((s, q) => s + (q.marks || 0), 0);
  console.log(`[SubjectWorksheet] ✅ Final: ${allQuestions.length} questions · ${actualTotalMarks} marks`);

  return {
    questions:    allQuestions,
    total:        allQuestions.length,
    totalMarks:   actualTotalMarks,
    source,
    chaptersUsed: chapters.map(c => ({ id: c.id, chapter_no: c.chapter_no, chapter_title: c.chapter_title })),
    ...(failedTypes.length > 0 && { failedTypes }),
  };
};

module.exports = { generateSubjectWorksheet };