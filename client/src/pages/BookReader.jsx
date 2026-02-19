import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  MessageCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BookReader = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  
  // State
  const [chapter, setChapter] = useState(null);
  const [content, setContent] = useState(null);
  const [navigation, setNavigation] = useState({ previous: null, next: null });
  const [loading, setLoading] = useState(true);
  
  // Reading state
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // AI interaction
  const [showChat, setShowChat] = useState(false);
  const [question, setQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  
  // PDF viewer
  const [showPdf, setShowPdf] = useState(true);
  
  // Load chapter content
  useEffect(() => {
    loadChapter();
  }, [chapterId]);
  
  const loadChapter = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/content`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setChapter(res.data.chapter);
      setContent(res.data.content);
      setNavigation(res.data.navigation);
      
      // Load saved progress
      loadProgress();
    } catch (err) {
      console.error("Failed to load chapter:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const loadProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/progress`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data) {
        // Resume from saved position
        const savedPage = content.pages.findIndex(p => p.page_number === res.data.page_number);
        if (savedPage >= 0) {
          setCurrentPageIndex(savedPage);
          const paraIndex = content.pages[savedPage].paragraphs
            .findIndex(p => p.paragraph_id === res.data.paragraph_id);
          if (paraIndex >= 0) {
            setCurrentParagraphIndex(paraIndex);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load progress:", err);
    }
  };
  
  const saveProgress = async () => {
    try {
      const token = localStorage.getItem("token");
      const currentPage = content.pages[currentPageIndex];
      const currentParagraph = currentPage.paragraphs[currentParagraphIndex];
      
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/progress`,
        {
          paragraph_id: currentParagraph.paragraph_id,
          page_number: currentPage.page_number
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  };
  
  // AI Explanation
  const explainCurrentSection = async () => {
    const currentPage = content.pages[currentPageIndex];
    const currentParagraph = currentPage.paragraphs[currentParagraphIndex];
    
    try {
      setIsGenerating(true);
      setAiResponse("Generating explanation...");
      
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/explain`,
        {
          paragraph_ids: [currentParagraph.paragraph_id]
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setAiResponse(res.data.explanation);
      
      // Convert to speech
      await speakText(res.data.explanation);
      
    } catch (err) {
      console.error("Failed to get explanation:", err);
      setAiResponse("Failed to generate explanation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Ask AI a question
  const askQuestion = async () => {
    if (!question.trim()) return;
    
    const currentPage = content.pages[currentPageIndex];
    const currentParagraph = currentPage.paragraphs[currentParagraphIndex];
    
    // Add to chat history
    setChatHistory(prev => [...prev, { type: "user", text: question }]);
    
    try {
      setIsGenerating(true);
      setAiResponse("Thinking...");
      
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/explain`,
        {
          paragraph_ids: [currentParagraph.paragraph_id],
          question: question
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const answer = res.data.explanation;
      setAiResponse(answer);
      setChatHistory(prev => [...prev, { type: "ai", text: answer }]);
      setQuestion("");
      
      // Speak the answer
      await speakText(answer);
      
    } catch (err) {
      console.error("Failed to get answer:", err);
      setAiResponse("Failed to answer. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Text-to-speech
  const speakText = async (text) => {
    try {
      setIsSpeaking(true);
      const token = localStorage.getItem("token");
      
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/tts`,
        { text },
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: "arraybuffer"
        }
      );
      
      // Create audio blob and play
      const audioBlob = new Blob([res.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
      
    } catch (err) {
      console.error("TTS failed:", err);
      setIsSpeaking(false);
    }
  };
  
  // Navigation
  const nextParagraph = () => {
    const currentPage = content.pages[currentPageIndex];
    
    if (currentParagraphIndex < currentPage.paragraphs.length - 1) {
      setCurrentParagraphIndex(prev => prev + 1);
    } else if (currentPageIndex < content.pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
      setCurrentParagraphIndex(0);
    }
    
    saveProgress();
  };
  
  const previousParagraph = () => {
    if (currentParagraphIndex > 0) {
      setCurrentParagraphIndex(prev => prev - 1);
    } else if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
      const prevPage = content.pages[currentPageIndex - 1];
      setCurrentParagraphIndex(prevPage.paragraphs.length - 1);
    }
    
    saveProgress();
  };
  
  // Auto-read mode
  const startReading = async () => {
    setIsReading(true);
    await explainCurrentSection();
  };
  
  const stopReading = () => {
    setIsReading(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsSpeaking(false);
  };
  
  // Audio ended handler
  const handleAudioEnd = () => {
    setIsSpeaking(false);
    if (isReading) {
      nextParagraph();
      setTimeout(() => explainCurrentSection(), 1000);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  const currentPage = content?.pages[currentPageIndex];
  const currentParagraph = currentPage?.paragraphs[currentParagraphIndex];
  
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {chapter?.chapter_title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {chapter?.book_title} • Page {currentPage?.page_number}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Reading controls */}
            <button
              onClick={isReading ? stopReading : startReading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                isReading 
                  ? "bg-red-600 text-white hover:bg-red-700" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isReading ? (
                <>
                  <Pause className="h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Learning
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowChat(!showChat)}
              className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer */}
        {showPdf && (
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700">
            <iframe
              src={`${chapter?.pdf_url}#page=${currentPage?.page_number}`}
              className="w-full h-full"
              title="PDF Viewer"
            />
          </div>
        )}
        
        {/* Text Content & AI Explanation */}
        <div className={`${showPdf ? 'w-1/2' : 'w-full'} flex flex-col`}>
          {/* Current Paragraph Display */}
          <div className="flex-1 overflow-y-auto p-8">
            <motion.div
              key={currentParagraph?.paragraph_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
                <p className="text-lg leading-relaxed text-gray-900 dark:text-white mb-6">
                  {currentParagraph?.text}
                </p>
                
                {aiResponse && (
                  <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                          AI Tutor Explains:
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {aiResponse}
                        </p>
                      </div>
                      <button
                        onClick={() => speakText(aiResponse)}
                        disabled={isSpeaking}
                        className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSpeaking ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
          
          {/* Navigation Controls */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              <button
                onClick={previousParagraph}
                disabled={currentPageIndex === 0 && currentParagraphIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipBack className="h-4 w-4" />
                Previous
              </button>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Paragraph {currentParagraphIndex + 1} of {currentPage?.paragraphs.length}
              </div>
              
              <button
                onClick={nextParagraph}
                disabled={
                  currentPageIndex === content.pages.length - 1 &&
                  currentParagraphIndex === currentPage.paragraphs.length - 1
                }
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <SkipForward className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat Panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col z-50"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Ask AI Tutor</h3>
              <button onClick={() => setShowChat(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && askQuestion()}
                  placeholder="Ask a question..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isGenerating}
                />
                <button
                  onClick={askQuestion}
                  disabled={isGenerating || !question.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        onError={() => setIsSpeaking(false)}
      />
    </div>
  );
};

export default BookReader;