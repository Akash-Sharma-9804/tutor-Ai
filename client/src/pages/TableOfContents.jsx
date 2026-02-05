import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  ChevronRight, 
  Clock, 
  CheckCircle,
  Circle,
  ArrowLeft
} from "lucide-react";

const TableOfContents = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({});
  
  useEffect(() => {
    loadBookChapters();
  }, [bookId]);
  
  const loadBookChapters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/${bookId}/chapters`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setBook(res.data.book);
      setChapters(res.data.chapters);
      
      // Load progress for all chapters
      // This would require a new API endpoint to get all progress for a book
      
    } catch (err) {
      console.error("Failed to load chapters:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const openChapter = (chapterId) => {
    navigate(`/reader/${chapterId}`);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Subjects
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {book?.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {book?.board} • Class {book?.class_num} • {book?.subject_name}
              </p>
              {book?.author && (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  By {book.author}
                </p>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Chapters
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {chapters.length}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Table of Contents */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Table of Contents
        </h2>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          className="space-y-3"
        >
          {chapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              onClick={() => openChapter(chapter.id)}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 md:p-6 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Chapter Number */}
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-xs md:text-lg">
                      {chapter.chapter_no}
                    </span>
                  </div>
                  
                  {/* Chapter Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {chapter.chapter_title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        ~30 min read
                      </span>
                      {progress[chapter.id] && (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          {progress[chapter.id].percentage}% Complete
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action Button */}
                <button className="flex text-xs md:text-base items-center gap-2 p-2 md:px-6 md:py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40">
                  Start Learning
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TableOfContents;