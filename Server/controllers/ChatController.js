const db = require("../models/db");
const axios = require("axios");
const { 
  processTextQuery, 
  processTextQueryStreaming,
  processFileWithStreaming 
} = require("../services/ChatProcessingService");

/**
 * Send a chat message to AI tutor (WITH WEBSOCKET STREAMING)
 * POST /api/chat/message
 */
const sendChatMessage = async (req, res) => {
  try {
    const { student_id, message, conversation_id } = req.body;
    const file = req.file;

    // Validation
    if (!student_id) {
      return res.status(400).json({
        success: false,
        message: "student_id is required",
      });
    }

    if ((!message || !message.trim()) && !file) {
      return res.status(400).json({
        success: false,
        message: "message or file is required",
      });
    }

    console.log(`💬 Processing ${file ? 'file' : 'text'} message from student ${student_id}`);

    // Get student info
    const [studentInfo] = await db.executeQuery(
      "SELECT school_id, class_id FROM students WHERE id = ?",
      [student_id]
    );

    if (!studentInfo || studentInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const { school_id, class_id } = studentInfo[0];

    // Get or create conversation
   // Get or create conversation - reuse blank conversation if exists
    let finalConversationId = conversation_id;
    if (!finalConversationId) {
      // Check if there's a blank conversation (no messages)
      const [existingBlankConv] = await db.executeQuery(
        `SELECT c.id 
         FROM chat_conversations c
         LEFT JOIN chat_messages m ON c.id = m.conversation_id
         WHERE c.student_id = ?
         GROUP BY c.id
         HAVING COUNT(m.id) = 0
         ORDER BY c.created_at DESC
         LIMIT 1`,
        [student_id]
      );

      if (existingBlankConv && existingBlankConv.length > 0) {
        // Reuse the blank conversation
        finalConversationId = existingBlankConv[0].id;
        console.log(`♻️ Reusing blank conversation: ${finalConversationId}`);
      } else {
        // Create new conversation only if no blank exists
        const [convResult] = await db.executeQuery(
          `INSERT INTO chat_conversations (student_id, school_id, class_id, title) VALUES (?, ?, ?, 'New Chat')`,
          [student_id, school_id, class_id]
        );
        finalConversationId = convResult.insertId;
        console.log(`✨ Created new conversation: ${finalConversationId}`);
      }
    }

    // Get class number
    const [classInfo] = await db.executeQuery(
      "SELECT class_name FROM classes WHERE id = ?",
      [class_id]
    );

    let classNumber = "10";
    if (classInfo && classInfo.length > 0) {
      const className = classInfo[0].class_name;
      classNumber = className.match(/\d+/)?.[0] || "10";
    }

    // Get conversation history
    const [history] = await db.executeQuery(
      `SELECT user_message, ai_response 
       FROM chat_messages 
       WHERE conversation_id = ? AND processing_status = 'completed'
       ORDER BY created_at DESC LIMIT 10`,
      [finalConversationId]
    );

    const conversationHistory = history.reverse().map(msg => ({
      user: msg.user_message,
      assistant: msg.ai_response
    }));

    let messageType = 'text';
    let fileUrl = null;
    let fileName = null;
    let fileType = null;
    let fileSizeKb = null;
    let userMessage = message || '';

    // Handle file upload
    if (file) {
      messageType = 'file';
      fileName = file.originalname;
      fileType = file.originalname.split('.').pop().toLowerCase();
      fileSizeKb = Math.round(file.size / 1024);

      // Upload to FTP
      const { uploadFileToFTP } = require("../services/uploadToFTP");
      const ftpResult = await uploadFileToFTP(
        file.buffer,
        file.originalname,
        "/books/chat-uploads"
      );

      if (ftpResult.success) {
        fileUrl = ftpResult.url;
      }

      if (!userMessage.trim()) {
        userMessage = `I uploaded a file: ${fileName}`;
      } else {
        userMessage = `${message} [File: ${fileName}]`;
      }
    }

    // Save chat message to database
    const [insertResult] = await db.executeQuery(
      `INSERT INTO chat_messages 
       (conversation_id, student_id, school_id, class_id, user_message, message_type, 
        file_url, file_name, file_type, file_size_kb, processing_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'processing')`,
      [finalConversationId, student_id, school_id, class_id, userMessage, 
       messageType, fileUrl, fileName, fileType, fileSizeKb]
    );

    const chatId = insertResult.insertId;
    console.log(`🆔 Chat message created with ID: ${chatId}`);

    // Update conversation's last_message_at
    await db.executeQuery(
      "UPDATE chat_conversations SET last_message_at = NOW() WHERE id = ?",
      [finalConversationId]
    );

    // Get WebSocket io instance
    const io = req.app.get('io');
    const roomName = `chat_${chatId}`;

    // Return immediately with chat_id so client can join room
    res.status(200).json({
      success: true,
      message: "Message received. Connect to WebSocket for real-time updates.",
      data: {
        chat_id: chatId,
        conversation_id: finalConversationId,
        status: "processing",
        message_type: messageType,
        websocket_room: roomName,
      },
    });

    // Process in background with WebSocket streaming
    if (messageType === 'file') {
      // File processing with streaming
      processFileWithStreaming(
        file.buffer,
        fileType,
        classNumber,
        io,
        chatId,
        message
      )
        .then(async (aiResult) => {
          // Update database with final response
          await db.executeQuery(
            `UPDATE chat_messages 
             SET ai_response = ?, processing_status = 'completed', processed_at = NOW() 
             WHERE id = ?`,
            [aiResult.response, chatId]
          );
          console.log(`✅ File processed and saved for ID: ${chatId}`);
        })
        .catch(async (aiError) => {
          console.error("❌ File processing failed:", aiError.message);
          await db.executeQuery(
            `UPDATE chat_messages 
             SET processing_status = 'failed', error_message = ?, processed_at = NOW() 
             WHERE id = ?`,
            [aiError.message, chatId]
          );
        });
    } else {
      // Text processing with streaming
      let contextualMessage = userMessage;
      if (conversationHistory.length > 0) {
        let historyText = "Previous conversation:\n";
        conversationHistory.forEach(h => {
          historyText += `Student: ${h.user}\nAssistant: ${h.assistant}\n\n`;
        });
        contextualMessage = historyText + `Current question: ${userMessage}`;
      }

      processTextQueryStreaming(contextualMessage, classNumber, io, roomName)
        .then(async (aiResult) => {
          await db.executeQuery(
            `UPDATE chat_messages 
             SET ai_response = ?, processing_status = 'completed', processed_at = NOW() 
             WHERE id = ?`,
            [aiResult.response, chatId]
          );
          console.log(`✅ Text processed and saved for ID: ${chatId}`);
        })
        .catch(async (aiError) => {
          console.error("❌ Text processing failed:", aiError.message);
          await db.executeQuery(
            `UPDATE chat_messages 
             SET processing_status = 'failed', error_message = ?, processed_at = NOW() 
             WHERE id = ?`,
            [aiError.message, chatId]
          );
        });
    }

  } catch (error) {
    console.error("❌ Send chat message error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process chat message",
    });
  }
};

