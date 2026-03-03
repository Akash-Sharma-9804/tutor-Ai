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

    // Count actual readable segments from content (what student navigates through)
    // These match the page0_seg0, page0_seg1... IDs saved in reading_progress_segments
    let readableSegmentCount = 0;
    if (content?.sections) {
      content.sections.forEach((section, pageIdx) => {
        if (Array.isArray(section.content)) {
          readableSegmentCount += section.content.length;
        }
      });
    }

    // Always sync total_segments from content (source of truth)
    if (readableSegmentCount > 0 && chapter.total_segments !== readableSegmentCount) {
      await db.query(
        `UPDATE book_chapters SET total_segments = ? WHERE id = ?`,
        [readableSegmentCount, chapterId]
      );
      chapter.total_segments = readableSegmentCount;
    }

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
    const { paragraph_id, page_number, segment_id, time_spent_seconds, completed } = req.body;
    const userId = req.studentId; // From auth middleware
    
    // Save to reading_progress (bookmark/last position)
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

    // Also save segment-level progress if segment_id provided
    if (segment_id !== undefined && segment_id !== null) {
      await db.query(
        `INSERT INTO reading_progress_segments
         (user_id, chapter_id, segment_id, page_number, completed, time_spent_seconds)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         completed = GREATEST(completed, VALUES(completed)),
         time_spent_seconds = time_spent_seconds + VALUES(time_spent_seconds),
         last_read_at = NOW()`,
        [userId, chapterId, segment_id, page_number || 1, completed ? 1 : 0, time_spent_seconds || 0]
      );
    }

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
    const userId = req.studentId;

    // Get last position
    const [progress] = await db.query(
      `SELECT paragraph_id, page_number, last_read_at
       FROM reading_progress
       WHERE user_id = ? AND chapter_id = ?`,
      [userId, chapterId]
    );

    // Get per-segment completion
    const [segments] = await db.query(
      `SELECT segment_id, page_number, completed, time_spent_seconds
       FROM reading_progress_segments
       WHERE user_id = ? AND chapter_id = ?`,
      [userId, chapterId]
    );

    const completedSegments = segments.filter(s => s.completed).map(s => s.segment_id);
    const totalTimeSeconds = segments.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0);

    res.json({
      lastPosition: progress[0] || null,   // has paragraph_id field
      completedSegments,
      totalSegments: segments.length,
      totalTimeSeconds,
      hasProgress: !!progress[0],
    });
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

/**
 * GET /api/books/:bookId/progress-summary
 * Get per-chapter completion % for a book (used on Dashboard)
 */
exports.getBookProgressSummary = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.studentId;

    // Get all chapters with their total_segments count stored on the chapter row
    const [chapters] = await db.query(
      `SELECT id, chapter_no, chapter_title, total_segments
       FROM book_chapters WHERE book_id = ? ORDER BY chapter_no ASC`,
      [bookId]
    );

    if (chapters.length === 0) return res.json({ chapters: [], overallPercent: 0 });

    const chapterIds = chapters.map(c => c.id);
    const placeholders = chapterIds.map(() => '?').join(',');

    // Only get THIS student's completed segments
    const [completedCounts] = await db.query(
      `SELECT chapter_id, COUNT(DISTINCT segment_id) as completed
       FROM reading_progress_segments
       WHERE user_id = ? AND chapter_id IN (${placeholders}) AND completed = 1
       GROUP BY chapter_id`,
      [userId, ...chapterIds]
    );

    const completedMap = Object.fromEntries(
      completedCounts.map(r => [r.chapter_id, r.completed])
    );

    const chaptersWithProgress = chapters.map(ch => {
      const total = ch.total_segments || 0;
      const done = completedMap[ch.id] || 0;
      const percent = total > 0 ? Math.round((done / total) * 100) : 0;
      return {
        id: ch.id,
        chapter_no: ch.chapter_no,
        chapter_title: ch.chapter_title,
        completedSegments: done,
        totalSegments: total,
        percent
      };
    });

    // Only count chapters that have segments for overall %
    const chaptersWithContent = chaptersWithProgress.filter(c => c.totalSegments > 0);
    const overallPercent = chaptersWithContent.length > 0
      ? Math.round(chaptersWithProgress.reduce((s, c) => s + c.percent, 0) / chaptersWithProgress.length)
      : 0;

    res.json({ chapters: chaptersWithProgress, overallPercent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch progress summary" });
  }
};

/**
 * POST /api/books/chapters/:chapterId/backfill-segments
 * One-time call to populate total_segments from segments JSON
 */
exports.backfillSegmentCount = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const [rows] = await db.query(
      `SELECT content_json_path FROM book_chapters WHERE id = ?`, [chapterId]
    );
    if (!rows[0]?.content_json_path) return res.json({ skipped: true, reason: "no content_json_path" });

    const contentRes = await axios.get(rows[0].content_json_path);
    const content = contentRes.data;

    // Count readable segments (matches page0_seg0 naming used in progress tracking)
    let count = 0;
    if (content?.sections) {
      content.sections.forEach(section => {
        if (Array.isArray(section.content)) count += section.content.length;
      });
    }

    await db.query(
      `UPDATE book_chapters SET total_segments = ? WHERE id = ?`, [count, chapterId]
    );
    res.json({ chapterId, total_segments: count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.backfillAllSegments = async (req, res) => {
  try {
    const { bookId } = req.params;
    const [chapters] = await db.query(
      `SELECT id, content_json_path FROM book_chapters WHERE book_id = ?`,
      [bookId]
    );

    const results = [];
    for (const ch of chapters) {
      try {
        if (!ch.content_json_path) {
          results.push({ id: ch.id, skipped: true, reason: "no content_json_path" });
          continue;
        }
        const contentRes = await axios.get(ch.content_json_path);
        const content = contentRes.data;
        let count = 0;
        if (content?.sections) {
          content.sections.forEach(section => {
            if (Array.isArray(section.content)) count += section.content.length;
          });
        }
        // Force update always, regardless of existing value
        await db.query(
          `UPDATE book_chapters SET total_segments = ? WHERE id = ?`,
          [count, ch.id]
        );
        results.push({ id: ch.id, old_total: ch.total_segments, new_total: count });
      } catch (err) {
        results.push({ id: ch.id, error: err.message });
      }
    }

    res.json({ bookId, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = exports;