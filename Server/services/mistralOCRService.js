const axios = require("axios");
const { uploadFileToFTP } = require("./uploadToFTP");

const MISTRAL_OCR_MODEL = "mistral-ocr-latest";
const MISTRAL_OCR_URL = "https://api.mistral.ai/v1/ocr";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Check memory usage and warn if high
 */
function checkMemory(label = "") {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  if (used > 700) {
    console.warn(`⚠️ [Memory] ${label} — heap used: ${used.toFixed(0)}MB (HIGH)`);
  } else {
    console.log(`🧠 [Memory] ${label} — heap used: ${used.toFixed(0)}MB`);
  }
  return used;
}

// ─── Core OCR Call ────────────────────────────────────────────────────────────

/**
 * Call Mistral OCR API with a base64-encoded PDF.
 * Returns the full structured response with pages[] and images[].
 *
 * @param {string} pdfBase64 - Base64 encoded PDF
 * @returns {Promise<object>} - Mistral OCR response { pages: [...] }
 */
async function callMistralOCR(pdfBase64) {
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error("MISTRAL_API_KEY is not set in environment variables");
  }

  console.log("🔍 Calling Mistral OCR API...");
  checkMemory("before Mistral OCR call");

  const response = await axios.post(
    MISTRAL_OCR_URL,
    {
      model: MISTRAL_OCR_MODEL,
      document: {
        type: "document_url",
        document_url: `data:application/pdf;base64,${pdfBase64}`,
      },
      include_image_base64: true, // ← get actual diagram images
      extract_header: true,
      extract_footer: true,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      timeout: 180000, // 3 minutes — large PDFs can take time
      maxContentLength: 200 * 1024 * 1024, // 200MB response allowed
      maxBodyLength: 200 * 1024 * 1024,
    }
  );

  checkMemory("after Mistral OCR response received");

  const pages = response.data?.pages || [];
  console.log(`✅ Mistral OCR complete — ${pages.length} pages returned`);

  return response.data;
}

// ─── OCR Cache (DB) ───────────────────────────────────────────────────────────

/**
 * Check if OCR result already exists in DB for this chapter.
 * Returns parsed OCR data if found, null otherwise.
 *
 * @param {object} dbConnection
 * @param {number} bookId
 * @param {number} chapterNo
 * @returns {Promise<object|null>}
 */
async function getCachedOCR(dbConnection, bookId, chapterNo) {
  try {
    const [rows] = await dbConnection.query(
      `SELECT ocr_json, total_pages, ocr_model 
       FROM book_chapter_ocr 
       WHERE book_id = ? AND chapter_no = ?`,
      [bookId, chapterNo]
    );

    if (rows.length === 0) return null;

    console.log(
      `📦 Found cached OCR for book ${bookId} chapter ${chapterNo} (${rows[0].total_pages} pages, model: ${rows[0].ocr_model})`
    );

    return JSON.parse(rows[0].ocr_json);
  } catch (err) {
    console.warn("⚠️ Failed to read OCR cache:", err.message);
    return null;
  }
}

/**
 * Save OCR result to DB cache.
 *
 * @param {object} dbConnection
 * @param {number} bookId
 * @param {number} chapterNo
 * @param {object} ocrData - Full Mistral OCR response
 */
async function saveOCRCache(dbConnection, bookId, chapterNo, ocrData) {
  try {
    const totalPages = ocrData.pages?.length || 0;
    const ocrJson = JSON.stringify(ocrData);

    await dbConnection.query(
      `INSERT INTO book_chapter_ocr 
         (book_id, chapter_no, ocr_json, ocr_model, total_pages)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         ocr_json = VALUES(ocr_json),
         ocr_model = VALUES(ocr_model),
         total_pages = VALUES(total_pages),
         created_at = NOW()`,
      [bookId, chapterNo, ocrJson, MISTRAL_OCR_MODEL, totalPages]
    );

    console.log(
      `💾 OCR result cached in DB — book ${bookId} chapter ${chapterNo} (${totalPages} pages)`
    );
  } catch (err) {
    // Non-fatal — log and continue. Processing can still succeed.
    console.warn("⚠️ Failed to cache OCR result in DB:", err.message);
  }
}

// ─── Diagram Image Upload ─────────────────────────────────────────────────────

/**
 * Upload all diagram images from a single page to FTP.
 * Saves each image record to DB table book_chapter_diagrams.
 * Returns a map: { "img-0.jpeg": "https://ftp.../page1-img-0.jpeg", ... }
 *
 * @param {Array}  images      - page.images[] from Mistral OCR ({ id, image_base64 })
 * @param {number} pageNo      - 1-based page number
 * @param {number} bookId
 * @param {number} chapterNo
 * @param {string} ftpBaseDir  - FTP directory: /books/School/Class/Subject/ch01
 * @param {object} dbConnection
 * @returns {Promise<object>}  - imageUrlMap
 */
