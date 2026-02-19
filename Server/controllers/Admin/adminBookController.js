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
      query += " AND sc.id = ?";
      params.push(school_id);
    }

    if (class_id) {
      query += " AND c.id = ?";
      params.push(class_id);
    }

    if (subject_id) {
      query += " AND s.id = ?";
      params.push(subject_id);
    }

    if (search) {
      query +=
        " AND (b.title LIKE ? OR b.author LIKE ? OR s.name LIKE ? OR c.class_name LIKE ? OR sc.name LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += " ORDER BY b.created_at DESC";

    const [rows] = await db.query(query, params);

    // Calculate file sizes and format response
    const books = rows.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author || "Unknown",
      pdf_url: book.pdf_url,
      board: book.board || book.school_board || "CBSE",
      class_num: book.class_num,
      subject: book.name || book.subject_name_alt || "Unknown",
      class_name: book.class_name || "Unknown",
      school: book.school_name || "Unknown",
      school_id: book.school_id,
      class_id: book.class_id,
      subject_id: book.subject_id,
      chapters_count: book.chapters_count || 0,
      chunks_count: 0, // Removed book_chunks reference, default to 0
      created_at: book.created_at,
      updated_at: book.updated_at,
      file_size: book.file_size || 0,
      status: book.status || "active",
    }));

    res.status(200).json({
      success: true,
      data: books,
      count: books.length,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch books",
      error: error.message,
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
      [req.params.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const book = rows[0];
    const bookData = {
      id: book.id,
      title: book.title,
      author: book.author || "Unknown",
      pdf_url: book.pdf_url,
      board: book.board || book.school_board || "CBSE",
      class_num: book.class_num,
      subject: book.name || book.subject_name_alt || "Unknown",
      class_name: book.class_name || "Unknown",
      school: book.school_name || "Unknown",
      chapters_count: 0, // Will be calculated separately if needed
      chunks_count: 0, // Removed book_chunks reference
      created_at: book.created_at,
      updated_at: book.updated_at,
      file_size: book.file_size || 0,
      status: book.status || "active",
      metadata: {
        school_id: book.school_id,
        class_id: book.class_id,
        subject_id: book.subject_id,
      },
    };

    res.status(200).json({
      success: true,
      data: bookData,
    });
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch book",
      error: error.message,
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
          total_chunks: 0, // Removed book_chunks reference
        },
      },
    });
  } catch (error) {
    console.error("Error fetching book statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
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
        message: "Subject ID and book title are required",
      });
    }

    // Validate subject exists
    const [subjectCheck] = await db.query(
      `SELECT s.*, c.class_name, sc.name as school_name 
       FROM subjects s
       JOIN classes c ON s.class_id = c.id
       JOIN schools sc ON c.school_id = sc.id
       WHERE s.id = ?`,
      [subject_id],
    );

    if (subjectCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Subject not found",
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
        board || subjectCheck[0].board || "CBSE",
        class_num || subjectCheck[0].class_name?.match(/\d+/)?.[0] || "1",
      ],
    );

    // Get the created book
    const [newBook] = await db.query(
      `SELECT b.*, s.name as subject_name, c.class_name, sc.name as school_name
       FROM books b
       LEFT JOIN subjects s ON b.subject_id = s.id
       LEFT JOIN classes c ON s.class_id = c.id
       LEFT JOIN schools sc ON c.school_id = sc.id
       WHERE b.id = ?`,
      [result.insertId],
    );

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: newBook[0],
    });
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create book",
      error: error.message,
    });
  }
};

 