/**
 * Get chat message details including AI response
 * GET /api/chat/:chat_id
 */
const getChatMessage = async (req, res) => {
  try {
    const { chat_id } = req.params;

    if (!chat_id) {
      return res.status(400).json({
        success: false,
        message: "chat_id is required",
      });
    }

    const [messages] = await db.executeQuery(
      `SELECT 
         cm.*,
         c.class_name,
         st.name as student_name
       FROM chat_messages cm
       LEFT JOIN classes c ON cm.class_id = c.id
       LEFT JOIN students st ON cm.student_id = st.id
       WHERE cm.id = ?`,
      [chat_id]
    );

    if (!messages || messages.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Chat message not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: messages[0],
    });
  } catch (error) {
    console.error("❌ Get chat message error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve chat message",
    });
  }
};

/**
 * Get chat history for a student
 * GET /api/chat/history/:student_id
 */
const getChatHistory = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    if (!student_id) {
      return res.status(400).json({
        success: false,
        message: "student_id is required",
      });
    }

    const [messages] = await db.executeQuery(
      `SELECT 
         cm.*,
         c.class_name
       FROM chat_messages cm
       LEFT JOIN classes c ON cm.class_id = c.id
       WHERE cm.student_id = ?
       ORDER BY cm.created_at DESC
       LIMIT ? OFFSET ?`,
      [student_id, parseInt(limit), parseInt(offset)]
    );

    const [countResult] = await db.executeQuery(
      "SELECT COUNT(*) as total FROM chat_messages WHERE student_id = ?",
      [student_id]
    );

    return res.status(200).json({
      success: true,
      data: {
        messages,
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error("❌ Get chat history error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve chat history",
    });
  }
};

/**
 * Create a new conversation
 * POST /api/chat/conversation/new
 */
