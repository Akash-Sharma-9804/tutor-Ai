// import { FaPlus, FaBookOpen, FaUpload } from "react-icons/fa";

// const BooksHeader = ({ onUploadBook, disabled }) => {
//   return (
//     <div className="mb-8">
//       <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
//         <div className="flex items-center">
//           <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg mr-4">
//             <FaBookOpen className="text-white text-2xl" />
//           </div>
//           <div>
//             <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
//               Digital Library
//             </h1>
//             <p className="text-gray-600 dark:text-gray-300">
//               Upload, manage, and organize educational books
//             </p>
//           </div>
//         </div>
//        <button
//           onClick={onUploadBook}
//           disabled={disabled}
//           className={`mt-4 md:mt-0 cursor-pointer px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center transform hover:-translate-y-0.5 active:translate-y-0 ${
//             disabled 
//               ? 'opacity-50 cursor-not-allowed' 
//               : 'hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600'
//           }`}
//         >
//           <FaUpload className="mr-2" />
//           Upload Book
//         </button>
//       </div>
//     </div>
//   );
// };

// export default BooksHeader;


import { FaPlus, FaBookOpen, FaUpload, FaEdit } from "react-icons/fa";

const BooksHeader = ({ onUploadBook, onEditChapters, disabled, existingBook }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg mr-4">
            <FaBookOpen className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Digital Library
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {existingBook 
                ? `Managing: ${existingBook.title}` 
                : "Upload, manage, and organize educational books"}
            </p>
          </div>
        </div>
        
        {existingBook ? (
          <button
            onClick={onEditChapters}
            className="mt-4 md:mt-0 cursor-pointer px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center transform hover:-translate-y-0.5 active:translate-y-0 hover:from-green-700 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600"
          >
            <FaEdit className="mr-2" />
            Edit Chapters
          </button>
        ) : (
          <button
            onClick={onUploadBook}
            disabled={disabled}
            className={`mt-4 md:mt-0 cursor-pointer px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center transform hover:-translate-y-0.5 active:translate-y-0 ${
              disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600'
            }`}
          >
            <FaUpload className="mr-2" />
            Upload Book
          </button>
        )}
      </div>
    </div>
  );
};

export default BooksHeader;