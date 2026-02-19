import { FaBookOpen, FaSchool, FaChalkboardTeacher, FaUser, FaExternalLinkAlt, FaEye, FaEdit, FaTrash } from "react-icons/fa";

const BooksTable = ({ books, onView, onEdit, onDelete }) => {
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">All Books</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
              <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Book Title</th>
              <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Author</th>
              <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Class</th>
              <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Subject</th>
              {/* <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Size</th> */}
              <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr
                key={book.id}
                className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg mr-3">
                      <FaBookOpen className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 dark:text-white block">
                        {book.title}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px] block">
                        {book.school}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    <FaUser className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {book.author || "Unknown"}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center">
                    <FaChalkboardTeacher className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {book.class_name}
                    </span>
                  </div>
                </td>
              <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onView(book)}
                      className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => onEdit(book)}
                      className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      title="Edit Book"
                    >
                      <FaEdit />
                    </button>
                    {book.pdf_url && (
                      <a
                        href={book.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        title="Open PDF"
                      >
                        <FaExternalLinkAlt />
                      </a>
                    )}
                    <button
                      onClick={() => onDelete(book)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BooksTable;