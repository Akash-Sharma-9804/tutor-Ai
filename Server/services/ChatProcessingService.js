const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Rate limiting helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Convert PDF pages to images using pdfjs-dist
 */
async function convertPDFPagesToImages(pdfBuffer, maxPages = 15) {
  try {
    const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
    const { createCanvas } = require("canvas");

    console.log(`📄 Converting PDF to images...`);

    const pdfData = new Uint8Array(pdfBuffer);
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    
    const totalPages = Math.min(pdf.numPages, maxPages);
    
    console.log(`📄 PDF has ${pdf.numPages} pages, converting ${totalPages} to images...`);

    const pages = [];

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        console.log(`🖼️  Converting page ${pageNum}/${totalPages} to image...`);

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 });

        const canvas = createCanvas(viewport.width, viewport.height);
        const ctx = canvas.getContext("2d");

        await page.render({ 
          canvasContext: ctx, 
          viewport 
        }).promise;

        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        const base64Image = imageDataUrl.split(',')[1];

        pages.push({
          pageNumber: pageNum,
          imageData: base64Image,
          mimeType: 'image/jpeg'
        });

        console.log(`✅ Page ${pageNum} converted (${Math.round(base64Image.length / 1024)}KB)`);

      } catch (pageError) {
        console.error(`❌ Failed to convert page ${pageNum}:`, pageError.message);
        pages.push({
          pageNumber: pageNum,
          error: pageError.message,
          imageData: null
        });
      }
    }

    return pages;

  } catch (error) {
    console.error("❌ PDF to image conversion failed:", error.message);
    throw new Error(`Failed to convert PDF to images: ${error.message}`);
  }
}

/**
 * Parse Gemini streaming response
 */
function parseGeminiStreamChunk(chunk) {
  try {
    if (!chunk?.candidates?.[0]?.content?.parts) {
      return null;
    }

    const parts = chunk.candidates[0].content.parts;
    const text = parts.map(part => part.text || "").join("");
    
    return {
      text,
      finishReason: chunk.candidates[0].finishReason,
      done: chunk.candidates[0].finishReason === 'STOP'
    };
  } catch (error) {
    console.error("Error parsing stream chunk:", error);
    return null;
  }
}

/**
 * Process a single page with STREAMING via WebSocket
 * This sends chunks in real-time as they arrive from Gemini
 */
