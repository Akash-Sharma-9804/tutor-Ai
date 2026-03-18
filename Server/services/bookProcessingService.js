// bookProcessingService.js
// ─────────────────────────────────────────────────────────────────────────────
// Book processing pipeline:
//   PDF → Mistral OCR (text + diagram images) → Gemini (page-by-page explanation)
//   → FTP (content.json + diagram images) → DB (metadata + diagram URLs)
//
// Key changes from previous version:
//   ✅ Mistral OCR replaces pdftoppm + pdfjs entirely
//   ✅ Diagram images extracted by Mistral, uploaded to FTP individually
//   ✅ OCR result cached in DB (no redundant Mistral calls on reprocess)
//   ✅ Gemini receives clean LaTeX markdown + isolated diagram images
//   ✅ All diagram blocks in final JSON have image_url pointing to FTP
//   ✅ Sequential page processing — safe memory usage
// ─────────────────────────────────────────────────────────────────────────────

const axios = require("axios");
const OpenAI = require("openai");
const { uploadFileToFTP } = require("./uploadToFTP");
const {
  getOCRPages,
  uploadPageDiagrams,
  checkMemory,
} = require("./mistralOCRService");
const { isMathsSubject, buildMathsPrompt } = require("./mathsPrompt");
const { isEnglishSubject, buildEnglishPrompt } = require("./englishPrompt");
const { isPhysicsSubject, buildPhysicsPrompt } = require("./physicsPrompt");


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const EMBEDDING_MODEL = "text-embedding-3-small";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate embedding for text (unchanged from original)
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("❌ Failed to generate embedding:", error);
    throw error;
  }
}

/**
 * Retry with exponential backoff (unchanged from original)
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 5000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      // Log full Gemini error body for debugging (especially 400 errors)
      if (error.response?.status === 400) {
        const errBody = JSON.stringify(error.response?.data || {});
        console.error(`❌ Gemini 400 error body: ${errBody.substring(0, 500)}`);
        throw error; // 400 is not retryable
      }
      if (error.response?.status === 429 && i < maxRetries - 1) {
        const waitTime = initialDelay * Math.pow(2, i);
        console.log(
          `⏳ Rate limited. Waiting ${waitTime / 1000}s before retry ${i + 1}/${maxRetries}...`
        );
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }
}

// ─── Gemini Page Processing ───────────────────────────────────────────────────

/**
 * Process one page with Gemini.
 * Now receives Mistral markdown (rich LaTeX, tables, headings) instead of
 * raw pdfjs text, and receives isolated diagram images instead of full-page WebP.
 *
 * @param {string}  pageMarkdown     - Mistral OCR markdown for this page
 * @param {Array}   pageImages       - page.images[] from Mistral ({ id, image_base64 })
 *                                    base64 values may be null if already freed after FTP upload
 * @param {number}  pageNumber       - 1-based page number
 * @param {object}  bookMetadata     - { class, subject, board, ... }
 * @param {number}  chunkIndex       - for logging
 * @param {boolean} retryMode        - use stricter retry prompt
 * @returns {Promise<Array>}         - sections[] for this page
 */
