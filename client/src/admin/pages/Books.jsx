import { useEffect, useState } from "react";
import adminAxios from "../api/adminAxios";
import Table from "../components/Table";
import StatusBadge from "../components/StatusBadge";

const Books = () => {
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [books, setBooks] = useState([]);

  const [schoolId, setSchoolId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  // Store selected metadata for upload
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [board, setBoard] = useState("CBSE"); // Default board
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  /* Fetch schools */
  useEffect(() => {
    adminAxios.get("/schools").then(res => setSchools(res.data));
  }, []);

  /* Fetch classes when school changes */
  useEffect(() => {
    if (!schoolId) return;
    setClassId("");
    setSubjectId("");
    setBooks([]);
    setSelectedClass(null);
    setSelectedSubject(null);
    
    adminAxios.get(`/classes?schoolId=${schoolId}`).then(res => {
      setClasses(res.data);
      // Store selected school object
      const school = schools.find(s => s.id === parseInt(schoolId));
      setSelectedSchool(school);
      // Try to extract board from school name if available
      if (school?.name?.includes("CBSE")) setBoard("CBSE");
      else if (school?.name?.includes("ICSE")) setBoard("ICSE");
      else if (school?.name?.includes("IB")) setBoard("IB");
    });
  }, [schoolId, schools]);

  /* Fetch subjects when class changes */
  useEffect(() => {
    if (!schoolId || !classId) return;
    setSubjectId("");
    setBooks([]);
    setSelectedSubject(null);
    
    adminAxios.get(`/subjects?schoolId=${schoolId}&classId=${classId}`).then(res => {
      setSubjects(res.data);
      // Store selected class object
      const cls = classes.find(c => c.id === parseInt(classId));
      setSelectedClass(cls);
    });
  }, [schoolId, classId, classes]);

  /* Fetch books when subject changes */
  useEffect(() => {
    if (!subjectId) return;
    
    // Store selected subject object
    const subject = subjects.find(s => s.id === parseInt(subjectId));
    setSelectedSubject(subject);
    
    adminAxios.get(`/books?subjectId=${subjectId}`).then(res => setBooks(res.data));
  }, [subjectId, subjects]);

  /* Upload Book Handler */
  const handleUpload = async () => {
    if (!schoolId || !classId || !subjectId) {
      setUploadStatus("❌ Please select School, Class and Subject");
      return;
    }
    if (!file) {
      setUploadStatus("❌ Please select a PDF file");
      return;
    }
    if (!title.trim()) {
      setUploadStatus("❌ Please enter a book title");
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus("⏳ Uploading PDF...");
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title.trim());
      formData.append("author", author.trim() || "Unknown");
      formData.append("subject_id", subjectId);
      formData.append("school_id", schoolId);
      formData.append("class_id", classId);
      
      // Add required metadata for new architecture
      formData.append("board", board);
      
      // Extract class number from class_name (e.g., "Class 8" -> 8)
      const classNum = selectedClass?.class_name?.match(/\d+/)?.[0] || classId;
      formData.append("class_num", classNum);
      
      // Send subject name
      formData.append("subject_name", selectedSubject?.subject_name || "Unknown");

      console.log("📤 Uploading with metadata:", {
        board,
        class_num: classNum,
        subject_name: selectedSubject?.subject_name,
        title: title.trim()
      });

      setUploadStatus("⏳ Processing PDF with OCR...");
      
      const response = await adminAxios.post("/books/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000 // 5 minutes timeout for large PDFs
      });

      console.log("✅ Upload response:", response.data);

      setUploadStatus(`✅ Book uploaded! ${response.data.chapters_created} chapters processed across ${response.data.total_pages} pages`);
      
      // Reset form
      setTitle("");
      setAuthor("");
      setFile(null);
      
      // Refresh books list
      adminAxios.get(`/books?subjectId=${subjectId}`).then(res => setBooks(res.data));
      
      // Clear success message after 5 seconds
      setTimeout(() => setUploadStatus(""), 5000);
      
    } catch (err) {
      console.error("Upload error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Upload failed";
      setUploadStatus(`❌ ${errorMsg}`);
    } finally {
      setIsUploading(false);
    }
  };

  /* Delete Book Handler */
  const handleDelete = async (bookId) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    
    try {
      await adminAxios.delete(`/books/${bookId}`);
      setUploadStatus("✅ Book deleted");
      // Refresh list
      adminAxios.get(`/books?subjectId=${subjectId}`).then(res => setBooks(res.data));
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setUploadStatus("❌ Delete failed");
    }
  };

  const tableData = books.map(b => ({
    Title: b.title,
    Class: b.class_name,
    Subject: b.subject,
    Author: b.author || "N/A",
    Status: <StatusBadge status="ready" />,
    Actions: (
      <button
        onClick={() => handleDelete(b.id)}
        className="text-red-600 hover:text-red-800 text-sm"
      >
        Delete
      </button>
    )
  }));

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Upload Books</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select 
          value={schoolId} 
          onChange={e => setSchoolId(e.target.value)} 
          className="border p-2 rounded"
          disabled={isUploading}
        >
          <option value="">Select School</option>
          {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <select 
          value={classId} 
          onChange={e => setClassId(e.target.value)} 
          className="border p-2 rounded" 
          disabled={!schoolId || isUploading}
        >
          <option value="">Select Class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.class_name}</option>)}
        </select>

        <select 
          value={subjectId} 
          onChange={e => setSubjectId(e.target.value)} 
          className="border p-2 rounded" 
          disabled={!classId || isUploading}
        >
          <option value="">Select Subject</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
        </select>
      </div>

      {/* Upload Form - Only show when subject is selected */}
      {subjectId && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-3">Upload New Book</h3>
          
          {/* Board Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Board *</label>
            <select
              value={board}
              onChange={e => setBoard(e.target.value)}
              className="border p-2 rounded w-full max-w-sm"
              disabled={isUploading}
            >
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="IB">IB</option>
              <option value="State Board">State Board</option>
            </select>
          </div>

          {/* Book Title Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Book Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter book title"
              className="border p-2 rounded w-full max-w-sm"
              disabled={isUploading}
            />
          </div>

          {/* Author Input (Optional) */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Author (Optional)</label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="Enter author name"
              className="border p-2 rounded w-full max-w-sm"
              disabled={isUploading}
            />
          </div>

          {/* File Picker */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Upload PDF *</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={e => setFile(e.target.files[0])}
              className="border p-2 rounded w-full max-w-sm"
              disabled={isUploading}
            />
            {file && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading || !file || !title.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUploading ? "Processing..." : "Upload & Process Book"}
          </button>

          {/* Upload Status */}
          {uploadStatus && (
            <div className={`mt-3 p-3 rounded ${
              uploadStatus.includes("❌") ? "bg-red-50 text-red-700" :
              uploadStatus.includes("⏳") ? "bg-yellow-50 text-yellow-700" :
              "bg-green-50 text-green-700"
            }`}>
              <p className="font-medium">{uploadStatus}</p>
            </div>
          )}

          {/* Processing Info */}
          {isUploading && (
            <div className="mt-3 text-sm text-gray-600">
              <p>⚙️ This may take a few minutes for large PDFs...</p>
              <p>📄 OCR extraction → 📚 Chapter detection → 🧩 Chunking → 🧠 Embeddings</p>
            </div>
          )}
        </div>
      )}

      {/* Books Table */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Existing Books</h3>
        {books.length > 0 ? (
          <Table 
            columns={["Title", "Class", "Subject", "Author", "Status", "Actions"]} 
            data={tableData} 
          />
        ) : (
          <p className="text-gray-500">
            {subjectId ? "No books uploaded yet" : "Select a subject to view books"}
          </p>
        )}
      </div>
    </div>
  );
};

export default Books;