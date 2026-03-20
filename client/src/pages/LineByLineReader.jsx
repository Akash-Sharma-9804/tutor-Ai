import { useState, useEffect ,useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "katex/dist/katex.min.css";

// ── Hooks ─────────────────────────────────────────────────────────────────────
import useChapterData, { fetchDetailedExplanation, saveSegmentProgress } from '../hooks/useChapterData';
import useSegmentNavigation from '../hooks/useSegmentNavigation';
import useTTS from '../hooks/useTTS';
import useFullscreen from '../hooks/useFullscreen';
import VoiceController from '../components/VoiceController';

// ── Segment display ───────────────────────────────────────────────────────────
import { TextSegment, DialogueSegment, ExampleSegment, EquationSegment, DiagramSegment, TableSegment } from '../components/SegmentDisplay';

// ── UI components ─────────────────────────────────────────────────────────────
import {
  LoadingScreen, ErrorScreen,
  MobileHeader, MobileTeacherAvatar, MobilePageSelector,
  DesktopHeader, SidebarTeacher,
  ControlButtons, ExplanationCard, TeacherBoard,
  NavigationFooter, CompletionModal, ExitDialog,
} from '../components/ReaderComponents';

// ── Constants ─────────────────────────────────────────────────────────────────
import { SUBHEADING_SKIP_DELAY_MS } from '../constants/readerConfig';

// Import your existing TeacherAvatar component
import TeacherAvatar from '../components/TeacherAvatar';
import OnboardingTour from '../components/OnboardingTour';

const READER_CSS = `
  @keyframes slideIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  .animate-slideIn { animation: slideIn 0.4s ease-out; }
  @keyframes chalkWrite { from { opacity:0; transform:translateX(-10px); filter:blur(2px); } to { opacity:1; transform:translateX(0); filter:blur(0); } }
  .animate-chalkWrite { animation: chalkWrite 0.6s ease-out forwards; opacity:0; }
  .chalk-text { text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }
  .underline-animation::after { content:''; position:absolute; left:0; bottom:-2px; width:100%; height:3px; background:linear-gradient(90deg,#3b82f6,#8b5cf6); animation:underline-draw 0.5s ease-out; }
  @keyframes underline-draw { from { width:0%; } to { width:100%; } }
  .custom-scrollbar::-webkit-scrollbar { width:8px; }
  .custom-scrollbar::-webkit-scrollbar-track { background:#f1f5f9; border-radius:10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background:linear-gradient(to bottom,#3b82f6,#8b5cf6); border-radius:10px; }
`;

// ─────────────────────────────────────────────────────────────────────────────

const LineByLineReader = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();

  // ── UI state ───────────────────────────────────────────────────────────────
  const [showExplanation, setShowExplanation]               = useState(true);
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(false);
  const greetingFiredRef = useRef(false);
  const greetingAudioRef = useRef(null);
  const [detailedExplanation, setDetailedExplanation]       = useState('');
  const [loadingExplanation, setLoadingExplanation]         = useState(false);
  const [showCompletionModal, setShowCompletionModal]       = useState(false);
  const [showExitDialog, setShowExitDialog]                 = useState(false);

  // ── Data hook ──────────────────────────────────────────────────────────────
  const {
    chapterData, chapter, navigation, pageImages, segments, loading,
    currentPageIndex, setCurrentPageIndex,
    currentSegmentIndex, setCurrentSegmentIndex,
    currentPdfPage, setCurrentPdfPage,
  } = useChapterData(chapterId);

  const currentSection = chapterData?.sections?.[currentPageIndex] || { content: [], heading: '' };
  const currentSegment = currentSection?.content?.[currentSegmentIndex];

  // ── Navigation hook ────────────────────────────────────────────────────────
  const { isLastSegment, goToNextSegment, goToPreviousSegment, saveProgress } = useSegmentNavigation({
    chapterId, chapterData,
    currentPageIndex, setCurrentPageIndex,
    currentSegmentIndex, setCurrentSegmentIndex,
    setShowDetailedExplanation,
  });

  // ── TTS hook ───────────────────────────────────────────────────────────────
  const tts = useTTS({ chapterId, currentSegment, currentSegmentIndex, showExplanation, goToNextSegment });

  // ── Voice ref — tracks currently visible text for voice Q&A ──────────────
  const visibleTextRef = useRef('');
  useEffect(() => {
    if (currentSegment) {
      visibleTextRef.current =
        currentSegment.text ||
        currentSegment.problem ||
        currentSegment.equation ||
        currentSegment.subheading || '';
    }
  }, [currentSegment]);

  // ── Fullscreen hook ────────────────────────────────────────────────────────
  const { enterFullscreen } = useFullscreen({
    loading, chapter,
    onStopReading: tts.stopReading,
    onShowExitDialog: () => setShowExitDialog(true),
  });

  // ── Lifecycle effects ──────────────────────────────────────────────────────
  useEffect(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }, []);

  useEffect(() => () => {
    if (tts.ttsAbortRef.current) { tts.ttsAbortRef.current.abort(); tts.ttsAbortRef.current = null; }
    if (tts.audioRef.current) { tts.audioRef.current.pause(); tts.audioRef.current.src = ''; tts.audioRef.current = null; }
  }, [chapterId]); // eslint-disable-line

  useEffect(() => {
    const wasAutoPlaying = tts.autoPlayRef.current;
    if (tts.ttsAbortRef.current) { tts.ttsAbortRef.current.abort(); tts.ttsAbortRef.current = null; }
    if (tts.audioRef.current) { tts.audioRef.current.pause(); tts.audioRef.current.src = ''; tts.audioRef.current = null; }
    tts.setActiveEquationStep(0); tts.setEquationStepChars({}); tts.setShowFinalResult(false);
    if (wasAutoPlaying) { tts.autoPlayRef.current = true; setTimeout(() => tts.readAloud(), 400); }
  }, [currentSegmentIndex, currentPageIndex]); // eslint-disable-line

  useEffect(() => {
    const range = currentSection?.page_range;
    if (range?.length > 0) setCurrentPdfPage(range[0]);
  }, [currentPageIndex]); // eslint-disable-line

  useEffect(() => {
    if (currentSegment?.type === 'subheading') {
      const t = setTimeout(() => goToNextSegment(), SUBHEADING_SKIP_DELAY_MS);
      return () => clearTimeout(t);
    }
  }, [currentSegment, currentSegmentIndex, currentPageIndex]); // eslint-disable-line

  // Stop greeting audio if user navigates away or exits fullscreen
  const stopGreeting = () => {
    if (greetingAudioRef.current) {
      greetingAudioRef.current.pause();
      greetingAudioRef.current = null;
    }
  };

  // Welcome greeting - plays once when chapter data loads
  useEffect(() => {
    if (greetingFiredRef.current || !chapterData) return;
    greetingFiredRef.current = true;
    const getFirstName = () => {
      try {
        const raw = localStorage.getItem('student') || sessionStorage.getItem('student');
        if (raw) { const full = (JSON.parse(raw)?.name || '').trim(); return full.split(' ')[0] || null; }
      } catch (_) {} return null;
    };
    const firstName = getFirstName();
    const chapterTitle = chapterData?.chapter_title || chapter?.chapter_title || 'this chapter';
    const lines = ["Let's dive in and make this chapter fun together!","Let's explore this chapter step by step.","Ready to learn something awesome? Let's go!","Learning is an adventure and it starts right now!"];
    const greetText = (firstName
      ? `Hi ${firstName}! Welcome to AI Tutor. We are starting ${chapterTitle}. `
      : `Welcome to AI Tutor! We are starting ${chapterTitle}. `
    ) + lines[Math.floor(Math.random() * lines.length)];
    const API_BASE = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    fetch(`${API_BASE}/api/voice/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ text: greetText }),
    }).then(r => r.ok ? r.blob() : Promise.reject()).then(blob => {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      greetingAudioRef.current = audio;
      audio.onended = () => { URL.revokeObjectURL(url); greetingAudioRef.current = null; };
      audio.play().catch(() => {});
    }).catch(() => {});
    // Stop greeting when component unmounts
    return stopGreeting;
  }, [chapterData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop greeting on fullscreen exit or chapterId change
  useEffect(() => { return stopGreeting; }, [chapterId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onFsChange = () => {
      const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
      if (!isFs) stopGreeting();
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Progress stats ─────────────────────────────────────────────────────────
  const totalSegments = chapterData?.sections?.reduce((sum, s) => sum + (s.content?.length || 0), 0) || 0;
  const currentSegmentGlobal =
    (chapterData?.sections?.slice(0, currentPageIndex).reduce((sum, s) => sum + (s.content?.length || 0), 0) || 0)
    + currentSegmentIndex + 1;
  const progressPercentage = (currentSegmentGlobal / totalSegments) * 100;

  // ── AI explanation ─────────────────────────────────────────────────────────
  const getDetailedExplanation = async () => {
    if (!currentSegment) return;
    setLoadingExplanation(true);
    setShowDetailedExplanation(true);
    try {
      const text = currentSegment.type === 'equation'
        ? `Equation: ${currentSegment.equation}. ${currentSegment.final_result ? 'Final result: ' + currentSegment.final_result : ''}`
        : currentSegment.type === 'example' ? `Example: ${currentSegment.problem}` : currentSegment.text;
      setDetailedExplanation(await fetchDetailedExplanation(chapterId, text, currentSection.heading || chapter?.chapter_title));
    } catch { setDetailedExplanation('Failed to generate explanation. Please try again.'); }
    finally { setLoadingExplanation(false); }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handlePageSelect = (idx) => { setCurrentPageIndex(idx); setCurrentSegmentIndex(0); };
  const handleExitClass = () => { setShowExitDialog(false); navigate(chapter?.book_id ? '/subjects' : -1); };
  const handleReturnToFullscreen = async () => { setShowExitDialog(false); await enterFullscreen(); };

  // ── Render guards ──────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;
  if (!chapterData) return <ErrorScreen />;

  // ── Segment type flags ─────────────────────────────────────────────────────
  const isDiagram    = ['diagram', 'diagram_concept', 'diagram_reference'].includes(currentSegment?.type);
  // 'derivation' is a physics proof → renders as EquationSegment (safety net if normalization didn't run)
  const isEquation   = ['equation', 'derivation'].includes(currentSegment?.type);
  const isExample    = currentSegment?.type === 'example';
  const isDialogue   = currentSegment?.type === 'dialogue';
  const isTable      = currentSegment?.type === 'table';
  const isSubheading = currentSegment?.type === 'subheading';
  // 'law', 'concept', 'definition', 'theorem', 'note', 'topic_intro', 'text' all render as TextSegment
  const isText       = !isDiagram && !isEquation && !isExample && !isDialogue && !isTable && !isSubheading;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

      <MobileHeader chapter={chapter} chapterData={chapterData} currentSection={currentSection} currentPageIndex={currentPageIndex} progressPercentage={progressPercentage} showExplanation={showExplanation} onToggleExplanation={() => setShowExplanation(v => !v)} />
      <MobileTeacherAvatar isReading={tts.isReading} audioRef={tts.audioRef} TeacherAvatarComponent={TeacherAvatar} />
      <MobilePageSelector chapterData={chapterData} currentPageIndex={currentPageIndex} onPageSelect={handlePageSelect} />
      <DesktopHeader chapter={chapter} chapterData={chapterData} currentSection={currentSection} currentPageIndex={currentPageIndex} currentSegmentGlobal={currentSegmentGlobal} totalSegments={totalSegments} progressPercentage={progressPercentage} showExplanation={showExplanation} onToggleExplanation={() => setShowExplanation(v => !v)} />

      <div className="w-full py-0 px-0 sm:px-1 lg:px-2 pt-[240px] sm:pt-[230px] md:pt-[280px] lg:pt-0 overflow-hidden">
        <div className="flex flex-col w-full gap-0 lg:gap-2 lg:flex-row lg:h-[calc(100vh-9rem)] overflow-hidden">

          <div data-tour="pages"><SidebarTeacher isReading={tts.isReading} audioRef={tts.audioRef} chapterData={chapterData} currentPageIndex={currentPageIndex} onPageSelect={handlePageSelect} TeacherAvatarComponent={TeacherAvatar} /></div>

          <div className="relative flex-1 w-full lg:h-full overflow-hidden">
            <div className="flex flex-col gap-0 h-full overflow-hidden">

              <div className="flex-1 overflow-hidden custom-scrollbar h-[calc(100vh-220px)] lg:h-auto"
                style={{ background: 'linear-gradient(180deg,#e8d4b8 0%,#d4c4a8 50%,#c4b498 100%)' }}>
                <div className="relative p-2 sm:p-3 md:p-4 lg:p-6 pb-6">
                  <div className="relative" style={{ background: 'linear-gradient(145deg,#2d3748,#1a202c)', padding: '12px', borderRadius: '8px', boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}>
                    {/* Corner brackets */}
                    {[['top-2 left-2 border-l-4 border-t-4'], ['top-2 right-2 border-r-4 border-t-4'], ['bottom-2 left-2 border-l-4 border-b-4'], ['bottom-2 right-2 border-r-4 border-b-4']].map(([cls], i) => (
                      <div key={i} className={`absolute w-8 h-8 border-gray-600 ${cls}`} />
                    ))}

                    <div className="rounded-lg shadow-inner flex flex-col h-full lg:h-[calc(100vh-20rem)]"
                      style={{ background: '#fff', boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.15)', border: '3px solid #5a6a5a' }}>
                      <div className="flex-1 overflow-hidden p-2 sm:p-4 md:p-6 pb-12">

                        <div data-tour="read-aloud">
                        <ControlButtons
                          isReading={tts.isReading} isLoadingAudio={tts.isLoadingAudio}
                          autoPlayMode={tts.autoPlayMode} autoPlayCountdown={tts.autoPlayCountdown}
                          onReadAloud={() => tts.readAloud()} onStopReading={tts.stopReading}
                          onToggleAutoPlay={tts.toggleAutoPlay} onGetDetailedExplanation={getDetailedExplanation}
                        />
                        </div>

                        {/* Section badge */}
                        {!isSubheading && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="text-sm font-bold text-slate-700 uppercase tracking-wider px-3 py-1 bg-yellow-200 rounded-lg border-2 border-yellow-400 shadow-sm" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                              📖 {currentSection.heading || `Section ${currentPageIndex + 1}`}
                            </div>
                            {isDialogue && <span className="px-3 py-1 bg-orange-300 text-orange-900 text-xs font-bold rounded-lg border-2 border-orange-500" style={{ fontFamily: 'Comic Sans MS, cursive' }}>💬 DIALOGUE</span>}
                            {isEquation && <span className="px-3 py-1 bg-blue-300 text-blue-900 text-xs font-bold rounded-lg border-2 border-blue-500" style={{ fontFamily: 'Comic Sans MS, cursive' }}>🔢 EQUATION</span>}
                            {isExample && <span className="px-3 py-1 bg-green-300 text-green-900 text-xs font-bold rounded-lg border-2 border-green-500" style={{ fontFamily: 'Comic Sans MS, cursive' }}>📝 EXAMPLE</span>}
                            {isDiagram && <span className="px-3 py-1 bg-purple-300 text-purple-900 text-xs font-bold rounded-lg border-2 border-purple-500" style={{ fontFamily: 'Comic Sans MS, cursive' }}>📊 DIAGRAM</span>}
                          </div>
                        )}

                        {isSubheading && (
                          <div className="mb-4 px-4 py-2 bg-blue-100 rounded-lg border-2 border-blue-400 inline-block" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                            <span className="text-lg font-bold text-blue-700 uppercase tracking-wider">📑 {currentSegment.subheading}</span>
                          </div>
                        )}

                        {/* ── Segment content ────────────────────────────────── */}
                        <div className="mb-4 animate-chalkWrite">
                          {isText     && <TextSegment     segment={currentSegment} currentSection={currentSection} currentPageIndex={currentPageIndex} isReading={tts.isReading} currentWords={tts.currentWords} highlightedWordIndex={tts.highlightedWordIndex} mainTextWordCount={tts.mainTextWordCount} />}
                          {isDialogue && <DialogueSegment segment={currentSegment} />}
                          {isExample  && <ExampleSegment  segment={currentSegment} />}
                          {isTable    && <TableSegment    segment={currentSegment} showExplanation={showExplanation} isReading={tts.isReading} currentWords={tts.currentWords} highlightedWordIndex={tts.highlightedWordIndex} />}
                          {isEquation && <EquationSegment segment={currentSegment} activeEquationStep={tts.activeEquationStep} activeStepUnderline={tts.activeStepUnderline} isReading={tts.isReading} currentWords={tts.currentWords} highlightedWordIndex={tts.highlightedWordIndex} equationStepChars={tts.equationStepChars} explanationWords={tts.explanationWords} showFinalResult={tts.showFinalResult} />}
                          {isDiagram  && <DiagramSegment  segment={currentSegment} segments={segments} currentPdfPage={currentPdfPage} isReading={tts.isReading} currentWords={tts.currentWords} highlightedWordIndex={tts.highlightedWordIndex} mainTextWordCount={tts.mainTextWordCount} />}
                        </div>

                        {/* ── Explanation card ──────────────────────────────── */}
                        {showExplanation && currentSegment?.explanation && !isDiagram && !isTable && !isDialogue && (
                          <ExplanationCard segment={currentSegment} isReading={tts.isReading} currentWords={tts.currentWords} highlightedWordIndex={tts.highlightedWordIndex} mainTextWordCount={tts.mainTextWordCount} />
                        )}

                        {/* ── Teacher's Board ───────────────────────────────── */}
                        {showDetailedExplanation && (
                          <TeacherBoard
                            detailedExplanation={detailedExplanation} loadingExplanation={loadingExplanation}
                            isReading={tts.isReading} isLoadingAudio={tts.isLoadingAudio}
                            teacherBoardWords={tts.teacherBoardWords} teacherBoardHighlightIndex={tts.teacherBoardHighlightIndex}
                            currentChunk={tts.currentChunk}
                            onClose={() => setShowDetailedExplanation(false)}
                            onReadAloud={() => tts.readTeacherBoard(detailedExplanation)}
                            onStopReading={tts.stopReading}
                          />
                        )}

                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div data-tour="next">
              <NavigationFooter
                currentSegmentGlobal={currentSegmentGlobal} totalSegments={totalSegments}
                progressPercentage={progressPercentage} isLastSegment={isLastSegment()}
                onPrevious={goToPreviousSegment} onNext={goToNextSegment}
                onFinish={() => { saveProgress(currentSegmentIndex, currentPageIndex); setShowCompletionModal(true); }}
              />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCompletionModal && <CompletionModal chapter={chapter} onClose={() => setShowCompletionModal(false)} />}
      {showExitDialog && <ExitDialog onContinue={handleReturnToFullscreen} onExit={handleExitClass} />}

<OnboardingTour isReady={!loading} />
<VoiceController
  chapterId={chapterId}
  getVisibleText={() => visibleTextRef.current}
  getCurrentSegment={() => currentSegment}
        onCommand={(cmd) => {
          if (cmd === 'next')      goToNextSegment();
          if (cmd === 'prev')      goToPreviousSegment();
          if (cmd === 'pause')     tts.stopReading();
          if (cmd === 'stop')      { tts.stopReading(); tts.autoPlayRef && (tts.autoPlayRef.current = false); }
          if (cmd === 'resume')    tts.readAloud();
          if (cmd === 'auto-play') tts.toggleAutoPlay();
        }}
        autoNarrate={false}
        currentSegmentText={currentSegment?.text || currentSegment?.problem || currentSegment?.equation || ''}
        onNarrationEnd={goToNextSegment}
        onStopNarration={() => {
          tts.stopReading();
        }}
      />
      <style>{READER_CSS}</style>
    </div>
  );
};

export default LineByLineReader;