async function processSinglePageStreaming(
  pageData,
  previousPageData,
  studentClass,
  pageNumber,
  totalPages,
  io,
  roomName,
  fileType = 'image',
  mimeType = 'image/jpeg',
  userMessage = '' // Add userMessage parameter
) {
  try {
    console.log(`\n📄 Streaming page ${pageNumber}/${totalPages}...`);

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';

    // Build the prompt
    const isFirstPage = pageNumber === 1;
    const hasContext = previousPageData && !isFirstPage;

    // Add user's specific instructions if provided
    const userInstructions = userMessage && userMessage.trim() 
      ? `\n\n🎯 USER'S SPECIFIC REQUEST:\n"${userMessage}"\n\n⚠️ IMPORTANT: Follow the user's specific instructions above. If they ask for specific questions only, ONLY answer those questions. If they ask for a particular style or format, follow that exactly.\n\n`
      : '';

    const pagePrompt = `You are a warm, encouraging tutor helping a Class ${studentClass} student with their homework. Your goal is to teach, not just solve.
${userInstructions}
📚 PAGE CONTEXT:
${hasContext ? `- This is page ${pageNumber} of ${totalPages} in the document
- You are seeing BOTH page ${pageNumber - 1} (for context) AND page ${pageNumber} (current page)
- The previous page is shown first for reference in case questions continue across pages
- ONLY answer questions that appear on page ${pageNumber} (the second image)
- If a question on page ${pageNumber} seems incomplete, check the previous page for the beginning` : `- This is page ${pageNumber} of ${totalPages}`}

🎯 YOUR TASK:
1. Identify ALL questions/problems on ${hasContext ? 'the SECOND image (current page)' : 'this page'}
2. For each question, provide:
   - Step-by-step solution with clear explanations
    

📝 FORMATTING RULES:
- Use **bold** for question numbers and important terms
- Use proper markdown headers (##, ###) for organization
- For math: Use LaTeX notation
  * Inline math: $expression$
  * Block math: $$expression$$
- Example: "The formula is $F = ma$" or "$$\\frac{d}{dx}(x^2) = 2x$$"
- Break down complex steps
- Use bullet points for lists
- Add encouraging notes
- COMPLETE all solutions fully - do not truncate or cut off mid-explanation
- Ensure every problem has a complete answer with final result
🎓 TEACHING STYLE:
- Explain WHY, not just HOW
- Use simple language for Class ${studentClass}
- Provide memory tricks where helpful
- Encourage the student

${hasContext ? `⚠️ IMPORTANT: Focus ONLY on questions from the SECOND image. The first image is just for context if questions span pages.` : ''}

Now, help the student with ${hasContext ? 'page ' + pageNumber : 'this page'}:`;

    // Prepare images for the API call
    const imageParts = [];
    if (hasContext) {
      // Add previous page first (for context)
      imageParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: previousPageData
        }
      });
    }
    // Add current page
    imageParts.push({
      inlineData: {
        mimeType: mimeType,
        data: pageData
      }
    });

    // Emit page start event
    io.to(roomName).emit('page_start', {
      pageNumber,
      totalPages,
      status: 'processing'
    });

    // Make streaming API request to Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: pagePrompt },
            ...imageParts
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 16384,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      ]
    };

    const response = await axios.post(url, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'stream'
    });

    let accumulatedText = '';
    let buffer = '';

    // Process the streaming response
    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        try {
          buffer += chunk.toString();
          
          // Split by newlines to handle multiple SSE events
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              
              if (jsonStr === '[DONE]') {
                continue;
              }

              try {
                const parsed = JSON.parse(jsonStr);
                const chunkData = parseGeminiStreamChunk(parsed);

                if (chunkData && chunkData.text) {
                  accumulatedText += chunkData.text;
                  
                  // Emit chunk to WebSocket
                  io.to(roomName).emit('page_chunk', {
                    pageNumber,
                    chunk: chunkData.text,
                    accumulated: accumulatedText,
                    done: chunkData.done
                  });

                  // If done, resolve
                  if (chunkData.done) {
                    resolve({
                      success: true,
                      pageNumber,
                      response: accumulatedText,
                      model: modelName
                    });
                  }
                }
              } catch (parseError) {
                // Ignore parse errors for individual chunks
                console.warn('Failed to parse chunk:', parseError.message);
              }
            }
          }
        } catch (error) {
          console.error('Error processing chunk:', error);
        }
      });

      response.data.on('end', () => {
        if (accumulatedText) {
          // Emit completion
          io.to(roomName).emit('page_complete', {
            pageNumber,
            response: accumulatedText,
            success: true
          });

          resolve({
            success: true,
            pageNumber,
            response: accumulatedText,
            model: modelName
          });
        } else {
          reject(new Error('No content received from stream'));
        }
      });

      response.data.on('error', (error) => {
        console.error('Stream error:', error);
        reject(error);
      });
    });

  } catch (error) {
    console.error(`❌ Error streaming page ${pageNumber}:`, error.message);
    
    // Emit error to WebSocket
    io.to(roomName).emit('page_error', {
      pageNumber,
      error: error.message
    });

    throw error;
  }
}

/**
 * Process text query with streaming
 */
