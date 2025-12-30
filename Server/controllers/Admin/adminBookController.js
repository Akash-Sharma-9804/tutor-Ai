const db = require("../../models/db");
const { uploadFileToFTP } = require("../../services/uploadToFTP");
const { processBookFromPDF } = require("../../services/bookProcessingService");

// @desc    Get all books with filters
// @route   GET /api/books
// @access  Private
exports.listBooks = async (req, res) => {
  try {
    const { school_id, class_id, subject_id, search } = req.query;
    
    let query = `
      SELECT 
        b.*,
        b.created_at,
        b.updated_at,
        s.name as subject_name,
        s.name as subject_name_alt,
        c.class_name,
        c.school_id,
        sc.name as school_name,
        sc.board as school_board,
        sc.country,
        sc.state,
        (SELECT COUNT(*) FROM book_chapters WHERE book_id = b.id) as chapters_count
      FROM books b
      LEFT JOIN subjects s ON b.subject_id = s.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN schools sc ON c.school_id = sc.id
      WHERE 1=1
    `;
    
    const params = [];

    // Apply filters
    if (school_id) {
      query += ' AND sc.id = ?';
      params.push(school_id);
    }

    if (class_id) {
      query += ' AND c.id = ?';
      params.push(class_id);
    }

    if (subject_id) {
      query += ' AND s.id = ?';
      params.push(subject_id);
    }

    if (search) {
      query += ' AND (b.title LIKE ? OR b.author LIKE ? OR s.name LIKE ? OR c.class_name LIKE ? OR sc.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY b.created_at DESC';

    const [rows] = await db.query(query, params);
    
    // Calculate file sizes and format response
    const books = rows.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author || 'Unknown',
      pdf_url: book.pdf_url,
      board: book.board || book.school_board || 'CBSE',
      class_num: book.class_num,
      subject: book.name || book.subject_name_alt || 'Unknown',
      class_name: book.class_name || 'Unknown',
      school: book.school_name || 'Unknown',
      school_id: book.school_id,
      class_id: book.class_id,
      subject_id: book.subject_id,
      chapters_count: book.chapters_count || 0,
      chunks_count: 0, // Removed book_chunks reference, default to 0
      created_at: book.created_at,
      updated_at: book.updated_at,
      file_size: book.file_size || 0,
      status: book.status || 'active'
    }));

    res.status(200).json({
      success: true,
      data: books,
      count: books.length
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch books',
      error: error.message
    });
  }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Private
exports.getBookById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        b.*,
        b.created_at,
        b.updated_at,
        s.name as subject_name,
        s.name as subject_name_alt,
        c.class_name,
        c.school_id,
        sc.name as school_name,
        sc.board as school_board,
        sc.country,
        sc.state
      FROM books b
      LEFT JOIN subjects s ON b.subject_id = s.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN schools sc ON c.school_id = sc.id
      WHERE b.id = ?
      `,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const book = rows[0];
    const bookData = {
      id: book.id,
      title: book.title,
      author: book.author || 'Unknown',
      pdf_url: book.pdf_url,
      board: book.board || book.school_board || 'CBSE',
      class_num: book.class_num,
      subject: book.name || book.subject_name_alt || 'Unknown',
      class_name: book.class_name || 'Unknown',
      school: book.school_name || 'Unknown',
      chapters_count: 0, // Will be calculated separately if needed
      chunks_count: 0, // Removed book_chunks reference
      created_at: book.created_at,
      updated_at: book.updated_at,
      file_size: book.file_size || 0,
      status: book.status || 'active',
      metadata: {
        school_id: book.school_id,
        class_id: book.class_id,
        subject_id: book.subject_id
      }
    };

    res.status(200).json({
      success: true,
      data: bookData
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch book',
      error: error.message
    });
  }
};

// @desc    Get book statistics
// @route   GET /api/books/statistics
// @access  Private
exports.getBookStatistics = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_books,
        SUM(COALESCE(file_size, 0)) as total_size_bytes,
        COUNT(DISTINCT subject_id) as subjects_with_books,
        (SELECT COUNT(*) FROM books WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as books_last_7_days,
        (SELECT COUNT(*) FROM book_chapters) as total_chapters
      FROM books
    `);

    const [classesWithBooks] = await db.query(`
      SELECT COUNT(DISTINCT c.id) as classes_with_books
      FROM books b
      JOIN subjects s ON b.subject_id = s.id
      JOIN classes c ON s.class_id = c.id
    `);

    const [schoolsWithBooks] = await db.query(`
      SELECT COUNT(DISTINCT sc.id) as schools_with_books
      FROM books b
      JOIN subjects s ON b.subject_id = s.id
      JOIN classes c ON s.class_id = c.id
      JOIN schools sc ON c.school_id = sc.id
    `);

    const totalSizeMB = (stats[0].total_size_bytes || 0) / 1024 / 1024;

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          total_books: stats[0].total_books || 0,
          total_size_mb: totalSizeMB.toFixed(2),
          subjects_with_books: stats[0].subjects_with_books || 0,
          classes_with_books: classesWithBooks[0]?.classes_with_books || 0,
          schools_with_books: schoolsWithBooks[0]?.schools_with_books || 0,
          books_last_7_days: stats[0].books_last_7_days || 0,
          total_chapters: stats[0].total_chapters || 0,
          total_chunks: 0 // Removed book_chunks reference
        }
      }
    });
  } catch (error) {
    console.error('Error fetching book statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// @desc    Create a new book (basic)
// @route   POST /api/books
// @access  Private
exports.createBook = async (req, res) => {
  try {
    const { subject_id, title, author, pdf_url, board, class_num } = req.body;

    // Validate required fields
    if (!subject_id || !title) {
      return res.status(400).json({
        success: false,
        message: 'Subject ID and book title are required'
      });
    }

    // Validate subject exists
    const [subjectCheck] = await db.query(
      `SELECT s.*, c.class_name, sc.name as school_name 
       FROM subjects s
       JOIN classes c ON s.class_id = c.id
       JOIN schools sc ON c.school_id = sc.id
       WHERE s.id = ?`,
      [subject_id]
    );

    if (subjectCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Create book
    const [result] = await db.query(
      `INSERT INTO books (subject_id, title, author, pdf_url, board, class_num) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        subject_id, 
        title, 
        author || null, 
        pdf_url || null,
        board || subjectCheck[0].board || 'CBSE',
        class_num || subjectCheck[0].class_name?.match(/\d+/)?.[0] || '1'
      ]
    );

    // Get the created book
    const [newBook] = await db.query(
      `SELECT b.*, s.name as subject_name, c.class_name, sc.name as school_name
       FROM books b
       LEFT JOIN subjects s ON b.subject_id = s.id
       LEFT JOIN classes c ON s.class_id = c.id
       LEFT JOIN schools sc ON c.school_id = sc.id
       WHERE b.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: newBook[0]
    });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create book',
      error: error.message
    });
  }
};

