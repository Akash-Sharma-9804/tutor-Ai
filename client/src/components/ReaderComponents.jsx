import { ArrowLeft, BookOpen, Lightbulb, Play, Pause, Loader2, Sparkles, ChevronLeft, ChevronRight, X, MessageCircle, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// LOADING / ERROR SCREENS
// ─────────────────────────────────────────────────────────────────────────────

export const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div className="text-center">
      <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400 text-lg">Loading your chapter...</p>
    </div>
  </div>
);

export const ErrorScreen = () => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load chapter content</p>
        <button onClick={() => navigate(-1)} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg">
          Go Back
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE HEADER
// ─────────────────────────────────────────────────────────────────────────────

export const MobileHeader = ({ chapter, chapterData, currentSection, currentPageIndex, progressPercentage, showExplanation, onToggleExplanation }) => {
  const navigate = useNavigate();
  const lastPageNum = chapterData?.sections?.[chapterData.sections.length - 1]?.page_range?.slice(-1)[0] ?? chapterData?.sections?.length;
  const currentPageNum = currentSection?.page_range?.[0] ?? currentPageIndex + 1;

  const togglePageSelector = () => {
    document.getElementById('mobile-page-selector')?.classList.toggle('translate-y-full');
    document.getElementById('mobile-page-selector-backdrop')?.classList.toggle('hidden');
  };

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="px-2 py-2">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
            <ArrowLeft className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-[11px] font-bold text-gray-900 dark:text-white truncate flex-1">{chapter?.chapter_title}</h1>
              <span className="text-[9px] font-semibold text-gray-500 flex-shrink-0">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-0.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>
          <button onClick={togglePageSelector} className="flex-shrink-0 flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white rounded-md text-[10px] font-bold shadow-md">
            <BookOpen className="h-3 w-3" />{currentPageNum}/{lastPageNum}
          </button>
          <button onClick={onToggleExplanation} className={`flex-shrink-0 p-1.5 rounded-md transition-colors shadow-sm ${showExplanation ? 'bg-yellow-400 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600'}`}>
            <Lightbulb className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE PAGE SELECTOR (bottom sheet)
// ─────────────────────────────────────────────────────────────────────────────

export const MobilePageSelector = ({ chapterData, currentPageIndex, onPageSelect }) => {
  const hide = () => {
    document.getElementById('mobile-page-selector')?.classList.add('translate-y-full');
    document.getElementById('mobile-page-selector-backdrop')?.classList.add('hidden');
  };
  return (
    <>
      <div id="mobile-page-selector-backdrop" className="hidden fixed inset-0 z-[60] bg-black/50" onClick={hide} />
      <div id="mobile-page-selector" className="translate-y-full fixed bottom-0 left-0 right-0 z-[70] bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl transition-transform duration-300 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg"  >📖 Jump to Page</h3>
          <button onClick={hide} className="text-gray-500 hover:text-gray-900 font-bold text-xl">✕</button>
        </div>
        <div className="overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {chapterData?.sections?.map((section, idx) => (
            <button key={idx} onClick={() => { onPageSelect(idx); hide(); }}
              className={`w-full text-left p-3 rounded-xl transition-all ${currentPageIndex === idx ? 'bg-indigo-600 text-white font-bold shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-indigo-50'}`}
               
            >
              <div className="font-bold text-sm">Page {section.page_range?.[0] ?? idx + 1}</div>
              {section.heading && <div className="text-xs mt-0.5 opacity-80 truncate">{section.heading}</div>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP HEADER
// ─────────────────────────────────────────────────────────────────────────────

export const DesktopHeader = ({ chapter, chapterData, currentSection, currentPageIndex, currentSegmentGlobal, totalSegments, progressPercentage, showExplanation, onToggleExplanation }) => {
  const navigate = useNavigate();
  const lastPageNum = chapterData?.sections?.[chapterData.sections.length - 1]?.page_range?.slice(-1)[0] ?? chapterData?.sections?.length;
  const currentPageNum = currentSection?.page_range?.[0] ?? currentPageIndex + 1;

  return (
    <div className="hidden lg:block sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-5 w-5" /><span className="hidden sm:inline">Back to Chapters</span>
          </button>
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center">
            <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            <div className="flex-1 max-w-2xl">
              <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 dark:text-white truncate">{chapter?.chapter_title}</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                Ch {chapter?.chapter_no} • Page {currentPageNum}/{lastPageNum}
                {currentSection?.subheading && <span className="hidden sm:inline ml-2 font-semibold text-blue-600"> • {currentSection.subheading}</span>}
              </p>
            </div>
          </div>
          <button onClick={onToggleExplanation}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base ${showExplanation ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
            <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">{showExplanation ? 'Hide' : 'Show'} Explanations</span>
          </button>
        </div>
        <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
          Segment {currentSegmentGlobal} of {totalSegments} • {Math.round(progressPercentage)}% Complete
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR TEACHER (desktop)
// ─────────────────────────────────────────────────────────────────────────────

export const SidebarTeacher = ({ isReading, audioRef, chapterData, currentPageIndex, onPageSelect, TeacherAvatarComponent }) => (
  <div className="hidden lg:flex lg:flex-col lg:w-64 lg:h-full gap-4 p-4 overflow-hidden">
    <div className="flex-shrink-0 relative" style={{ background: 'linear-gradient(145deg, #f59e0b, #d97706)', padding: '12px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', border: '4px solid #78350f' }}>
      <div className="w-full h-[300px] flex items-end justify-center">
        {TeacherAvatarComponent && <TeacherAvatarComponent isSpeaking={isReading} audioRef={audioRef} />}
      </div>
      <div className="text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border-2 border-white/20">
          <p className="text-white text-xs mb-1"  >Hi! I'm</p>
          <h3 className="text-white font-black text-2xl tracking-wide" style={{ fontFamily: 'Comic Sans MS, cursive', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Andy</h3>
          <p className="text-amber-200 font-semibold text-sm mt-1"  >Your study sidekick! 🚀</p>
        </div>
      </div>
    </div>
    <div className="flex-1 min-h-0 rounded-2xl overflow-hidden flex flex-col" style={{ background: 'linear-gradient(145deg,#e0e7ff,#c7d2fe)', border: '3px solid #6366f1', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
      <h3 className="flex-shrink-0 text-lg font-bold text-indigo-900 p-4 pb-3 text-center bg-gradient-to-b from-indigo-200 to-indigo-100 z-10"  >📖 Pages</h3>
      <div className="flex-1 min-h-0 space-y-2 p-4 pt-0 overflow-y-auto custom-scrollbar">
        {chapterData?.sections?.map((section, idx) => (
          <button key={idx} onClick={() => onPageSelect(idx)}
            className={`w-full text-left p-3 rounded-lg transition-all ${currentPageIndex === idx ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-white text-indigo-900 hover:bg-indigo-100'}`}
             
          >
            <div className="font-bold text-sm">Page {section.page_range?.[0] ?? idx + 1}</div>
            {section.heading && <div className="text-xs opacity-90 truncate mt-1">{section.heading}</div>}
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE TEACHER AVATAR STRIP
// ─────────────────────────────────────────────────────────────────────────────

export const MobileTeacherAvatar = ({ isReading, audioRef, TeacherAvatarComponent }) => (
  <div className="lg:hidden fixed top-[42px] left-0 right-0 z-40 overflow-hidden"
    style={{
      background: 'linear-gradient(160deg, #92400e 0%, #b45309 30%, #f59e0b 70%, #fbbf24 100%)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      borderBottom: '2px solid rgba(251,191,36,0.4)',
    }}>

    {/* Decorative background glow rings */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-[220px] h-[220px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
      <div className="absolute top-2 left-6 w-3 h-3 rounded-full bg-white/20" />
      <div className="absolute top-5 left-16 w-1.5 h-1.5 rounded-full bg-white/15" />
      <div className="absolute top-3 right-10 w-2 h-2 rounded-full bg-white/20" />
      <div className="absolute bottom-8 right-6 w-2.5 h-2.5 rounded-full bg-white/10" />
    </div>

    {/* Avatar area */}
    <div className="relative h-[160px] md:h-[200px] flex items-center justify-center">
      <div className="w-full h-full">
        {TeacherAvatarComponent && <TeacherAvatarComponent isSpeaking={isReading} audioRef={audioRef} />}
      </div>

      {/* Sound wave bars when speaking */}
      {isReading && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-[3px]">
          {[10, 18, 26, 18, 12, 22, 16, 24, 14].map((h, i) => (
            <div key={i}
              className="w-[3px] rounded-full bg-white/80"
              style={{
                height: `${h}px`,
                animation: `soundBar 0.6s ease-in-out ${i * 0.07}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}

      {/* Idle pulse ring when not speaking */}
      {!isReading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full border border-white/25">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-200 animate-pulse" />
          <span className="text-white/90 text-[10px] font-semibold tracking-wide">READY</span>
        </div>
      )}
    </div>

    {/* Name strip */}
    <div className="relative flex items-center justify-between px-4 py-1.5"
      style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm">🎓</div>
        <div>
          <p className="text-white font-bold text-xs leading-none">Andy</p>
          <p className="text-amber-200 text-[9px] leading-none mt-0.5">AI Study Buddy</p>
        </div>
      </div>
      {isReading ? (
        <div className="flex items-center gap-1.5 bg-red-500/80 px-2.5 py-1 rounded-full">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          <span className="text-white text-[10px] font-bold">LIVE</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-full">
          <span className="text-white/80 text-[10px]">Your study sidekick 🚀</span>
        </div>
      )}
    </div>

    <style>{`
      @keyframes soundBar {
        from { transform: scaleY(0.4); opacity: 0.5; }
        to   { transform: scaleY(1.2); opacity: 1; }
      }
    `}</style>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// CONTROL BUTTONS
// ─────────────────────────────────────────────────────────────────────────────

export const ControlButtons = ({ isReading, isLoadingAudio, autoPlayMode, autoPlayCountdown, onReadAloud, onStopReading, onToggleAutoPlay, onGetDetailedExplanation }) => (
  <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b-2 sm:border-b-4 border-slate-600" style={{ borderStyle: 'dashed' }}>
    <button onClick={isReading ? onStopReading : onReadAloud} disabled={isLoadingAudio}
      className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md border-2 ${isReading ? 'bg-red-500 hover:bg-red-600 text-white border-red-700' : isLoadingAudio ? 'bg-gray-400 cursor-not-allowed text-white border-gray-600' : 'bg-blue-500 hover:bg-blue-600 text-white border-blue-700'}`}
       >
      {isLoadingAudio ? <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</> : isReading ? <><Pause className="h-4 w-4" /> Stop</> : <><Play className="h-4 w-4" /> Read Aloud</>}
    </button>
    <button onClick={onToggleAutoPlay}
      className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md border-2 hover:scale-105 ${autoPlayMode ? 'bg-green-500 text-white border-green-700' : 'bg-slate-300 text-slate-700 hover:bg-slate-400 border-slate-500'}`}
       >
      {autoPlayCountdown > 0 ? `Next in ${autoPlayCountdown}s` : 'Auto-Play'}
    </button>
    <button onClick={onGetDetailedExplanation}
      className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md bg-purple-500 hover:bg-purple-600 text-white hover:scale-105 border-2 border-purple-700"
       >
      <Sparkles className="h-4 w-4" />
      <span className="hidden sm:inline">Explain in Detail</span>
      <span className="sm:hidden">Explain</span>
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// EXPLANATION CARD (simple yellow card)
// ─────────────────────────────────────────────────────────────────────────────

const HighlightedWords = ({ words, highlightedIndex, color, shadow }) =>
  words.map((word, idx) => (
    <span key={idx} style={{ marginRight: '0.3em', display: 'inline-block', color: idx === highlightedIndex ? color : idx < highlightedIndex ? 'rgba(30,41,59,0.45)' : 'rgb(30,41,59)', fontWeight: idx === highlightedIndex ? '700' : 'inherit', textShadow: idx === highlightedIndex ? shadow : 'none', transition: 'color 0.1s' }}>
      {word}
    </span>
  ));

import renderMixedText from '../utils/renderMixedText';

export const ExplanationCard = ({ segment, isReading, currentWords, highlightedWordIndex, mainTextWordCount }) => {
  if (!segment?.explanation) return null;
  const expWords = currentWords.slice(mainTextWordCount);
  const expIdx = highlightedWordIndex - mainTextWordCount;
  return (
    <div className="bg-yellow-100 rounded-2xl shadow-lg p-4 border-4 border-yellow-400 mb-4 animate-chalkWrite"  >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-yellow-500 rounded-lg border-2 border-yellow-600 shadow-md"><Lightbulb className="h-6 w-6 text-white" /></div>
        <h2 className="text-sm md:text-xl font-bold text-slate-800">💡 Simple Explanation</h2>
      </div>
      <p className="text-sm sm:text-base leading-relaxed text-slate-700" style={{ wordSpacing: '0.15em' }}>
        {isReading && expWords.length > 0 && mainTextWordCount > 0
          ? <HighlightedWords words={expWords} highlightedIndex={expIdx} color="#b45309" shadow="0 0 10px rgba(180,83,9,0.3)" />
          : renderMixedText(segment.explanation)}
      </p>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TEACHER'S BOARD
// ─────────────────────────────────────────────────────────────────────────────

const ICONS = ['📚', '🎯', '🌟', '⚠️', '💡', '✍️'];

export const TeacherBoard = ({ detailedExplanation, loadingExplanation, isReading, isLoadingAudio, teacherBoardWords, teacherBoardHighlightIndex, currentChunk, onClose, onReadAloud, onStopReading }) => {
  const paragraphs = detailedExplanation
    ? detailedExplanation.replace(/\*\*/g, '').replace(/##/g, '').replace(/^\* /gm, '').replace(/^- /gm, '').split('\n\n')
    : [];

  // Build a complete word map: word index → {paragraphIndex, wordIndexInParagraph}
  let globalWordIndex = 0;
  const wordMap = {};
  paragraphs.forEach((para, parIdx) => {
    const cleanText = para.replace(/\*\*/g, '').replace(/##/g, '').trim();
    const words = cleanText.split(/\s+/).filter(Boolean);
    words.forEach((_, wordIdx) => {
      wordMap[globalWordIndex] = { parIdx, wordIdx };
      globalWordIndex++;
    });
  });

  const renderParagraph = (paragraph, idx) => {
    const isHeading = /^(\*\*|##|\d+\.)/.test(paragraph.trim());
    const isBullet = paragraph.trim().startsWith('*') && !paragraph.trim().startsWith('**');
    const cleanText = paragraph.replace(/\*\*/g, '').replace(/##/g, '').trim();
    const words = cleanText.split(/\s+/).filter(Boolean);

    if (isHeading) return (
      <div key={idx} className="animate-chalkWrite mb-4 pb-3 border-b-4 border-yellow-400" style={{ animationDelay: `${idx * 0.15}s`, fontFamily: 'Comic Sans MS, cursive' }}>
        <h3 className="text-lg sm:text-xl font-bold text-slate-800">{ICONS[idx] || ''} {cleanText}</h3>
      </div>
    );

    if (isBullet) return (
      <div key={idx} className="animate-chalkWrite pl-6 py-2 border-l-4 border-blue-400 bg-blue-50/50" style={{ animationDelay: `${idx * 0.15}s`, fontFamily: 'Comic Sans MS, cursive' }}>
        <p className="text-xs sm:text-sm md:text-base text-slate-700 leading-snug"><span className="text-blue-600 font-bold mr-2">•</span>{cleanText.replace(/^\*\s*/, '')}</p>
      </div>
    );

    // Regular paragraph with highlighting
    const content = words.map((word, wordIdx) => {
      // Find this word's global index
      let globalIdx = -1;
      for (const [gIdx, { parIdx, wordIdx: wIdx }] of Object.entries(wordMap)) {
        if (parIdx === idx && wIdx === wordIdx) {
          globalIdx = parseInt(gIdx);
          break;
        }
      }

      const isActive = isReading && globalIdx === teacherBoardHighlightIndex;
      const isPast = isReading && globalIdx < teacherBoardHighlightIndex;

      return (
        <span
          key={wordIdx}
          className="inline transition-all duration-150"
          style={{
            color: isActive ? '#2563eb' : isPast ? 'rgba(30,41,59,0.45)' : 'rgb(30,41,59)',
            fontWeight: isActive ? '700' : 'inherit',
            textShadow: isActive ? '0 0 8px rgba(37,99,235,0.25)' : 'none',
            backgroundColor: isActive ? 'rgba(37,99,235,0.1)' : 'transparent',
            padding: isActive ? '0 2px' : '0',
            borderRadius: isActive ? '2px' : '0',
          }}
        >
          {word}{wordIdx < words.length - 1 ? '\u00A0' : ''}
        </span>
      );
    });

    return (
      <div key={idx} className="animate-chalkWrite bg-white/70 rounded-lg p-3 sm:p-4 shadow-sm overflow-hidden" style={{ animationDelay: `${idx * 0.15}s`, fontFamily: 'Comic Sans MS, cursive' }}>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed break-words overflow-x-hidden">{content}</p>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl p-3 sm:p-6 border-4 border-slate-600 animate-slideIn sticky top-4 overflow-hidden max-w-full">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E\")" }} />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6 relative z-10">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="p-2 sm:p-3 bg-green-500 rounded-lg sm:rounded-xl shadow-lg border-2 border-white flex-shrink-0"><MessageCircle className="h-5 sm:h-7 w-5 sm:w-7 text-white" /></div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white truncate"  >🎓 Teacher's Board</h2>
            <p className="text-xs sm:text-sm text-green-300 mt-0.5 truncate">Step-by-step explanation</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all hover:scale-110 shadow-lg flex-shrink-0"><X className="h-5 sm:h-6 w-5 sm:w-6 text-white" /></button>
      </div>

      {loadingExplanation ? (
        <div className="flex items-center justify-center py-12 sm:py-16">
          <div className="text-center">
            <Loader2 className="h-10 sm:h-12 w-10 sm:w-12 animate-spin text-purple-600 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Generating explanation...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-inner relative z-10 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 border-b-4 border-slate-300 bg-slate-100 flex-wrap">
            <h3 className="text-sm sm:text-base font-bold text-slate-800"  >📝 Comprehensive Breakdown</h3>
            <button onClick={isReading ? onStopReading : onReadAloud} disabled={!detailedExplanation || loadingExplanation || isLoadingAudio}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 shadow-md border-2 border-blue-300 flex-shrink-0 whitespace-nowrap">
              {isLoadingAudio ? <><Loader2 className="h-4 w-4 animate-spin" /><span className="hidden sm:inline text-xs">Loading...</span></> : isReading ? <><Pause className="h-4 w-4" /><span className="hidden sm:inline text-xs">{currentChunk.total > 1 ? `Stop (${currentChunk.current}/${currentChunk.total})` : 'Stop'}</span></> : <><Volume2 className="h-4 w-4" /><span className="hidden sm:inline text-xs">Read</span></>}
            </button>
          </div>
          <div className="max-h-[55vh] sm:max-h-[60vh] overflow-y-auto p-3 sm:p-6 custom-scrollbar">
            <div className="space-y-4 sm:space-y-6 w-full">{paragraphs.map((p, i) => renderParagraph(p, i))}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION FOOTER
// ─────────────────────────────────────────────────────────────────────────────

export const NavigationFooter = ({ currentSegmentGlobal, totalSegments, progressPercentage, isLastSegment, onPrevious, onNext, onFinish }) => (
  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-white dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700 shadow-inner lg:relative fixed bottom-0 left-0 right-0 z-50">
    <button onClick={onPrevious} className="flex items-center justify-center gap-1.5 px-4 md:px-6 py-2.5 md:py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 transition-all shadow min-w-[80px] md:min-w-[100px]">
      <ChevronLeft className="h-5 w-5" /><span className="text-sm md:text-base">Prev</span>
    </button>
    <div className="flex-1 flex flex-col items-center gap-1">
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
      </div>
      <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Segment {currentSegmentGlobal} of {totalSegments}</div>
    </div>
    <button onClick={isLastSegment ? onFinish : onNext}
      className={`flex items-center justify-center gap-1.5 px-4 md:px-6 py-2.5 md:py-3 text-white rounded-xl font-medium transition-all shadow-lg min-w-[80px] md:min-w-[100px] ${isLastSegment ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'}`}>
      <span className="text-sm md:text-base">{isLastSegment ? '🎉 Finish' : 'Next'}</span><ChevronRight className="h-5 w-5" />
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETION MODAL
// ─────────────────────────────────────────────────────────────────────────────

export const CompletionModal = ({ chapter, onClose }) => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md mx-4 shadow-2xl border-4 border-green-400 text-center">
        <div className="text-7xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2"  >Chapter Complete!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">You've finished <strong className="text-gray-900 dark:text-white">{chapter?.chapter_title}</strong>. Amazing work! 🌟</p>
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-28 h-28">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="url(#cg)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 42}`} strokeDashoffset="0" />
              <defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#059669" /></linearGradient></defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-green-600">100%</span>
              <span className="text-xs text-gray-500">Complete</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={() => { onClose(); navigate(`/book/${chapter?.book_id}`); }} className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-2xl text-lg shadow-lg transition-all">📚 Back to Table of Contents</button>
          <button onClick={onClose} className="w-full py-2 px-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-medium rounded-2xl transition-all">Stay & Review</button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EXIT DIALOG
// ─────────────────────────────────────────────────────────────────────────────

export const ExitDialog = ({ onContinue, onExit }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
    <div className="bg-gray-900 border-2 border-red-500 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4"><X className="h-8 w-8 text-red-500" /></div>
        <h2 className="text-2xl font-bold text-white mb-2">Exit Class?</h2>
        <p className="text-gray-400 mb-6">If you exit now, you'll leave the current learning session and return to the table of contents.</p>
        <div className="space-y-3">
          <button onClick={onContinue} className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg">Continue Learning</button>
          <button onClick={onExit} className="w-full py-4 px-6 bg-gray-800 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition-all border border-gray-700">Exit to Table of Contents</button>
        </div>
      </div>
    </div>
  </div>
);