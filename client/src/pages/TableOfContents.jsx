 
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, CheckCircle, ArrowLeft, FileText } from "lucide-react";

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

      const progressRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/${bookId}/progress-summary`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const map = {};
      progressRes.data.chapters?.forEach((ch) => {
        map[ch.id] = ch.percent;
      });

      setProgress(map);
    } catch (err) {
      console.error("Failed to load chapters:", err);
    } finally {
      setLoading(false);
    }
  };

  const openChapter = (id) => navigate(`/reader/${id}`);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] dark:bg-[#141210] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#e8e3dc] dark:border-[#2a2620] border-t-[#b85c2a] dark:border-t-[#d4793a] rounded-full animate-spin" />
      </div>
    );
  }

  const total = chapters.length;
  const doneCount = chapters.filter((c) => progress[c.id] === 100).length;
  const overall = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f7f5f2] dark:bg-[#141210] text-[#1c1812] dark:text-[#f0ebe4]">
      
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-white dark:bg-[#1c1a17] border-b border-[#e8e3dc] dark:border-[#2a2620]">
        <div className="max-w-3xl mx-auto px-4 py-4">
          
          <button
            onClick={() => navigate("/subjects")}
            className="flex items-center gap-2 text-sm text-[#7a6f63] dark:text-[#9a8f83] hover:text-black dark:hover:text-white mb-4"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex gap-3 mb-4">
            <div className="w-12 h-12 bg-[#b85c2a] text-white rounded-xl flex items-center justify-center">
              <BookOpen />
            </div>
            <div>
              <h1 className="font-semibold text-lg">{book?.title}</h1>
              <p className="text-sm text-[#7a6f63] dark:text-[#9a8f83]">
                {[book?.board, book?.class_num && `Class ${book.class_num}`, book?.subject_name]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>

          {/* PROGRESS */}
          <div className="flex items-center gap-3 text-sm">
            <span>{doneCount}/{total} done</span>
            <div className="flex-1 h-2 bg-[#e8e3dc] dark:bg-[#2a2620] rounded overflow-hidden">
              <div
                className="h-full bg-[#b85c2a]"
                style={{ width: `${overall}%` }}
              />
            </div>
            <span>{overall}%</span>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {chapters.map((ch, i) => {
          const pct = progress[ch.id] ?? 0;
          const done = pct === 100;

          return (
            <motion.div
              key={ch.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-[#1e1c19] border border-[#e8e3dc] dark:border-[#2a2620] rounded-xl p-4 cursor-pointer hover:shadow"
              onClick={() => openChapter(ch.id)}
            >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

  {/* LEFT */}
  <div className="min-w-0">
    <h3 className="font-medium truncate">{ch.chapter_title}</h3>

    <p className="text-xs text-[#7a6f63] dark:text-[#9a8f83] mt-1">
      {done ? "Completed" : pct > 0 ? `${pct}% done` : "Not started"}
    </p>

    {/* MINI BAR */}
    <div className="mt-2 h-1 bg-[#e8e3dc] dark:bg-[#2a2620] rounded overflow-hidden w-full max-w-[160px]">
      <div
        className="h-full bg-[#b85c2a]"
        style={{ width: `${pct}%` }}
      />
    </div>
  </div>

  {/* RIGHT */}
  <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:justify-end">

    <button
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/chapter/${ch.id}/worksheets/${bookId}`);
      }}
      className="text-xs flex items-center gap-1 px-3 py-2 rounded bg-[#f0ebe4] dark:bg-[#252320] whitespace-nowrap"
    >
      <FileText size={14} />
      <span className=" inline">Worksheet</span>
    </button>

    <button className="text-xs px-4 py-2 rounded bg-[#b85c2a] text-white flex items-center gap-1 whitespace-nowrap">
      {done ? "Review" : pct > 0 ? "Continue" : "Start"}
      <ChevronRight size={14} />
    </button>

  </div>
</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TableOfContents;
 
