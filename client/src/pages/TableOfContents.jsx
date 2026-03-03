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

      // Load real progress summary for this book
      const progressRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/${bookId}/progress-summary`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Build a map of chapterId -> progress info
      const progressMap = {};
      progressRes.data.chapters?.forEach(ch => {
        progressMap[ch.id] = {
          percentage: ch.percent,
          completedSegments: ch.completedSegments,
          totalSegments: ch.totalSegments,
        };
      });
      setProgress(progressMap);
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
                      {progress[chapter.id] ? (
                        progress[chapter.id].percentage === 100 ? (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                            <CheckCircle className="h-4 w-4" />
                            Completed
                          </span>
                        ) : progress[chapter.id].percentage > 0 ? (
                          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <Circle className="h-4 w-4" />
                            {progress[chapter.id].percentage}% Complete
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-400">
                            <Circle className="h-4 w-4" />
                            Not started
                          </span>
                        )
                      ) : null}
                    </div>
                    {/* Progress bar */}
                    {progress[chapter.id] && (
                      <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden w-full max-w-xs">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            progress[chapter.id].percentage === 100
                              ? "bg-green-500"
                              : "bg-gradient-to-r from-blue-500 to-purple-500"
                          }`}
                          style={{ width: `${progress[chapter.id].percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button className={`flex text-xs md:text-base items-center gap-2 p-2 md:px-6 md:py-3 rounded-lg text-white font-medium transition-all shadow-lg group-hover:shadow-xl ${
                  progress[chapter.id]?.percentage === 100
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/30"
                    : progress[chapter.id]?.percentage > 0
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/30"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-blue-500/30"
                }`}>
                  {progress[chapter.id]?.percentage === 100
                    ? "Review"
                    : progress[chapter.id]?.percentage > 0
                    ? "Continue"
                    : "Start Learning"}
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