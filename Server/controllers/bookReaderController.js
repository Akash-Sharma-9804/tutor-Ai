// bookReaderController.js
const db = require("../models/db");
const axios = require("axios");

/**
 * GET /api/books/subject/:subjectId
 * Get all books for a subject
 */
exports.getBooksBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    
    const [books] = await db.query(
      `SELECT 
        b.id,
        b.title,
        b.author,
        b.pdf_url,
        b.board,
        b.class_num,
        s.name as subject_name,
        COUNT(DISTINCT bc.id) as chapter_count
      FROM books b
      JOIN subjects s ON b.subject_id = s.id
      LEFT JOIN book_chapters bc ON b.id = bc.book_id
      WHERE b.subject_id = ?
      GROUP BY b.id
      ORDER BY b.created_at DESC`,
      [subjectId]
    );

    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};


exports.getAllBooks = async (req, res) => {
  try {
    const [rows] = await db.query(  
        `select id, title, pdf_url from books`
    );
    res.json(rows);
    } catch (err) {
    res.status(500).json({ message: "Failed to fetch books" });
  } 
};
/**
 * GET /api/books/:bookId/chapters
 * Get table of contents (all chapters) for a book
 */
exports.getBookChapters = async (req, res) => {
  try {
    const { bookId } = req.params;
    
    // Get book info
    const [bookRows] = await db.query(
      `SELECT b.*, s.name as subject_name
       FROM books b
       JOIN subjects s ON b.subject_id = s.id
       WHERE b.id = ?`,
      [bookId]
    );
    
    if (bookRows.length === 0) {
      return res.status(404).json({ message: "Book not found" });
    }
    
    // Get all chapters
    const [chapters] = await db.query(
      `SELECT 
        id,
        chapter_no,
        chapter_title,
        content_json_path,
        created_at
      FROM book_chapters
      WHERE book_id = ?
      ORDER BY chapter_no ASC`,
      [bookId]
    );

    res.json({
      book: bookRows[0],
      chapters: chapters
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch chapters" });
  }
};

/**
 * GET /api/books/chapters/:chapterId/content
 * Get full chapter content from FTP JSON
 */
exports.getChapterContent = async (req, res) => {
  try {
    const { chapterId } = req.params;
    
    // Get chapter metadata
    const [chapterRows] = await db.query(
  `SELECT 
    bc.*,
    bc.chapter_no as chapter_no,
    bc.content_json_path,
    bc.segments_json_path,
    b.title as book_title,
    b.pdf_url,
    b.board,
    b.class_num,
    s.name as subject_name
  FROM book_chapters bc
  JOIN books b ON bc.book_id = b.id
  JOIN subjects s ON b.subject_id = s.id
  WHERE bc.id = ?`,
  [chapterId]
);

    
    if (chapterRows.length === 0) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    
    const chapter = chapterRows[0];
    
    // Validate content_json_path
    if (!chapter.content_json_path || chapter.content_json_path === "null") {
      console.error("❌ No chapter JSON path found in DB for chapter ID:", chapterId);
      return res.status(400).json({ message: "Chapter content URL is missing or invalid" });
    }

    console.log("📥 Fetching chapter content from:", chapter.content_json_path);

    // Fetch content from FTP/external URL
    const contentRes = await axios.get(chapter.content_json_path);
const content = contentRes.data;

let segments = [];
if (chapter.segments_json_path && chapter.segments_json_path !== "null") {
  console.log("📥 Fetching segments from:", chapter.segments_json_path);
  const segmentsRes = await axios.get(chapter.segments_json_path);
  segments = segmentsRes.data.segments || [];
}

    
    // Get previous and next chapter for navigation
    const [prevChapter] = await db.query(
      `SELECT id, chapter_no, chapter_title 
       FROM book_chapters 
       WHERE book_id = ? AND chapter_no < ? 
       ORDER BY chapter_no DESC LIMIT 1`,
      [chapter.book_id, chapter.chapter_no]
    );
    
    const [nextChapter] = await db.query(
      `SELECT id, chapter_no, chapter_title 
       FROM book_chapters 
       WHERE book_id = ? AND chapter_no > ? 
       ORDER BY chapter_no ASC LIMIT 1`,
      [chapter.book_id, chapter.chapter_no]
    );

    res.json({
  chapter: {
    id: chapter.id,
    book_id: chapter.book_id,
    chapter_no: chapter.chapter_no,
    chapter_title: chapter.chapter_title,
    book_title: chapter.book_title,
    pdf_url: chapter.pdf_url,
    board: chapter.board,
    class_num: chapter.class_num,
    subject: chapter.subject_name
  },
  content,
  segments,

  navigation: {
    previous: prevChapter[0] || null,
    next: nextChapter[0] || null
  }
});

  } catch (err) {
    console.error("Failed to fetch chapter content:", err.message);
    res.status(500).json({ message: "Failed to fetch chapter content" });
  }
};

/**
 * POST /api/books/chapters/:chapterId/explain
 * Generate AI explanation for a paragraph or section
 */
exports.explainSection = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { paragraph_ids, question } = req.body;
    
    // Get chapter content
    const [chapterRows] = await db.query(
      `SELECT bc.*, b.title as book_title, b.board, b.class_num, s.name as subject_name
       FROM book_chapters bc
       JOIN books b ON bc.book_id = b.id
       JOIN subjects s ON b.subject_id = s.id
       WHERE bc.id = ?`,
      [chapterId]
    );
    
    if (chapterRows.length === 0) {
      return res.status(404).json({ message: "Chapter not found" });
    }
    
    const chapter = chapterRows[0];
    
    // Fetch full chapter content
    if (!chapter.content_json_path || chapter.content_json_path === "null") {
  return res.status(400).json({ message: "Chapter content URL is missing or invalid" });
}
const contentRes = await axios.get(chapter.content_json_path);
const chapterContent = contentRes.data;

    
    // Extract specific paragraphs if requested
    let relevantText = "";
    if (paragraph_ids && paragraph_ids.length > 0) {
      const paragraphs = chapterContent.pages
        .flatMap(page => page.paragraphs)
        .filter(p => paragraph_ids.includes(p.paragraph_id));
      relevantText = paragraphs.map(p => p.text).join("\n\n");
    } else {
      // Use entire chapter
      relevantText = chapterContent.pages
        .flatMap(page => page.paragraphs)
        .map(p => p.text)
        .join("\n\n");
    }
    
    // Generate explanation using Deepseek
    const geminiResponse = await axios.post(
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=" + process.env.GEMINI_API_KEY,
  {
    contents: [{
      role: "user",
      parts: [{
        text: `Explain this in a NEW and simple way like a teacher. Do not repeat old explanation:\n\n${relevantText}`
      }]
    }]
  }
);
const explanation = geminiResponse.data.candidates[0].content.parts[0].text;



    
    res.json({
      explanation,
      context: {
        chapter_title: chapter.chapter_title,
        paragraph_ids: paragraph_ids || []
      }
    });
    
  } catch (err) {
    console.error("Failed to generate explanation:", err);
    res.status(500).json({ message: "Failed to generate explanation" });
  }
};

