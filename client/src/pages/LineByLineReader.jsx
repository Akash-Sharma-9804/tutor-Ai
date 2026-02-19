
import { useState, useEffect, useRef } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Volume2, BookOpen, Lightbulb, ArrowLeft, Loader2, Play, Pause, Sparkles, X, MessageCircle } from 'lucide-react';
import PageImageViewer from "../components/PageImageViewer";
import { motion, AnimatePresence } from "framer-motion";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import TeacherAvatar from '../components/TeacherAvatar.jsx';
import WhiteboardPanel from '../components/WhiteboardPanel.jsx';

const LineByLineReader = () => {
  const utteranceRef = useRef(null);

  const { chapterId } = useParams();
  const navigate = useNavigate();

  const [pageImages, setPageImages] = useState({});
  const [segments, setSegments] = useState([]);

  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [activeEquationStep, setActiveEquationStep] = useState(0);
  const [showFinalResult, setShowFinalResult] = useState(false);



  const [chapterData, setChapterData] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [navigation, setNavigation] = useState({ previous: null, next: null });
  const [loading, setLoading] = useState(true);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [imagePanelWidth, setImagePanelWidth] = useState(30); // %
  const [isResizing, setIsResizing] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [showPageTextMobile, setShowPageTextMobile] = useState(false);


  // const [pdfURL, setPdfURL] = useState(null);
  const [currentPdfPage, setCurrentPdfPage] = useState(1);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(true);
  const [isReading, setIsReading] = useState(false);

  const [autoPlayMode, setAutoPlayMode] = useState(false);

  // Detailed explanation states
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(false);
  const [detailedExplanation, setDetailedExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const [narrationQueue, setNarrationQueue] = useState([]);
  const [currentNarrationIndex, setCurrentNarrationIndex] = useState(0);
  const [activeNarrationId, setActiveNarrationId] = useState(null);
  const audioRef = useRef(null);

  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
  const [currentWords, setCurrentWords] = useState([]);
  const [currentChunk, setCurrentChunk] = useState({ current: 0, total: 0 });
  const [teacherBoardWords, setTeacherBoardWords] = useState([]);
  const [teacherBoardHighlightIndex, setTeacherBoardHighlightIndex] = useState(-1);
  const [equationStepChars, setEquationStepChars] = useState({});
  const [activeStepUnderline, setActiveStepUnderline] = useState(-1);
  const [explanationWords, setExplanationWords] = useState({});
const [isFullscreen, setIsFullscreen] = useState(false);
const fullscreenAttempted = useRef(false);


const enterFullscreen = async () => {
  try {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      await elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      await elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      await elem.msRequestFullscreen();
    }
    setIsFullscreen(true);
  } catch (err) {
    console.error('Error attempting to enable fullscreen:', err);
  }
};

const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
};


const handleFullscreenChange = () => {
  const isCurrentlyFullscreen = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
  
  setIsFullscreen(isCurrentlyFullscreen);

  // Navigate back when fullscreen is exited
  if (!isCurrentlyFullscreen && !loading && fullscreenAttempted.current) {
    if (chapter?.book_id) {
      navigate(`/subjects`);
    } else {
      navigate(-1);
    }
  }
};

