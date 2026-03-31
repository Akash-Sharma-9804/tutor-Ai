const axios = require("axios");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

exports.evaluateAnswer = async (question, correct, student) => {
  try {
    const prompt = `You are a strict but fair exam evaluator.

Question: ${question}

Correct Answer: ${correct}

Student Answer: ${student}

Evaluate based on:
- concept understanding
- correctness
- completeness

Do NOT require exact wording.

Respond in EXACT format:

Score: number between 0 and 1
Reason: short explanation

Example:
Score: 1
Reason: Fully correct answer

IMPORTANT:
- Do NOT return JSON
- Always return score`;

    const res = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 150,
        },
      }
    );

    const text =
      res.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!text || !text.trim()) {
      console.warn("⚠️ Empty AI response");
      return semanticFallback(correct, student);
    }

    // 🧹 Clean response
    const clean = text.trim();

    // ✅ SIMPLE SCORE EXTRACTION (NO JSON)
    const scoreMatch = clean.match(/score\s*:\s*([0-9.]+)/i);

    let score = scoreMatch ? parseFloat(scoreMatch[1]) : null;

    if (score === null || isNaN(score)) {
      console.warn("⚠️ AI score parse failed → fallback");
      return semanticFallback(correct, student);
    }

    return {
      score: Math.min(1, Math.max(0, score)),
      reason: clean.slice(0, 200),
    };

  } catch (err) {
    console.error("Gemini error:", err.response?.data || err.message);

    // 🔥 FINAL SAFETY
    return semanticFallback(correct, student);
  }
};



// 🧠 SMART FALLBACK (VERY IMPORTANT)
function semanticFallback(correct, student) {
  const normalize = (str) =>
    str.toLowerCase().replace(/[^a-z0-9 ]/g, "");

  const s1 = normalize(student);
  const s2 = normalize(correct);

  if (!s1 || !s2) {
    return { score: 0, reason: "No answer provided" };
  }

  const words1 = new Set(s1.split(" "));
  const words2 = new Set(s2.split(" "));

  const common = [...words1].filter((w) => words2.has(w)).length;
  const ratio = common / Math.max(words2.size, 1);

  let score = 0;

  if (ratio > 0.85) score = 1;
  else if (ratio > 0.6) score = 0.8;
  else if (ratio > 0.4) score = 0.6;
  else if (ratio > 0.2) score = 0.4;
  else score = 0.2;

  return {
    score,
    reason: "Semantic fallback evaluation",
  };
}