// Helper function to update book with chapters
const updateBookWithChapters = async (req, res, data) => {
  const {
    bookId,
    title,
    author,
    board,
    class_num,
    subject_name,
    parsedChapters,
    files,
    chaptersToDelete
  } = data;

  try {
    // 1. Update book metadata
   // 1. Update book metadata
    await db.query(
      `UPDATE books 
       SET title = ?, author = ?, board = ?, class_num = ?
       WHERE id = ?`,
      [title, author || 'Unknown', board, class_num, bookId]
    );

    // 2. Delete chapters marked for deletion
    let deletedCount = 0;
    if (chaptersToDelete && chaptersToDelete.length > 0) {
      // Delete chapter segments first (if using segments table)
      await db.query(
        `DELETE FROM book_chapter_segments WHERE chapter_id IN (?)`,
        [chaptersToDelete]
      );
      
      // Delete chapters
      await db.query(
        `DELETE FROM book_chapters WHERE id IN (?)`,
        [chaptersToDelete]
      );
      
      deletedCount = chaptersToDelete.length;
    }

    // 3. Process chapters
    let fileIndex = 0;
    let totalPagesProcessed = 0;
    let chaptersCreated = 0;

    for (const chapterMeta of parsedChapters) {
      // If chapter has a file (new or replacement)
      if (chapterMeta.hasFile && files[fileIndex]) {
        const file = files[fileIndex];
        fileIndex++;

        // If updating existing chapter, delete old segments first
        if (chapterMeta.existing && chapterMeta.id) {
          await db.query(
            `DELETE FROM book_chapter_segments WHERE chapter_id = ?`,
            [chapterMeta.id]
          );
          
         
       // Update chapter metadata
          await db.query(
            `UPDATE book_chapters 
             SET chapter_title = ?, chapter_no = ?
             WHERE id = ?`,
            [chapterMeta.chapter_title, chapterMeta.chapter_number, chapterMeta.id]
          );

          // Process new PDF for existing chapter
       // Get school and subject names for folder structure
          const [schoolSubjectInfo] = await db.query(
            `SELECT sc.name as school_name, c.class_name, s.name as subject_name
             FROM books b
             JOIN subjects s ON b.subject_id = s.id
             JOIN classes c ON s.class_id = c.id
             JOIN schools sc ON c.school_id = sc.id
             WHERE b.id = ?`,
            [bookId]
          );

          const schoolName = schoolSubjectInfo[0]?.school_name || 'Unknown';
          const classNum = schoolSubjectInfo[0]?.class_name?.match(/\d+/)?.[0] || class_num || '1';
        const className = `Class ${classNum}`;
          const subjectNameForPath = schoolSubjectInfo[0]?.subject_name || subject_name;

          // Upload PDF to FTP first
          const ftpRes = await uploadFileToFTP(
            file.buffer,
            `${title}_ch${chapterMeta.chapter_number}_${file.originalname}`,
            `/books/${schoolName}/${className}/${subjectNameForPath}`
          );

          // Update chapter PDF URL
          await db.query(
            `UPDATE book_chapters SET pdf_url = ? WHERE id = ?`,
            [ftpRes.url, chapterMeta.id]
          );

          // Prepare metadata for processing
          const chapterMetadata = {
            board: board || "CBSE",
            class: parseInt(class_num) || 1,
            subject: subject_name,
            book_id: bookId,
            chapter_number: chapterMeta.chapter_number,
            chapter_title: chapterMeta.chapter_title,
            pdf_url: ftpRes.url,
            title: title,
            author: author || "Unknown"
          };

          // Process PDF with FTP URL
          const processingResult = await processBookFromPDF(
            ftpRes.url,
            bookId,
            chapterMetadata,
            db
          );

          totalPagesProcessed += processingResult.total_pages || 0;

     } else {
          // Create new chapter
          // Get the highest existing chapter number
          const [maxChapterResult] = await db.query(
            `SELECT MAX(chapter_no) as max_chapter FROM book_chapters WHERE book_id = ?`,
            [bookId]
          );
          
          const nextChapterNo = (maxChapterResult[0]?.max_chapter || 0) + 1;
          
          console.log(`📖 Creating new chapter ${nextChapterNo} (original number: ${chapterMeta.chapter_number})`);
          
          const [chapterResult] = await db.query(
            `INSERT INTO book_chapters (book_id, chapter_no, chapter_title, created_at)
             VALUES (?, ?, ?, NOW())`,
            [bookId, nextChapterNo, chapterMeta.chapter_title]
          );
          
          const newChapterId = chapterResult.insertId;
          chaptersCreated++;

      // Get school and subject names for folder structure
           const [schoolSubjectInfo] = await db.query(
            `SELECT sc.name as school_name, c.class_name, s.name as subject_name
             FROM books b
             JOIN subjects s ON b.subject_id = s.id
             JOIN classes c ON s.class_id = c.id
             JOIN schools sc ON c.school_id = sc.id
             WHERE b.id = ?`,
            [bookId]
          );

          const schoolName = schoolSubjectInfo[0]?.school_name || 'Unknown';
          const classNum = schoolSubjectInfo[0]?.class_name?.match(/\d+/)?.[0] || class_num || '1';
        const className = `Class ${classNum}`;
          const subjectNameForPath = schoolSubjectInfo[0]?.subject_name || subject_name;

        // Upload PDF to FTP first
          const ftpRes = await uploadFileToFTP(
            file.buffer,
            `${title}_ch${chapterMeta.chapter_number}_${file.originalname}`,
            `/books/${schoolName}/${className}/${subjectNameForPath}`
          );

          // Update chapter PDF URL
          await db.query(
            `UPDATE book_chapters SET pdf_url = ? WHERE id = ?`,
            [ftpRes.url, newChapterId]
          );

          // Prepare metadata for processing
          const chapterMetadata = {
            board: board || "CBSE",
            class: parseInt(class_num) || 1,
            subject: subject_name,
            book_id: bookId,
            chapter_number: nextChapterNo,
            chapter_title: chapterMeta.chapter_title,
            pdf_url: ftpRes.url,
            title: title,
            author: author || "Unknown"
          };

          // Process PDF with FTP URL
          const processingResult = await processBookFromPDF(
            ftpRes.url,
            bookId,
            chapterMetadata,
            db
          );

          totalPagesProcessed += processingResult.total_pages || 0;
        }
      } else if (chapterMeta.existing && chapterMeta.id) {
       // Just update chapter metadata for existing chapters without new files
        await db.query(
          `UPDATE book_chapters 
           SET chapter_title = ?, chapter_no = ?
           WHERE id = ?`,
          [chapterMeta.chapter_title, chapterMeta.chapter_number, chapterMeta.id]
        );
      }
    }

    res.json({
      success: true,
      message: "Book updated successfully",
      book_id: bookId,
      chapters_created: chaptersCreated,
      chapters_deleted: deletedCount,
      total_pages: totalPagesProcessed
    });

  } catch (error) {
    console.error("Update book error:", error);
    throw error;
  }
};