// @desc    Upload and process a book with PDF
// @route   POST /api/books/upload
// @access  Private
exports.uploadAndProcess = async (req, res) => {
  try {
    const { subject_id, title, author, school_id, class_id } = req.body;
    console.log("📘 [BOOK CONTROLLER] Upload Request Received:", { 
      subject_id, 
      title, 
      author, 
      school_id, 
      class_id,
      file: req.file?.originalname 
    });

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'PDF file is required'
      });
    }

    // Validate required fields
    if (!subject_id || !title) {
      return res.status(400).json({
        success: false,
        message: 'Subject ID and book title are required'
      });
    }

    // Extract metadata (with fallbacks for backward compatibility)
    let { board, class_num, subject_name } = req.body;
    
    // If metadata not provided, try to fetch from database
    if (!board || !class_num || !subject_name) {
      console.log("⚠️ Metadata not provided, fetching from database...");
      
      const [subjectRows] = await db.query(
        `SELECT 
          s.name as subject_name,
          s.name as subject_name_alt,
          c.class_name,
          c.school_id,
          sc.name as school_name,
          sc.board as school_board
         FROM subjects s
         JOIN classes c ON s.class_id = c.id
         JOIN schools sc ON c.school_id = sc.id
         WHERE s.id = ?`,
        [subject_id]
      );

      if (subjectRows.length > 0) {
        const meta = subjectRows[0];
        
        // Extract subject name
        subject_name = subject_name || meta.name || meta.subject_name_alt || "Unknown";
        
        // Extract class number from class_name (e.g., "Class 8" -> 8)
        const classMatch = meta.class_name?.match(/\d+/);
        class_num = class_num || (classMatch ? classMatch[0] : class_id);
        
        // Get board from school or use default
        board = board || meta.school_board || "CBSE";
        
        console.log("✅ Extracted metadata:", { board, class_num, subject_name });
      } else {
        // Last resort defaults
        board = board || "CBSE";
        class_num = class_num || class_id;
        subject_name = subject_name || "Unknown";
        console.log("⚠️ Using default metadata:", { board, class_num, subject_name });
      }
    }

    // Upload PDF to FTP
    console.log("📤 Uploading PDF to FTP...");
    const ftpRes = await uploadFileToFTP(
      file.buffer, 
      file.originalname, 
      "/books/uploads"
    );
    console.log("✅ PDF uploaded:", ftpRes.url);

    // Save book record to database
    console.log("💾 Saving book record to database...");
    const [insertResult] = await db.query(
      `INSERT INTO books (subject_id, title, author, pdf_url, board, class_num, file_size, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subject_id, 
        title, 
        author || null, 
        ftpRes.url, 
        board, 
        class_num,
        file.size, // Store file size in bytes
        'processing'
      ]
    );
    const bookId = insertResult.insertId;
    console.log("✅ Book record saved with ID:", bookId);

    // Prepare book metadata for processing
    const bookMetadata = {
      board: board,
      class: parseInt(class_num) || 1,
      subject: subject_name,
      book_id: bookId,
      title: title,
      author: author || 'Unknown'
    };

    console.log("📋 Processing with metadata:", bookMetadata);

    // Start processing in background to avoid timeout
    res.status(202).json({
      success: true,
      message: 'Book upload started. Processing will continue in background.',
      data: {
        book_id: bookId,
        pdf_url: ftpRes.url,
        metadata: bookMetadata,
        status: 'processing'
      }
    });

    // Process book in background
    setTimeout(async () => {
      try {
        console.log("🚀 Starting book processing pipeline...");
        const processRes = await processBookFromPDF(
          ftpRes.url, 
          bookId, 
          bookMetadata,
          db
        );
        console.log("🎯 Book processed successfully!");

        // Update book status
        await db.query(
          `UPDATE books SET status = 'active', chapters_count = ?, updated_at = NOW() WHERE id = ?`,
          [processRes.chapters || 0, bookId]
        );

        console.log("\n🔍 Verifying database records...");
        const [chapterRows] = await db.query(
          "SELECT * FROM book_chapters WHERE book_id = ?",
          [bookId]
        );
        console.log("📖 Chapters saved:", chapterRows.length);

      } catch (processError) {
        console.error("❌ Book processing failed:", processError);
        await db.query(
          "UPDATE books SET status = 'failed', updated_at = NOW() WHERE id = ?",
          [bookId]
        );
      }
    }, 1000);

  } catch (error) {
    console.error("❌ Upload or processing failed:", error);
    res.status(500).json({
      success: false,
      message: 'Upload or processing failed',
      error: error.message
    });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private
exports.updateBook = async (req, res) => {
  try {
    const { title, author, board, class_num } = req.body;
    const bookId = req.params.id;

    // Check if book exists
    const [existingBook] = await db.query(
      'SELECT * FROM books WHERE id = ?',
      [bookId]
    );

    if (existingBook.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Prepare update fields
    const updateFields = {};
    const updateValues = [];

    if (title !== undefined) {
      updateFields.title = title;
      updateValues.push(title);
    }

    if (author !== undefined) {
      updateFields.author = author;
      updateValues.push(author);
    }

    if (board !== undefined) {
      updateFields.board = board;
      updateValues.push(board);
    }

    if (class_num !== undefined) {
      updateFields.class_num = class_num;
      updateValues.push(class_num);
    }

    // If no fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Build update query
    const setClause = Object.keys(updateFields)
      .map(field => `${field} = ?`)
      .join(', ');
    
    updateValues.push(bookId);

    await db.query(
      `UPDATE books SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      updateValues
    );

    // Get updated book
    const [updatedBook] = await db.query(
      `SELECT b.*, s.name as subject_name, c.class_name, sc.name as school_name
       FROM books b
       LEFT JOIN subjects s ON b.subject_id = s.id
       LEFT JOIN classes c ON s.class_id = c.id
       LEFT JOIN schools sc ON c.school_id = sc.id
       WHERE b.id = ?`,
      [bookId]
    );

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook[0]
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update book',
      error: error.message
    });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private
exports.deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    // Check if book exists
    const [existingBook] = await db.query(
      'SELECT * FROM books WHERE id = ?',
      [bookId]
    );

    if (existingBook.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if book has chapters
    const [chapterRows] = await db.query(
      'SELECT id FROM book_chapters WHERE book_id = ?',
      [bookId]
    );

    if (chapterRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book with existing chapters. Please delete chapters first.'
      });
    }

    // Delete the book
    await db.query('DELETE FROM books WHERE id = ?', [bookId]);

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete book',
      error: error.message
    });
  }
};

// @desc    Force delete a book with all its chapters
// @route   DELETE /api/books/:id/force
// @access  Private
exports.forceDeleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    // Check if book exists
    const [existingBook] = await db.query(
      'SELECT * FROM books WHERE id = ?',
      [bookId]
    );

    if (existingBook.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Delete chapters first
    await db.query('DELETE FROM book_chapters WHERE book_id = ?', [bookId]);
    
    // Delete the book
    await db.query('DELETE FROM books WHERE id = ?', [bookId]);

    res.status(200).json({
      success: true,
      message: 'Book and all associated chapters deleted successfully'
    });
  } catch (error) {
    console.error('Error force deleting book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete book',
      error: error.message
    });
  }
};

// @desc    Get book chapters
// @route   GET /api/books/:id/chapters
// @access  Private
exports.getBookChapters = async (req, res) => {
  try {
    const bookId = req.params.id;

    const [chapters] = await db.query(
      `SELECT 
        bc.*
       FROM book_chapters bc
       WHERE bc.book_id = ?
       ORDER BY bc.chapter_no`,
      [bookId]
    );

    res.status(200).json({
      success: true,
      data: chapters,
      count: chapters.length
    });
  } catch (error) {
    console.error('Error fetching book chapters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch book chapters',
      error: error.message
    });
  }
};