async function processPageChunk(
  pageMarkdown,
  pageImages,
  pageNumber,
  bookMetadata,
  chunkIndex,
  retryMode = false,
  subjectName = ""
) {
  console.log(`\n📄 Processing page ${pageNumber} (Chunk ${chunkIndex})...`);

  const geminiRes = await retryWithBackoff(async () => {
    console.log(`🔧 Calling Gemini API for page ${pageNumber}...`);

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }

    // Build image list description for prompt (helps Gemini map image IDs)
    const imageListText =
      pageImages && pageImages.length > 0
        ? `\nDIAGRAM IMAGES ON THIS PAGE (in order):\n` +
          pageImages
            .map((img, idx) => `  ${idx + 1}. Image ID: "${img.id}"`)
            .join("\n") +
          `\n\nFor EVERY diagram_concept or diagram_reference block, you MUST include the field:\n"mistral_image_id": "<the exact image id from the list above>"\nMatch by order of appearance in the markdown.`
        : "\nNo diagram images on this page.";

    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    // ── Choose prompt: maths-specific, english-specific, or general ──────────
    const effectiveSubject = subjectName || bookMetadata.subject || "";
    const useMathsPrompt   = isMathsSubject(effectiveSubject);
    const usePhysicsPrompt = !useMathsPrompt && isPhysicsSubject(effectiveSubject);
    const useEnglishPrompt = !useMathsPrompt && !usePhysicsPrompt && isEnglishSubject(effectiveSubject);
 
    if (useMathsPrompt) {
      console.log(`🔢 Using MATHS prompt for page ${pageNumber} (subject: ${effectiveSubject})`);
    } else if (usePhysicsPrompt) {
      console.log(`⚛️  Using PHYSICS prompt for page ${pageNumber} (subject: ${effectiveSubject})`);
    } else if (useEnglishPrompt) {
      console.log(`📖 Using ENGLISH prompt for page ${pageNumber} (subject: ${effectiveSubject})`);
    }
    // Build parts array: text prompt + diagram images inline
    const parts = [
      {
        text: useMathsPrompt
          ? buildMathsPrompt(pageMarkdown, pageImages, pageNumber, bookMetadata, retryMode)
          : usePhysicsPrompt
          ? buildPhysicsPrompt(pageMarkdown, pageImages, pageNumber, bookMetadata, retryMode)
          : useEnglishPrompt
          ? buildEnglishPrompt(pageMarkdown, pageImages, pageNumber, bookMetadata, retryMode)
          : `${
          retryMode
            ? `🚨🚨🚨 CRITICAL - RETRY MODE ACTIVATED 🚨🚨🚨

THE PREVIOUS ATTEMPT FAILED - IT RETURNED EMPTY CONTENT OR INVALID DATA.

MANDATORY REQUIREMENTS FOR THIS RETRY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. You MUST generate content for this page - empty responses are NOT acceptable
2. Even if the page text seems minimal or unclear, create at least 1-3 content items
3. If there's ANY diagram/figure/image mentioned, include it with explanation
4. Every content item needs an explanation (minimum 2 sentences)
5. Return VALID JSON with properly populated content arrays
6. DO NOT return empty [] for the content field under any circumstances
7. DO NOT return {"error":"incomplete"}

THIS IS YOUR FINAL ATTEMPT - GENERATE CONTENT NOW!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`
            : ""
        }
You are an expert CBSE Class ${bookMetadata.class} ${bookMetadata.subject} teacher creating study material for Class ${bookMetadata.class} students.

PAGE CONTINUATION RULE (CRITICAL):
- This page may be a continuation from the previous page.
- DO NOT restate earlier explanations or definitions.
- ONLY explain what is present on THIS page.
- If a derivation, example, or explanation starts mid-way, continue ONLY from the visible steps.
- Do NOT assume missing steps — they may exist on previous pages.
- NEVER say "cannot solve" or "beyond class level" — ALWAYS solve using the visible information.

The following is EXACTLY the OCR markdown from page ${pageNumber} of the textbook.
The text is already clean with proper LaTeX equations preserved.
Do NOT add, repeat, or infer content from any other page.

PAGE ${pageNumber} MARKDOWN:
"""
${pageMarkdown}
"""
${imageListText}

DIAGRAMS DETECTED ON THIS PAGE:
${
  pageImages && pageImages.length > 0
    ? `🚨🚨🚨 VISUAL ELEMENTS DETECTED ON THIS PAGE 🚨🚨🚨
  
  YOU MUST INCLUDE DIAGRAM OBJECTS WITH EXPLANATIONS:
  - Use "diagram_concept" for educational diagrams (with 3-5 sentence explanation)
  - Use "diagram_reference" for activity/observation images (with 1-2 sentence explanation)
  - NEVER skip diagrams or leave explanation fields empty
  - ALWAYS include "mistral_image_id" field matching the image ID from the list above
  - Format: {"type": "diagram_concept", "title": "...", "mistral_image_id": "img-0.jpeg", "explanation": "..."}`
    : "No diagram images on this page."
}

Now analyze the markdown carefully and create detailed, student-friendly explanations appropriate for Class ${bookMetadata.class} level.

⚠️⚠️⚠️ CONTENT GENERATION IS MANDATORY ⚠️⚠️⚠️
Every page MUST have content in the content array. Even if text is minimal, generate at least 1-2 items.

📝 HANDLING PAGES WITH MINIMAL TEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If this page has very little text (under 50 characters), you MUST still:
1. Extract ANY visible text and include it as a "text" content item
2. Provide explanation based on what you CAN see
3. If there's a heading/title, include it as "subheading" type
4. If there's a diagram reference, include it with explanation
NEVER return empty content arrays, even for near-empty pages.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL INSTRUCTIONS:
1. FIRST classify the content type:
   - THEORY / CONCEPT → group into balanced segments (see Rule 3 below).
   - EXERCISE / QUESTION / NUMERICAL / PROBLEM → SOLVE completely.

2. DO NOT treat questions like theory.

3. GROUPING RULE — BALANCED SEGMENTS (MOST IMPORTANT RULE):
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Think of how a TEACHER explains in class — not too fast (one line at a time), not too slow (a giant wall of text). Apply this same balance:

   ✅ IDEAL TEXT BLOCK SIZE: 2–4 sentences from the book (40–80 words)
   ✅ IDEAL EXPLANATION SIZE: 3–5 sentences (60–100 words)

   WHEN TO GROUP LINES TOGETHER (merge into one block):
   - Lines that together explain ONE concept or ONE idea (e.g., "what is metabolism" across 2 short lines)
   - A list of related points (A, B, C...) that all belong to the same topic
   - A definition followed immediately by its example

   WHEN TO SPLIT INTO SEPARATE BLOCKS (do NOT merge):
   - When the topic clearly shifts (e.g., from metabolism to reproduction)
   - When one point is already 3–4 sentences on its own
   - When a new lettered/numbered point introduces a DIFFERENT concept

   ❌ DO NOT: Put an entire section (10+ sentences) into one text block
   ❌ DO NOT: Make a block for every single short line (1 sentence per block)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. HANDLING RULES BASED ON CONTENT TYPE:

A. THEORY / CONCEPT CONTENT:
   - Group 2–4 related sentences into one "text" block (see Rule 3).
   - Use simple language suitable for Class ${bookMetadata.class}.
   - Explain meanings, ideas, and real-life relevance.

B. EXERCISES / QUESTIONS / PROBLEMS:
   - Detect by patterns such as:
     • numbering (1.1, 1.14, 2.3, etc.)
     • question words ("What is", "Find", "Calculate", "Determine", "Solve")
     • parts like (a), (b), (c)
     • presence of numbers, units, symbols, or equations
   - DO NOT explain the question text.
   - SOLVE the problem fully, step by step, like a teacher.
   - Structure solutions as:
     {
       "type": "example",
       "problem": "Exact question text from the markdown",
       "solution": "Clear step-by-step solution explaining each step"
     }

C. EQUATIONS / FORMULAS (STRICT):
   - The equation string MUST be copied EXACTLY as it appears in the markdown.
   - Preserve LaTeX notation exactly as given.
   - Do NOT reorder symbols or simplify the equation text itself.
   - When an equation or formula appears:
     {
       "type": "equation",
       "equation": "Equation as written in the markdown (LaTeX preserved)",
       "derivation": [
         {
           "step": "Step 1",
           "explanation": "Why this step is taken at Class ${bookMetadata.class} level"
         }
       ],
       "final_result": "Final simplified result",
       "application": "Where and how students use this equation"
     }

5. Do NOT skip ANY text from the page.

6. DIAGRAM HANDLING (CRITICAL AND NON-NEGOTIABLE):

6a. DETECTION — Include diagrams when markdown contains:
    - ![img-X.jpeg](img-X.jpeg) references
    - "Fig", "Figure", "Diagram" mentions
    - Any numbered figures (e.g., "Fig 1.1", "Figure 2")

6b. CLASSIFICATION:
    - diagram_concept: Scientific/mathematical/geographic educational diagrams
    - diagram_reference: Activity images, observation tasks

6c. EXPLANATION REQUIREMENTS (MANDATORY):
    ✓ diagram_concept → MUST have 3-5 sentence detailed explanation
    ✓ diagram_reference → MUST have 1-2 sentence description
    ✓ NEVER leave explanation field empty
    ✓ ALWAYS include "mistral_image_id" field

6d. OUTPUT FORMAT:
    For concepts:
    {
      "type": "diagram_concept",
      "title": "Fig 1.1 (a) Plane angle",
      "mistral_image_id": "img-0.jpeg",
      "explanation": "Detailed 3-5 sentences..."
    }
    For activities:
    {
      "type": "diagram_reference",
      "title": "Activity name",
      "mistral_image_id": "img-1.jpeg",
      "explanation": "Brief 1-2 sentence purpose"
    }

STRUCTURAL RULES:

A. PAGE / CHAPTER HEADINGS
- If a line is a page title or chapter heading, DO NOT include it in output.

B. SUBHEADINGS / SECTION TITLES
- Output ONLY: {"type": "subheading", "subheading": "exact heading text"}
- NEVER explain or expand a subheading.

C. BODY TEXT
- Only body paragraphs should be treated as explainable text.

YOU ARE A JSON API.
RETURN ONLY VALID JSON.
DO NOT include markdown, explanations, comments, or trailing text.

CONTENT GENERATION REQUIREMENTS (CRITICAL):
1. NEVER return empty content arrays
2. DO NOT return {"error":"incomplete"} — always try to generate content
3. MINIMUM OUTPUT: Every page MUST have at least 1-2 content items

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "sections": [
    {
      "heading": "Main topic or section heading from this page",
      "page_range": [${pageNumber}, ${pageNumber}],
      "content": [
        {
          "type": "text",
          "text": "2–4 sentences from the book covering ONE complete idea (40–80 words). Never a single short line. Never an entire section.",
          "explanation": "3–5 sentences explaining this idea like a teacher: what it means, why it matters, and a real-life example if possible. (60–100 words)"
        },
        {
          "type": "diagram_concept",
          "title": "Name or caption of the diagram",
          "mistral_image_id": "img-0.jpeg",
          "explanation": "Detailed 3-5 sentence explanation of what the diagram shows, key components, and what students should observe."
        },
        {
          "type": "diagram_reference",
          "title": "Activity or observation image name",
          "mistral_image_id": "img-1.jpeg",
          "explanation": "Brief 1-2 sentence purpose of this activity image."
        },
        {
          "type": "example",
          "problem": "Example problem from markdown",
          "solution": "Step-by-step solution with explanation of each step"
        },
        {
          "type": "equation",
          "equation": "EXACT equation text copied verbatim from the markdown",
          "derivation": [
            {
              "step": "Step 1: Starting equation or given information",
              "explanation": "Why we start here"
            }
          ],
          "final_result": "Final simplified form",
          "application": "When and how Class ${bookMetadata.class} students use this equation"
        },
        {
          "type": "subheading",
          "subheading": "exact heading text"
        }
      ]
    }
  ]
}

QUALITY REQUIREMENTS:
- Each text block covers ONE complete idea — not a single line, not an entire topic dump
- Explanations are teacher-like: clear, connected, 3–5 sentences (60–100 words)
- Explain WHY concepts work, not just WHAT they are
- Use real-life analogies familiar to Class ${bookMetadata.class} students
- For diagrams: explain every visible part and interaction (3–5 sentences)
- For equations: explain every step and the rule used
- Maintain strict JSON validity at all times`,
      },
    ];

    // Attach each diagram image inline for Gemini to see
    if (pageImages && pageImages.length > 0) {
      pageImages.forEach((img, idx) => {
        if (img.image_base64) {
          // ✅ Strip data URI prefix — Gemini inlineData needs raw base64 only
          let rawBase64 = img.image_base64;
          const commaIdx = rawBase64.indexOf(",");
          if (commaIdx !== -1) rawBase64 = rawBase64.substring(commaIdx + 1);
          rawBase64 = rawBase64.trim();

          if (!rawBase64 || rawBase64.length < 100) return; // skip corrupt/empty

          // Use detected mimeType from mistralOCRService, default to jpeg
          const mimeType = img.mimeType || "image/jpeg";

          parts.push({
            text: `Diagram image ${idx + 1} (ID: "${img.id}"):`,
          });
          parts.push({
            inlineData: {
              mimeType: mimeType,
              data: rawBase64,
            },
          });
        }
      });
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ role: "user", parts }],
        generationConfig: {
          temperature: 0.1,
          topP: 0.85,
          maxOutputTokens: 65536,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 180000,
      }
    );

    return response;
  });

  // ── Extract raw text from Gemini response ──────────────────────────────────
  const rawOutput =
    geminiRes?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!rawOutput || rawOutput.trim().length < 10) {
    if (!retryMode) {
      console.log(`🔄 Retrying page ${pageNumber} due to empty response...`);
      await delay(3000);
      return await processPageChunk(
        pageMarkdown,
        pageImages,
        pageNumber,
        bookMetadata,
        chunkIndex,
        true,
        subjectName
      );
    }
    throw new Error("EMPTY_RESPONSE_FROM_GEMINI");
  }

  // ── Clean JSON output ─────────────────────────────────────────────────────
  let cleanedOutput = rawOutput.trim();
  cleanedOutput = cleanedOutput.replace(/```json\s*/gi, "");
  cleanedOutput = cleanedOutput.replace(/```\s*/g, "");
  cleanedOutput = cleanedOutput.trim();

  // Strip unstable fields
  cleanedOutput = cleanedOutput.replace(/"key_terms"\s*:\s*\[[^\]]*\]\s*,?/gi, "");
  cleanedOutput = cleanedOutput.replace(/"simplified"\s*:\s*"[^"]*"\s*,?/gi, "");

  while (cleanedOutput.startsWith("`")) cleanedOutput = cleanedOutput.substring(1);
  while (cleanedOutput.endsWith("`")) cleanedOutput = cleanedOutput.substring(0, cleanedOutput.length - 1);
  cleanedOutput = cleanedOutput.trim();

  const jsonStart = cleanedOutput.indexOf("{");
  const jsonEnd = cleanedOutput.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleanedOutput = cleanedOutput.substring(jsonStart, jsonEnd + 1);
  }

  // ── Parse JSON ────────────────────────────────────────────────────────────
  try {
    if (cleanedOutput.includes('"error":"incomplete"')) {
      throw new Error("MODEL_RETURNED_INCOMPLETE_JSON");
    }

    function sanitizeJsonString(str) {
      // ✅ Full fix: handles LaTeX backslashes AND raw newlines/tabs inside JSON strings
      // Valid JSON escape sequences: \" \/ \\ \b \f \n \r \t \uXXXX
      // BUT: 'f' and 't' are intentionally EXCLUDED because LaTeX uses \frac, \theta,
      // \tau, \times, \text etc. If \f and \t are treated as valid JSON escapes,
      // JSON.parse converts them to form-feed (U+000C) and tab characters, corrupting
      // all LaTeX. Raw tabs are caught below by the ch==='\t' check instead.
      // Exclude ALL single-letter sequences that are valid JSON escapes BUT also
// appear as LaTeX command prefixes: \b (→ backspace), \n (→ \nabla, \nu),
// \r (→ \rho, \right, \rangle), \f (→ \frac), \t (→ \theta, \times).
// We only allow \\ (escaped backslash), \" (escaped quote), \/ (escaped slash),
// \uXXXX (unicode), and raw \n/\r/\t that appear OUTSIDE strings (handled below).
const VALID_ESCAPES = new Set(['"', '/', '\\', 'u']);
      let result = "";
      let inString = false;
      let i = 0;
      while (i < str.length) {
        const ch = str[i];
        // Handle escape sequences
        if (inString && ch === "\\") {
          const next = str[i + 1];
          if (next === undefined) {
            // Trailing backslash — escape it
            result += "\\\\";
            i++;
            continue;
          }
          if (VALID_ESCAPES.has(next)) {
            // Valid escape sequence — pass through as-is
            result += ch + next;
            i += 2;
            // Skip 4 hex digits for \uXXXX
            if (next === 'u') {
              result += str.substring(i, i + 4);
              i += 4;
            }
            continue;
          }
          // ✅ Invalid escape (e.g. \m in \mathrm, \f in \frac, \t in \times)
          // Double the backslash so JSON.parse sees \\ + letter = escaped backslash
          result += "\\\\" + next;
          i += 2;
          continue;
        }
        // Raw newline/CR/tab inside string — must be escaped
        if (inString && ch === "\n") { result += "\\n"; i++; continue; }
        if (inString && ch === "\r") { result += "\\n"; i++; continue; }
        if (inString && ch === "\t") { result += "\\t"; i++; continue; }
        // Track string boundaries
        if (ch === '"') inString = !inString;
        result += ch;
        i++;
      }
      return result;
    }


    let chunkData;

    // ✅ PRE-SANITIZE before first parse attempt
    // This fixes LaTeX backslashes (\mathrm, \frac etc.) and raw newlines
    // so the first JSON.parse attempt succeeds instead of always failing
    let preSanitized = cleanedOutput;
    try {
      preSanitized = sanitizeJsonString(cleanedOutput);
    } catch (preSanitizeErr) {
      // ignore — fall back to original
    }

    try {
      chunkData = JSON.parse(preSanitized);
    } catch (e) {
      console.log("🧠 JSON broken, trying auto-repair...");
      let fixed = preSanitized;

      fixed = fixed.replace(/,\s*}/g, "}");
      fixed = fixed.replace(/,\s*]/g, "]");

      const openBraces = (fixed.match(/{/g) || []).length;
      const closeBraces = (fixed.match(/}/g) || []).length;
      const openBrackets = (fixed.match(/\[/g) || []).length;
      const closeBrackets = (fixed.match(/]/g) || []).length;

      if (closeBraces < openBraces) fixed += "}".repeat(openBraces - closeBraces);
      if (closeBrackets < openBrackets) fixed += "]".repeat(openBrackets - closeBrackets);

      try {
        chunkData = JSON.parse(fixed);
        console.log("✅ JSON auto-repaired successfully!");
      } catch (e2) {
        console.log("❌ Auto-repair failed, retrying with simplified prompt...");
        throw new Error("RETRY_CHUNK");
      }
    }

      const restoreNewlines = (obj) => {
      if (typeof obj === 'string') return obj.replace(/\\n/g, '\n');
      if (Array.isArray(obj)) return obj.map(restoreNewlines);
      if (obj && typeof obj === 'object') {
        const out = {};
        for (const k of Object.keys(obj)) out[k] = restoreNewlines(obj[k]);
        return out;
      }
      return obj;
    };
    chunkData = restoreNewlines(chunkData);

    // Normalize subheading structure
    const mathsTypes = new Set([
      "definition", "theorem", "proof", "formula",
      "concept", "note", "activity", "topic_intro",
      "worked_example", "exercise", "summary_table",
      "diagram",   // ← new maths prompt type; image_url injected by injectImageUrls
      // English prompt types — pass through as-is
      "passage", "dialogue", "author_note", "question", "glossary",
    ]);
    chunkData.sections?.forEach((section, sectionIndex) => {
      section.content = section.content?.map((item, contentIndex) => {
        if (item.type === "subheading") {
          return {
            type: "subheading",
            subheading: item.subheading || item.text || "",
          };
        }

        // Maths-specific types — pass through as-is (image_url injected later)
        if (mathsTypes.has(item.type)) {
          return item;
        }

        // Add page metadata to diagram blocks (legacy types from general prompt)
        if (
          item.type === "diagram_concept" ||
          item.type === "diagram_reference"
        ) {
          return {
            ...item,
            page: section.page_range?.[0],
            segment_index: contentIndex,
          };
        }

        return item;
      });
    });

    // Fill missing diagram explanations (legacy diagram types only)
    chunkData.sections?.forEach((section) => {
      section.content?.forEach((item) => {
        if (item.type === "diagram_concept" && !item.explanation) {
          item.explanation =
            "This diagram illustrates an important concept related to the topic being discussed.";
        }
        if (item.type === "diagram_reference") {
          if (!item.explanation && item.note) {
            item.explanation = item.note;
            delete item.note;
          } else if (!item.explanation) {
            item.explanation =
              "This image supports the learning activity or observation task.";
          }
        }
      });
    });

    // Validate content
    const hasNoSections = !chunkData.sections || chunkData.sections.length === 0;
    const hasEmptyContent = chunkData.sections?.some(
      (s) => !s.content || s.content.length === 0
    );
    const totalSegments =
      chunkData.sections?.reduce(
        (sum, s) => sum + (s.content?.length || 0),
        0
      ) || 0;

    if (hasNoSections || hasEmptyContent || totalSegments === 0) {
      console.warn(`⚠️ Empty content detected for page ${pageNumber}`);

      if (!retryMode) {
        console.log(`🔄 Retrying page ${pageNumber} with strict requirements...`);
        await delay(3000);
        return await processPageChunk(
          pageMarkdown,
          pageImages,
          pageNumber,
          bookMetadata,
          chunkIndex,
          true,
          subjectName
        );
      }

      // Fallback content
      console.warn(`⚠️ Creating fallback content for page ${pageNumber}`);
      return [
        {
          heading: `Content from Page ${pageNumber}`,
          page_range: [pageNumber, pageNumber],
          content: [
            {
              type: "text",
              text:
                pageMarkdown.substring(0, 500).trim() ||
                "Page content available",
              explanation:
                "This page contains content that requires manual review.",
            },
          ],
        },
      ];
    }

    console.log(
      `✅ Chunk ${chunkIndex}: Processed ${
        chunkData.sections?.length || 0
      } sections (${totalSegments} segments)`
    );

    return chunkData.sections || [];
  } catch (parseError) {
    console.error(`❌ JSON Parse Error for chunk ${chunkIndex}:`, parseError.message);
    console.error("First 300 chars:", cleanedOutput?.substring(0, 300));
    throw new Error("INVALID_JSON_FROM_MODEL");
  }
}