async function uploadPageDiagrams(
  images,
  pageNo,
  bookId,
  chapterNo,
  ftpBaseDir,
  dbConnection
) {
  const imageUrlMap = {};

  if (!images || images.length === 0) {
    return imageUrlMap;
  }

  const diagramsDir = `${ftpBaseDir}/diagrams`;
  console.log(
    `🖼  Uploading ${images.length} diagram(s) for page ${pageNo} to FTP...`
  );

  for (const image of images) {
    try {
      // ✅ Strip data URI prefix if present (e.g. "data:image/jpeg;base64,/9j/...")
      // Mistral sometimes returns full data URIs — Buffer.from needs raw base64 only
      let rawBase64 = image.image_base64 || "";
      const commaIdx = rawBase64.indexOf(",");
      if (commaIdx !== -1) {
        rawBase64 = rawBase64.substring(commaIdx + 1);
      }
      rawBase64 = rawBase64.trim();

      if (!rawBase64 || rawBase64.length < 100) {
        console.warn(`   ⚠️ Skipping image ${image.id} — base64 data is empty or too short`);
        continue;
      }

      // Detect actual image type from data URI or default to jpeg
      let mimeType = "image/jpeg";
      let fileExt = "jpeg";
      if (image.image_base64.startsWith("data:image/png")) {
        mimeType = "image/png";
        fileExt = "png";
      } else if (image.image_base64.startsWith("data:image/webp")) {
        mimeType = "image/webp";
        fileExt = "webp";
      }

      // Decode base64 → Buffer
      const imageBuffer = Buffer.from(rawBase64, "base64");

      // Store clean base64 + mimeType on image object for Gemini (called before this function)
      image.image_base64 = rawBase64;
      image.mimeType = mimeType;

      // Structured filename: page1-img-0.jpeg (use detected extension)
      const baseId = image.id.replace(/\.[^.]+$/, "");
      const fileName = `page${pageNo}-${baseId}.${fileExt}`;

      // Upload to FTP
      let ftpRes;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          ftpRes = await uploadFileToFTP(imageBuffer, fileName, diagramsDir);
          break;
        } catch (ftpErr) {
          if (attempt === 3) throw ftpErr;
          console.warn(
            `⚠️ FTP upload attempt ${attempt} failed for ${fileName}, retrying...`
          );
          await delay(2000 * attempt);
        }
      }

      // Save to DB
      await dbConnection.query(
        `INSERT INTO book_chapter_diagrams
           (book_id, chapter_no, page_no, mistral_image_id, ftp_url, ftp_path)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           ftp_url  = VALUES(ftp_url),
           ftp_path = VALUES(ftp_path)`,
        [
          bookId,
          chapterNo,
          pageNo,
          image.id,
          ftpRes.url,
          ftpRes.remotePath || ftpRes.path || "",
        ]
      );

      imageUrlMap[image.id] = ftpRes.url;

      // Free base64 after FTP upload — Gemini was already called before this
      image.image_base64 = null;

      console.log(`   ✅ ${fileName} → ${ftpRes.url}`);
    } catch (err) {
      console.error(
        `   ❌ Failed to upload diagram ${image.id} on page ${pageNo}:`,
        err.message
      );
      // Continue with other images even if one fails
    }
  }

  return imageUrlMap;
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Full OCR pipeline for one chapter:
 *  1. Check DB cache — if found, skip Mistral API call
 *  2. Call Mistral OCR on the PDF
 *  3. Save OCR JSON to DB cache
 *  4. Return pages[] ready for page-by-page Gemini processing
 *
 * @param {string} pdfBase64      - Base64 encoded PDF
 * @param {number} bookId
 * @param {number} chapterNo
 * @param {object} dbConnection
 * @param {boolean} forceRefresh  - Ignore cache and re-call Mistral
 * @returns {Promise<Array>}      - pages[] from Mistral OCR
 */
async function getOCRPages(
  pdfBase64,
  bookId,
  chapterNo,
  dbConnection,
  forceRefresh = false
) {
  // Check cache first (saves Mistral API cost + time on reprocess)
  if (!forceRefresh) {
    const cached = await getCachedOCR(dbConnection, bookId, chapterNo);
    if (cached) {
      console.log(
        `⚡ Using cached OCR — skipping Mistral API call (book ${bookId} ch ${chapterNo})`
      );
      return cached.pages || [];
    }
  }

  // Call Mistral OCR
  const ocrData = await callMistralOCR(pdfBase64);

  // Save to DB cache (non-blocking — don't await, let it save in background)
  saveOCRCache(dbConnection, bookId, chapterNo, ocrData).catch((err) =>
    console.warn("⚠️ OCR cache save failed (non-fatal):", err.message)
  );

  return ocrData.pages || [];
}

module.exports = {
  getOCRPages,
  uploadPageDiagrams,
  getCachedOCR,
  saveOCRCache,
  callMistralOCR,
  checkMemory,
};