/**
 * POST /api/books/chapters/:chapterId/tts
 * Convert text to speech using Deepgram
 */
exports.textToSpeech = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    // Clean text for better TTS
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/##/g, '')
      .replace(/^\* /gm, '')
      .replace(/^- /gm, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    
      
    // ✅ Validate API key BEFORE calling Deepgram
if (!process.env.DEEPGRAM_API_KEY) {
  console.error("❌ DEEPGRAM_API_KEY is missing in environment variables");
  return res.status(500).json({ message: "TTS service not configured" });
}

const response = await axios.post(
  "https://api.deepgram.com/v1/speak",
  {
    text: cleanText
  },
  {
    params: {
      model: "aura-2-mars-en"
    },
    headers: {
      Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
      Accept: "audio/mpeg",
      "Content-Type": "application/json"
    },
    responseType: "arraybuffer"
  }
);

    // Return audio as base64 for easier frontend handling
    const audioBase64 = Buffer.from(response.data).toString('base64');
    res.json({ 
      audio: audioBase64,
      mimeType: "audio/mpeg"
    });
    
  } catch (err) {
    console.error("TTS failed:", err);
    res.status(500).json({ message: "Text-to-speech conversion failed" });
  }
};

/**
 * POST /api/books/chapters/:chapterId/progress
 * Save reading progress
 */
exports.saveProgress = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { paragraph_id, page_number } = req.body;
    const userId = req.user.id; // From auth middleware
    
    await db.query(
      `INSERT INTO reading_progress 
       (user_id, chapter_id, paragraph_id, page_number, last_read_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE 
       paragraph_id = VALUES(paragraph_id),
       page_number = VALUES(page_number),
       last_read_at = NOW()`,
      [userId, chapterId, paragraph_id, page_number]
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save progress" });
  }
};

/**
 * GET /api/books/chapters/:chapterId/progress
 * Get user's reading progress for chapter
 */
exports.getProgress = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const userId = req.user.id;
    
    const [progress] = await db.query(
      `SELECT paragraph_id, page_number, last_read_at
       FROM reading_progress
       WHERE user_id = ? AND chapter_id = ?`,
      [userId, chapterId]
    );
    
    res.json(progress[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch progress" });
  }
};

/**
 * POST /api/books/chapters/:chapterId/explain-detailed
 * Generate detailed AI explanation for current segment
 */
exports.explainDetailed = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { text, context } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    // Get chapter info for additional context
    const [chapterRows] = await db.query(
      `SELECT bc.chapter_title, b.board, b.class_num, s.name as subject_name
       FROM book_chapters bc
       JOIN books b ON bc.book_id = b.id
       JOIN subjects s ON b.subject_id = s.id
       WHERE bc.id = ?`,
      [chapterId]
    );
    
    const chapter = chapterRows[0] || {};
    
    // Create comprehensive prompt for detailed explanation
    const prompt = `
You are a clear, engaging teacher helping a learner truly understand a concept.

**Context:** ${context || chapter.chapter_title || 'N/A'}

**Text to explain:**
"${text}"

Explain this in a way that builds REAL understanding, not memorization.

Guidelines:
- Keep the explanation concise but meaningful
- Use simple language without sounding childish
- Focus on the *idea behind the words*
- Use everyday examples only where they genuinely help
- Avoid greetings, role-play, or addressing a specific class or age

Structure the response naturally:
- Start with a short plain-language explanation of what the text is saying
- Explain the most important ideas one by one
- Clarify why this information matters in real life
- End with a short reflection or question that helps the learner think deeper

Do NOT repeat the text verbatim.
Do NOT use headings unless they add clarity.
`;

 const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }
    );

    const explanation = geminiResponse.data.candidates[0].content.parts[0].text;

    res.json({
      explanation,
      context: {
        chapter_title: chapter.chapter_title,
        subject: chapter.subject_name,
        class: chapter.class_num
      }
    });
    
  } catch (err) {
    console.error("Failed to generate detailed explanation:", err);
    res.status(500).json({ 
      message: "Failed to generate explanation",
      error: err.message 
    });
  }
};

module.exports = exports;