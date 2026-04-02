/**
 * worksheetService.js
 * Generates chapter worksheets using Gemini.
 * Supports full type_config: { mcq: { count, marks }, fill_in_blank: { count, marks }, ... }
 * Falls back to legacy questionCount if type_config not provided.
 */

const axios = require("axios");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent`;

// ── Content extractor (same logic as aiService) ────────────────────────────
const extractTextFromContentJson = (contentJson) => {
  if (!contentJson) return "";
  const lines = [];

  const extractItem = (item) => {
    if (!item) return;
    if (item.text)        lines.push(item.text);
    if (item.explanation) lines.push(item.explanation);
    if (item.subheading)  lines.push("[" + item.subheading + "]");
    if (item.problem)     lines.push(item.problem);
    if (item.solution)    lines.push(item.solution);
    if (item.equation)    lines.push("Equation: " + item.equation);
    if (item.final_result) lines.push(item.final_result);
    if (Array.isArray(item.derivation)) {
      item.derivation.forEach(step => { if (step.step) lines.push(step.step); });
    }
  };

  if (contentJson.sections) {
    for (const section of contentJson.sections) {
      if (section.title || section.heading)
        lines.push("[Section: " + (section.title || section.heading) + "]");
      for (const item of section.content || []) extractItem(item);
    }
  }
  if (contentJson.pages) {
    for (const page of contentJson.pages) {
      for (const para of page.paragraphs || page.content || []) extractItem(para);
    }
  }
  if (Array.isArray(contentJson)) contentJson.forEach(extractItem);
  if (contentJson.content && Array.isArray(contentJson.content))
    contentJson.content.forEach(extractItem);

  return lines.join("\n").slice(0, 8000);
};

const fetchContentJson = async (url) => {
  try {
    const res = await axios.get(url, { timeout: 30000 });
    return res.data;
  } catch (err) {
    console.error("[Worksheet] Failed to fetch content_json from FTP:", err.message);
    return null;
  }
};

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
    return lines.join("\n").slice(0, 8000);
  } catch {
    return typeof ocrJson === "string" ? ocrJson.slice(0, 8000) : "";
  }
};

// ── Build prompt from type_config ─────────────────────────────────────────────
/**
 * typeConfig: {
 *   mcq:           { count: 5, marks: 1 },
 *   fill_in_blank: { count: 5, marks: 1 },
 *   short_answer:  { count: 5, marks: 3 },
 *   long_answer:   { count: 5, marks: 5 },
 * }
 * Only keys present in typeConfig are generated.
 */
const buildWorksheetPrompt = ({
  chapterTitle,
  chapterNo,
  subject,
  classNum,
  board,
  contentText,
  typeConfig,
  difficulty = "mixed",
}) => {
  // Build summary of what to generate
  const TYPE_LABELS = {
    mcq:           "MCQ (4 options A/B/C/D, one correct answer)",
    fill_in_blank: "fill-in-the-blank (leave ONE key term blank, provide answer)",
    short_answer:  "short answer (2-3 sentence expected answer)",
    long_answer:   "long answer (4-6 sentence detailed expected answer)",
  };

  const typeLines = Object.entries(typeConfig)
    .filter(([, v]) => v.count > 0)
    .map(([key, v]) => `  - ${v.count} × ${TYPE_LABELS[key] || key} [${v.marks} mark${v.marks !== 1 ? "s" : ""} each]`)
    .join("\n");

  const totalQuestions = Object.values(typeConfig).reduce((s, v) => s + (v.count || 0), 0);
  const totalMarks = Object.values(typeConfig).reduce((s, v) => s + ((v.count || 0) * (v.marks || 0)), 0);

  // Build JSON example rows per type
  const exampleRows = [];
  let qNo = 1;
  Object.entries(typeConfig).forEach(([key, v]) => {
    if (!v.count) return;
    if (key === "mcq") {
      exampleRows.push(`  { "q_no": ${qNo}, "type": "mcq", "difficulty": "easy", "marks": ${v.marks}, "question": "...", "options": {"A": "...", "B": "...", "C": "...", "D": "..."}, "correct_answer": "A", "explanation": "One-line reason" }`);
    } else if (key === "fill_in_blank") {
      exampleRows.push(`  { "q_no": ${qNo}, "type": "fill_in_blank", "difficulty": "easy", "marks": ${v.marks}, "question": "The process of ... is called ______.", "correct_answer": "the answer", "explanation": "One-line reason" }`);
    } else if (key === "short_answer") {
      exampleRows.push(`  { "q_no": ${qNo}, "type": "short_answer", "difficulty": "medium", "marks": ${v.marks}, "question": "...", "correct_answer": "2-3 sentence answer", "explanation": null }`);
    } else if (key === "long_answer") {
      exampleRows.push(`  { "q_no": ${qNo}, "type": "long_answer", "difficulty": "hard", "marks": ${v.marks}, "question": "...", "correct_answer": "4-6 sentence answer", "explanation": null }`);
    }
    qNo++;
  });

  return `You are an expert ${board || "CBSE"} Class ${classNum || ""} ${subject || "General"} teacher.

