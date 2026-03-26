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
  return sections
    .flatMap((s) => s.content || [])
    .map((item) => {
      if (item.type === "text") return item.explanation || item.text;
      if (item.type === "example") return item.solution;
      if (item.type === "equation") return item.application || "";
      return "";
    })
    .join("\n");
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
fullText = fullText.slice(0, 20000); // instead of 92k → 20k

console.log("✂️ [Summary] Trimmed text length:", fullText.length);

  if (!fullText || fullText.length < 100) {
    throw new Error("Not enough content to summarize");
  }

  const chunks = splitText(fullText, 4000);
  console.log(`📦 [Summary] Total chunks: ${chunks.length}`);
const MAX_CHUNKS = 8;
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

Keep it concise (120-150 words).

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
- Keep summary between 400–500 words (NOT more)
- Keep key_points max 8
- Keep definitions max 5

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