// ─── Image URL Injection ──────────────────────────────────────────────────────

/**
 * Inject FTP image URLs into diagram blocks returned by Gemini.
 * Matches by mistral_image_id field that Gemini was instructed to include.
 * Falls back to positional matching if mistral_image_id is missing.
 *
 * @param {Array}  sections     - Gemini output sections[]
 * @param {object} imageUrlMap  - { "img-0.jpeg": "https://ftp.../page1-img-0.jpeg" }
 */
function injectImageUrls(sections, imageUrlMap) {
  if (!imageUrlMap || Object.keys(imageUrlMap).length === 0) return;

  const imageIds = Object.keys(imageUrlMap);
  let positionalIndex = 0;

  sections.forEach((section) => {
    section.content?.forEach((item) => {
      if (
        item.type === "diagram_concept" ||
        item.type === "diagram_reference" ||
        item.type === "diagram"
      ) {
        if (item.mistral_image_id && imageUrlMap[item.mistral_image_id]) {
          // ✅ Exact match by ID
          item.image_url = imageUrlMap[item.mistral_image_id];
        } else if (imageIds[positionalIndex]) {
          // ✅ Fallback: positional match
          item.image_url = imageUrlMap[imageIds[positionalIndex]];
          positionalIndex++;
        }

        // Keep mistral_image_id on the object — frontend normalizeMathsContent
        // reads it when mapping "diagram" → "diagram_concept"
        if (item.type !== "diagram") {
          delete item.mistral_image_id;
        }
      }
    });
  });
}

