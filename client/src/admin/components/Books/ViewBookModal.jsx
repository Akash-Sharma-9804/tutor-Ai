 
import { useEffect, useState } from "react";
import adminAxios from "../../api/adminAxios";
import { FaBookOpen, FaSchool, FaChalkboardTeacher, FaUser, FaCalendarAlt, FaExternalLinkAlt, FaTimes, FaFilePdf, FaLayerGroup } from "react-icons/fa";


const ChaptersSection = ({ bookId }) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await adminAxios.get(`/books/${bookId}/chapters`);
        const bookData = res.data.data;
setChapters(bookData?.chapters || []);
      } catch (error) {
        console.error("Error fetching chapters:", error);
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchChapters();
    }
  }, [bookId]);

  if (loading) {
    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Chapters</h4>
        <p className="text-gray-500 dark:text-gray-400">Loading chapters...</p>
      </div>
    );
  }

  if (chapters.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
        Chapters ({chapters.length})
      </h4>
      <div className="space-y-3">
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <span className="inline-flex items-center px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-sm font-medium mr-3">
                  Ch {chapter.chapter_no}
                </span>
                <h5 className="font-medium text-gray-800 dark:text-white">
                  {chapter.chapter_title}
                </h5>
              </div>
              {chapter.total_segments > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-12">
                  {chapter.total_segments} segments processed
                </p>
              )}
            </div>
            {chapter.pdf_url && (
              <a
                href={chapter.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all shadow hover:shadow-md"
              >
                <FaFilePdf className="mr-2" />
                Open PDF
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ViewBookModal = ({ book, onClose }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getFileSize = (size) => {
    if (!size) return "N/A";
    const mb = size / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Book Details</h2>
            <button
              onClick={onClose}
              className="p-2 cursor-pointer text-black hover:dark:text-black   rounded-full hover:bg-red-300   transition-colors"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-start mb-6">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow mr-4">
              <FaBookOpen className="text-white text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {book.title}
              </h3>
              {book.author && (
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
                  <FaUser className="mr-2" />
                  <span className="text-lg">by {book.author}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {book.board && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    {book.board}
                  </span>
                )}
                {book.class_name && (
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                    <FaChalkboardTeacher className="mr-1" />
                    {book.class_name}
                  </span>
                )}
                {book.subject && (
                  <span className="inline-flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                    {book.subject}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Course Information</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FaSchool className="text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">School</p>
                    <p className="font-medium text-gray-800 dark:text-white">{book.school}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaChalkboardTeacher className="text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Class</p>
                    <p className="font-medium text-gray-800 dark:text-white">{book.class_name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaBookOpen className="text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Subject</p>
                    <p className="font-medium text-gray-800 dark:text-white">{book.subject}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Book Information</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded</p>
                    <p className="font-medium text-gray-800 dark:text-white">{formatDate(book.created_at)}</p>
                  </div>
                </div>
                {/* <div className="flex items-center">
                  <FaFilePdf className="text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">File Size</p>
                    <p className="font-medium text-gray-800 dark:text-white">{getFileSize(book.file_size)}</p>
                  </div>
                </div> */}
                {book.chapters_count > 0 && (
                  <div className="flex items-center">
                    <FaLayerGroup className="text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Chapters</p>
                      <p className="font-medium text-gray-800 dark:text-white">{book.chapters_count} chapters processed</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        {book.pdf_url && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">PDF Document</h4>
              <a
                href={book.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
              >
                <FaExternalLinkAlt className="mr-2" />
                Open PDF Document
              </a>
            </div>
          )}

          {/* Chapters Section */}
          <ChaptersSection bookId={book.id} />
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 cursor-pointer bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewBookModal;