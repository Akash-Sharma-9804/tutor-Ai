const axios = require("axios");
const { pushEmbeddingToQdrant } = require("./qdrantService");




const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMBEDDING_MODEL = "text-embedding-3-small";

/* Your reusable embedding function */
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
 * Split raw OCR text into chapters using common patterns
 */
function splitIntoChapters(text) {
  return text.split(/(?:chapter|lesson|unit|CHAPTER|LESSON|UNIT)\s*\d+/).filter(Boolean);
}

/**
 * Create semantic chunks only inside a chapter
 * Ensures no cross-chapter mixing
 */
function createSemanticChunks(chapterText, minWords = 120, maxWords = 350) {
  const words = chapterText.split(/\s+/);
  const chunks = [];
  let buffer = [];

  for (const word of words) {
    buffer.push(word);
    const length = buffer.join(" ").split(/\s+/).length;
    if (length >= maxWords) {
      chunks.push(buffer.join(" "));
      buffer = [];
    }
  }

  if (buffer.length >= minWords) {
    chunks.push(buffer.join(" "));
  } else if (buffer.length > 0 && chunks.length > 0) {
    chunks[chunks.length - 1] += " " + buffer.join(" ");
  }

  return chunks;
}

/**
 * Process PDF → Extract text → Split chapters → Chunk → Embed → Store vectors
 * This file is reusable and scalable
 */
async function processBookFromPDF(pdfPublicURL, bookId) {
  try {
    // OCR using Mistral API
    const ocrRes = await axios.post(`${process.env.MISTRAL_OCR_URL}`, {
      document: pdfPublicURL
    }, {
      headers: { Authorization: `Bearer ${process.env.MISTRAL_API_KEY}` }
    });

    const extractedText = ocrRes.data.text;
    const chapters = splitIntoChapters(extractedText);

    // Process each chapter separately
    for (let i = 0; i < chapters.length; i++) {
      const chapterText = chapters[i].trim();
      const chunks = createSemanticChunks(chapterText);

      for (let c = 0; c < chunks.length; c++) {
        const chunkText = chunks[c];

        // Generate embedding using your OpenAI function
        const embedding = await generateEmbedding(chunkText);

        // Push vector to Qdrant DB (only references, not full text)
      await pushEmbeddingToQdrant(embedding, {
  book_id: bookId,
  chapter_no: i + 1,
  chunk_no: c + 1,
  chunk_id: `${bookId}-ch${i+1}-chunk${c+1}`,
  approx_page: c + 1
});

      }
    }

    return { success: true, chapters: chapters.length };

  } catch (error) {
    console.error("❌ Book processing failed:", error);
    throw error;
  }
}

module.exports = {
  splitIntoChapters,
  createSemanticChunks,
  generateEmbedding,
  processBookFromPDF
};
