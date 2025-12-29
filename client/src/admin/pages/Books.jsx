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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: "", message: "" });

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
    }
  }, [selectedSchool, selectedClass, selectedSubject, searchTerm]);

  const handleUploadBook = async (formData, file) => {
    setUploading(true);
    setUploadStatus({ type: "info", message: "📤 Uploading PDF file..." });

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("title", formData.title);
      uploadFormData.append("author", formData.author || "Unknown");
      uploadFormData.append("subject_id", selectedSubject);
      uploadFormData.append("school_id", selectedSchool);
      uploadFormData.append("class_id", selectedClass);
      uploadFormData.append("board", formData.board);
      uploadFormData.append("class_num", formData.class_num || "1");
      uploadFormData.append("subject_name", formData.subject_name || "Unknown");

      setUploadStatus({ type: "info", message: "⏳ Processing PDF with OCR..." });

      const response = await adminAxios.post("/books/upload", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000
      });

      setUploadStatus({
        type: "success",
        message: `✅ Book uploaded successfully! ${response.data.chapters_created} chapters processed across ${response.data.total_pages} pages`
      });

      setShowUploadModal(false);
      fetchBooks();

      // Clear success message after 5 seconds
      setTimeout(() => setUploadStatus({ type: "", message: "" }), 5000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Upload failed";
      setUploadStatus({
        type: "error",
        message: `❌ ${errorMsg}`
      });
    } finally {
      setUploading(false);
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

      {/* Header */}
      <BooksHeader
        onUploadBook={() => setShowUploadModal(true)}
        disabled={!selectedSchool || !selectedClass || !selectedSubject}
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
          onUploadBook={() => setShowUploadModal(true)}
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
            onDelete={handleDeleteClick}
          />
          
          <div className="mt-8">
            <BooksTable
              books={filteredBooks}
              onView={handleViewBook}
              onDelete={handleDeleteClick}
            />
          </div>
        </>
      )}

      {/* Modals */}
      {showUploadModal && (
        <UploadBookModal
          onUpload={handleUploadBook}
          onClose={() => {
            setShowUploadModal(false);
            setUploadStatus({ type: "", message: "" });
          }}
          uploading={uploading}
          selectedSchool={selectedSchool}
          selectedClass={selectedClass}
          selectedSubject={selectedSubject}
          schools={schools}
          classes={classes}
          subjects={subjects}
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