function isComputerSubject(subjectName) {
  if (!subjectName) return false;
  return /computer|it|information technology|cs/i.test(subjectName);
}

function buildComputerPrompt(pageMarkdown, pageImages, pageNumber, bookMetadata, retryMode = false) {

  const imageList = (pageImages && pageImages.length > 0)
    ? pageImages.map((img, idx) => `  ${idx + 1}. id="${img.id}"`).join('\n')
    : null;

  const imageBlock = imageList
    ? `\nDIAGRAM IMAGES ON THIS PAGE:\n${imageList}\nFor every diagram, include "mistral_image_id".`
    : '\n(No diagram images on this page.)';

  return `${retryMode ? '🚨 RETRY MODE — MUST GENERATE CONTENT\n\n' : ''}

You are an expert Class ${bookMetadata.class} Computer Science / IT teacher.

Your job: Convert textbook OCR into **clear, structured, student-friendly learning blocks**.

GOLDEN RULE:
A student should understand concepts like SEO, HTML, keywords, etc. clearly — not just read definitions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE ${pageNumber} OCR TEXT:
"""
${pageMarkdown}
"""
${imageBlock}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

═══════════════════════════════════════
STEP 1: UNDERSTAND CONTENT TYPE
═══════════════════════════════════════
Identify what this page contains:
• Concepts (SEO, Keywords, Backlinks)
• Definitions
• Lists / bullet points
• Code (HTML examples)
• Steps / techniques
• Diagrams

═══════════════════════════════════════
STEP 2: LABEL BLOCKS
═══════════════════════════════════════

Use these labels:

[SUBHEADING]     → section titles
[CONCEPT]        → explanation text
[DEFINITION]     → formal definition
[LIST]           → bullet points
[CODE]           → HTML / code examples
[PROCESS]        → steps / procedures
[DIAGRAM]        → figures/images
[NOTE]           → important tips

═══════════════════════════════════════
STEP 3: CONVERT INTO JSON
═══════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━
[SUBHEADING]
━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "subheading",
  "subheading": "exact heading text"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━
[CONCEPT]
━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "concept",
  "heading": "Short title (e.g. 'What is SEO')",
  "text": "Exact book content (2–4 sentences)",
  "explanation": "Explain in simple terms: what it means, why it matters, real-life example (3–4 sentences)"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━
[DEFINITION]
━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "definition",
  "term": "Term name",
  "text": "Exact definition from book",
  "plain_english": "Simple explanation for Class ${bookMetadata.class}",
  "example": "Real-life example (1–2 sentences)",
  "memory_tip": "Easy way to remember"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━
[LIST → CONVERT TO MULTIPLE CONCEPT BLOCKS]
━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ DO NOT return "type": "list"

✅ Instead, convert EACH bullet into a separate concept block

Example:

{
  "type": "concept",
  "heading": "Point title (e.g. On-Page SEO)",
  "text": "Original point from book",
  "explanation": "Explain like a teacher: what it means, why it matters, and where it is used (2–4 sentences). Include real-world example."
}

RULES:
- Each bullet = ONE concept block
- Do NOT group into a list
- Keep flow like a teacher explaining step by step

━━━━━━━━━━━━━━━━━━━━━━━━━━
[PROCESS]
━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "process",
  "title": "Process name",
  "steps": [
    {
      "step_no": 1,
      "step": "Original step",
      "explanation": "Why this step is important"
    }
  ]
}

━━━━━━━━━━━━━━━━━━━━━━━━━━
[CODE → TEACH LIKE A LIVE CODING SESSION]
━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "type": "worked_example",
  "example_no": "Code Example",
  "problem": "What this code is trying to achieve",
  "what_this_tests": "What concept this code teaches (HTML structure / SEO tag / etc.)",

  "given": "The HTML/code snippet from the book",

  "method": "Why this code structure is used. What concept is applied here.",

  "steps": [
    {
      "step_no": 1,
      "narration": "Explain what the first part does",
      "working": "<tag or code line>",
      "result": "What happens because of this line"
    }
  ],

  "final_answer": "What the final output/result of this code is",
  "common_mistake": "Common mistake students make in this type of code"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━
[DIAGRAM]
━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "diagram_concept",
  "title": "Diagram name",
  "mistral_image_id": "img-0.jpeg",
  "explanation": "Explain what the diagram shows (3–4 sentences)"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━
[NOTE]
━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "note",
  "text": "Important note from book",
  "explanation": "Why this is important"
}

═══════════════════════════════════════
SPECIAL RULES FOR COMPUTER SUBJECT
═══════════════════════════════════════

✅ For SEO topics:
- Always explain with real-world examples (Google search, ranking, etc.)

✅ For HTML/code:
- DO NOT modify code
- Explain tags like <title>, <meta>, <img>, etc.

✅ For lists (like White Hat / Black Hat):
- Convert each bullet into explanation

✅ For keywords / SEO:
- Explain WHY it matters practically

═══════════════════════════════════════
OUTPUT FORMAT (STRICT JSON)
═══════════════════════════════════════

{
  "sections": [
    {
      "heading": "Main topic",
      "page_range": [${pageNumber}, ${pageNumber}],
      "content": []
    }
  ]
}

RULES:
- NEVER return empty content
- ALWAYS explain like a teacher
- Keep language simple for Class ${bookMetadata.class}
- Do NOT skip any content
- Maintain valid JSON ONLY
`;
}

module.exports = {
  isComputerSubject,
  buildComputerPrompt,
};