async function processTextQueryStreaming(userMessage, classNumber, io, roomName) {
  try {
    console.log("🤖 Streaming text query with Gemini AI...");

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
    });

    const prompt = `You are an expert AI tutor helping a Class ${classNumber} student. Your goal is to provide clear, educational, and helpful responses.

GUIDELINES:
- Provide step-by-step explanations for complex topics
- Use simple language appropriate for Class ${classNumber} students
- Include examples when relevant
- If it's a math problem, show the solution step-by-step
- If it's a concept, explain it clearly with real-world examples
- Be encouraging and supportive
- Use proper formatting with markdown (headers, bullet points, bold text)
- For formulas, use LaTeX notation with $ for inline math and $$ for block math

STUDENT'S QUESTION:
${userMessage}

YOUR RESPONSE:`;

    const result = await model.generateContentStream(prompt);

    let accumulatedText = '';

    // Emit start
    io.to(roomName).emit('stream_start', {
      status: 'streaming'
    });

    // Process stream
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      accumulatedText += chunkText;

      // Emit chunk
      io.to(roomName).emit('stream_chunk', {
        chunk: chunkText,
        accumulated: accumulatedText
      });
    }

    // Emit completion
    io.to(roomName).emit('stream_complete', {
      response: accumulatedText,
      success: true
    });

    console.log("✅ Streaming completed");

    return {
      response: accumulatedText,
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
    };

  } catch (error) {
    console.error("❌ Error streaming text query:", error);
    
    io.to(roomName).emit('stream_error', {
      error: error.message
    });

    throw new Error(`AI processing failed: ${error.message}`);
  }
}

/**
 * Process file (image/PDF) with WebSocket streaming
 */