Create a worksheet for Chapter ${chapterNo}: "${chapterTitle}"

CHAPTER CONTENT:
"""
${contentText}
"""

GENERATE EXACTLY:
${typeLines}
TOTAL: ${totalQuestions} questions worth ${totalMarks} marks.

DIFFICULTY: ${difficulty === "mixed"
    ? "Mixed — easy (40%), medium (40%), hard (20%)"
    : `ALL questions must be ${difficulty} level`}

RULES:
- Base ALL questions strictly on the chapter content above
- Include conceptual, factual, and application-based questions
- Do NOT repeat the same concept twice
- MCQ: exactly 4 options (A, B, C, D), one correct
- Fill-in-blank: one blank only, answer is a key term
- Short answer: 2-3 complete sentences
- Long answer: 4-6 complete sentences
- Keep explanations to 1 line max (null is fine for short/long)
- CRITICAL: Return ONLY valid JSON. Do NOT use raw backslashes (\\) in text. Write math using words or Unicode (e.g., "omega" not "\\omega", "pi" not "\\pi", "²" not "^2"). Never use LaTeX notation inside JSON strings.
- Each question MUST include the "marks" field exactly as specified above
- Number questions sequentially from 1 to ${totalQuestions}

Return ONLY a valid JSON array. No markdown, no preamble, no explanation outside JSON.

Example format:
[
${exampleRows.join(",\n")}
]`;
};

// ── Gemini call ───────────────────────────────────────────────────────────────
const callGemini = async (prompt) => {
  const res = await axios.post(
    `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
    },
    { timeout: 120000 }
  );
  return res.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

const parseQuestionsJson = (raw) => {
  try {
    // Step 1: Strip markdown code fences
    let cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    // Step 2: Extract only the JSON array (ignore any trailing junk after `]`)
    const startIdx = cleaned.indexOf("[");
    const endIdx = cleaned.lastIndexOf("]");
    if (startIdx === -1 || endIdx === -1) throw new Error("No JSON array found");
    cleaned = cleaned.slice(startIdx, endIdx + 1);

    // Step 3: Try direct parse first (fast path)
    try {
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) throw new Error("Not an array");
      return parsed;
    } catch (_directErr) {
      // Step 4: Repair bad escape sequences.
      // Gemini sometimes emits lone backslashes or literal newlines inside string
      // values (e.g. in physics formulas: v = r\omega, T = 2\pi/\omega).
      // Walk char-by-char; inside string literals, fix any backslash not
      // followed by a valid JSON escape character.
      const VALID_ESCAPES = new Set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u']);
      let repaired = "";
      let inString = false;
      let i = 0;

      while (i < cleaned.length) {
        const ch = cleaned[i];

        if (inString) {
          if (ch === "\\") {
            const next = cleaned[i + 1];
            if (next !== undefined && VALID_ESCAPES.has(next)) {
              // Valid escape — keep it; for \uXXXX consume 4 extra hex digits
              if (next === "u") {
                repaired += ch + next + cleaned.slice(i + 2, i + 6);
                i += 6;
              } else {
                repaired += ch + next;
                i += 2;
              }
            } else {
              // Lone/bad backslash — double-escape it so JSON.parse accepts it
              repaired += "\\\\";
              i += 1;
            }
          } else if (ch === '"') {
            inString = false;
            repaired += ch;
            i += 1;
          } else if (ch === "\n" || ch === "\r") {
            // Literal newlines inside strings are illegal JSON
            repaired += ch === "\n" ? "\\n" : "\\r";
            i += 1;
          } else {
            repaired += ch;
            i += 1;
          }
        } else {
          if (ch === '"') inString = true;
          repaired += ch;
          i += 1;
        }
      }

      const parsed = JSON.parse(repaired);
      if (!Array.isArray(parsed)) throw new Error("Not an array");
      console.log("[Worksheet] ✅ JSON repaired successfully (bad escapes fixed)");
      return parsed;
    }
  } catch (err) {
    console.error("[Worksheet] JSON parse failed:", err.message);
    console.error("[Worksheet] Raw (first 500):", raw.slice(0, 500));
    return null;
  }
};

