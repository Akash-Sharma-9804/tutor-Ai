const db = require("../../models/db");
const axios = require("axios");
const {
  generateChapterSummaryFromSections,
} = require("../../services/chapterSummaryService");

// 🔹 Fetch content.json from FTP
const fetchContentJson = async (url) => {
  const res = await axios.get(url);
  return res.data;
};

// 🔹 Generate summary for ONE chapter
exports.generateSummaryForChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
console.log("📥 [Summary] API hit for chapter:", chapterId);
    const [rows] = await db.query(
      "SELECT * FROM book_chapters WHERE id = ?",
      [chapterId]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found",
      });
    }

    const chapter = rows[0];

    console.log(`[Summary] Fetching content_json: ${chapter.content_json_path}`);

    console.log("🌐 [Summary] Fetching content JSON...");

const contentJson = await fetchContentJson(chapter.content_json_path);

    const sections = contentJson.sections || [];

console.log("📄 [Summary] Sections count:", sections.length);

    console.log(`[Summary] Generating summary for chapter ${chapter.id}`);

    const summary = await generateChapterSummaryFromSections(sections);

    await db.query(
      "UPDATE book_chapters SET summary_json = ? WHERE id = ?",
      [JSON.stringify(summary), chapterId]
    );

    return res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("[Summary] Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔥 Generate summary for ALL chapters (VERY USEFUL)
exports.generateSummaryForAllChapters = async (req, res) => {
  try {
    const [chapters] = await db.query(
      "SELECT * FROM book_chapters WHERE content_json_path IS NOT NULL"
    );

    let successCount = 0;

    for (const chapter of chapters) {
      try {
        console.log(`[Summary] Processing chapter ${chapter.id}`);

        const contentJson = await fetchContentJson(chapter.content_json_path);

        const sections = contentJson.sections || [];

        const summary = await generateChapterSummaryFromSections(sections);

        await db.query(
          "UPDATE book_chapters SET summary_json = ? WHERE id = ?",
          [JSON.stringify(summary), chapter.id]
        );

        successCount++;

        // small delay (important)
        await new Promise((r) => setTimeout(r, 1500));
      } catch (err) {
        console.error(`❌ Failed chapter ${chapter.id}:`, err.message);
      }
    }

    return res.json({
      success: true,
      message: `Generated summaries for ${successCount} chapters`,
    });
  } catch (error) {
    console.error("[Summary ALL] Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};