useEffect(() => {
  // Add fullscreen change listeners
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('msfullscreenchange', handleFullscreenChange);

  // Auto-enter fullscreen
  const timer = setTimeout(() => {
    if (!fullscreenAttempted.current && !loading) {
      fullscreenAttempted.current = true;
      enterFullscreen();
    }
  }, 500);

  return () => {
    clearTimeout(timer);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('msfullscreenchange', handleFullscreenChange);
  };
}, [loading]);



  // Deepgram TTS function
  const speakWithDeepgram = async (text, stepInfo = null, isTeacherBoard = false) => {
    try {
      setIsLoadingAudio(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/tts`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Create audio from base64
      const audioBlob = new Blob(
        [Uint8Array.from(atob(response.data.audio), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play audio
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Split text into words for highlighting
      // Split text into words for highlighting
      const words = text.split(/\s+/);

      if (isTeacherBoard) {
        setTeacherBoardWords(words);
      } else {
        setCurrentWords(words);
      }

      // Wait for audio metadata to load
      audio.addEventListener('loadedmetadata', () => {
        const avgWordDuration = audio.duration / words.length;

        let wordIndex = 0;
        const highlightInterval = setInterval(() => {
          if (wordIndex < words.length) {
            if (isTeacherBoard) {
              setTeacherBoardHighlightIndex(wordIndex);
            } else {
              setHighlightedWordIndex(wordIndex);
            }
            wordIndex++;
          } else {
            clearInterval(highlightInterval);
            if (isTeacherBoard) {
              setTeacherBoardHighlightIndex(-1);
            } else {
              setHighlightedWordIndex(-1);
            }
          }
        }, avgWordDuration * 1000);

        // If this is an equation step, handle typing animation
        // If this is an equation step, handle typing animation
        if (stepInfo) {
          const { stepIndex, stepText, explanationText } = stepInfo;

          // Type the step formula at a readable pace (complete in 3 seconds regardless of audio length)
          const stepTypingDuration = 3000; // 3 seconds total
          const charDuration = stepTypingDuration / stepText.length;

          let charIndex = 0;
          const typingInterval = setInterval(() => {
            if (charIndex <= stepText.length) {
              setEquationStepChars(prev => ({
                ...prev,
                [stepIndex]: charIndex
              }));
              charIndex++;
            } else {
              clearInterval(typingInterval);
              // After step typing is done, start explanation word reveal
              if (explanationText) {
                startExplanationReveal(stepIndex, explanationText, audio.duration - stepTypingDuration);
              }
            }
          }, charDuration);

          setActiveStepUnderline(stepIndex);
          audio.typingInterval = typingInterval;
        }

        audio.highlightInterval = highlightInterval;
      });

      audio.onended = () => {
        if (audio.highlightInterval) clearInterval(audio.highlightInterval);
        if (audio.typingInterval) clearInterval(audio.typingInterval);
        if (audio.explanationInterval) clearInterval(audio.explanationInterval);

        // Don't reset if we're in equation mode and still reading steps
        if (currentSegment?.type !== 'equation' || !stepInfo) {
          setIsReading(false);
        }


        setHighlightedWordIndex(-1);
        setCurrentWords([]);
        setTeacherBoardHighlightIndex(-1);
        setActiveStepUnderline(-1);
        URL.revokeObjectURL(audioUrl);

        if (autoPlayMode && currentSegment?.type !== 'equation') {
          setTimeout(goToNextSegment, 600);
        }
      };

      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsReading(false);
        setAutoPlayMode(false);
        setActiveStepUnderline(-1);
      };

      setIsReading(true);

      // 🟢 WAIT for audio context to attach before play
      setTimeout(async () => {
        try {
          await audio.play();
        } catch (e) {
          console.log("play retry", e);
          await audio.play();
        }
      }, 120);


      setIsLoadingAudio(false);
    } catch (err) {
      console.error('Deepgram TTS failed:', err);
      setIsLoadingAudio(false);
      setIsReading(false);
      setActiveStepUnderline(-1);
    }
  };


  const startExplanationReveal = (stepIndex, explanationText, duration) => {
    const words = explanationText.split(/\s+/);
    const wordDuration = (duration / words.length) * 1000;

    let wordIndex = 0;
    const revealInterval = setInterval(() => {
      if (wordIndex <= words.length) {
        setExplanationWords(prev => ({
          ...prev,
          [stepIndex]: wordIndex
        }));
        wordIndex++;
      } else {
        clearInterval(revealInterval);
      }
    }, wordDuration);

    // Store interval reference for cleanup
    if (audioRef.current) {
      audioRef.current.explanationInterval = revealInterval;
    }
  };

  function buildNarrationQueue(content) {
    const queue = [];

    content.forEach((item, idx) => {
      if (item.type === "text") {
        queue.push({
          id: `text-${idx}`,
          text: item.text,
        });

        queue.push({
          id: `text-exp-${idx}`,
          text: item.explanation,
        });
      }

      if (item.type === "equation") {
        queue.push({
          id: `eq-${idx}`,
          text: `The equation is ${item.equation}`,
        });

        item.derivation.forEach((step, sIdx) => {
          queue.push({
            id: `eq-${idx}-step-${sIdx}`,
            text: step.step,
          });

          queue.push({
            id: `eq-${idx}-step-exp-${sIdx}`,
            text: step.explanation,
          });
        });

        queue.push({
          id: `eq-${idx}-final`,
          text: item.final_result,
        });
      }
    });

    return queue;
  }


  const startResize = () => setIsResizing(true);
  const stopResize = () => setIsResizing(false);

  const handleResize = (e) => {
    if (!isResizing) return;
    const percent = (e.clientX / window.innerWidth) * 100;
    if (percent > 15 && percent < 60) {
      setImagePanelWidth(percent);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleResize);
    window.addEventListener("mouseup", stopResize);
    return () => {
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", stopResize);
    };
  }, [isResizing]);


  const safeText = (value, seen = new Set()) => {
    if (!value) return "";
    if (typeof value === "string") return value;

    // Prevent circular references
    if (typeof value === "object") {
      if (seen.has(value)) return "";
      seen.add(value);
    }

    if (Array.isArray(value)) {
      return value.map(v => safeText(v, seen)).join(". ");
    }
    if (typeof value === "object") {
      return Object.values(value).map(v => safeText(v, seen)).join(". ");
    }
    return String(value);
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);


  useEffect(() => {
    loadChapterContent();
  }, [chapterId]);

  useEffect(() => {
    setActiveEquationStep(0);
    setExplanationWords({});
    setEquationStepChars({});
    setShowFinalResult(false);
  }, [currentSegmentIndex, currentPageIndex]);




  // Auto-update PDF page when segment changes
  useEffect(() => {
    const pageRange = currentSection?.page_range;

    if (pageRange && pageRange.length > 0) {
      setCurrentPdfPage(pageRange[0]); // always show correct page
    }
  }, [currentPageIndex]);




  const loadChapterContent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/content`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChapter(res.data.chapter);
      // setPdfURL(res.data.chapter.pdf_url);
      setChapterData(res.data.content);
      setNavigation(res.data.navigation);

      // Set initial PDF page if available
      if (res.data.content?.sections?.[0]?.content?.[0]?.page_number) {
        setCurrentPdfPage(res.data.content.sections[0].content[0].page_number);
      }

      // Fetch segments.json (image map)
      // Build page → image map from BACKEND
      const imageMap = {};
      (res.data.segments || []).forEach(seg => {
        imageMap[seg.page] = seg.image_path;
      });

      setPageImages(imageMap);
      setSegments(res.data.segments || []);



    } catch (err) {
      console.error("Failed to load chapter:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentSection = chapterData?.sections?.[currentPageIndex] || { content: [], heading: '' };
  // 📄 Text-only lines of current page (no explanation, no diagrams)
  const pageTextLines =
    currentSection?.content
      ?.filter(item => item.type === "text")
      ?.map(item => item.text) || [];

  // Get current segment and handle subheadings
  let currentSegment = currentSection?.content?.[currentSegmentIndex];

  // If current segment is a subheading and there's a next segment, show both
  const isSubheading = currentSegment?.type === 'subheading';
  const nextSegment = isSubheading && currentSegmentIndex + 1 < currentSection.content.length
    ? currentSection.content[currentSegmentIndex + 1]
    : null;

  // If we have a subheading followed by content, use the next segment as current
  if (isSubheading && nextSegment && nextSegment.type !== 'subheading') {
    currentSegment = nextSegment;
  }

  const goToNextSegment = () => {
    if (currentSegmentIndex < currentSection.content.length - 1) {
      setCurrentSegmentIndex(currentSegmentIndex + 1);
    } else if (currentPageIndex < (chapterData?.sections?.length || 0) - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      setCurrentSegmentIndex(0);
    }
    setShowDetailedExplanation(false); // Reset detailed explanation
  };

  const goToPreviousSegment = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(currentSegmentIndex - 1);
    } else if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      const prevSection = chapterData.sections[currentPageIndex - 1];
      setCurrentSegmentIndex(prevSection.content.length - 1);
    }
    setShowDetailedExplanation(false); // Reset detailed explanation
  };

  const readAloud = async (customText = null) => {
    if (!customText && !currentSegment) return;

    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setTimeout(async () => {
      let textToRead = '';

      if (customText) {
        // Ensure we're getting a string value, not an object
        textToRead = String(customText)
          .replace(/\*\*/g, '')
          .replace(/##/g, '')
          .replace(/^\* /gm, '')
          .replace(/^- /gm, '')
          .replace(/<[^>]+>/g, '') // removes <sup> tags etc
          .replace(/\n+/g, ' ')
          .trim();

        console.log('Custom text to read:', textToRead.substring(0, 100));
      }
      else if (currentSegment?.type === 'equation') {
        // For equations, read step-by-step
        setActiveEquationStep(0);
        setEquationStepChars({});

        // Helper function to wait for audio to complete
        const waitForAudio = () => {
          return new Promise((resolve) => {
            if (audioRef.current) {
              const handler = () => {
                resolve();
              };
              audioRef.current.addEventListener('ended', handler, { once: true });
            } else {
              resolve();
            }
          });
        };

        // Read main equation first
        await speakWithDeepgram(`Equation: ${currentSegment.equation}`);
        await waitForAudio();

        // Small pause after equation
        await new Promise(resolve => setTimeout(resolve, 800));

        // Read each step with typing animation
        if (showExplanation && Array.isArray(currentSegment.derivation)) {
          for (let idx = 0; idx < currentSegment.derivation.length; idx++) {
            const step = currentSegment.derivation[idx];
            setActiveEquationStep(idx);

            const stepText = `${step.step}. Now let me explain this step. ${step.explanation}`;
            await speakWithDeepgram(stepText, {
              stepIndex: idx,
              stepText: step.step,
              explanationText: step.explanation
            });
            await waitForAudio();

            // Small pause between steps
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        }

        // Read final result (AFTER all steps)
        if (currentSegment.final_result) {
          setShowFinalResult(true);
          await speakWithDeepgram(`Final result: ${currentSegment.final_result}`);
          await waitForAudio();
        }


        setSpeakingIndex(null);
        setIsReading(false);
        return; // Exit early since we handled everything
      }

      else if (currentSegment?.type === 'subheading') {
        textToRead = `Section heading: ${currentSegment.subheading}`;
      }
      else if (currentSegment?.type === 'example') {
        textToRead = `Example problem: ${currentSegment.problem || ''}. `;
        if (showExplanation && currentSegment.solution) {
          textToRead += `Now let's solve this step by step. ${currentSegment.solution}`;
        }
      }
      else if (
        currentSegment?.type === 'diagram_concept' ||
        currentSegment?.type === 'diagram_reference'
      ) {

        textToRead = currentSegment.reference ? `Looking at ${currentSegment.reference}. ` : 'Looking at this diagram. ';
        // Always read description for diagrams
        if (currentSegment.description) {
          textToRead += `${currentSegment.description}`;
        }
        // Add explanation if available and enabled
        if (showExplanation && currentSegment.explanation) {
          textToRead += ` Let me explain further: ${currentSegment.explanation}`;
        }
      }
      else {
        // Regular text
        textToRead = currentSegment?.text || '';
        if (showExplanation && currentSegment?.explanation) {
          textToRead += `. Now let's understand this properly. ${currentSegment.explanation}`;
        }
      }

      if (!textToRead.trim()) {
        console.log('No text to read');
        return;
      }

      console.log('Reading:', textToRead.substring(0, 100));

      setIsReading(true);
      if (!customText) {
        setSpeakingIndex(currentSegmentIndex);
      } else {
        setSpeakingIndex(null);
      }


      let stepInterval = null;

      // Whiteboard-style step reveal (1 step every 2.2 seconds)



      // Whiteboard-style step reveal for equations
      if (currentSegment?.type === 'equation' && currentSegment.derivation?.length) {
        let step = 0;
        setActiveEquationStep(0);

        stepInterval = setInterval(() => {
          step += 1;
          setActiveEquationStep(prev => {
            if (prev >= currentSegment.derivation.length - 1) {
              clearInterval(stepInterval);
              return prev;
            }
            return step;
          });
        }, 2600);
      }

      if (!customText) {
        setSpeakingIndex(currentSegmentIndex);
      }

      // Use Deepgram TTS
      await speakWithDeepgram(textToRead);

      if (stepInterval) clearInterval(stepInterval);
      setSpeakingIndex(null);

    }, 100);
  };

  // Auto-advance past subheadings to show actual content
  useEffect(() => {
    if (currentSegment?.type === 'subheading') {
      // If current segment is a subheading, automatically move to next segment after a brief moment
      const timer = setTimeout(() => {
        goToNextSegment();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [currentSegment, currentSegmentIndex, currentPageIndex]);

  const readTeacherBoard = async (text) => {
    if (!text) {
      console.log('No text provided to readTeacherBoard');
      return;
    }

    console.log('readTeacherBoard called with text length:', text.length);

    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Reset states
    setTeacherBoardWords([]);
    setTeacherBoardHighlightIndex(-1);
    setCurrentChunk({ current: 0, total: 0 });

    // More aggressive text cleaning
    const cleanText = String(text)
      .replace(/\*\*/g, '')
      .replace(/##/g, '')
      .replace(/^\* /gm, '')
      .replace(/^- /gm, '')
      .replace(/^\d+\.\s*/gm, '')
      .replace(/<[^>]+>/g, '')
      .replace(/[*_~`]/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      console.log('Text is empty after cleaning');
      return;
    }

    console.log('Reading teacher board text (first 100 chars):', cleanText.substring(0, 100));
    console.log('Total length:', cleanText.length);

    // Chunk the text if it's too long (>1500 chars)
    const MAX_CHUNK_SIZE = 1500;

    if (cleanText.length <= MAX_CHUNK_SIZE) {
      // Short enough - play directly
      await speakWithDeepgram(cleanText, null, true);
      return;
    }

    // Text is too long - chunk it intelligently
    console.log('Text is long, chunking into smaller parts...');
    const chunks = chunkTextIntelligently(cleanText, MAX_CHUNK_SIZE);

    console.log(`Created ${chunks.length} chunks to play`);
    setCurrentChunk({ current: 0, total: chunks.length });

    // Play each chunk sequentially
    for (let i = 0; i < chunks.length; i++) {
      // Check if user stopped reading
      if (!audioRef.current && i > 0) {
        console.log('User stopped reading, breaking chunk loop');
        break;
      }

      setCurrentChunk({ current: i + 1, total: chunks.length });
      console.log(`Playing chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`);

      await speakWithDeepgram(chunks[i], null, true);

      // Wait for audio to complete
      await new Promise((resolve) => {
        if (audioRef.current) {
          const handler = () => {
            resolve();
          };
          audioRef.current.addEventListener('ended', handler, { once: true });
        } else {
          resolve();
        }
      });

      // Small pause between chunks
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('Finished playing all chunks');
    setCurrentChunk({ current: 0, total: 0 });
    setTeacherBoardWords([]);
    setTeacherBoardHighlightIndex(-1);
  };

  // Helper function to chunk text intelligently at sentence boundaries
  const chunkTextIntelligently = (text, maxSize) => {
    const chunks = [];
    let currentChunk = '';

    // Split by sentences (period, exclamation, question mark followed by space)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    for (const sentence of sentences) {
      // If adding this sentence would exceed max size
      if (currentChunk.length + sentence.length > maxSize) {
        // If current chunk has content, save it
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }

        // If single sentence is too long, split it by words
        if (sentence.length > maxSize) {
          const words = sentence.split(' ');
          for (const word of words) {
            if (currentChunk.length + word.length + 1 > maxSize) {
              if (currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
              }
            }
            currentChunk += (currentChunk ? ' ' : '') + word;
          }
        } else {
          currentChunk = sentence;
        }
      } else {
        currentChunk += ' ' + sentence;
      }
    }

    // Don't forget the last chunk
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  };




  const stopReading = () => {
    // Stop Deepgram audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setIsReading(false);
    setAutoPlayMode(false);
    setIsLoadingAudio(false);

    // Reset teacher board states
    setTeacherBoardWords([]);
    setTeacherBoardHighlightIndex(-1);
    setCurrentChunk({ current: 0, total: 0 });
  };



  const toggleAutoPlay = () => {
    if (autoPlayMode) {
      stopReading();
    } else {
      setAutoPlayMode(true);
      readAloud();
    }
  };

  const getDetailedExplanation = async () => {
    if (!currentSegment) return;

    setLoadingExplanation(true);
    setShowDetailedExplanation(true);
    // stopReading(); // Stop any current reading

    try {
      const token = localStorage.getItem("token");

      // Get the text to explain based on segment type
      let textToExplain = '';
      if (currentSegment.type === 'equation') {
        textToExplain = `Equation: ${currentSegment.equation}. ${currentSegment.final_result ? 'Final result: ' + currentSegment.final_result : ''}`;
      } else if (currentSegment.type === 'example') {
        textToExplain = `Example: ${currentSegment.problem}`;
      } else {
        textToExplain = currentSegment.text;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/explain-detailed`,
        {
          text: textToExplain,
          context: currentSection.heading || chapter?.chapter_title
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Full API Response:', response);
      console.log('Response.data type:', typeof response.data);
      console.log('Response.data.explanation:', response.data.explanation);

      // The API might be returning the explanation directly in response.data
      let explanationText = '';

      // Check if response.data itself is a string
      if (typeof response.data === 'string') {
        explanationText = response.data;
      }
      // Check if response.data.explanation exists
      else if (response.data.explanation) {
        const exp = response.data.explanation;
        if (typeof exp === 'string') {
          explanationText = exp;
        } else if (typeof exp === 'object') {
          explanationText = exp.text || exp.content || exp.explanation || JSON.stringify(exp, null, 2);
        }
      }
      // Fallback: stringify the whole response
      else {
        explanationText = JSON.stringify(response.data, null, 2);
      }

      console.log('Final extracted explanation:', explanationText);
      console.log('Type:', typeof explanationText);
      setDetailedExplanation(explanationText);
    } catch (err) {
      console.error("Failed to get explanation:", err);
      setDetailedExplanation("Failed to generate detailed explanation. Please try again.");
    } finally {
      setLoadingExplanation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your chapter...</p>
        </div>
      </div>
    );
  }

  if (!chapterData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load chapter content</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const totalSegments =
    chapterData?.sections?.reduce(
      (sum, section) => sum + (section.content?.length || 0),
      0
    ) || 0;

  const currentSegmentGlobal =
    (chapterData?.sections
      ?.slice(0, currentPageIndex)
      .reduce((sum, section) => sum + (section.content?.length || 0), 0) || 0)
    + currentSegmentIndex + 1;

  const progressPercentage = (currentSegmentGlobal / totalSegments) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
   {/* Mobile Header - Ultra Compact */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="px-2 py-2">
          <div className="flex items-center gap-2">
            {/* Back */}
            <button
              onClick={() => navigate(-1)}
              className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Title & Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-[11px] font-bold text-gray-900 dark:text-white truncate flex-1">
                  {chapter?.chapter_title}
                </h1>
                <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Page Button */}
            <button
              onClick={() => {
                const pageSelector = document.getElementById('mobile-page-selector');
                const backdrop = document.getElementById('mobile-page-selector-backdrop');
                pageSelector?.classList.toggle('translate-y-full');
                backdrop?.classList.toggle('hidden');
              }}
              className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white rounded-md text-[10px] font-bold shadow-md"
            >
              <BookOpen className="h-3 w-3" />
              {currentPageIndex + 1}/{chapterData?.sections?.length}
            </button>

            {/* Tips Toggle */}
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className={`flex-shrink-0 p-1.5 rounded-md transition-colors shadow-sm ${
                showExplanation
                  ? 'bg-yellow-400 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Lightbulb className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

     {/* Mobile Teacher Avatar (BELOW Chapter Info) */}
     <div
  className="
    lg:hidden
    fixed top-[42px] left-0 right-0 z-40
    shadow-lg
    rounded-t-none        /* mobile + tablet */
    rounded-b-[15px]      /* mobile + tablet */
    lg:rounded-[20px]     /* desktop */
  "
  style={{
    background: 'linear-gradient(145deg, #f59e0b, #d97706)',
    boxShadow:
      '0 10px 40px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)',
  }}
>

        <div
  className="
    relative
    h-[160px]     /* mobile */
    md:h-[220px]  /* tablet */
  "
>

          <TeacherAvatar isSpeaking={isReading} audioRef={audioRef} />
          {/* Speaking indicator */}
          {isReading && (
            <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-red-500/95 px-3 py-1.5 rounded-full shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-semibold">Speaking...</span>
            </div>
          )}
        </div>
           <div className="text-center  ">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl  p-1 border-2 border-white/20">
                  <p className="text-white text-xs mb-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    Hi! I'm Andy Your study sidekick! 🚀
                  </p>
                 
                </div>
              </div>
      </div>

      {/* Fixed Header - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate(-1)}
              className="flex cursor-pointer items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Chapters</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600" />
              <div className="flex-1 max-w-2xl">
                <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white truncate">
                  {chapter?.chapter_title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  Ch {chapter?.chapter_no} • Page {currentPageIndex + 1}/{chapterData?.sections?.length}
                  {currentSection?.subheading && (
                    <span className="hidden sm:inline ml-2 font-semibold text-blue-600 dark:text-blue-400">
                      • {currentSection.subheading}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base ${showExplanation
                ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
            >
              <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">{showExplanation ? 'Hide' : 'Show'} Explanations</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
            Segment {currentSegmentGlobal} of {totalSegments} • {Math.round(progressPercentage)}% Complete
          </p>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="w-full py-0 px-0 sm:px-1 lg:px-2 pt-[240px] sm:pt-[230px] md:pt-[280px] lg:pt-0">
       <div className="flex flex-col w-full gap-0 lg:gap-2 lg:flex-row lg:h-[calc(100vh-9rem)]">

          {/* LEFT SIDEBAR - Teacher + Page Numbers */}
          <div className="hidden lg:flex lg:flex-col lg:w-64 gap-4 p-4">
            {/* Teacher Avatar Box */}
            <div
              className="relative"
              style={{
                background: 'linear-gradient(145deg, #f59e0b, #d97706)',
                padding: '12px',
                borderRadius: '20px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.2)',
                border: '4px solid #78350f'
              }}
            >
             

              {/* Teacher Avatar */}
              <div className="w-full h-[300px] flex items-end justify-center">
                <TeacherAvatar isSpeaking={isReading} audioRef={audioRef} />
              </div>
              {/* Teacher Introduction */}
              <div className="text-center  ">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border-2 border-white/20">
                  <p className="text-white text-xs mb-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    Hi! I'm
                  </p>
                  <h3 className="text-white font-black text-2xl tracking-wide" style={{
                    fontFamily: 'Comic Sans MS, cursive',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3), 0 0 10px rgba(255,255,255,0.2)'
                  }}>
                    Andy
                  </h3>
                  <p className="text-amber-200 font-semibold text-sm mt-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    Your study sidekick! 🚀
                  </p>
                </div>
              </div>
            </div>

            {/* Page Numbers Section */}
            <div
              className="flex-1 rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #e0e7ff, #c7d2fe)',
                border: '3px solid #6366f1',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
              }}
            >
              <h3 className="text-lg font-bold text-indigo-900 p-4 pb-3 text-center sticky top-0 bg-gradient-to-b from-indigo-200 to-indigo-100 z-10" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                📖 Pages
              </h3>
              <div className="space-y-2 p-4 pt-0 overflow-y-auto custom-scrollbar max-h-[calc(100%-4rem)]">
                {chapterData?.sections?.map((section, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentPageIndex(idx);
                      setCurrentSegmentIndex(0);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${currentPageIndex === idx
                      ? 'bg-indigo-600 text-white shadow-lg scale-105'
                      : 'bg-white text-indigo-900 hover:bg-indigo-100'
                      }`}
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  >
                    <div className="font-bold text-sm">Page {idx + 1}</div>
                    {section.heading && (
                      <div className="text-xs opacity-90 truncate mt-1">
                        {section.heading}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Whiteboard (Full Width) */}
       {/* RIGHT COLUMN - Whiteboard (Full Width) */}
          <div className="relative flex-1 w-full lg:h-full">

            {/* Whiteboard Container */}
            <div className="flex flex-col gap-0 h-full">


              <div
                className="flex-1 overflow-y-auto custom-scrollbar min-h-[calc(100vh-220px)] sm:min-h-[calc(100vh-230px)] md:min-h-[calc(100vh-240px)] lg:min-h-0"
                style={{
                  background: 'linear-gradient(180deg, #e8d4b8 0%, #d4c4a8 50%, #c4b498 100%)'
                }}
              >
                <div className="relative p-2 sm:p-3 md:p-4 lg:p-6 pb-6">
                  {/* Whiteboard Frame - Like a real school board */}
                  <div
                    className="relative"
                    style={{
                      background: 'linear-gradient(145deg, #2d3748, #1a202c)',
                      padding: window.innerWidth < 640 ? '8px' : window.innerWidth < 1024 ? '12px' : '16px',
                      borderRadius: '8px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.1)'
                    }}
                  >
                    {/* Corner Brackets - School board style */}
                    <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-gray-600"></div>
                    <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-gray-600"></div>
                    <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-gray-600"></div>
                    <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-gray-600"></div>



                    {/* Whiteboard surface */}
                    <div
                      className="rounded-lg shadow-inner relative flex flex-col
  h-auto lg:h-[calc(100vh-20rem)]"
                      style={{
                        background: '#ffff',
                        boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.15), inset 0 -2px 8px rgba(255,255,255,0.3)',
                        border: '3px solid #5a6a5a'
                      }}
                    >
                      {/* Scrollable Content Area */}
                     <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-4 md:p-6 pb-12 sm:pb-14">

                        {/* Control Buttons - Top Left of Whiteboard */}
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-3 sm:mb-4 md:mb-6 pb-2 sm:pb-3 md:pb-4 border-b-2 sm:border-b-4 border-slate-600" style={{ borderStyle: 'dashed' }}>
                          <button
                            onClick={isReading ? stopReading : () => readAloud()}
                            disabled={isLoadingAudio}
                            className={`flex items-center gap-0 sm:gap-2 px-2 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-bold transition-all shadow-md border-2 sm:border-3 ${isReading
                              ? 'bg-red-500 hover:bg-red-600 text-white border-red-700'
                              : isLoadingAudio
                                ? 'bg-gray-400 cursor-not-allowed text-white border-gray-600'
                                : 'bg-blue-500 hover:bg-blue-600 text-white border-blue-700'
                              }`}
                            style={{ fontFamily: 'Comic Sans MS, cursive' }}
                          >
                            {isLoadingAudio ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Loading...
                              </>
                            ) : isReading ? (
                              <>
                                <Pause className="h-5 w-5" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Play className="h-5 w-5" />
                                Read Aloud
                              </>
                            )}
                          </button>

                          <button
                            onClick={toggleAutoPlay}
                            className={`px-2 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-bold transition-all shadow-md border-2 sm:border-3 hover:scale-105 ${autoPlayMode
                              ? 'bg-green-500 text-white border-green-700'
                              : 'bg-slate-300 text-slate-700 hover:bg-slate-400 border-slate-500'
                              }`}
                            style={{ fontFamily: 'Comic Sans MS, cursive' }}
                          >
                            {autoPlayMode ? '🔄 Auto-Play ON' : '▶️ Auto-Play'}
                          </button>

                          <button
                            onClick={getDetailedExplanation}
                            className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-bold transition-all shadow-md bg-purple-500 hover:bg-purple-600 text-white hover:scale-105 border-2 sm:border-3 border-purple-700"
                            style={{ fontFamily: 'Comic Sans MS, cursive' }}
                          >
                            <Sparkles className="h-4 w-4" />
                            <span className="hidden sm:inline">Explain in Detail</span>
                            <span className="sm:hidden">Explain</span>
                          </button>

                        
                        </div>




                        {/* Current Segment Card - Whiteboard Style */}
                        <div className="mb-6 animate-chalkWrite">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">

                              {/* 📊 DIAGRAM LAYOUT - Two columns: Image (left) + Description (right) */}
                              {(currentSegment?.type === "diagram" ||
                                currentSegment?.type === "diagram_concept" ||
                                currentSegment?.type === "diagram_reference") && (() => {
                                  // Find the page image from segments based on page or page_number
                                  const pageNum = currentSegment.page || currentSegment.page_number || currentPdfPage;
                                  const pageSeg = segments.find(s => s.page === pageNum);

                                  if (!pageSeg?.image_path) {
                                    console.log('No page image found for page:', pageNum);
                                    return null;
                                  }

                                  return (
                                    <div className="mb-6">
                                      {/* Two-column layout for diagrams */}
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                                        {/* LEFT: Scrollable Image */}
                                        <div className="order-1">
                                          <div className="bg-white rounded-2xl shadow-lg p-3 border-4 border-purple-400 max-h-[350px] overflow-y-auto custom-scrollbar">
                                            {(currentSegment.title || currentSegment.reference) && (
                                              <p className="text-center mb-2 text-sm font-semibold text-purple-700 bg-purple-50 py-2 rounded-lg sticky top-0 z-10">
                                                📍 {currentSegment.title || currentSegment.reference}
                                              </p>
                                            )}
                                            <img
                                              src={`${import.meta.env.VITE_CDN_URL}${pageSeg.image_path}`}
                                              alt={currentSegment.reference || "Diagram"}
                                              className="w-full rounded-lg shadow-xl"
                                              onError={(e) => {
                                                console.error('Diagram page image failed to load:', pageSeg.image_path);
                                                e.target.style.display = 'none';
                                              }}
                                            />
                                          </div>
                                        </div>

                                        {/* RIGHT: Description */}
                                        <div className="order-2">
                                          {(currentSegment.description || currentSegment.explanation) && (
                                            <div className="bg-purple-100 rounded-2xl shadow-lg p-4 sm:p-6 border-4 border-purple-400 max-h-[350px] overflow-y-auto custom-scrollbar" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                                              <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-purple-500 rounded-lg border-2 border-purple-600 shadow-md">
                                                  <Lightbulb className="h-6 w-6 text-white" />
                                                </div>
                                                <h2 className="text-xl font-bold text-slate-800 chalk-text">💡 Understanding the Diagram</h2>
                                              </div>
                                              {currentSegment.description && (
                                                <p className="text-xs sm:text-sm leading-relaxed text-slate-700 chalk-text mb-4" style={{ wordSpacing: '0.15em' }}>
                                                  {currentSegment.description}
                                                </p>
                                              )}

                                              {/* {!currentSegment.description && currentSegment.explanation && (
  <p className="text-base sm:text-sm leading-relaxed text-slate-700 chalk-text mb-4" style={{ wordSpacing: '0.15em' }}>
    {currentSegment.explanation}
  </p>
)} */}

                                              {/* Show detailed explanation option for diagrams too */}
                                              {showExplanation && currentSegment.explanation && (
                                                <div className="mt-4 pt-4 border-t-2 border-purple-300">
                                                  <p className="text-xs sm:text-base text-slate-600 italic chalk-text">
                                                    💭 {currentSegment.explanation}
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}

                              {/* Show subheading if this segment is a subheading */}
                              {currentSegment?.type === 'subheading' && (
                                <div className="mb-6">
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="text-lg font-bold text-blue-700 uppercase tracking-wider px-4 py-2 bg-blue-100 rounded-lg border-3 border-blue-400 shadow-md"
                                      style={{ fontFamily: 'Comic Sans MS, cursive' }}
                                    >
                                      📑 {currentSegment.subheading}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Only show content badges and text if NOT a subheading */}
                              {currentSegment?.type !== 'subheading' && currentSegment?.type !== 'diagram' && (
                                <>
                                  <div className="flex items-center gap-2 mb-3">
                                    <div
                                      className="text-sm font-bold text-slate-700 uppercase tracking-wider px-3 py-1 bg-yellow-200 rounded-lg border-2 border-yellow-400 shadow-sm"
                                      style={{ fontFamily: 'Comic Sans MS, cursive' }}
                                    >
                                      📖 {currentSection.heading || `Section ${currentPageIndex + 1}`}
                                    </div>
                                    {currentSegment?.type === 'equation' && (
                                      <span
                                        className="px-3 py-1 bg-blue-300 text-blue-900 text-xs font-bold rounded-lg border-2 border-blue-500 shadow-sm"
                                        style={{ fontFamily: 'Comic Sans MS, cursive' }}
                                      >
                                        🔢 EQUATION
                                      </span>
                                    )}
                                    {currentSegment?.type === 'example' && (
                                      <span
                                        className="px-3 py-1 bg-green-300 text-green-900 text-xs font-bold rounded-lg border-2 border-green-500 shadow-sm"
                                        style={{ fontFamily: 'Comic Sans MS, cursive' }}
                                      >
                                        📝 EXAMPLE
                                      </span>
                                    )}
                                    {(currentSegment?.type === 'diagram_concept' || currentSegment?.type === 'diagram_reference') && (
                                      <span
                                        className="px-3 py-1 bg-purple-300 text-purple-900 text-xs font-bold rounded-lg border-2 border-purple-500 shadow-sm"
                                        style={{ fontFamily: 'Comic Sans MS, cursive' }}
                                      >
                                        📊 {currentSegment?.type === 'diagram_concept' ? 'CONCEPT DIAGRAM' : 'DIAGRAM'}
                                      </span>
                                    )}
                                  </div>

                                  {/* Text content - don't show for diagram-only segments */}
                                  {currentSegment?.type !== 'diagram' && (
                                    <p
  className={`text-base sm:text-xl md:text-2xl leading-relaxed transition-all text-slate-800 ${currentSegment?.type === 'equation' ? 'font-mono font-bold text-center' : 'font-medium'
    }`}
  style={{ fontFamily: 'Comic Sans MS, cursive', wordSpacing: '0.15em' }}
>
                                      {isReading && currentWords.length > 0 && currentSegment?.type !== 'equation' ? (
                                        currentWords.map((word, idx) => (
                                          <span
                                            key={idx}
                                            className={`inline-block transition-all duration-150 ease-out ${idx <= highlightedWordIndex
                                              ? 'opacity-100 scale-100'
                                              : 'opacity-0 scale-95'
                                              }`}
                                            style={{
                                              marginRight: '0.3em'
                                            }}
                                          >
                                            {word}
                                          </span>
                                        ))
                                      ) : (
                                        currentSegment?.type === 'equation'
                                          ? currentSegment?.equation
                                          : currentSegment?.text || currentSegment?.problem || currentSegment?.reference || ''
                                      )}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Example Problem and Solution */}
                        {currentSegment?.type === 'example' && (
                          <div className="mb-6 space-y-4">
                            {/* Problem Statement */}
                            <div className="bg-green-100 rounded-2xl shadow-lg p-4 sm:p-6 border-4 border-green-400" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-500 rounded-lg border-2 border-green-600 shadow-md">
                                  <span className="text-2xl">📝</span>
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 chalk-text">Example Problem</h2>
                              </div>
                              <p className="text-sm sm:text-base md:text-lg leading-relaxed text-slate-700 chalk-text" style={{ wordSpacing: '0.15em' }}>
                                {currentSegment.problem}
                              </p>
                            </div>

                            {/* Solution */}
                            {currentSegment.solution && (
                              <div className="bg-blue-50 rounded-2xl shadow-lg p-4 sm:p-6 border-4 border-blue-400" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="p-2 bg-blue-500 rounded-lg border-2 border-blue-600 shadow-md">
                                    <span className="text-2xl">✅</span>
                                  </div>
                                  <h2 className="text-xl font-bold text-slate-800 chalk-text">Solution</h2>
                                </div>
                                <div className="prose prose-slate max-w-none">
                                  {currentSegment.solution.split('\n').map((line, idx) => {
                                    // Check if it's a numbered step or bullet point
                                    if (line.trim().match(/^\d+\./)) {
                                      return (
                                        <div key={idx} className="mb-3 pl-4">
                                          <p className="text-base text-slate-700 chalk-text font-semibold">{line}</p>
                                        </div>
                                      );
                                    }
                                    // Check if it's a sub-point (starts with *)
                                    if (line.trim().startsWith('*')) {
                                      return (
                                        <div key={idx} className="mb-2 pl-8">
                                          <p className="text-sm text-slate-600 chalk-text">{line.replace('*', '•')}</p>
                                        </div>
                                      );
                                    }
                                    // Regular paragraph
                                    if (line.trim()) {
                                      return (
                                        <p key={idx} className="text-base text-slate-700 chalk-text mb-2 leading-relaxed">
                                          {line}
                                        </p>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                      


                        {/* Explanation Card - Whiteboard Style */}
                        {showExplanation && currentSegment?.explanation && currentSegment?.type !== 'diagram' && (
                          <div
                            className="bg-yellow-100 rounded-2xl shadow-lg p-2   border-4 border-yellow-400 transform transition-all duration-300 mb-6 animate-chalkWrite"
                            style={{ fontFamily: 'Comic Sans MS, cursive' }}
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-yellow-500 rounded-lg border-2 border-yellow-600 shadow-md">
                                <Lightbulb className="h-6 w-6 text-white" />
                              </div>
                              <h2 className="text-sm md:text-xl font-bold text-slate-800 chalk-text">💡 Simple Explanation</h2>
                            </div>
                            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-slate-700 chalk-text" style={{ wordSpacing: '0.15em' }}>
                              {currentSegment.explanation}
                            </p>
                          </div>
                        )}

                        {/* Equation Display - Step by Step */}
                        {currentSegment?.type === 'equation' && (
                          <div
                            className="p-6 sm:p-8 animate-slideIn mb-6"
                            style={{
                              fontFamily: 'Comic Sans MS, cursive'
                            }}
                          >

                            <div className="flex items-center gap-3 mb-6 pb-3 border-b-4 border-blue-400">
                              <span className="text-3xl">🔢</span>
                              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 chalk-text">
                                Mathematical Equation
                              </h2>
                            </div>

                            {/* Main Equation */}
                            <div className="p-4 mb-6">
                              <p className="text-xl sm:text-2xl md:text-3xl font-mono text-center text-slate-800 font-bold chalk-text">
                                {currentSegment.equation}
                              </p>
                            </div>

                            {/* Step-by-Step Derivation */}
                            {/* Step-by-Step Derivation */}
                            {currentSegment.derivation && currentSegment.derivation.length > 0 && (
                              <div className="space-y-4 mb-6">
                                <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b-2 border-slate-300 chalk-text">
                                  <span className="text-xl">📝</span> Step-by-Step Solution:
                                </h3>
                                {currentSegment.derivation
                                  .slice(0, activeEquationStep + 1)
                                  .map((step, index) => (

                                    <div
                                      key={index}
                                      className="p-5 border-l-4 border-blue-400 pl-6 animate-chalkWrite"
                                      style={{
                                        animationDelay: `${index * 0.25}s`,
                                        fontFamily: 'Comic Sans MS, cursive'
                                      }}
                                    >

                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                                          {index + 1}
                                        </div>
                                        <div className="flex-1">
                                          <p className="text-base sm:text-lg font-bold text-slate-800 mb-2 chalk-text relative">
                                            <span className={`${activeStepUnderline === index ? 'underline-animation' : ''}`}>
                                              {equationStepChars[index] !== undefined
                                                ? step.step.substring(0, equationStepChars[index])
                                                : step.step}
                                              {equationStepChars[index] !== undefined && equationStepChars[index] < step.step.length && (
                                                <span className="typing-cursor">|</span>
                                              )}
                                            </span>
                                          </p>

                                          <p className="text-sm sm:text-base leading-relaxed chalk-text text-slate-700">
                                            {(() => {
                                              const cleanExplanation = String(step.explanation)
                                                .replace(/\*\*/g, '')
                                                .replace(/##/g, '')
                                                .replace(/^- /gm, '')
                                                .replace(/\n+/g, ' ')
                                                .trim();

                                              const words = cleanExplanation.split(/\s+/);
                                              const revealedCount = explanationWords[index] || 0;

                                              if (revealedCount === 0) {
                                                return cleanExplanation;
                                              }

                                              return words.map((word, wordIdx) => (
                                                <span
                                                  key={wordIdx}
                                                  className={`${wordIdx < revealedCount
                                                    ? 'opacity-100 transition-opacity duration-400'
                                                    : 'opacity-30'
                                                    }`}
                                                >
                                                  {word}{' '}
                                                </span>
                                              ));
                                            })()}
                                          </p>

                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}

                            {/* Final Result */}
                            {/* Final Result */}
                            {currentSegment.final_result && showFinalResult && (
                              <div className="p-5 border-4 border-green-400 rounded-xl mb-4 bg-green-50">


                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xl">✅</span>
                                  <h4 className="text-lg font-bold text-slate-800 chalk-text">Final Result:</h4>
                                </div>
                                <p className="text-xl font-mono font-bold text-slate-800 chalk-text">
                                  {currentSegment.final_result}
                                </p>
                              </div>
                            )}

                            {/* Application */}
                            {currentSegment.application && (
                              <div className="bg-purple-50 rounded-xl p-5 border-4 border-purple-400">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xl">💡</span>
                                  <h4 className="text-lg font-bold text-slate-800 chalk-text">Real-World Application:</h4>
                                </div>
                                <p className="text-base text-slate-700 leading-relaxed chalk-text">
                                  {currentSegment.application}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {showDetailedExplanation && (
                          <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-3xl shadow-2xl p-4 sm:p-6 border-4 border-slate-600 transform transition-all duration-300 animate-slideIn sticky top-4 relative overflow-hidden">
                            {/* Whiteboard texture overlay */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100\' height=\'100\' filter=\'url(%23noise)\' opacity=\'0.3\'/%3E%3C/svg%3E")'
                            }}></div>
                            <div className="flex items-start justify-between mb-6 relative z-10">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => setShowPageTextMobile(prev => !prev)}
                                  className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg
             bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                                >
                                  📘 {showPageTextMobile ? "Hide Page Text" : "Show Page Text"}
                                </button>

                                <div className="p-3 bg-green-500 rounded-xl shadow-lg border-2 border-white">
                                  <MessageCircle className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                  <h2 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                                    🎓 Teacher's Board
                                  </h2>
                                  <p className="text-sm text-green-300 mt-1">
                                    Step-by-step classroom explanation
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => setShowDetailedExplanation(false)}
                                className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all hover:scale-110 shadow-lg"
                                title="Close"
                              >
                                <X className="h-6 w-6 text-white" />
                              </button>
                            </div>
                            {loadingExplanation ? (
                              <div className="flex items-center justify-center py-16">
                                <div className="text-center">
                                  <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                                    Generating comprehensive explanation...
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                    This may take a few seconds
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="bg-white rounded-2xl shadow-inner relative z-10" style={{
                                  backgroundImage: 'linear-gradient(0deg, rgba(0,0,0,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.02) 1px, transparent 1px)',
                                  backgroundSize: '20px 20px'
                                }}>
                                  <div className="flex items-center justify-between p-4 border-b-4 border-slate-700 bg-slate-100">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                                      📝 Comprehensive Breakdown
                                    </h3>
                                    <button
                                      onClick={() => {
                                        if (isReading) {
                                          stopReading();
                                        } else {
                                          readTeacherBoard(detailedExplanation);
                                        }
                                      }}
                                      disabled={!detailedExplanation || loadingExplanation || isLoadingAudio}
                                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 shadow-md border-2 border-blue-300"
                                    >
                                      {isLoadingAudio ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                          <span className="hidden sm:inline">Loading...</span>
                                        </>
                                      ) : isReading ? (
                                        <>
                                          <Pause className="h-4 w-4" />
                                          <span className="hidden sm:inline">
                                            {currentChunk.total > 1
                                              ? `Stop (${currentChunk.current}/${currentChunk.total})`
                                              : 'Stop'}
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <Volume2 className="h-4 w-4" />
                                          <span className="hidden sm:inline">Read Aloud</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                                    <div className="prose prose-xs sm:prose-sm md:prose-base max-w-none">

                                      <div className="whiteboard-content space-y-6">
                                        {detailedExplanation
                                          .replace(/\*\*/g, '')
                                          .replace(/##/g, '')
                                          .replace(/^\* /gm, '')
                                          .replace(/^- /gm, '')
                                          .split('\n\n')
                                          .map((paragraph, idx) => {

                                            // Check if it's a heading (starts with ** or ##)
                                            const isHeading = paragraph.trim().startsWith('**') || paragraph.trim().startsWith('##');
                                            const isNumberedHeading = /^\d+\./.test(paragraph.trim());
                                            const isBulletPoint = paragraph.trim().startsWith('*') && !paragraph.trim().startsWith('**');

                                            if (isHeading || isNumberedHeading) {
                                              const cleanText = paragraph
                                                .replace(/\*\*/g, '')
                                                .replace(/##/g, '')
                                                .trim();

                                              return (
                                                <div
                                                  key={idx}
                                                  className="whiteboard-heading animate-chalkWrite mb-4 pb-3 border-b-4 border-yellow-400"
                                                  style={{
                                                    animationDelay: `${idx * 0.15}s`,
                                                    fontFamily: 'Comic Sans MS, cursive'
                                                  }}
                                                >
                                                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                                                    {idx === 0 && '📚'}
                                                    {idx === 1 && '🎯'}
                                                    {idx === 2 && '🌟'}
                                                    {idx === 3 && '⚠️'}
                                                    {idx === 4 && '💡'}
                                                    {idx === 5 && '✍️'}
                                                    <span className="chalk-text">{cleanText}</span>
                                                  </h3>
                                                </div>
                                              );
                                            }

                                            if (isBulletPoint) {
                                              const cleanText = paragraph.replace(/^\*\s*/, '').trim();
                                              return (
                                                <div
                                                  key={idx}
                                                  className="whiteboard-bullet animate-chalkWrite pl-6 py-2 border-l-4 border-blue-400 bg-blue-50/50"
                                                  style={{
                                                    animationDelay: `${idx * 0.15}s`,
                                                    fontFamily: 'Comic Sans MS, cursive'
                                                  }}
                                                >
                                                  <p className="text-xs sm:text-sm md:text-base text-slate-700 leading-snug">

                                                    <span className="text-blue-600 font-bold mr-2">•</span>
                                                    {cleanText}
                                                  </p>
                                                </div>
                                              );
                                            }

                                            return (
                                              <div
                                                key={idx}
                                                className="whiteboard-paragraph animate-chalkWrite bg-white/70 rounded-lg p-3 sm:p-4 shadow-sm"
                                                style={{
                                                  animationDelay: `${idx * 0.15}s`,
                                                  fontFamily: 'Comic Sans MS, cursive'
                                                }}
                                              >
                                                <p className="text-sm sm:text-base text-slate-700 leading-relaxed chalk-text">
                                                  {(() => {
                                                    // When reading teacher board, show word-by-word reveal
                                                    if (isReading && teacherBoardWords.length > 0) {
                                                      // Split the current paragraph into words
                                                      const paragraphWords = paragraph.split(/\s+/);

                                                      // Calculate which words from the full text correspond to this paragraph
                                                      const fullText = detailedExplanation
                                                        .replace(/\*\*/g, '')
                                                        .replace(/##/g, '')
                                                        .replace(/^\* /gm, '')
                                                        .replace(/^- /gm, '')
                                                        .replace(/\n+/g, ' ')
                                                        .replace(/\s+/g, ' ')
                                                        .trim();

                                                      // Find where this paragraph starts in the full text
                                                      const paragraphText = paragraph.split('\n').join(' ').trim();
                                                      const startIndex = fullText.indexOf(paragraphText);

                                                      if (startIndex === -1) {
                                                        // Paragraph not found in cleaned text, show normally
                                                        return paragraph.split('\n').map((line, lineIdx) => (
                                                          <span key={lineIdx}>
                                                            {line}
                                                            {lineIdx < paragraph.split('\n').length - 1 && <br />}
                                                          </span>
                                                        ));
                                                      }

                                                      // Count words before this paragraph
                                                      const textBeforeParagraph = fullText.substring(0, startIndex);
                                                      const wordsBeforeCount = textBeforeParagraph ? textBeforeParagraph.split(/\s+/).length : 0;

                                                      // Render words with opacity based on position
                                                      return paragraphWords.map((word, wordIdx) => {
                                                        const globalWordIndex = wordsBeforeCount + wordIdx;
                                                        return (
                                                          <span
                                                            key={wordIdx}
                                                            className={`transition-opacity duration-400 ease-in-out ${globalWordIndex <= teacherBoardHighlightIndex
                                                              ? 'opacity-100'
                                                              : 'opacity-30'
                                                              }`}
                                                          >
                                                            {word}{' '}
                                                          </span>
                                                        );
                                                      });
                                                    }

                                                    // When not reading, show normal text
                                                    return paragraph.split('\n').map((line, lineIdx) => (
                                                      <span key={lineIdx}>
                                                        {line}
                                                        {lineIdx < paragraph.split('\n').length - 1 && <br />}
                                                      </span>
                                                    ));
                                                  })()}
                                                </p>
                                              </div>
                                            );
                                          })}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-6 relative z-10">
                                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 sm:p-5 border-4 border-orange-300 shadow-lg animate-chalkWrite" style={{
                                    animationDelay: '1s',
                                    fontFamily: 'Comic Sans MS, cursive'
                                  }}>
                                    <div className="flex items-start gap-3">
                                      <div className="p-2 bg-orange-400 rounded-lg shadow-md">
                                        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                      </div>
                                      <div>
                                        <p className="text-sm sm:text-base text-slate-800 font-semibold mb-1">
                                          💡 Teacher's Tip:
                                        </p>
                                        <p className="text-xs sm:text-sm text-slate-700">
                                          Try explaining this concept to a friend or family member in your own words. Teaching is the best way to learn!
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}



                        {/* Diagram description is now integrated in the two-column layout above */}

                      </div>

                      {/* Chalk Tray at bottom - STICKY INSIDE WHITEBOARD */}
                      <div
                        className="sticky bottom-0 left-0 right-0 h-8 sm:h-10 rounded-b-lg flex-shrink-0"
                        style={{
                          background: 'linear-gradient(180deg, #8B7355 0%, #6B5345 100%)',
                          boxShadow: '0 -2px 5px rgba(0,0,0,0.2)',
                          zIndex: 10
                        }}
                      >
                        {/* Chalk pieces and eraser */}
                        <div className="flex gap-2 sm:gap-3 items-center justify-center h-full px-2 sm:px-4">
                          <div className="w-8 sm:w-12 h-1.5 sm:h-2 bg-white rounded-full opacity-80 shadow-sm"></div>
                          <div className="w-6 sm:w-10 h-1.5 sm:h-2 bg-yellow-100 rounded-full opacity-80 shadow-sm"></div>
                          <div className="w-5 sm:w-8 h-1.5 sm:h-2 bg-blue-100 rounded-full opacity-80 shadow-sm"></div>
                          {/* Eraser */}
                          <div className="w-12 sm:w-16 h-3 sm:h-4 bg-gray-700 rounded-sm opacity-90 shadow-md"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>



              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Navigation */}
        

        {/* Floating buttons removed - controls are in whiteboard */}

        {/* Mobile Page Selector Drawer */}
        <div
          id="mobile-page-selector"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl border-t-4 border-indigo-500 transform translate-y-full transition-transform duration-300 ease-out"
          style={{ maxHeight: '70vh' }}
        >
          {/* Drawer Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>

          {/* Header */}
          <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                  Select Page
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {chapterData?.sections?.length} pages available
                </p>
              </div>
              <button
                onClick={() => {
                  const pageSelector = document.getElementById('mobile-page-selector');
                  const backdrop = document.getElementById('mobile-page-selector-backdrop');
                  pageSelector?.classList.add('translate-y-full');
                  backdrop?.classList.add('hidden');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Pages List */}
          <div className="overflow-y-auto custom-scrollbar p-3 space-y-2" style={{ maxHeight: 'calc(70vh - 100px)' }}>
            {chapterData?.sections?.map((section, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentPageIndex(idx);
                  setCurrentSegmentIndex(0);
                  const pageSelector = document.getElementById('mobile-page-selector');
                  const backdrop = document.getElementById('mobile-page-selector-backdrop');
                  pageSelector?.classList.add('translate-y-full');
                  backdrop?.classList.add('hidden');
                }}
                className={`w-full text-left p-3 rounded-xl transition-all ${currentPageIndex === idx
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-[1.02]'
                    : 'bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${currentPageIndex === idx
                      ? 'bg-white/20 text-white'
                      : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-0.5">Page {idx + 1}</div>
                    {section.heading && (
                      <div className={`text-xs line-clamp-2 ${currentPageIndex === idx ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                        {section.heading}
                      </div>
                    )}
                  </div>
                  {currentPageIndex === idx && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-lg"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Backdrop for drawer */}
        <div
          id="mobile-page-selector-backdrop"
          className="lg:hidden fixed inset-0 bg-black/50 z-[55] hidden transition-opacity duration-300"
          onClick={() => {
            const pageSelector = document.getElementById('mobile-page-selector');
            const backdrop = document.getElementById('mobile-page-selector-backdrop');
            pageSelector?.classList.add('translate-y-full');
            backdrop?.classList.add('hidden');
          }}
        ></div>

        {/* Fixed Bottom Navigation */}
        <div className="sticky bottom-0 z-50 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-t-2 border-gray-200 dark:border-gray-700 shadow-2xl">
          <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8 py-2.5 md:py-3">
            <div className="flex items-center justify-between gap-2 md:gap-4">
              {/* Previous Button */}
              <button
                onClick={goToPreviousSegment}
                disabled={currentPageIndex === 0 && currentSegmentIndex === 0}
                className="flex items-center justify-center gap-1.5 px-4 md:px-6 py-2.5 md:py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md min-w-[80px] md:min-w-[100px]"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm md:text-base">Prev</span>
              </button>

              {/* Progress Section */}
              <div className="flex-1 flex flex-col items-center gap-1.5 max-w-md mx-2">
                {/* Progress Bar - Always visible */}
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                {/* Segment Counter */}
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Segment {currentSegmentGlobal} of {totalSegments}
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={goToNextSegment}
                disabled={
                  currentPageIndex === (chapterData?.sections?.length || 0) - 1 &&
                  currentSegmentIndex === (currentSection?.content?.length || 0) - 1
                }
                className="flex items-center justify-center gap-1.5 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg min-w-[80px] md:min-w-[100px]"
              >
                <span className="text-sm md:text-base">Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Chapter Navigation - Hidden on mobile/tablet */}
            {/* {(navigation.previous || navigation.next) && (
              <div className="hidden lg:flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {navigation.previous ? (
                  <button
                    onClick={() => navigate(`/reader/${navigation.previous.id}`)}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous Chapter
                  </button>
                ) : <div />}

                {navigation.next && (
                  <button
                    onClick={() => navigate(`/reader/${navigation.next.id}`)}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Next Chapter
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )} */}
          </div>
        </div>
      </div>

      <style>{`
        /* Mobile specific styles */
        @media (max-width: 1024px) {
          /* Smooth scroll behavior */
          html {
            scroll-behavior: smooth;
          }
          
          /* Prevent horizontal scroll */
          body {
            overflow-x: hidden;
          }
          
          /* Ensure content is visible below fixed avatar */
          .custom-scrollbar {
            scroll-padding-top: 35vh;
          }
        }

        /* Ping animation for voice button */
        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        /* Teacher pointer animation */
        @keyframes pointToBoard {
          0%, 100% { transform: rotate(-5deg) translateX(0); }
          50% { transform: rotate(-8deg) translateX(10px); }
        }
        
        .teacher-pointing {
          animation: pointToBoard 2s ease-in-out infinite;
        }

        @keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-slideIn {
  animation: slideIn 0.4s ease-out;
}

@keyframes chalkWrite {
  from {
    opacity: 0;
    transform: translateX(-10px);
    filter: blur(2px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
    filter: blur(0);
  }
}

.animate-chalkWrite {
  animation: chalkWrite 0.6s ease-out forwards;
  opacity: 0;
}

.chalk-text {
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.whiteboard-content {
  position: relative;
}

/* Responsive whiteboard styles */
@media (max-width: 640px) {
  .whiteboard-heading h3 {
    font-size: 1rem;
  }
  
  .whiteboard-paragraph p,
  .whiteboard-bullet p {
    font-size: 0.875rem;
    line-height: 1.5;
  }
}

/* Custom scrollbar for whiteboard */
.custom-scrollbar::-webkit-scrollbar {
  width: 10px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(203, 213, 225, 0.3);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #10b981, #059669);
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #059669, #047857);
}
        
        @keyframes boardWrite {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-boardWrite {
  animation: boardWrite 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
}

/* Typing cursor animation */
.typing-cursor {
  display: inline-block;
  animation: blink 0.7s infinite;
  margin-left: 2px;
}

@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

/* Underline animation */
.underline-animation {
  position: relative;
  display: inline-block;
}

.underline-animation::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  animation: underline-draw 0.5s ease-out;
}

@keyframes underline-draw {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e293b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
    </div>

  );
};

export default LineByLineReader;