async function processFileWithStreaming(
  fileBuffer,
  fileType,
  studentClass,
  io,
  chatId,
  userMessage = ''
) {
  try {
    const roomName = `chat_${chatId}`;
    
    console.log(`🚀 Starting streaming file processing for chat ${chatId}`);

    // Emit processing start
    io.to(roomName).emit('processing_start', {
      chatId,
      fileType,
      message: userMessage,
      status: 'starting'
    });

    if (fileType === 'pdf') {
      // Convert PDF to images
      const MAX_PAGES = 15;
      
      io.to(roomName).emit('conversion_start', {
        message: 'Converting PDF to images...'
      });

      const pages = await convertPDFPagesToImages(fileBuffer, MAX_PAGES);
      const actualPages = Math.min(pages.length, MAX_PAGES);

      io.to(roomName).emit('conversion_complete', {
        totalPages: actualPages,
        message: `Processing ${actualPages} pages...`
      });

      const pageResults = [];
      let combinedResponse = '';

      // Add greeting for first page
      const greetingMessage = actualPages > 1 
        ? `Hello there! 👋 It's great that you're working on these problems. I'll help you understand each one step-by-step. We'll go through all ${actualPages} pages together. Don't worry if some questions seem difficult - I'll explain the concepts clearly!\n\n`
        : `Hello there! 👋 It's great that you're working on these problems. I'll help you understand each one step-by-step. Don't worry if any questions seem difficult - I'll explain the concepts clearly!\n\n`;

      combinedResponse = greetingMessage;

      // Process each page with streaming
      for (let i = 0; i < actualPages; i++) {
        const page = pages[i];
        
        if (!page.imageData) {
          console.warn(`⚠️  Skipping page ${page.pageNumber} - conversion failed`);
          
          const errorMsg = `\n${'='.repeat(80)}\n📄 PAGE ${page.pageNumber} - CONVERSION ERROR\n${'='.repeat(80)}\n\nCould not convert page ${page.pageNumber} to image.\n\n`;
          combinedResponse += errorMsg;
          
          io.to(roomName).emit('page_skip', {
            pageNumber: page.pageNumber,
            error: page.error || 'Conversion failed'
          });
          
          continue;
        }

        try {
          // Add page header
          const pageHeader = `\n${'='.repeat(80)}\n📄 PAGE ${page.pageNumber}\n${'='.repeat(80)}\n\n`;
          combinedResponse += pageHeader;

          io.to(roomName).emit('page_header', {
            pageNumber: page.pageNumber,
            header: pageHeader
          });

          let result;
          if (i === 0) {
            // First page - no context
            result = await processSinglePageStreaming(
              page.imageData,
              null,
              studentClass,
              page.pageNumber,
              actualPages,
              io,
              roomName,
              'pdf',
              page.mimeType,
              userMessage // Pass userMessage to AI
            );
          } else {
            // Subsequent pages - include previous page for context
            const previousPage = pages[i - 1];
            result = await processSinglePageStreaming(
              page.imageData,
              previousPage.imageData || null,
              studentClass,
              page.pageNumber,
              actualPages,
              io,
              roomName,
              'pdf',
              page.mimeType,
              userMessage // Pass userMessage to AI
            );
          }

          combinedResponse += result.response + '\n\n';
          pageResults.push(result);

          // Small delay between pages
          if (i < actualPages - 1) {
            await delay(1000);
          }

        } catch (error) {
          console.error(`❌ Failed to process page ${page.pageNumber}:`, error.message);
          
          const errorMsg = `\n${'='.repeat(80)}\n📄 PAGE ${page.pageNumber} - PROCESSING ERROR\n${'='.repeat(80)}\n\nUnable to process this page.\n\n**Error:** ${error.message}\n\n`;
          combinedResponse += errorMsg;

          io.to(roomName).emit('page_error', {
            pageNumber: page.pageNumber,
            error: error.message
          });
        }
      }

      // If user added a message with the file
      let finalResponse = combinedResponse;
      // No need to prepend "Regarding your question" - it's already in the AI's prompt

      // Emit final completion
      io.to(roomName).emit('processing_complete', {
        chatId,
        response: finalResponse,
        pagesProcessed: actualPages,
        success: true
      });

      return {
        success: true,
        response: finalResponse,
        pages_processed: actualPages
      };

    } else {
      // Single image processing with streaming
      console.log(`🖼️ Processing image with streaming...`);

      const base64Data = fileBuffer.toString("base64");

      const greetingMessage = `Hello there! 👋 It's great that you're working on these problems. I'll help you understand each one step-by-step. Don't worry if any questions seem difficult - I'll explain the concepts clearly!\n\n`;

      const result = await processSinglePageStreaming(
        base64Data,
        null,
        studentClass,
        1,
        1,
        io,
        roomName,
        'image',
        'image/jpeg',
        userMessage // Pass userMessage to AI
      );

      let finalResponse = greetingMessage + result.response;
      // No need to prepend "Regarding your question" - it's already in the AI's prompt

      io.to(roomName).emit('processing_complete', {
        chatId,
        response: finalResponse,
        pagesProcessed: 1,
        success: true
      });

      return {
        success: true,
        response: finalResponse,
        pages_processed: 1
      };
    }

  } catch (error) {
    console.error("❌ File processing failed:", error.message);

    io.to(`chat_${chatId}`).emit('processing_error', {
      chatId,
      error: error.message
    });

    throw error;
  }
}

/**
 * Process text query (non-streaming version for compatibility)
 */
const processTextQuery = async (userMessage, classNumber = "10") => {
  try {
    console.log("🤖 Processing text query with Gemini AI...");

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
    });

    const prompt = `You are an expert AI tutor helping a Class ${classNumber} student. Your goal is to provide clear, educational, and helpful responses.

GUIDELINES:
- Provide step-by-step explanations for complex topics
- Use simple language appropriate for Class ${classNumber} students
- Include examples when relevant
- If it's a math problem, show the solution step-by-step
- If it's a concept, explain it clearly with real-world examples
- Be encouraging and supportive
- Use proper formatting with markdown (headers, bullet points, bold text)
- For formulas, use LaTeX notation with $ for inline math and $$ for block math

STUDENT'S QUESTION:
${userMessage}

YOUR RESPONSE:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const aiResponse = response.text();

    console.log("✅ AI response generated successfully");

    return {
      response: aiResponse,
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
    };

  } catch (error) {
    console.error("❌ Error processing text query:", error);
    throw new Error(`AI processing failed: ${error.message}`);
  }
};

module.exports = {
  processTextQuery,
  processTextQueryStreaming,
  processFileWithStreaming,
  convertPDFPagesToImages,
};