import { useState } from "react";
import { FaTimes, FaUpload, FaBookOpen, FaGraduationCap, FaUser } from "react-icons/fa";

const UploadBookModal = ({ 
  onUpload, 
  onClose, 
  uploading, 
  selectedSchool, 
  selectedClass, 
  selectedSubject,
  schools,
  classes,
  subjects
}) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    board: "CBSE",
    class_num: "",
    subject_name: ""
  });
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");

  const selectedSchoolObj = schools.find(s => s.id == selectedSchool);
  const selectedClassObj = classes.find(c => c.id == selectedClass);
  const selectedSubjectObj = subjects.find(s => s.id == selectedSubject);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file type
    if (selectedFile.type !== "application/pdf") {
      setFileError("Please upload a PDF file");
      setFile(null);
      return;
    }

    // Validate file size (max 100MB)
    if (selectedFile.size > 100 * 1024 * 1024) {
      setFileError("File size must be less than 100MB");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!file) {
      setFileError("Please select a PDF file");
      return;
    }

    if (!formData.title.trim()) {
      alert("Please enter a book title");
      return;
    }

    // Auto-fill subject name if not provided
    const finalFormData = {
      ...formData,
      subject_name: formData.subject_name || selectedSubjectObj?.name || selectedSubjectObj?.subject_name || "Unknown",
      class_num: formData.class_num || selectedClassObj?.class_name?.match(/\d+/)?.[0] || "1"
    };

    onUpload(finalFormData, file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
              <FaBookOpen className="mr-2" />
              Upload New Book
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={uploading}
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Selection Summary */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Selected Course</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                      <FaGraduationCap className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">School</p>
                      <p className="font-bold text-gray-800 dark:text-white">{selectedSchoolObj?.name || "Not selected"}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                      <FaBookOpen className="text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Class</p>
                      <p className="font-bold text-gray-800 dark:text-white">{selectedClassObj?.class_name || "Not selected"}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3">
                      <FaBookOpen className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Subject</p>
                      <p className="font-bold text-gray-800 dark:text-white">{selectedSubjectObj?.name || selectedSubjectObj?.subject_name || "Not selected"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Book Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  disabled={uploading}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder="Enter book title"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Author (Optional)
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    disabled={uploading}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter author name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Education Board *
                  </label>
                  <select
                    name="board"
                    value={formData.board}
                    onChange={handleInputChange}
                    required
                    disabled={uploading}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-800 dark:text-white appearance-none"
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="IB">IB</option>
                    <option value="State Board">State Board</option>
                    <option value="Cambridge">Cambridge</option>
                    <option value="WBBSE">WBBSE</option>
                  </select>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PDF File *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <FaBookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                        <span>Upload a PDF file</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileChange}
                          disabled={uploading}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF up to 100MB
                    </p>
                    {file && (
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          Selected: {file.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    )}
                    {fileError && (
                      <p className="text-sm text-red-600 dark:text-red-400">{fileError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Processing Info */}
              {uploading && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <div className="flex items-center">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-300">Processing Book...</p>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                        This may take a few minutes for large PDFs
                      </p>
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 space-y-1">
                        <p>📄 Extracting text with OCR...</p>
                        <p>📚 Detecting chapters...</p>
                        <p>🧩 Creating content chunks...</p>
                        <p>🧠 Generating embeddings...</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading || !file}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaUpload className="mr-2" />
                {uploading ? "Processing..." : "Upload & Process Book"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadBookModal;