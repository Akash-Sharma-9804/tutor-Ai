const axios = require("axios");

// 🔹 Call Gemini (reuse your existing if available)
const callGemini = async (prompt) => {
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
    }
  );

  return res.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

// 🔹 Extract clean text from sections
const extractTextFromSections = (sections) => {
  let texts = [];

  for (const section of sections) {
    for (const item of section.content || []) {

      // ✅ English passages
      if (item.type === "passage") {
        if (item.text) texts.push(item.text);
        if (item.explanation) texts.push(item.explanation);
      }

      // ✅ Normal text (Physics, etc.)
      else if (item.type === "text") {
        if (item.text) texts.push(item.text);
        if (item.explanation) texts.push(item.explanation);
      }

      // ✅ Examples (very important)
      else if (item.type === "example") {
        if (item.problem) texts.push(item.problem);
        if (item.solution) texts.push(item.solution);
      }

      // ✅ Equations (concept + application)
      else if (item.type === "equation") {
        if (item.explanation) texts.push(item.explanation);
        if (item.application) texts.push(item.application);
      }

      // ✅ Diagrams (concept explanation)
      else if (item.type === "diagram_concept") {
        if (item.explanation) texts.push(item.explanation);
      }

      // ❌ Skip: glossary, question, subheading
      // 🔥 NEW UNIVERSAL SUPPORT (ADDED — DOES NOT BREAK OLD)

// concept / topic_intro / note
if (item.type === "concept" || item.type === "topic_intro" || item.type === "note") {
  if (item.heading) texts.push(item.heading);
  if (item.title) texts.push(item.title);
  if (item.text) texts.push(item.text);
  if (item.explanation) texts.push(item.explanation);
}

// 🔥 derivation / proof (VERY IMPORTANT for Physics)
if (item.type === "derivation" || item.type === "proof") {
  if (item.proving) texts.push(item.proving);
  if (item.setup) texts.push(item.setup);
  if (item.conclusion) texts.push(item.conclusion);
  if (item.key_insight) texts.push(item.key_insight);

  if (Array.isArray(item.steps)) {
    for (const step of item.steps) {
      if (step.statement) texts.push(step.statement);
      if (step.reason) texts.push(step.reason);
    }
  }
}

// 🔥 formulas
if (item.type === "formula") {
  if (item.name) texts.push(item.name);
  if (item.formula_latex) texts.push(item.formula_latex);
  if (item.when_to_use) texts.push(item.when_to_use);
  if (item.common_mistake) texts.push(item.common_mistake);
}

// 🔥 definitions
if (item.type === "definition") {
  if (item.term) texts.push(item.term);
  if (item.text) texts.push(item.text);
  if (item.plain_english) texts.push(item.plain_english);
}

// 🔥 diagrams
if (item.type === "diagram") {
  if (item.title) texts.push(item.title);
  if (item.what_to_look_at) texts.push(item.what_to_look_at);
  if (item.observation) texts.push(item.observation);
}

// 🔥 activity / questions (optional but useful for context)
if (item.type === "activity") {
  if (item.text) texts.push(item.text);
  if (item.explanation) texts.push(item.explanation);
}
    }
  }

  return texts.join("\n");
};

// 🔹 Chunking
const splitText = (text, size = 2000) => {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
};

// 🔹 Main function
const generateChapterSummaryFromSections = async (sections) => {
  console.log("📘 [Summary] Starting summary generation...");

  let fullText = extractTextFromSections(sections);

// 🔥 LIMIT TEXT SIZE (VERY IMPORTANT)
fullText = fullText.slice(0, 60000);// instead of 92k → 20k

console.log("✂️ [Summary] Trimmed text length:", fullText.length);

  if (!fullText || fullText.length < 50) {
  console.warn("⚠️ Low content, generating minimal summary...");
  return {
    summary: fullText || "Limited content available for this chapter.",
    key_points: [],
    definitions: [],
    formulas: []
  };
}

  const chunks = splitText(fullText, 3000);
  console.log(`📦 [Summary] Total chunks: ${chunks.length}`);
const MAX_CHUNKS = 20;
const finalChunks = chunks.slice(0, MAX_CHUNKS);

console.log(`📦 [Summary] Using ${finalChunks.length} chunks (limited)`); 
  const partialSummaries = [];

  // 🔹 Step 1: summarize each chunk
  for (let i = 0; i < finalChunks.length; i++) {
    console.log(`🧠 [Summary] Processing chunk ${i + 1}/${chunks.length}`);

    const prompt = `
Summarize this part of a chapter.

Focus on:
- Key concepts
- Important ideas
- Definitions if present

Make it detailed and informative (200-300 words).
Include examples, concepts, and important explanations.

CONTENT:
${finalChunks[i]}
`;

    try {
      const res = await callGemini(prompt);
      console.log(`✅ [Summary] Chunk ${i + 1} summarized`);

      partialSummaries.push(res);
    } catch (err) {
      console.error(`❌ [Summary] Chunk ${i + 1} failed:`, err.message);
    }
  }

  console.log("🔗 [Summary] Merging partial summaries...");

  // 🔹 Step 2: final merge
 const finalPrompt = `
You are an expert teacher.

Combine these summaries into ONE structured chapter summary.

STRICT RULES:
- Return ONLY valid JSON (no markdown, no explanation)
- Do NOT cut the response midway
- Ensure JSON is COMPLETE and properly closed
- Keep summary between 700–800 words
- Keep key_points max 12
- Keep definitions max 8
- Include formulas if present
 

FORMAT:
{
  "summary": "...",
  "key_points": ["..."],
  "definitions": [
    { "term": "...", "definition": "..." }
  ],
  "formulas": ["..."]
}

IMPORTANT:
If response is getting too long, SHORTEN the summary but NEVER break JSON.

SUMMARIES:
${partialSummaries.slice(0, 6).join("\n")}
`;

  let raw;
  let attempts = 0;
  let parsed = null;

  while (!parsed && attempts < 3) {
    attempts++;
    console.log(`🔁 [Summary] Final merge attempt ${attempts}`);

    try {
      raw = await callGemini(finalPrompt);

      console.log("📥 [Summary] Raw Gemini response length:", raw.length);

      // 🔹 Clean
      raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");

      if (start !== -1 && end !== -1) {
        raw = raw.slice(start, end + 1);
      }

      parsed = JSON.parse(raw);

      console.log("✅ [Summary] JSON parsed successfully");
    } catch (err) {
      console.error("❌ [Summary] JSON parse failed:", err.message);

      if (attempts === 3) {
        console.error("🔥 [Summary] Final RAW response:");
        console.error(raw);

        console.error("⚠️ Falling back to safe summary");

return {
  summary: partialSummaries.join("\n").slice(0, 1200),
  key_points: [],
  definitions: [],
  formulas: []
};
      }
    }
  }

  console.log("🎉 [Summary] Summary generation completed");

  return parsed;
};

module.exports = {
  generateChapterSummaryFromSections,
};