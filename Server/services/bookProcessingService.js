const axios = require("axios");
const path = require("path");
const {
  pushEmbeddingToQdrant,
  ensureQdrantCollection,
} = require("./qdrantService");
const { uploadFileToFTP } = require("./uploadToFTP");

const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMBEDDING_MODEL = "text-embedding-3-small";

/**
 * Generate embedding for text
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
 * Detect chapters from OCR pages with better accuracy
 */
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
    const lines = page.markdown.split('\n');
    let foundChapter = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this line is a chapter heading
      for (const pattern of chapterPatterns) {
        const match = trimmedLine.match(pattern);
        if (match) {
          // Save previous chapter if exists
          if (currentChapter) {
            chapters.push(currentChapter);
          }

          chapterNumber++;
          currentChapter = {
            chapter_no: chapterNumber,
            chapter_title: trimmedLine,
            start_page: pageIdx + 1,
            end_page: pageIdx + 1,
            pages: []
          };
          foundChapter = true;
          break;
        }
      }
      
      if (foundChapter) break;
    }

    // Add page to current chapter
    if (currentChapter) {
      currentChapter.end_page = pageIdx + 1;
      currentChapter.pages.push({
        page_number: pageIdx + 1,
        markdown: page.markdown
      });
    } else if (chapters.length === 0) {
      // If no chapter found yet, create default chapter
      if (!currentChapter) {
        currentChapter = {
          chapter_no: 1,
          chapter_title: "Introduction",
          start_page: 1,
          end_page: pageIdx + 1,
          pages: []
        };
      }
      currentChapter.end_page = pageIdx + 1;
      currentChapter.pages.push({
        page_number: pageIdx + 1,
        markdown: page.markdown
      });
    }
  });

  // Push last chapter
  if (currentChapter) {
    chapters.push(currentChapter);
  }

  return chapters;
}

/**
 * Structure page content into paragraphs
 */
function structurePageContent(pageMarkdown, pageNumber) {
  const paragraphs = [];
  const lines = pageMarkdown.split('\n');
  let currentParagraph = [];
  let paragraphIndex = 0;

  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    if (trimmedLine === '') {
      // Empty line marks paragraph boundary
      if (currentParagraph.length > 0) {
        paragraphs.push({
          paragraph_id: `p${pageNumber}_${paragraphIndex + 1}`,
          text: currentParagraph.join(' ').trim()
        });
        paragraphIndex++;
        currentParagraph = [];
      }
    } else {
      currentParagraph.push(trimmedLine);
    }
  });

  // Push remaining paragraph
  if (currentParagraph.length > 0) {
    paragraphs.push({
      paragraph_id: `p${pageNumber}_${paragraphIndex + 1}`,
      text: currentParagraph.join(' ').trim()
    });
  }

  return paragraphs;
}

/**
 * Create semantic chunks from structured paragraphs with accurate page tracking
 */
function createSemanticChunksFromStructure(structuredPages, minWords = 150, maxWords = 400) {
  const chunks = [];
  let currentChunk = {
    paragraphs: [],
    text: '',
    page_numbers: [],
    paragraph_ids: [],
    wordCount: 0
  };

  structuredPages.forEach(page => {
    page.paragraphs.forEach(para => {
      const words = para.text.split(/\s+/).filter(w => w.length > 0);
      const paraWordCount = words.length;

      // If adding this paragraph exceeds maxWords, save current chunk
      if (currentChunk.wordCount > 0 && 
          currentChunk.wordCount + paraWordCount > maxWords) {
        
        if (currentChunk.wordCount >= minWords) {
          chunks.push({
            chunk_text: currentChunk.text.trim(),
            page_numbers: [...new Set(currentChunk.page_numbers)].sort((a, b) => a - b),
            paragraph_ids: [...currentChunk.paragraph_ids]
          });
        }

        // Start new chunk
        currentChunk = {
          paragraphs: [],
          text: '',
          page_numbers: [],
          paragraph_ids: [],
          wordCount: 0
        };
      }

      // Add paragraph to current chunk
      currentChunk.text += (currentChunk.text ? ' ' : '') + para.text;
      currentChunk.page_numbers.push(page.page_number);
      currentChunk.paragraph_ids.push(para.paragraph_id);
      currentChunk.wordCount += paraWordCount;
    });
  });

  // Push final chunk if it meets minimum word count
  if (currentChunk.wordCount >= minWords) {
    chunks.push({
      chunk_text: currentChunk.text.trim(),
      page_numbers: [...new Set(currentChunk.page_numbers)].sort((a, b) => a - b),
      paragraph_ids: [...currentChunk.paragraph_ids]
    });
  } else if (currentChunk.wordCount > 0 && chunks.length > 0) {
    // Merge with last chunk if too small
    const lastChunk = chunks[chunks.length - 1];
    lastChunk.chunk_text += ' ' + currentChunk.text;
    lastChunk.page_numbers = [...new Set([...lastChunk.page_numbers, ...currentChunk.page_numbers])].sort((a, b) => a - b);
    lastChunk.paragraph_ids = [...lastChunk.paragraph_ids, ...currentChunk.paragraph_ids];
  }

  return chunks;
}

