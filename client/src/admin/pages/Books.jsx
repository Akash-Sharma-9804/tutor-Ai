 

import { useEffect, useState } from "react";
import adminAxios from "../api/adminAxios";
import BooksHeader from "../components/Books/BooksHeader";
import BooksStats from "../components/Books/BooksStats";
import BooksFilters from "../components/Books/BooksFilters";
import BooksGrid from "../components/Books/BooksGrid";
import BooksTable from "../components/Books/BooksTable";
import UploadBookModal from "../components/Books/UploadBookModal";

import DeleteBookModal from "../components/Books/DeleteBookModal";
import ViewBookModal from "../components/Books/ViewBookModal";
import EmptyState from "../components/Books/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import AdminFooter from "../layout/AdminFooter";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
   
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: "", message: "" });
 const [existingBook, setExistingBook] = useState(null);
  // Fetch schools
  const fetchSchools = async () => {
    try {
      const res = await adminAxios.get("/schools");
      setSchools(res.data.data);
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  // Fetch classes based on school
  const fetchClasses = async (schoolId) => {
    if (!schoolId) {
      setClasses([]);
      setSelectedClass("");
      return;
    }
    
    try {
      const res = await adminAxios.get(`/classes?school_id=${schoolId}`);
      setClasses(res.data.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    }
  };

  // Fetch subjects based on class
  const fetchSubjects = async (schoolId, classId) => {
    if (!schoolId || !classId) {
      setSubjects([]);
      setSelectedSubject("");
      return;
    }
    
    try {
      const res = await adminAxios.get(`/subjects?school_id=${schoolId}&class_id=${classId}`);
      setSubjects(res.data.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects([]);
    }
  };

  // Fetch books based on filters
  const fetchBooks = async () => {
    try {
      const params = {};
      if (selectedSchool) params.school_id = selectedSchool;
      if (selectedClass) params.class_id = selectedClass;
      if (selectedSubject) params.subject_id = selectedSubject;
      if (searchTerm) params.search = searchTerm;

      const res = await adminAxios.get("/books", { params });
      setBooks(res.data.data);
      setFilteredBooks(res.data.data);
    } catch (error) {
      console.error("Error fetching books:", error);
      setBooks([]);
      setFilteredBooks([]);
    }
  };

  // Fetch book with chapters for editing
 // Fetch book with chapters for editing
  const fetchBookWithChapters = async (bookId) => {
    try {
      const res = await adminAxios.get(`/books/${bookId}/chapters`);
      console.log("📚 Fetched book data:", res.data.data); // Debug log
      return res.data.data; // Return the actual data object, not the wrapper
    } catch (error) {
      console.error("Error fetching book chapters:", error);
      return null;
    }
  };
  // Initial data fetch
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchSchools();
      setLoading(false);
    };
    initData();
  }, []);

  // Fetch classes when school changes
  useEffect(() => {
    if (selectedSchool) {
      fetchClasses(selectedSchool);
    } else {
      setClasses([]);
      setSelectedClass("");
    }
  }, [selectedSchool]);

  // Fetch subjects when class changes
  useEffect(() => {
    if (selectedSchool && selectedClass) {
      fetchSubjects(selectedSchool, selectedClass);
    } else {
      setSubjects([]);
      setSelectedSubject("");
    }
  }, [selectedSchool, selectedClass]);

// Fetch books when filters change
  useEffect(() => {
    if (selectedSchool) {
      fetchBooks();
    } else {
      setBooks([]);
      setFilteredBooks([]);
      setExistingBook(null);
    }
  }, [selectedSchool, selectedClass, selectedSubject, searchTerm]);

  // Check if book exists for current subject
  useEffect(() => {
    if (selectedSubject && filteredBooks.length > 0) {
      // Find book matching current subject
      const bookForSubject = filteredBooks.find(
        book => book.subject_id === parseInt(selectedSubject)
      );
      setExistingBook(bookForSubject || null);
    } else {
      setExistingBook(null);
    }
  }, [filteredBooks, selectedSubject]);

  // ── Background job: stored on window so it survives navigation ──────────
  const [backgroundJob, setBackgroundJob] = useState(
    () => window.__uploadJob || null
  );

  // Keep window in sync whenever state changes
  const updateJob = (job) => {
    window.__uploadJob = job;
    setBackgroundJob(job);
  };

  // On mount, re-attach the ticker if a job is already running
  useEffect(() => {
    if (
      window.__uploadJob &&
      (window.__uploadJob.status === "uploading" ||
        window.__uploadJob.status === "processing")
    ) {
      setBackgroundJob({ ...window.__uploadJob });
    }
  }, []);

  // Smooth ticker: runs every second, advances based on elapsed real time
  useEffect(() => {
    if (
      !backgroundJob ||
      backgroundJob.status === "done" ||
      backgroundJob.status === "error"
    )
      return;

    const ticker = setInterval(() => {
      const job = window.__uploadJob;
      if (!job || job.status === "done" || job.status === "error") {
        clearInterval(ticker);
        return;
      }
      const elapsed = (Date.now() - job.startedAt) / 1000; // seconds
      const totalSecs = job.estimatedSecs || 300;
      // Ease-out curve: fast early, slows near 90%
      const raw = 1 - Math.exp(-3 * (elapsed / totalSecs));
      const progress = Math.min(Math.round(raw * 90), 90);
      const updated = { ...job, progress };
      window.__uploadJob = updated;
      setBackgroundJob({ ...updated });
    }, 1000);

    return () => clearInterval(ticker);
  }, [backgroundJob?.status]);

const handleUploadBook = async (formData, files) => {
    // Close modal immediately so admin can keep working
    setShowUploadModal(false);
    setEditingBook(null);

    const totalChapters = files.length || formData.chapters.filter(ch => !ch.existing || ch.file).length || 1;
    // Estimate ~2 min per chapter for Gemini processing
    const estimatedSecs = totalChapters * 120;

    const initialJob = {
      status: "uploading",
      message: `📤 Uploading "${formData.title}" — ${totalChapters} chapter${totalChapters > 1 ? "s" : ""}`,
      progress: 2,
      chapterName: formData.title || "Book",
      totalChapters,
      startedAt: Date.now(),
      estimatedSecs,
    };
    updateJob(initialJob);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("title", formData.title);
      uploadFormData.append("author", formData.author || "Unknown");
      uploadFormData.append("subject_id", selectedSubject);
      uploadFormData.append("school_id", selectedSchool);
      uploadFormData.append("class_id", selectedClass);
      uploadFormData.append("board", formData.board);
      uploadFormData.append("class_num", formData.class_num || "1");
      uploadFormData.append("subject_name", formData.subject_name || "Unknown");
      uploadFormData.append("chapters", JSON.stringify(formData.chapters));
      if (formData.isEditMode && formData.chaptersToDelete) {
        uploadFormData.append("chaptersToDelete", JSON.stringify(formData.chaptersToDelete));
      }
      if (formData.isEditMode && formData.bookId) {
        uploadFormData.append("bookId", formData.bookId);
        uploadFormData.append("isEditMode", "true");
      }
      files.forEach((file) => {
        uploadFormData.append("chapter_files", file);
      });

      // After ~5s switch message to "processing"
      const msgTimer = setTimeout(() => {
        if (window.__uploadJob?.status === "uploading") {
          updateJob({ ...window.__uploadJob, status: "processing",
            message: `⚙️ AI is processing "${formData.title}" (${totalChapters} chapter${totalChapters > 1 ? "s" : ""})…` });
        }
      }, 5000);

      const response = await adminAxios.post("/books/upload", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 900000 // 15 minutes
      });

      clearTimeout(msgTimer);

      const successMessage = formData.isEditMode
        ? `✅ Book updated! ${response.data.chapters_created || 0} chapters processed`
        : `✅ "${formData.title}" uploaded! ${response.data.chapters_created} chapters · ${response.data.total_pages} pages`;

      updateJob({ status: "done", message: successMessage, progress: 100, chapterName: formData.title });
      fetchBooks();
      setTimeout(() => updateJob(null), 8000);

    } catch (error) {
      clearTimeout(msgTimer ?? undefined);
      const isTimeout = error.code === "ECONNABORTED" || error.message?.includes("timeout");
      if (isTimeout) {
        // Backend is still running — keep the progress bar alive and poll
        const stalledJob = {
          ...(window.__uploadJob || {}),
          status: "processing",
          message: `⚙️ Still processing "${formData.title}" in background…`,
          chapterName: formData.title,
        };
        updateJob(stalledJob);

        const pollInterval = setInterval(async () => {
          try { await fetchBooks(); } catch (_) {}
        }, 30000);

        setTimeout(() => {
          clearInterval(pollInterval);
          updateJob(null);
          fetchBooks();
        }, 600000);
      } else {
        const errorMsg = error.response?.data?.message || error.message || "Upload failed";
        updateJob({ status: "error", message: `❌ ${errorMsg}`, progress: 0, chapterName: formData.title });
        setTimeout(() => updateJob(null), 8000);
      }
    }
  };

  const handleEditBook = async (book) => {
    // Fetch book with chapters
    const bookWithChapters = await fetchBookWithChapters(book.id);
    if (bookWithChapters) {
      setEditingBook(bookWithChapters);
      setShowUploadModal(true);
    } else {
      setUploadStatus({
        type: "error",
        message: "❌ Failed to load book chapters"
      });
      setTimeout(() => setUploadStatus({ type: "", message: "" }), 3000);
    }
  };

  const handleUploadBookPdf = async (bookId, file) => {
  setUploading(true);
  setUploadStatus({ type: "info", message: "📤 Uploading full book PDF..." });
  try {
    const fd = new FormData();
    fd.append("book_pdf", file);
    const response = await adminAxios.post(`/books/${bookId}/upload-pdf`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setUploadStatus({ type: "success", message: "✅ Book PDF uploaded successfully!" });
    fetchBooks();
    setTimeout(() => setUploadStatus({ type: "", message: "" }), 4000);
  } catch (error) {
    const msg = error.response?.data?.message || error.message || "Upload failed";
    setUploadStatus({ type: "error", message: `❌ ${msg}` });
  } finally {
    setUploading(false);
  }
};

const handleEditChaptersOnly = async () => {
    if (!existingBook) return;
    
    // Fetch book with chapters
    const bookWithChapters = await fetchBookWithChapters(existingBook.id);
    if (bookWithChapters) {
      setEditingBook(bookWithChapters);
      setShowUploadModal(true);
    } else {
      setUploadStatus({
        type: "error",
        message: "❌ Failed to load book chapters"
      });
      setTimeout(() => setUploadStatus({ type: "", message: "" }), 3000);
    }
  };

  const handleDeleteBook = async () => {
    if (!selectedBook) return;

    try {
      await adminAxios.delete(`/books/${selectedBook.id}`);
      setShowDeleteModal(false);
      setSelectedBook(null);
      fetchBooks();
      
      setUploadStatus({
        type: "success",
        message: "✅ Book deleted successfully"
      });
      setTimeout(() => setUploadStatus({ type: "", message: "" }), 3000);
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };

  const handleViewBook = (book) => {
    setSelectedBook(book);
    setShowViewModal(true);
  };

  const handleDeleteClick = (book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSchool("");
    setSelectedClass("");
    setSelectedSubject("");
  };

  if (loading) {
    return <LoadingSpinner message="Loading books..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 px-4 md:px-6 lg:px-8 pt-8 pb-0  transition-colors duration-200">
      {/* Status Message */}
      {uploadStatus.message && (
        <div className={`mb-6 p-4 rounded-2xl shadow-lg ${
          uploadStatus.type === "success" 
            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" 
            : uploadStatus.type === "error"
            ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
            : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
        }`}>
          <div className="flex items-center justify-between">
            <p className="font-medium">{uploadStatus.message}</p>
            <button
              onClick={() => setUploadStatus({ type: "", message: "" })}
              className="text-current hover:opacity-75"
            >
              ✕
            </button>
          </div>
        </div>
      )}

{/* Background Upload Job Banner */}
{backgroundJob && (
  <div className={`mb-4 rounded-2xl shadow-lg overflow-hidden border ${
    backgroundJob.status === "done"
      ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
      : backgroundJob.status === "error"
      ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
      : "border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20"
  }`}>
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {backgroundJob.status === "done" ? (
            <span className="text-green-500 text-lg flex-shrink-0">✅</span>
          ) : backgroundJob.status === "error" ? (
            <span className="text-red-500 text-lg flex-shrink-0">❌</span>
          ) : (
            <svg className="animate-spin h-5 w-5 text-indigo-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <div className="min-w-0">
            <p className={`font-semibold text-sm truncate ${
              backgroundJob.status === "done" ? "text-green-800 dark:text-green-300"
              : backgroundJob.status === "error" ? "text-red-800 dark:text-red-300"
              : "text-indigo-800 dark:text-indigo-300"
            }`}>
              {backgroundJob.message}
            </p>
            {backgroundJob.status !== "done" && backgroundJob.status !== "error" && backgroundJob.startedAt && (
              <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">
                {`Elapsed: ${Math.floor((Date.now() - backgroundJob.startedAt) / 60000)}m ${Math.floor(((Date.now() - backgroundJob.startedAt) % 60000) / 1000)}s`}
                {backgroundJob.estimatedSecs ? ` · Est. total: ~${Math.round(backgroundJob.estimatedSecs / 60)}m` : ""}
                {" · You can navigate freely — upload continues in background"}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => updateJob(null)}
          className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm"
        >✕</button>
      </div>

      {/* Progress Bar */}
      {backgroundJob.status !== "error" && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-1000 ${
              backgroundJob.status === "done" ? "bg-green-500"
              : "bg-gradient-to-r from-indigo-500 to-purple-500"
            }`}
            style={{ width: `${backgroundJob.progress}%` }}
          />
        </div>
      )}
      {backgroundJob.status !== "error" && backgroundJob.status !== "done" && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-indigo-400">{backgroundJob.progress}% complete</span>
          {backgroundJob.totalChapters && (
            <span className="text-xs text-indigo-400">{backgroundJob.totalChapters} chapter{backgroundJob.totalChapters > 1 ? "s" : ""} · ~2 min each</span>
          )}
        </div>
      )}
    </div>
  </div>
)}

      {/* Header */}
    {/* Header */}
      <BooksHeader
        onUploadBook={() => {
          setEditingBook(null);
          setShowUploadModal(true);
        }}
        onEditChapters={handleEditChaptersOnly}
        disabled={!selectedSchool || !selectedClass || !selectedSubject}
        existingBook={existingBook}
      />

      {/* Statistics */}
      <BooksStats
        books={books}
        filteredBooks={filteredBooks}
      />

      {/* Filters */}
      <BooksFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedSchool={selectedSchool}
        setSelectedSchool={setSelectedSchool}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        schools={schools}
        classes={classes}
        subjects={subjects}
        filteredBooks={filteredBooks}
        totalBooks={books.length}
        clearFilters={clearFilters}
      />

      {/* Books Content */}
      {filteredBooks.length === 0 ? (
        <EmptyState
          totalBooks={books.length}
          hasSchoolSelected={!!selectedSchool}
          hasClassSelected={!!selectedClass}
          hasSubjectSelected={!!selectedSubject}
          onUploadBook={() => {
            setEditingBook(null);
            setShowUploadModal(true);
          }}
          onSelectSchool={() => {
            const schoolSelect = document.querySelector('select[name="school"]');
            schoolSelect?.focus();
          }}
        />
      ) : (
        <>
          <BooksGrid
            books={filteredBooks}
            onView={handleViewBook}
            onEdit={handleEditBook}
            onDelete={handleDeleteClick}
          />
          
          <div className="mt-8">
            <BooksTable
              books={filteredBooks}
              onView={handleViewBook}
              onEdit={handleEditBook}
              onDelete={handleDeleteClick}
            />
          </div>
        </>
      )}

      {/* Modals */}
      {showUploadModal && (
        <UploadBookModal
          onUpload={handleUploadBook}
          onUploadPdf={handleUploadBookPdf}
          onClose={() => {
            setShowUploadModal(false);
            setEditingBook(null);
            setUploadStatus({ type: "", message: "" });
          }}
          uploading={uploading}
          selectedSchool={selectedSchool}
          selectedClass={selectedClass}
          selectedSubject={selectedSubject}
          schools={schools}
          classes={classes}
          subjects={subjects}
          book={editingBook}
        />
      )}

      {showViewModal && selectedBook && (
        <ViewBookModal
          book={selectedBook}
          onClose={() => {
            setShowViewModal(false);
            setSelectedBook(null);
          }}
        />
      )}

      {showDeleteModal && selectedBook && (
        <DeleteBookModal
          book={selectedBook}
          onDelete={handleDeleteBook}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedBook(null);
          }}
        />
      )}
      <div className=" md:-mx-8 -mx-4">
        <AdminFooter/>
      </div>
    </div>
  );
};

export default Books;