// ── Main exported function ────────────────────────────────────────────────────
/**
 * @param {object} chapter       - book_chapters row (+ content_json_path, summary_json)
 * @param {object} book          - { id, title, board, class_num, subject_name }
 * @param {string|null} ocrJson  - raw ocr_json string (fallback)
 * @param {object} typeConfig    - { mcq: {count,marks}, fill_in_blank: {count,marks}, ... }
 * @param {string} difficulty    - "mixed"|"easy"|"medium"|"hard"
 * @returns {{ questions, total, totalMarks, source }}
 */
const generateWorksheet = async (
  chapter,
  book,
  ocrJson = null,
  typeConfig = { mcq: { count: 5, marks: 1 }, fill_in_blank: { count: 5, marks: 1 }, short_answer: { count: 5, marks: 3 }, long_answer: { count: 5, marks: 5 } },
  difficulty = "mixed"
) => {
  let contentText = "";
  let source = "none";

  // 1. Hybrid: summary + example lines from content_json
  if (chapter.summary_json) {
    try {
      const summaryData = typeof chapter.summary_json === "string"
        ? JSON.parse(chapter.summary_json)
        : chapter.summary_json;

      const summaryText = `
SUMMARY:
${summaryData.summary || ""}

KEY POINTS:
${(summaryData.key_points || []).join("\n")}

DEFINITIONS:
${(summaryData.definitions || []).map(d => `${d.term}: ${d.definition}`).join("\n")}`;

      let contentSnippet = "";
      if (chapter.content_json_path) {
        const contentJson = await fetchContentJson(chapter.content_json_path);
        if (contentJson) {
          contentSnippet = extractTextFromContentJson(contentJson)
            .split("\n")
            .filter(line =>
              /example|activity|application/i.test(line)
            )
            .join("\n")
            .slice(0, 2000);
        }
      }

      contentText = `${summaryText}\n\nADDITIONAL CONTEXT (Examples & Applications):\n${contentSnippet}`;
      source = "hybrid";
    } catch {
      console.warn("[Worksheet] summary_json parse failed, falling back");
    }
  }

  // 2. Fallback: full content_json from FTP
  if (!contentText && chapter.content_json_path) {
    const contentJson = await fetchContentJson(chapter.content_json_path);
    if (contentJson) {
      contentText = extractTextFromContentJson(contentJson);
      source = "content_json";
    }
  }

  // 3. Last resort: OCR json from DB
  if (!contentText && ocrJson) {
    contentText = extractTextFromOcr(ocrJson);
    source = "ocr_json";
  }

  if (!contentText) {
    throw new Error("No content available for this chapter. Please process it first.");
  }

  const totalQuestions = Object.values(typeConfig).reduce((s, v) => s + (v.count || 0), 0);
  const totalMarks = Object.values(typeConfig).reduce((s, v) => s + ((v.count || 0) * (v.marks || 0)), 0);

  console.log(`[Worksheet] Generating ${totalQuestions}Q / ${totalMarks}M for Ch.${chapter.chapter_no} via ${source}`);

  const prompt = buildWorksheetPrompt({
    chapterTitle: chapter.chapter_title || `Chapter ${chapter.chapter_no}`,
    chapterNo: chapter.chapter_no,
    subject: book.subject_name || book.subject,
    classNum: book.class_num,
    board: book.board,
    contentText,
    typeConfig,
    difficulty,
  });

  // Retry up to 3 times on bad JSON
  let questions = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`[Worksheet] Gemini attempt ${attempt}`);
    const raw = await callGemini(prompt);
    questions = parseQuestionsJson(raw);
    if (questions) break;
    console.warn("[Worksheet] Invalid JSON, retrying…");
  }

  if (!questions || questions.length === 0) {
    throw new Error("Gemini failed to return valid questions after 3 attempts. Please retry.");
  }

  // Ensure each question has its marks field (in case Gemini drops it)
  const typeMarksMap = Object.fromEntries(
    Object.entries(typeConfig).map(([k, v]) => [k, v.marks || 1])
  );
  questions = questions.map(q => ({
    ...q,
    marks: q.marks ?? typeMarksMap[q.type] ?? 1,
  }));

  // Recompute actual total marks from returned questions
  const actualTotalMarks = questions.reduce((s, q) => s + (q.marks || 0), 0);

  console.log(`[Worksheet] ✅ ${questions.length} questions · ${actualTotalMarks} marks`);

  return {
    questions,
    total: questions.length,
    totalMarks: actualTotalMarks,
    source,
  };
};

module.exports = { generateWorksheet };