const createNewConversation = async (req, res) => {
  try {
    const { student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({
        success: false,
        message: "student_id is required",
      });
    }

    // Get student info
    const [studentInfo] = await db.executeQuery(
      "SELECT school_id, class_id FROM students WHERE id = ?",
      [student_id]
    );

    if (!studentInfo || studentInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const { school_id, class_id } = studentInfo[0];

    const [result] = await db.executeQuery(
      `INSERT INTO chat_conversations (student_id, school_id, class_id, title) 
       VALUES (?, ?, ?, 'New Chat')`,
      [student_id, school_id, class_id]
    );

    return res.status(201).json({
      success: true,
      message: "Conversation created successfully",
      data: {
        conversation_id: result.insertId,
      },
    });
  } catch (error) {
    console.error("❌ Create conversation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create conversation",
    });
  }
};

/**
 * Get all conversations for a student
 * GET /api/chat/conversations/:student_id
 */
const getConversations = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    if (!student_id) {
      return res.status(400).json({
        success: false,
        message: "student_id is required",
      });
    }

    const [conversations] = await db.executeQuery(
      `SELECT 
         c.id,
         c.title,
         c.created_at,
         c.last_message_at,
         (SELECT COUNT(*) FROM chat_messages WHERE conversation_id = c.id) as message_count,
         (SELECT user_message FROM chat_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
       FROM chat_conversations c
       WHERE c.student_id = ?
       ORDER BY c.last_message_at DESC
       LIMIT ? OFFSET ?`,
      [student_id, parseInt(limit), parseInt(offset)]
    );

    const [countResult] = await db.executeQuery(
      "SELECT COUNT(*) as total FROM chat_conversations WHERE student_id = ?",
      [student_id]
    );

    return res.status(200).json({
      success: true,
      data: {
        conversations,
        total: countResult[0].total,
      },
    });
  } catch (error) {
    console.error("❌ Get conversations error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve conversations",
    });
  }
};

/**
 * Get messages for a specific conversation
 * GET /api/chat/conversation/:conversation_id/messages
 */
const getConversationMessages = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!conversation_id) {
      return res.status(400).json({
        success: false,
        message: "conversation_id is required",
      });
    }

    const [messages] = await db.executeQuery(
      `SELECT 
         id,
         user_message,
         ai_response,
         message_type,
         file_url,
         file_name,
         file_type,
         processing_status,
         created_at,
         processed_at
       FROM chat_messages
       WHERE conversation_id = ?
       ORDER BY created_at ASC
       LIMIT ? OFFSET ?`,
      [conversation_id, parseInt(limit), parseInt(offset)]
    );

    return res.status(200).json({
      success: true,
      data: {
        messages,
        conversation_id,
      },
    });
  } catch (error) {
    console.error("❌ Get conversation messages error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve messages",
    });
  }
};

/**
 * Stream chat response (SSE fallback - not needed with WebSocket but kept for compatibility)
 * GET /api/chat/stream/:chat_id
 */
const streamChatResponse = async (req, res) => {
  try {
    const { chat_id } = req.params;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const interval = setInterval(async () => {
      try {
        const [messages] = await db.executeQuery(
          'SELECT ai_response, processing_status FROM chat_messages WHERE id = ?',
          [chat_id]
        );

        if (messages && messages.length > 0) {
          const msg = messages[0];
          
          if (msg.processing_status === 'completed') {
            res.write(`data: ${JSON.stringify({ 
              status: 'completed', 
              response: msg.ai_response 
            })}\n\n`);
            clearInterval(interval);
            res.end();
          } else if (msg.processing_status === 'failed') {
            res.write(`data: ${JSON.stringify({ 
              status: 'failed', 
              error: 'Processing failed' 
            })}\n\n`);
            clearInterval(interval);
            res.end();
          } else {
            res.write(`data: ${JSON.stringify({ 
              status: 'processing' 
            })}\n\n`);
          }
        }
      } catch (error) {
        console.error('Stream error:', error);
        clearInterval(interval);
        res.end();
      }
    }, 1000);

    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });

  } catch (error) {
    console.error('Stream chat response error:', error);
    res.status(500).json({ success: false, message: 'Failed to stream response' });
  }
};

/**
 * Delete a conversation
 * DELETE /api/chat/conversation/:conversation_id
 */