exports.uploadAndProcess = async (req, res) => {
  try {
   const {
      title,
      author,
      subject_id,
      school_id,
      class_id,
      board,
      class_num,
      subject_name,
      chapters: chaptersMetadata,
      chaptersToDelete,
      isEditMode,
      bookId: editBookId
    } = req.body;

    const files = req.files;

    // Parse chapters metadata
    let parsedChapters;
    try {
      parsedChapters = JSON.parse(chaptersMetadata);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: "Invalid chapters metadata",
      });
    }

    // Handle edit mode
  // Handle edit mode
    // Handle edit mode
    console.log("=== Backend Upload Debug ===");
    console.log("isEditMode:", isEditMode);
    console.log("editBookId:", editBookId);
    console.log("parsedChapters:", parsedChapters);
    
    if (isEditMode === 'true' && editBookId) {
      console.log("✅ EDIT MODE DETECTED - Updating existing book:", editBookId);
      return await updateBookWithChapters(req, res, {
        bookId: editBookId,
        title,
        author,
        board,
        class_num,
        subject_name,
        parsedChapters,
        files: files || [],
        chaptersToDelete: chaptersToDelete ? JSON.parse(chaptersToDelete) : []
      });
    }

    console.log("❌ CREATE MODE - Creating new book");

    // Validate required fields for create mode
    if (!subject_id || !title || !files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: subject_id, title, or chapter files",
      });
    }

    // Count chapters that need files (new chapters)
    const chaptersNeedingFiles = parsedChapters.filter(ch => !ch.existing || ch.hasFile);
    
    if (chaptersNeedingFiles.length !== files.length) {
      return res.status(400).json({
        success: false,
        message: `Expected ${chaptersNeedingFiles.length} files but received ${files.length}`,
      });
    }

  

    // Create book record first
    console.log("💾 Creating book record...");
    const [insertResult] = await db.query(
      `INSERT INTO books (subject_id, title, author, board, class_num, status, chapters_count) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        subject_id,
        title,
        author || "Unknown",
        board || "CBSE",
        class_num || 1,
        "processing",
parsedChapters.length  // Change from chaptersData.length
      ]
    );

    const bookId = insertResult.insertId;
    console.log(`✅ Created book with ID: ${bookId}`);

    let totalPages = 0;
    let chaptersCreated = 0;

    // Process each chapter sequentially
// Process each chapter sequentially
    for (let i = 0; i < parsedChapters.length; i++) {
      const chapterMeta = parsedChapters[i];
      const file = req.files[i];

      console.log(`\n📖 Processing Chapter ${chapterMeta.chapter_number}: ${chapterMeta.chapter_title}`);

     try {
        // Get school, class, and subject names for folder structure
        const [schoolSubjectInfo] = await db.query(
          `SELECT sc.name as school_name, c.class_name, s.name as subject_name
           FROM subjects s
           JOIN classes c ON s.class_id = c.id
           JOIN schools sc ON c.school_id = sc.id
           WHERE s.id = ?`,
          [subject_id]
        );

        const schoolName = schoolSubjectInfo[0]?.school_name || 'Unknown';
        const classNum = schoolSubjectInfo[0]?.class_name?.match(/\d+/)?.[0] || class_num || '1';
        const className = `Class ${classNum}`;
        const subjectNameForPath = schoolSubjectInfo[0]?.subject_name || subject_name;

        // Upload chapter PDF to FTP
        console.log(`📤 Uploading chapter ${chapterMeta.chapter_number} PDF to FTP to /${schoolName}/${className}/${subjectNameForPath}...`);
        const ftpRes = await uploadFileToFTP(
          file.buffer,
          `${title}_ch${chapterMeta.chapter_number}_${file.originalname}`,
          `/books/${schoolName}/${className}/${subjectNameForPath}`
        );
        console.log(`✅ Chapter ${chapterMeta.chapter_number} PDF uploaded:`, ftpRes.url);
// Save chapter with PDF URL
// Check if chapter exists, update or insert
const [existingChapter] = await db.query(
  `SELECT id FROM book_chapters WHERE book_id = ? AND chapter_no = ?`,
  [bookId, chapterMeta.chapter_number]
);

if (existingChapter.length > 0) {
  // Update existing chapter
  await db.query(
    `UPDATE book_chapters 
     SET pdf_url = ?, chapter_title = ? 
     WHERE book_id = ? AND chapter_no = ?`,
    [ftpRes.url, chapterMeta.chapter_title, bookId, chapterMeta.chapter_number]
  );
  console.log(`💾 Chapter ${chapterMeta.chapter_number} metadata updated with PDF URL`);
} else {
  // Insert new chapter
  await db.query(
    `INSERT INTO book_chapters 
     (book_id, chapter_no, chapter_title, pdf_url) 
     VALUES (?, ?, ?, ?)`,
    [bookId, chapterMeta.chapter_number, chapterMeta.chapter_title, ftpRes.url]
  );
  console.log(`💾 Chapter ${chapterMeta.chapter_number} metadata created with PDF URL`);
}

        // Prepare metadata for this chapter
        const chapterMetadata = {
          board: board || "CBSE",
          class: parseInt(class_num) || 1,
          subject: subject_name || "Unknown",
          book_id: bookId,
          chapter_number: chapterMeta.chapter_number,
          chapter_title: chapterMeta.chapter_title,
          pdf_url: ftpRes.url,
          title: title,
          author: author || "Unknown"
        };

        // Process this chapter
        console.log(`🚀 Processing chapter ${chapterMeta.chapter_number} with book processing service...`);
        const processRes = await processBookFromPDF(
          ftpRes.url,
          bookId,
          chapterMetadata,
          db
        );

        totalPages += processRes.total_pages || 0;
        chaptersCreated++;
        console.log(`✅ Chapter ${chapterMeta.chapter_number} processed: ${processRes.total_pages} pages`);

      } catch (error) {
        console.error(`❌ Failed to process chapter ${chapterMeta.chapter_number}:`, error);
        // Continue with other chapters even if one fails
      }
    }

    // Update book status and chapter count
    await db.query(
      `UPDATE books SET status = ?, chapters_count = ? WHERE id = ?`,
      ["active", chaptersCreated, bookId]
    );

    console.log(`\n🎉 Book processing complete!`);
    console.log(`   📚 Book ID: ${bookId}`);
    // console.log(`   📖 Chapters: ${chaptersCreated}/${chaptersData.length}`);
    console.log(`   📄 Total Pages: ${totalPages}`);

    res.status(201).json({
      success: true,
      message: "Book uploaded and processed successfully",
      data: {
        book_id: bookId,
        title: title,
        chapters_created: chaptersCreated,
        total_pages: totalPages
      }
    });

  } catch (error) {
    console.error("❌ Error uploading and processing book:", error);

    // Clean up: we don't need to delete files as multer already handles temp files

    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload and process book"
    });
  }
};

// @desc    Create a chapter record
// @route   POST /api/admin/chapters/create
// @access  Private
exports.createChapter = async (req, res) => {
  try {
    const { book_id, chapter_number, chapter_title, total_segments } = req.body;

    // Validate required fields
    if (!book_id || !chapter_number || !chapter_title) {
      return res.status(400).json({
        success: false,
        message: "book_id, chapter_number, and chapter_title are required"
      });
    }

    // Check if chapter already exists
    const [existingChapter] = await db.query(
      `SELECT id FROM book_chapters 
       WHERE book_id = ? AND chapter_number = ?`,
      [book_id, chapter_number]
    );

    if (existingChapter.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Chapter ${chapter_number} already exists for this book`
      });
    }

    // Create chapter
    const [result] = await db.query(
  `INSERT INTO book_chapters 
   (book_id, chapter_number, chapter_title, pdf_url, total_segments, created_at) 
   VALUES (?, ?, ?, ?, ?, NOW())`,
  [book_id, chapter_number, chapter_title, req.body.pdf_url || null, total_segments || 0]
);

    const chapterId = result.insertId;

    // Fetch the created chapter
    const [chapter] = await db.query(
      `SELECT * FROM book_chapters WHERE id = ?`,
      [chapterId]
    );

    res.status(201).json({
      success: true,
      message: "Chapter created successfully",
      data: chapter[0]
    });

  } catch (error) {
    console.error("Error creating chapter:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create chapter"
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
    const [existingBook] = await db.query("SELECT * FROM books WHERE id = ?", [
      bookId,
    ]);

    if (existingBook.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
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
        message: "No fields to update",
      });
    }

    // Build update query
    const setClause = Object.keys(updateFields)
      .map((field) => `${field} = ?`)
      .join(", ");

    updateValues.push(bookId);

    await db.query(
      `UPDATE books SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      updateValues,
    );

    // Get updated book
    const [updatedBook] = await db.query(
      `SELECT b.*, s.name as subject_name, c.class_name, sc.name as school_name
       FROM books b
       LEFT JOIN subjects s ON b.subject_id = s.id
       LEFT JOIN classes c ON s.class_id = c.id
       LEFT JOIN schools sc ON c.school_id = sc.id
       WHERE b.id = ?`,
      [bookId],
    );

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: updatedBook[0],
    });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update book",
      error: error.message,
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
    const [existingBook] = await db.query("SELECT * FROM books WHERE id = ?", [
      bookId,
    ]);

    if (existingBook.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Check if book has chapters
    const [chapterRows] = await db.query(
      "SELECT id FROM book_chapters WHERE book_id = ?",
      [bookId],
    );

    if (chapterRows.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete book with existing chapters. Please delete chapters first.",
      });
    }

    // Delete the book
    await db.query("DELETE FROM books WHERE id = ?", [bookId]);

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete book",
      error: error.message,
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
    const [existingBook] = await db.query("SELECT * FROM books WHERE id = ?", [
      bookId,
    ]);

    if (existingBook.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Delete chapters first
    await db.query("DELETE FROM book_chapters WHERE book_id = ?", [bookId]);

    // Delete the book
    await db.query("DELETE FROM books WHERE id = ?", [bookId]);

    res.status(200).json({
      success: true,
      message: "Book and all associated chapters deleted successfully",
    });
  } catch (error) {
    console.error("Error force deleting book:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete book",
      error: error.message,
    });
  }
};

 
// @desc    Get book chapters
// @route   GET /api/books/:id/chapters
// @access  Private
exports.getBookChapters = async (req, res) => {
  try {
    const bookId = req.params.id;

    // Get book data
    const [bookRows] = await db.query(
      `SELECT 
        b.*,
        s.name as subject_name,
        c.class_name,
        sc.name as school_name
      FROM books b
      LEFT JOIN subjects s ON b.subject_id = s.id
      LEFT JOIN classes c ON s.class_id = c.id
      LEFT JOIN schools sc ON c.school_id = sc.id
      WHERE b.id = ?`,
      [bookId]
    );

    if (bookRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    const book = bookRows[0];

    // Get chapters
  // Get chapters
    const [chapters] = await db.query(
      `SELECT 
        bc.id,
        bc.book_id,
        bc.chapter_no as chapter_number,
        bc.chapter_title,
        bc.pdf_url,
        bc.content_json_path,
        bc.segments_json_path,
        bc.total_segments,
        bc.created_at
      FROM book_chapters bc
      WHERE bc.book_id = ?
      ORDER BY bc.chapter_no`,
      [bookId]
    );

    // Format response with book data and chapters
    const response = {
      id: book.id,
      title: book.title,
      author: book.author,
      board: book.board,
      class_num: book.class_num,
      subject_name: book.subject_name,
      subject_id: book.subject_id,
      chapters: chapters.map(ch => ({
        id: ch.id,
        chapter_number: ch.chapter_number,
        chapter_title: ch.chapter_title,
        pdf_url: ch.pdf_url,
        total_segments: ch.total_segments,
        created_at: ch.created_at
      }))
    };

    res.status(200).json({
      success: true,
      data: response,
      count: chapters.length,
    });
  } catch (error) {
    console.error("Error fetching book chapters:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch book chapters",
      error: error.message,
    });
  }
};