// ─── Main Processing Function ─────────────────────────────────────────────────

/**
 * Main entry point — processes a chapter PDF end-to-end.
 * Called from adminBookController.js exactly as before.
 *
 * @param {string} pdfPublicURL    - FTP URL of the chapter PDF
 * @param {number} bookId
 * @param {object} bookMetadata    - { board, class, subject, chapter_number, chapter_title, ... }
 * @param {object} dbConnection    - MySQL connection
 * @returns {Promise<object>}      - { success, pages_processed, total_segments, ... }
 */
async function processBookFromPDF(
  pdfPublicURL,
  bookId,
  bookMetadata,
  dbConnection
) {
  try {
    // ── Download PDF ─────────────────────────────────────────────────────────
    console.log("📥 Downloading PDF from FTP...");
    const pdfRes = await axios.get(pdfPublicURL, {
      responseType: "arraybuffer",
      timeout: 60000,
    });

    const pdfBuffer = Buffer.from(pdfRes.data);
    const sizeMB = pdfBuffer.length / (1024 * 1024);
    console.log(`📄 PDF size: ${sizeMB.toFixed(2)}MB`);

    if (sizeMB > 50) {
      throw new Error("PDF too large (>50MB). Please split into smaller files.");
    }

    // ── Get school/class/subject info for FTP paths ───────────────────────────
    const [schoolSubjectInfo] = await dbConnection.query(
      `SELECT sc.name as school_name, c.class_name, s.name as subject_name
       FROM books b
       JOIN subjects s ON b.subject_id = s.id
       JOIN classes c ON s.class_id = c.id
       JOIN schools sc ON c.school_id = sc.id
       WHERE b.id = ?`,
      [bookId]
    );

    const schoolName = schoolSubjectInfo[0]?.school_name || "Unknown";
    const classNum =
      schoolSubjectInfo[0]?.class_name?.match(/\d+/)?.[0] ||
      bookMetadata.class ||
      "1";
    const className = `Class ${classNum}`;
    const subjectNameForPath =
      schoolSubjectInfo[0]?.subject_name || bookMetadata.subject;
    const chapterNum = String(bookMetadata.chapter_number || 1).padStart(2, "0");
    const ftpBaseDir = `/books/${schoolName}/${className}/${subjectNameForPath}/ch${chapterNum}`;

    // Store in metadata for convenience
    bookMetadata.schoolName = schoolName;
    bookMetadata.className = className;
    bookMetadata.subjectNameForPath = subjectNameForPath;
    bookMetadata.chapterNum = chapterNum;

    checkMemory("after PDF download");

    // ── Mistral OCR ───────────────────────────────────────────────────────────
    console.log("\n🔍 Starting Mistral OCR...");
    const pdfBase64 = pdfBuffer.toString("base64");

    const ocrPages = await getOCRPages(
      pdfBase64,
      bookId,
      bookMetadata.chapter_number || 1,
      dbConnection
    );

    if (!ocrPages || ocrPages.length === 0) {
      throw new Error("Mistral OCR returned no pages");
    }

    const actualPages = ocrPages.length;
    console.log(`✅ OCR complete — ${actualPages} pages to process`);
    checkMemory("after OCR");

    // Free pdfBase64 from memory — no longer needed
    // (pdfBuffer is also no longer needed after this point)

    // ── Process pages sequentially ────────────────────────────────────────────
    const allSections = [];

    for (let i = 0; i < ocrPages.length; i++) {
      const page = ocrPages[i];
      const pageNumber = (page.index ?? i) + 1;
      const pageMarkdown = page.markdown || "";
      const pageImages = page.images || []; // [{ id, image_base64 }]

      console.log(
        `\n📖 Page ${pageNumber}/${actualPages} — ${pageImages.length} diagram(s)`
      );

      // ✅ ORDER: Gemini first (needs base64) → FTP upload → inject URLs

      // ── Step 1: Process page with Gemini (needs image_base64 intact) ────
      let sections = [];
      try {
        sections = await processPageChunk(
          pageMarkdown,
          pageImages, // base64 still intact here
          pageNumber,
          bookMetadata,
          i + 1,
          false,
          subjectNameForPath
        );
      } catch (pageError) {
        console.error(
          `❌ Failed to process page ${pageNumber}:`,
          pageError.message
        );

        // Retry logic (same as original)
        if (
          pageError.message === "RETRY_CHUNK" ||
          pageError.message === "INVALID_JSON_FROM_MODEL"
        ) {
          console.log(`🔁 Retrying page ${pageNumber} (attempt 2)...`);
          try {
            sections = await processPageChunk(
              pageMarkdown,
              pageImages,
              pageNumber,
              bookMetadata,
              i + 1,
              false,
              subjectNameForPath
            );
            console.log(`✅ Retry succeeded for page ${pageNumber}`);
          } catch (retry1Error) {
            console.error(`❌ Retry 2 failed:`, retry1Error.message);
            console.log(`🔁 Retrying page ${pageNumber} (attempt 3 - safe mode)...`);
            try {
              sections = await processPageChunk(
                pageMarkdown,
                pageImages,
                pageNumber,
                bookMetadata,
                i + 1,
                true, // safe mode
                subjectNameForPath
              );
              console.log(`✅ Safe-mode retry succeeded for page ${pageNumber}`);
            } catch (retry2Error) {
              // Create fallback content
              console.warn(
                `⚠️ All retries failed for page ${pageNumber} — using fallback`
              );
              sections = [
                {
                  heading: `Content from Page ${pageNumber}`,
                  page_range: [pageNumber, pageNumber],
                  content: [
                    {
                      type: "text",
                      text:
                        pageMarkdown.substring(0, 500).trim() ||
                        "Page content available",
                      explanation:
                        "This page requires manual review. Automated processing encountered difficulties.",
                    },
                  ],
                },
              ];
            }
          }
        } else {
          // Non-retryable error — use fallback
          sections = [
            {
              heading: `Content from Page ${pageNumber}`,
              page_range: [pageNumber, pageNumber],
              content: [
                {
                  type: "text",
                  text:
                    pageMarkdown.substring(0, 500).trim() ||
                    "Page content available",
                  explanation: "This page requires manual review.",
                },
              ],
            },
          ];
        }
      }

      // ── Step 2: Upload diagrams to FTP (after Gemini, frees base64) ────────
      const imageUrlMap = await uploadPageDiagrams(
        pageImages,
        pageNumber,
        bookId,
        bookMetadata.chapter_number || 1,
        ftpBaseDir,
        dbConnection
      );

      // ── Step 3: Inject FTP URLs into Gemini's diagram blocks ─────────────
      injectImageUrls(sections, imageUrlMap);

      allSections.push(...sections);

      // Let base64 data go out of scope for GC
      page.images = page.images?.map((img) => ({
        id: img.id,
        image_base64: null, // freed
      }));

      checkMemory(`after page ${pageNumber}`);

      // Rate limiting between pages
      if (i < ocrPages.length - 1) {
        console.log("⏳ Waiting 2s before next page...");
        await delay(2000);
      }
    }

    // ── Build final chapter JSON ──────────────────────────────────────────────
    const totalSegments = allSections.reduce(
      (sum, section) => sum + (section.content?.length || 0),
      0
    );

    console.log(`\n✅ All ${actualPages} pages processed`);
    console.log(`   Total sections: ${allSections.length}`);
    console.log(`   Total segments: ${totalSegments}`);

    const chapterData = {
      chapter_title:
        bookMetadata.chapter_title || bookMetadata.title || "Chapter 1",
      chapter_number: bookMetadata.chapter_number || 1,
      total_pages: actualPages,
      sections: allSections,
      key_concepts: [],
      summary: "Complete chapter processed in segments",
      metadata: {
        board: bookMetadata.board,
        class: bookMetadata.class,
        subject: bookMetadata.subject,
        author: bookMetadata.author,
        pages_processed: actualPages,
        total_segments: totalSegments,
        ocr_model: "mistral-ocr-latest",
        ai_model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      },
    };

    // ── Upload content.json to FTP ────────────────────────────────────────────
    const contentJsonBuffer = Buffer.from(JSON.stringify(chapterData, null, 2));
    console.log(`💾 Uploading content.json to FTP at ${ftpBaseDir}...`);
    const ftpResult = await uploadFileToFTP(
      contentJsonBuffer,
      "content.json",
      ftpBaseDir
    );

    // ── Upload segments.json to FTP (for highlight/navigation) ───────────────
    // With Mistral OCR we store page markdown as segments for navigation
    const segments = ocrPages.map((p, idx) => ({
      page: (p.index ?? idx) + 1,
      markdown: p.markdown || "",
      has_images: (p.images?.length || 0) > 0,
    }));

    const segmentsBuffer = Buffer.from(
      JSON.stringify({ segments }, null, 2)
    );
    const ftpSegResult = await uploadFileToFTP(
      segmentsBuffer,
      "segments.json",
      ftpBaseDir
    );

    // ── Save to DB ────────────────────────────────────────────────────────────
    console.log(`💾 Saving to database...`);

    const [existingChapter] = await dbConnection.query(
      `SELECT id FROM book_chapters WHERE book_id = ? AND chapter_no = ?`,
      [bookId, bookMetadata.chapter_number || 1]
    );

    if (existingChapter.length > 0) {
      await dbConnection.query(
        `UPDATE book_chapters 
         SET content_json_path = ?,
             segments_json_path = ?,
             total_segments = ?
         WHERE book_id = ? AND chapter_no = ?`,
        [
          ftpResult.url,
          ftpSegResult.url,
          totalSegments,
          bookId,
          bookMetadata.chapter_number || 1,
        ]
      );
    } else {
      await dbConnection.query(
        `INSERT INTO book_chapters
         (book_id, chapter_no, chapter_title, content_json_path, segments_json_path, total_segments)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          bookId,
          bookMetadata.chapter_number || 1,
          chapterData.chapter_title,
          ftpResult.url,
          ftpSegResult.url,
          totalSegments,
        ]
      );
    }

    console.log(`✅ Chapter ${bookMetadata.chapter_number} saved to DB`);
    console.log(`   Content JSON: ${ftpResult.url}`);

    return {
      success: true,
      chapters: 1,
      pages_processed: actualPages,
      total_segments: totalSegments,
      chapterData,
    };
  } catch (error) {
    console.error("❌ Book processing failed:", error.message);

    if (error.response?.status === 429) {
      throw new Error(
        "Rate limit exceeded. Check API billing/quota."
      );
    }
    if (error.response?.status === 403) {
      throw new Error("API access forbidden. Check API key.");
    }
    if (error.response?.status === 400) {
      throw new Error("Invalid request to API. Check PDF format.");
    }

    throw error;
  }
}

// ─── Backward-compatible helpers (unchanged) ──────────────────────────────────

function detectChapterBoundaries(pages) {
  const chapters = [];
  let currentChapter = null;
  let chapterNumber = 0;

  const chapterPatterns = [
    /^#+\s*(chapter|lesson|unit)\s*(\d+)/i,
    /^(chapter|lesson|unit)\s*(\d+)/i,
    /^(\d+)\.\s*(chapter|lesson|unit)/i,
  ];

  pages.forEach((page, pageIdx) => {
    const lines = page.markdown.split("\n");
    let foundChapter = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      for (const pattern of chapterPatterns) {
        const match = trimmedLine.match(pattern);
        if (match) {
          if (currentChapter) chapters.push(currentChapter);
          chapterNumber++;
          currentChapter = {
            chapter_no: chapterNumber,
            chapter_title: trimmedLine,
            start_page: pageIdx + 1,
            end_page: pageIdx + 1,
            pages: [],
          };
          foundChapter = true;
          break;
        }
      }
      if (foundChapter) break;
    }

    if (currentChapter) {
      currentChapter.end_page = pageIdx + 1;
      currentChapter.pages.push({
        page_number: pageIdx + 1,
        markdown: page.markdown,
      });
    } else if (chapters.length === 0) {
      if (!currentChapter) {
        currentChapter = {
          chapter_no: 1,
          chapter_title: "Introduction",
          start_page: 1,
          end_page: pageIdx + 1,
          pages: [],
        };
      }
      currentChapter.end_page = pageIdx + 1;
      currentChapter.pages.push({
        page_number: pageIdx + 1,
        markdown: page.markdown,
      });
    }
  });

  if (currentChapter) chapters.push(currentChapter);
  return chapters;
}

function structurePageContent(pageMarkdown, pageNumber) {
  const paragraphs = [];
  const lines = pageMarkdown.split("\n");
  let currentParagraph = [];
  let paragraphIndex = 0;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine === "") {
      if (currentParagraph.length > 0) {
        paragraphs.push({
          paragraph_id: `p${pageNumber}_${paragraphIndex + 1}`,
          text: currentParagraph.join(" ").trim(),
        });
        paragraphIndex++;
        currentParagraph = [];
      }
    } else {
      currentParagraph.push(trimmedLine);
    }
  });

  if (currentParagraph.length > 0) {
    paragraphs.push({
      paragraph_id: `p${pageNumber}_${paragraphIndex + 1}`,
      text: currentParagraph.join(" ").trim(),
    });
  }

  return paragraphs;
}

function createSemanticChunksFromStructure(
  structuredPages,
  minWords = 150,
  maxWords = 400
) {
  const chunks = [];
  let currentChunk = {
    paragraphs: [],
    text: "",
    page_numbers: [],
    paragraph_ids: [],
    wordCount: 0,
  };

  structuredPages.forEach((page) => {
    page.paragraphs.forEach((para) => {
      const words = para.text.split(/\s+/).filter((w) => w.length > 0);
      const paraWordCount = words.length;

      if (
        currentChunk.wordCount > 0 &&
        currentChunk.wordCount + paraWordCount > maxWords
      ) {
        if (currentChunk.wordCount >= minWords) {
          chunks.push({
            chunk_text: currentChunk.text.trim(),
            page_numbers: [...new Set(currentChunk.page_numbers)].sort(
              (a, b) => a - b
            ),
            paragraph_ids: [...currentChunk.paragraph_ids],
          });
        }
        currentChunk = {
          paragraphs: [],
          text: "",
          page_numbers: [],
          paragraph_ids: [],
          wordCount: 0,
        };
      }

      currentChunk.text += (currentChunk.text ? " " : "") + para.text;
      currentChunk.page_numbers.push(page.page_number);
      currentChunk.paragraph_ids.push(para.paragraph_id);
      currentChunk.wordCount += paraWordCount;
    });
  });

  if (currentChunk.wordCount >= minWords) {
    chunks.push({
      chunk_text: currentChunk.text.trim(),
      page_numbers: [...new Set(currentChunk.page_numbers)].sort(
        (a, b) => a - b
      ),
      paragraph_ids: [...currentChunk.paragraph_ids],
    });
  } else if (currentChunk.wordCount > 0 && chunks.length > 0) {
    const lastChunk = chunks[chunks.length - 1];
    lastChunk.chunk_text += " " + currentChunk.text;
    lastChunk.page_numbers = [
      ...new Set([...lastChunk.page_numbers, ...currentChunk.page_numbers]),
    ].sort((a, b) => a - b);
    lastChunk.paragraph_ids = [
      ...lastChunk.paragraph_ids,
      ...currentChunk.paragraph_ids,
    ];
  }

  return chunks;
}

module.exports = {
  generateEmbedding,
  processBookFromPDF,
  detectChapterBoundaries,
  structurePageContent,
  createSemanticChunksFromStructure,
};