const deleteConversation = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    const { student_id } = req.body;

    if (!conversation_id || !student_id) {
      return res.status(400).json({
        success: false,
        message: "conversation_id and student_id are required",
      });
    }

    // Verify ownership
    const [conv] = await db.executeQuery(
      "SELECT id FROM chat_conversations WHERE id = ? AND student_id = ?",
      [conversation_id, student_id]
    );

    if (!conv || conv.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or unauthorized",
      });
    }

    // Delete all messages first (foreign key constraint)
    await db.executeQuery(
      "DELETE FROM chat_messages WHERE conversation_id = ?",
      [conversation_id]
    );

    // Delete conversation
    await db.executeQuery(
      "DELETE FROM chat_conversations WHERE id = ?",
      [conversation_id]
    );

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete conversation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete conversation",
    });
  }
};

/**
 * Rename a conversation
 * PUT /api/chat/conversation/:conversation_id
 */
const renameConversation = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    const { student_id, title } = req.body;

    if (!conversation_id || !student_id || !title) {
      return res.status(400).json({
        success: false,
        message: "conversation_id, student_id, and title are required",
      });
    }

    // Verify ownership
    const [conv] = await db.executeQuery(
      "SELECT id FROM chat_conversations WHERE id = ? AND student_id = ?",
      [conversation_id, student_id]
    );

    if (!conv || conv.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found or unauthorized",
      });
    }

    await db.executeQuery(
      "UPDATE chat_conversations SET title = ? WHERE id = ?",
      [title, conversation_id]
    );

    return res.status(200).json({
      success: true,
      message: "Conversation renamed successfully",
      data: { conversation_id, title },
    });
  } catch (error) {
    console.error("❌ Rename conversation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to rename conversation",
    });
  }
};

/**
 * Text-to-speech conversion for chat messages with chunking for long text
 * POST /api/chat/tts
 */
const textToSpeech = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false,
        message: "Text is required" 
      });
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
    
    // Validate API key BEFORE calling Deepgram
    if (!process.env.DEEPGRAM_API_KEY) {
      console.error("❌ DEEPGRAM_API_KEY is missing in environment variables");
      return res.status(500).json({ 
        success: false,
        message: "TTS service not configured" 
      });
    }

    // Deepgram has a character limit (~2000 chars), so we need to chunk long text
    const MAX_CHUNK_LENGTH = 1800; // Safe limit below 2000
    const chunks = [];
    
    if (cleanText.length <= MAX_CHUNK_LENGTH) {
      // Text is short enough, send as single chunk
      chunks.push(cleanText);
    } else {
      // Split text into sentences
      const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
      let currentChunk = '';
      
      for (const sentence of sentences) {
        // If single sentence is too long, split by commas
        if (sentence.length > MAX_CHUNK_LENGTH) {
          const parts = sentence.split(/,\s+/);
          for (const part of parts) {
            if ((currentChunk + part).length > MAX_CHUNK_LENGTH) {
              if (currentChunk) chunks.push(currentChunk.trim());
              currentChunk = part;
            } else {
              currentChunk += (currentChunk ? ', ' : '') + part;
            }
          }
        } else {
          // Normal sentence handling
          if ((currentChunk + sentence).length > MAX_CHUNK_LENGTH) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
          } else {
            currentChunk += ' ' + sentence;
          }
        }
      }
      
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
    }

    console.log(`🎵 Processing ${chunks.length} TTS chunk(s)`);

    // Process each chunk and collect audio buffers
    const audioBuffers = [];
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`🎤 Processing chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`);
      
      try {
        const response = await axios.post(
          "https://api.deepgram.com/v1/speak",
          {
            text: chunks[i]
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
        
        audioBuffers.push(Buffer.from(response.data));
        
        // Small delay to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (chunkError) {
        console.error(`❌ Failed to process chunk ${i + 1}:`, chunkError.message);
        throw new Error(`Failed to process audio chunk ${i + 1}`);
      }
    }

    // Combine all audio buffers
    const combinedBuffer = Buffer.concat(audioBuffers);
    const audioBase64 = combinedBuffer.toString('base64');
    
    console.log(`✅ Successfully generated ${audioBuffers.length} audio chunk(s), total size: ${combinedBuffer.length} bytes`);

    res.json({ 
      success: true,
      audio: audioBase64,
      mimeType: "audio/mpeg",
      chunks: chunks.length
    });
    
  } catch (err) {
    console.error("❌ TTS failed:", err);
    res.status(500).json({ 
      success: false,
      message: "Text-to-speech conversion failed",
      error: err.message
    });
  }
};

module.exports = {
  sendChatMessage,
  getChatMessage,
  getChatHistory,
  createNewConversation,
  getConversations,
  getConversationMessages,
  streamChatResponse,
  deleteConversation,
  renameConversation,
  textToSpeech
};