/**
 * Main processing function with new architecture
 */
async function processBookFromPDF(pdfPublicURL, bookId, bookMetadata, dbConnection) {
  try {
    console.log("🔍 Ensuring Qdrant collection exists...");
    await ensureQdrantCollection();

    // Step 1: OCR with Mistral
    console.log("🔍 Sending PDF for OCR to Mistral...");
    const ocrRes = await axios.post(
      "https://api.mistral.ai/v1/ocr",
      {
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          document_url: pdfPublicURL,
        },
        include_image_base64: false,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const pages = ocrRes.data.pages || [];
    console.log("📄 Total pages received:", pages.length);

    // Step 2: Detect chapter boundaries
    console.log("📚 Detecting chapter boundaries...");
    const chapters = detectChapterBoundaries(pages);
    console.log(`✅ Found ${chapters.length} chapters`);

    // Step 3: Process each chapter
    for (const chapter of chapters) {
      const chapterNo = chapter.chapter_no;
      const chapterTitle = chapter.chapter_title;
      
      console.log(`\n📖 Processing Chapter ${chapterNo}: ${chapterTitle}`);
      console.log(`   Pages: ${chapter.start_page} - ${chapter.end_page}`);

      // Step 3a: Structure content (pages → paragraphs)
      const structuredPages = chapter.pages.map(page => ({
        page_number: page.page_number,
        paragraphs: structurePageContent(page.markdown, page.page_number)
      }));

      // Step 3b: Create chapter content JSON
      const chapterContent = {
        chapter_id: `${bookMetadata.board}_cls${bookMetadata.class}_${bookMetadata.subject}_ch${String(chapterNo).padStart(2, '0')}`,
        title: chapterTitle,
        pages: structuredPages
      };

      // Step 3c: Upload chapter content to FTP
      const contentJsonBuffer = Buffer.from(JSON.stringify(chapterContent, null, 2));
      const ftpPath = `/books/class${bookMetadata.class}/${bookMetadata.subject.toLowerCase()}/ch${String(chapterNo).padStart(2, '0')}`;
      
      console.log(`💾 Uploading chapter content JSON to FTP...`);
      const ftpResult = await uploadFileToFTP(
        contentJsonBuffer,
        'content.json',
        ftpPath
      );

      // Step 3d: Save chapter metadata to DB (no text content)
      console.log(`💾 Saving chapter metadata to database...`);
      await dbConnection.query(
        `INSERT INTO book_chapters 
         (book_id, chapter_no, chapter_title, content_json_path) 
         VALUES (?, ?, ?, ?)`,
        [bookId, chapterNo, chapterTitle, ftpResult.url]
      );

      // Step 4: Create semantic chunks
      console.log(`🧩 Creating semantic chunks...`);
      const chunks = createSemanticChunksFromStructure(structuredPages);
      console.log(`   Created ${chunks.length} chunks`);

      // Step 5: Generate embeddings and store in Qdrant
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkId = `chunk_${chapterContent.chapter_id}_${String(i + 1).padStart(3, '0')}`;

        console.log(`🧠 Chunk ${i + 1}/${chunks.length}: Pages [${chunk.page_numbers.join(', ')}], Paragraphs: ${chunk.paragraph_ids.length}`);

        // Generate embedding
        const embedding = await generateEmbedding(chunk.chunk_text);

        // Store in Qdrant with rich metadata
        await pushEmbeddingToQdrant(embedding, {
          chunk_id: chunkId,
          chapter_id: chapterContent.chapter_id,
          book_id: bookId,
          chapter_no: chapterNo,
          chunk_no: i + 1,
          page_numbers: chunk.page_numbers,
          paragraph_ids: chunk.paragraph_ids,
          chunk_text: chunk.chunk_text.substring(0, 500) // Store preview only
        });

        console.log(`✅ Stored: ${chunkId}`);
      }
    }

    return { 
      success: true, 
      chapters: chapters.length,
      total_pages: pages.length 
    };

  } catch (error) {
    console.error("❌ Book processing failed:", error);
    throw error;
  }
}

module.exports = {
  generateEmbedding,
  processBookFromPDF,
  detectChapterBoundaries,
  structurePageContent,
  createSemanticChunksFromStructure
};