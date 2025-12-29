import { FaBookOpen, FaSchool, FaChalkboardTeacher, FaUser, FaCalendarAlt, FaExternalLinkAlt, FaTrash, FaEye } from "react-icons/fa";

const BookCard = ({ book, onView, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFileSize = (size) => {
    if (!size) return "N/A";
    const mb = size / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow mr-4">
            <FaBookOpen className="text-white text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1 line-clamp-2">
              {book.title}
            </h3>
            {book.author && (
              <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
                <FaUser className="mr-1" />
                <span>by {book.author}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {book.class_name && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  <FaChalkboardTeacher className="mr-1" />
                  {book.class_name}
                </span>
              )}
              {book.subject && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                  {book.subject}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onDelete(book)}
          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Delete Book"
        >
          <FaTrash />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">School</p>
          <div className="flex items-center">
            <FaSchool className="text-gray-400 dark:text-gray-500 mr-2" />
            <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
              {book.school || "N/A"}
            </span>
          </div>
        </div>

        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Uploaded</p>
          <div className="flex items-center">
            <FaCalendarAlt className="text-gray-400 dark:text-gray-500 mr-2" />
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {formatDate(book.created_at)}
            </span>
          </div>
        </div>
      </div>

      {book.pdf_url && (
        <div className="mb-4">
          <a
            href={book.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
          >
            <FaExternalLinkAlt className="mr-2" />
            View PDF ({getFileSize(book.file_size)})
          </a>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onView(book)}
          className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          <FaEye className="mr-2" />
          View Details
        </button>
        {book.chapters_count > 0 && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {book.chapters_count} chapters
          </span>
        )}
      </div>
    </div>
  );
};

export default BookCard;