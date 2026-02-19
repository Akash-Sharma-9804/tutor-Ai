

// import { useState } from "react";
// import { FaTimes, FaUpload, FaBook, FaPlus, FaTrash, FaFilePdf } from "react-icons/fa";

// const UploadBookModal = ({ onUpload, onClose, uploading, selectedSchool, selectedClass, selectedSubject, schools, classes, subjects }) => {
//  // Get helper data
//   const getSchoolObj = () => schools.find(s => s.id === parseInt(selectedSchool));
//   const getClassObj = () => classes.find(c => c.id === parseInt(selectedClass));
//   const getSubjectObj = () => subjects.find(s => s.id === parseInt(selectedSubject));

//   const [formData, setFormData] = useState({
//     title: "",
//     author: "",
//     board: getSchoolObj()?.board || "CBSE",
//     class_num: getClassObj()?.class_name?.match(/\d+/)?.[0] || "",
//     subject_name: getSubjectObj()?.name || getSubjectObj()?.subject_name || "",
//     chapters: [{ chapter_number: 1, chapter_title: "", file: null }]
//   });

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleChapterChange = (index, field, value) => {
//     const updatedChapters = [...formData.chapters];
//     updatedChapters[index][field] = value;
//     setFormData({
//       ...formData,
//       chapters: updatedChapters
//     });
//   };

//   const handleFileChange = (index, file) => {
//     if (file && file.type === "application/pdf") {
//       const updatedChapters = [...formData.chapters];
//       updatedChapters[index].file = file;
//       setFormData({
//         ...formData,
//         chapters: updatedChapters
//       });
//     } else {
//       alert("Please select a valid PDF file");
//     }
//   };

//   const addChapter = () => {
//     setFormData({
//       ...formData,
//       chapters: [
//         ...formData.chapters,
//         { 
//           chapter_number: formData.chapters.length + 1, 
//           chapter_title: "", 
//           file: null 
//         }
//       ]
//     });
//   };

//   const removeChapter = (index) => {
//     if (formData.chapters.length === 1) {
//       alert("At least one chapter is required");
//       return;
//     }
    
//     const updatedChapters = formData.chapters.filter((_, i) => i !== index);
//     // Renumber chapters
//     updatedChapters.forEach((chapter, i) => {
//       chapter.chapter_number = i + 1;
//     });
    
//     setFormData({
//       ...formData,
//       chapters: updatedChapters
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     // Validate all chapters have files
//     const missingFiles = formData.chapters.filter(ch => !ch.file);
//     if (missingFiles.length > 0) {
//       alert("Please select PDF files for all chapters");
//       return;
//     }

//     // Validate all chapters have titles
//     const missingTitles = formData.chapters.filter(ch => !ch.chapter_title.trim());
//     if (missingTitles.length > 0) {
//       alert("Please provide titles for all chapters");
//       return;
//     }

//     // Extract files array
//     const files = formData.chapters.map(ch => ch.file);
    
//     // Prepare chapter metadata (without files)
//     const chaptersMetadata = formData.chapters.map(ch => ({
//       chapter_number: ch.chapter_number,
//       chapter_title: ch.chapter_title
//     }));

//    // Ensure subject_name is set
//     const finalSubjectName = formData.subject_name || getSubjectObj()?.name || getSubjectObj()?.subject_name || "Unknown";
//     const finalClassNum = formData.class_num || getClassObj()?.class_name?.match(/\d+/)?.[0] || "1";
//     const finalBoard = formData.board || getSchoolObj()?.board || "CBSE";

//     const submitData = {
//       ...formData,
//       subject_name: finalSubjectName,
//       class_num: finalClassNum,
//       board: finalBoard,
//       chapters: chaptersMetadata
//     };

//     onUpload(submitData, files);
//   };

//  const getSchoolName = () => {
//     return getSchoolObj()?.name || "Selected School";
//   };

//   const getClassName = () => {
//     return getClassObj()?.name || getClassObj()?.class_name || "Selected Class";
//   };

//   const getSubjectName = () => {
//     return getSubjectObj()?.name || getSubjectObj()?.subject_name || "Selected Subject";
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
//       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full my-8">
//         {/* Header */}
//         <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 p-6 rounded-t-2xl z-10">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <FaBook className="text-white text-2xl mr-3" />
//               <h2 className="text-2xl font-bold text-white">Upload New Book</h2>
//             </div>
//             <button
//               onClick={onClose}
//               disabled={uploading}
//               className="text-white cursor-pointer hover:bg-red-400 hover:bg-opacity-20 rounded-lg p-2 transition-colors disabled:opacity-50"
//             >
//               <FaTimes className="text-xl" />
//             </button>
//           </div>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
//           {/* Context Info */}
//           <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl">
//             <p className="text-sm text-gray-700 dark:text-gray-300">
//               <strong>School:</strong> {getSchoolName()} | 
//               <strong className="ml-2">Class:</strong> {getClassName()} | 
//               <strong className="ml-2">Subject:</strong> {getSubjectName()}
//             </p>
//           </div>

//           {/* Book Details */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                 Book Title <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="title"
//                 value={formData.title}
//                 onChange={handleChange}
//                 disabled={uploading}
//                 required
//                 placeholder="e.g., Physics Textbook"
//                 className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all disabled:opacity-50"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                 Author
//               </label>
//               <input
//                 type="text"
//                 name="author"
//                 value={formData.author}
//                 onChange={handleChange}
//                 disabled={uploading}
//                 placeholder="e.g., NCERT"
//                 className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all disabled:opacity-50"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                 Board
//               </label>
//               <input
//                 type="text"
//                 name="board"
//                 value={formData.board}
//                 onChange={handleChange}
//                 disabled={uploading}
//                 placeholder="e.g., CBSE, ICSE"
//                 className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all disabled:opacity-50"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                 Class Number
//               </label>
//               <input
//                 type="number"
//                 name="class_num"
//                 value={formData.class_num}
//                 onChange={handleChange}
//                 disabled={uploading}
//                 placeholder="e.g., 10, 11, 12"
//                 className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all disabled:opacity-50"
//               />
//             </div>
//           </div>

//           {/* Chapters Section */}
//           <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-bold text-gray-800 dark:text-white">
//                 Chapters ({formData.chapters.length})
//               </h3>
//               <button
//                 type="button"
//                 onClick={addChapter}
//                 disabled={uploading}
//                 className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white font-semibold rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center disabled:opacity-50"
//               >
//                 <FaPlus className="mr-2" /> Add Chapter
//               </button>
//             </div>

//             <div className="space-y-4">
//               {formData.chapters.map((chapter, index) => (
//                 <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600">
//                   <div className="flex items-start justify-between mb-3">
//                     <h4 className="font-semibold text-gray-700 dark:text-gray-300">
//                       Chapter {chapter.chapter_number}
//                     </h4>
//                     {formData.chapters.length > 1 && (
//                       <button
//                         type="button"
//                         onClick={() => removeChapter(index)}
//                         disabled={uploading}
//                         className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors disabled:opacity-50"
//                       >
//                         <FaTrash />
//                       </button>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-1 gap-3">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
//                         Chapter Title <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         value={chapter.chapter_title}
//                         onChange={(e) => handleChapterChange(index, 'chapter_title', e.target.value)}
//                         disabled={uploading}
//                         required
//                         placeholder={`e.g., Introduction to Chapter ${chapter.chapter_number}`}
//                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all disabled:opacity-50"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
//                         PDF File <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <input
//                           type="file"
//                           accept=".pdf"
//                           onChange={(e) => handleFileChange(index, e.target.files[0])}
//                           disabled={uploading}
//                           required
//                           className="w-full px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all disabled:opacity-50 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/50"
//                         />
//                       </div>
//                       {chapter.file && (
//                         <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 flex items-center">
//                           <FaFilePdf className="mr-1 text-red-500" />
//                           {chapter.file.name} ({(chapter.file.size / 1024 / 1024).toFixed(2)} MB)
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={uploading}
//               className="flex-1 px-6 cursor-pointer py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-red-400  hover:text-black transition-all disabled:opacity-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={uploading}
//               className="flex-1 px-6 py-3 cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center"
//             >
//               {uploading ? (
//                 <>
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Uploading...
//                 </>
//               ) : (
//                 <>
//                   <FaUpload className="mr-2" />
//                   Upload Book with {formData.chapters.length} Chapter{formData.chapters.length > 1 ? 's' : ''}
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default UploadBookModal;

import { useState, useEffect } from "react";
import { FaTimes, FaUpload, FaBook, FaPlus, FaTrash, FaFilePdf, FaCheck } from "react-icons/fa";

const UploadBookModal = ({ onUpload, onClose, uploading, selectedSchool, selectedClass, selectedSubject, schools, classes, subjects, book = null }) => {
 // Get helper data
  const getSchoolObj = () => schools.find(s => s.id === parseInt(selectedSchool));
  const getClassObj = () => classes.find(c => c.id === parseInt(selectedClass));
  const getSubjectObj = () => subjects.find(s => s.id === parseInt(selectedSubject));

 const isEditMode = !!book;

  // DEBUG: Log what we receive
  console.log("=== UploadBookModal Debug ===");
  console.log("book prop:", book);
  console.log("book.id:", book?.id);
  console.log("isEditMode:", isEditMode);
  console.log("chapters:", book?.chapters);

  const [formData, setFormData] = useState({
    title: book?.title || "",
    author: book?.author || "",
    board: book?.board || getSchoolObj()?.board || "CBSE",
    class_num: book?.class_num || getClassObj()?.class_name?.match(/\d+/)?.[0] || "",
    subject_name: book?.subject_name || getSubjectObj()?.name || getSubjectObj()?.subject_name || "",
    chapters: book?.chapters?.length > 0 
      ? book.chapters.map(ch => ({
          id: ch.id,
          chapter_number: ch.chapter_number || ch.chapter_no,
          chapter_title: ch.chapter_title,
          file: null,
          existing: true
        }))
      : [{ chapter_number: 1, chapter_title: "", file: null, existing: false }]
  });

  const [chaptersToDelete, setChaptersToDelete] = useState([]);

  // Update formData when book prop changes (important for edit mode!)
  useEffect(() => {
    if (book && book.chapters && book.chapters.length > 0) {
      console.log("📚 Loading existing chapters:", book.chapters);
      setFormData(prev => ({
        ...prev,
        title: book.title || prev.title,
        author: book.author || prev.author,
        board: book.board || prev.board,
        class_num: book.class_num || prev.class_num,
        subject_name: book.subject_name || prev.subject_name,
        chapters: book.chapters.map(ch => ({
          id: ch.id,
          chapter_number: ch.chapter_number || ch.chapter_no,
          chapter_title: ch.chapter_title,
          file: null,
          existing: true
        }))
      }));
    }
  }, [book]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleChapterChange = (index, field, value) => {
    const updatedChapters = [...formData.chapters];
    updatedChapters[index][field] = value;
    setFormData({
      ...formData,
      chapters: updatedChapters
    });
  };

  const handleFileChange = (index, file) => {
    if (file && file.type === "application/pdf") {
      const updatedChapters = [...formData.chapters];
      updatedChapters[index].file = file;
      setFormData({
        ...formData,
        chapters: updatedChapters
      });
    } else {
      alert("Please select a valid PDF file");
    }
  };

  const addChapter = () => {
    setFormData({
      ...formData,
      chapters: [
        ...formData.chapters,
        { 
          chapter_number: formData.chapters.length + 1, 
          chapter_title: "", 
          file: null,
          existing: false
        }
      ]
    });
  };

  const removeChapter = (index) => {
    const chapterToRemove = formData.chapters[index];
    
    // If it's an existing chapter, add to delete list
    if (chapterToRemove.existing && chapterToRemove.id) {
      setChaptersToDelete([...chaptersToDelete, chapterToRemove.id]);
    }
    
    // Remove from formData
    const updatedChapters = formData.chapters.filter((_, i) => i !== index);
    
    // Renumber chapters
    updatedChapters.forEach((chapter, i) => {
      chapter.chapter_number = i + 1;
    });
    
    setFormData({
      ...formData,
      chapters: updatedChapters
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate: new chapters must have files, existing chapters can skip if no file
    const newChaptersWithoutFiles = formData.chapters.filter(ch => !ch.existing && !ch.file);
    if (newChaptersWithoutFiles.length > 0) {
      alert("Please select PDF files for all new chapters");
      return;
    }

    // Validate all chapters have titles
    const missingTitles = formData.chapters.filter(ch => !ch.chapter_title.trim());
    if (missingTitles.length > 0) {
      alert("Please provide titles for all chapters");
      return;
    }

    // Separate new chapters and existing chapters
    const newChapters = formData.chapters.filter(ch => !ch.existing || ch.file);
    const existingChaptersToUpdate = formData.chapters.filter(ch => ch.existing && !ch.file);
    
    // Extract files array (only for chapters with files)
    const files = formData.chapters
      .filter(ch => ch.file)
      .map(ch => ch.file);
    
    // Prepare chapter metadata
    const chaptersMetadata = formData.chapters.map(ch => ({
      id: ch.existing ? ch.id : undefined,
      chapter_number: ch.chapter_number,
      chapter_title: ch.chapter_title,
      existing: ch.existing,
      hasFile: !!ch.file
    }));

   // Ensure subject_name is set
    const finalSubjectName = formData.subject_name || getSubjectObj()?.name || getSubjectObj()?.subject_name || "Unknown";
    const finalClassNum = formData.class_num || getClassObj()?.class_name?.match(/\d+/)?.[0] || "1";
    const finalBoard = formData.board || getSchoolObj()?.board || "CBSE";

  const submitData = {
      ...formData,
      subject_name: finalSubjectName,
      class_num: finalClassNum,
      board: finalBoard,
      chapters: chaptersMetadata,
      chaptersToDelete: chaptersToDelete,
      isEditMode: isEditMode,
      bookId: book?.id
    };

    console.log("=== Submit Data Debug ===");
    console.log("submitData:", submitData);
    console.log("isEditMode:", submitData.isEditMode);
    console.log("bookId:", submitData.bookId);
    console.log("chapters:", submitData.chapters);

    onUpload(submitData, files);
  };

 const getSchoolName = () => {
    return getSchoolObj()?.name || "Selected School";
  };

  const getClassName = () => {
    return getClassObj()?.name || getClassObj()?.class_name || "Selected Class";
  };

  const getSubjectName = () => {
    return getSubjectObj()?.name || getSubjectObj()?.subject_name || "Selected Subject";
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
          <div className="flex items-center">
              <FaBook className="text-white text-2xl mr-3" />
              <h2 className="text-2xl font-bold text-white">
                {isEditMode ? "Manage Book Chapters" : "Upload New Book"}
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={uploading}
              className="text-white cursor-pointer hover:bg-red-400 hover:bg-opacity-20 rounded-lg p-2 transition-colors disabled:opacity-50"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Context Info */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>School:</strong> {getSchoolName()} | 
              <strong className="ml-2">Class:</strong> {getClassName()} | 
              <strong className="ml-2">Subject:</strong> {getSubjectName()}
            </p>
          </div>

          {/* Edit Mode Notice */}
          {isEditMode && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 p-4 rounded-xl">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>📝 Edit Mode:</strong> Existing chapters are displayed below. You can add new chapters, delete existing ones, or update existing chapter PDFs.
              </p>
            </div>
          )}

          {/* Book Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Book Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={uploading}
                required
                placeholder="e.g., Physics Textbook"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Author
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                disabled={uploading}
                placeholder="e.g., NCERT"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Board
              </label>
              <input
                type="text"
                name="board"
                value={formData.board}
                onChange={handleChange}
                disabled={uploading}
                placeholder="e.g., CBSE, ICSE"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Class Number
              </label>
              <input
                type="number"
                name="class_num"
                value={formData.class_num}
                onChange={handleChange}
                disabled={uploading}
                placeholder="e.g., 10, 11, 12"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Chapters Section */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Chapters ({formData.chapters.length})
                {chaptersToDelete.length > 0 && (
                  <span className="ml-2 text-sm text-red-600 dark:text-red-400">
                    ({chaptersToDelete.length} to delete)
                  </span>
                )}
              </h3>
              <button
                type="button"
                onClick={addChapter}
                disabled={uploading}
                className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white font-semibold rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center disabled:opacity-50"
              >
                <FaPlus className="mr-2" /> Add Chapter
              </button>
            </div>

            <div className="space-y-4">
              {formData.chapters.map((chapter, index) => (
                <div key={index} className={`p-4 rounded-xl border-2 ${
                  chapter.existing 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' 
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                        Chapter {chapter.chapter_number}
                        {chapter.existing && (
                          <span className="ml-2 text-xs bg-blue-600 dark:bg-blue-500 text-white px-2 py-1 rounded-full inline-flex items-center">
                            <FaCheck className="mr-1" /> Existing
                          </span>
                        )}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeChapter(index)}
                      disabled={uploading}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors disabled:opacity-50"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Chapter Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={chapter.chapter_title}
                        onChange={(e) => handleChapterChange(index, 'chapter_title', e.target.value)}
                        disabled={uploading}
                        required
                        placeholder={`e.g., Introduction to Chapter ${chapter.chapter_number}`}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        PDF File {!chapter.existing && <span className="text-red-500">*</span>}
                        {chapter.existing && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            (Upload new file to replace existing)
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileChange(index, e.target.files[0])}
                          disabled={uploading}
                          required={!chapter.existing}
                          className="w-full px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all disabled:opacity-50 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/50"
                        />
                      </div>
                      {chapter.file && (
                        <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center">
                          <FaFilePdf className="mr-1 text-red-500" />
                          New: {chapter.file.name} ({(chapter.file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                      {chapter.existing && !chapter.file && (
                        <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                          ✓ Using existing chapter PDF
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="flex-1 px-6 cursor-pointer py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-red-400  hover:text-black transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-6 py-3 cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center"
            >
             {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditMode ? "Updating..." : "Uploading..."}
                </>
              ) : (
                <>
                  <FaUpload className="mr-2" />
                  {isEditMode 
                    ? `Update Chapters (${formData.chapters.filter(ch => !ch.existing || ch.file).length} new/updated)`
                    : `Upload Book with ${formData.chapters.length} Chapter${formData.chapters.length > 1 ? 's' : ''}`
                  }
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadBookModal;