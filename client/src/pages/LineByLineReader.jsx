import { useState, useEffect, useRef } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Volume2, BookOpen, Lightbulb, ArrowLeft, Loader2, Play, Pause, Sparkles, X, MessageCircle } from 'lucide-react';

import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import TeacherAvatar from '../components/TeacherAvatar.jsx';


// Renders text that contains inline LaTeX ($...$) mixed with plain text
const renderMixedText = (text) => {
  if (!text || typeof text !== 'string') return text;

  // ── Heal old-processed-book corruption ───────────────────────────────────
  // Bug: sanitizeJsonString treated \f and \t as valid JSON escapes.
  // JSON.parse converted \f → form-feed (U+000C) and \t → tab (U+0009).
  // These corrupt LaTeX: \frac becomes 0x0C+rac, \theta becomes 0x09+heta.
  // Fix: detect these corruptions by matching the ACTUAL control characters.
  // eslint-disable-next-line no-control-regex
  text = text
    .replace(/([a-zA-Z{])/g, '\\$1')   // form-feed+letter → \letter (restores \frac, \fbox etc)
    .replace(/	([a-zA-Z{])/g, '\\$1');  // tab+letter → \letter (restores \theta, \times, \tau etc)
  // ─────────────────────────────────────────────────────────────────────────

  // Don't try to parse if no $ signs and no LaTeX commands
  if (!text.includes('$') && !/\\[a-zA-Z]/.test(text)) return text;

  // Split on $...$ pattern (single dollar = inline math)
  const parts = text.split(/(\$[^$]+\$)/g);
  return parts.map((part, i) => {
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const math = part.slice(1, -1).trim();
      try {
        return <InlineMath key={i} math={math} />;
      } catch {
        return <span key={i}>{part}</span>;
      }
    }
    // Check if this plain text chunk contains bare LaTeX commands like \vec{} \frac{}{} \omega etc.
    // These are LaTeX tokens that escaped $ wrapping
    const bareLatexPattern = /\\[a-zA-Z]+(\{[^}]*\})*|[αβγδεζθλμνξπρστφχψωΩΓΔΛΣΦΨ]/;
    if (bareLatexPattern.test(part)) {
      // Sub-split on bare LaTeX expressions to render them inline
      // Match: \command{...}{...} or \command or Greek unicode chars
      const subParts = part.split(/(\\[a-zA-Z]+(?:\{[^}]*\})*(?:\{[^}]*\})*|[αβγδεζθλμνξπρστφχψωΩΓΔΛΣΦΨ])/g);
      return (
        <span key={i}>
          {subParts.map((sub, si) => {
            if (/^\\[a-zA-Z]/.test(sub) || /^[αβγδεζθλμνξπρστφχψωΩΓΔΛΣΦΨ]$/.test(sub)) {
              try {
                return <InlineMath key={si} math={sub} />;
              } catch {
                return <span key={si}>{sub}</span>;
              }
            }
            return <span key={si}>{sub}</span>;
          })}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

// Normalizes maths-specific segment types into types the frontend already renders.
// definition/theorem → example-style, concept/note → text-style,
// proof/formula → equation-style, exercise → example, activity → example
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// cleanForTTS — strips ALL markup before sending to Deepgram
// Handles: LaTeX ($...$  $$...$$), markdown (**bold** *italic* ## #),
//          emojis, HTML tags, arrows, math symbols
// ─────────────────────────────────────────────────────────────────────────────
const cleanForTTS = (str) => {
  if (!str) return '';
  return String(str)
    // Heal form-feed (U+000C) and tab (U+0009) corruption from old sanitizeJsonString bug
    .replace(/([a-zA-Z])/g, '\\$1')
    .replace(/	([a-zA-Z])/g, '\\$1')
    // ── LaTeX display math $$...$$ ──────────────────────────────────────────
    .replace(/\$\$[\s\S]*?\$\$/g, 'equation')
    // ── LaTeX inline math $...$ → spoken words ──────────────────────────────
    .replace(/\$([^$\n]+)\$/g, (_, inner) => inner
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2')
      .replace(/\\sqrt\{([^}]+)\}/g, 'square root of $1')
      .replace(/\\sqrt/g, 'square root')
      .replace(/\\theta/g, 'theta').replace(/\\alpha/g, 'alpha')
      .replace(/\\beta/g, 'beta').replace(/\\gamma/g, 'gamma')
      .replace(/\\pi/g, 'pi').replace(/\\sin/g, 'sine')
      .replace(/\\cos/g, 'cosine').replace(/\\tan/g, 'tangent')
      .replace(/\\circ/g, ' degrees').replace(/\\times/g, ' times ')
      .replace(/\\div/g, ' divided by ').replace(/\\pm/g, ' plus or minus ')
      .replace(/\\infty/g, 'infinity').replace(/\\neq/g, ' not equal to ')
      .replace(/\\leq/g, ' less than or equal to ')
      .replace(/\\geq/g, ' greater than or equal to ')
      .replace(/\^2/g, ' squared').replace(/\^3/g, ' cubed')
      .replace(/\^\{([^}]+)\}/g, ' to the power of $1')
      .replace(/\^(\w)/g, ' to the power of $1')
      .replace(/\{|\}/g, '').replace(/\\/g, ' ')
      .replace(/\s{2,}/g, ' ').trim()
    )
    // ── Markdown ────────────────────────────────────────────────────────────
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/`[^`]+`/g, '')
    // ── HTML ────────────────────────────────────────────────────────────────
    .replace(/<[^>]+>/g, '')
    // ── Emoji & symbols ─────────────────────────────────────────────────────
    .replace(/[✓✗⚠️💡👁🎭🔍📖💬📐💭📝✅]/g, '')
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
    // ── Math/arrow symbols → spoken ─────────────────────────────────────────
    .replace(/→/g, ' equals ').replace(/≈/g, ' approximately ')
    .replace(/≠/g, ' not equal to ').replace(/≤/g, ' less than or equal to ')
    .replace(/≥/g, ' greater than or equal to ').replace(/°/g, ' degrees ')
    // ── Cleanup ─────────────────────────────────────────────────────────────
    .replace(/\n+/g, '. ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\.\s*\.\s*/g, '. ')
    .trim();
};

// normalizeMathsContent
// Maps the rich maths JSON types from mathsPrompt.js into the types the
// frontend renderer already handles: text, equation, example, diagram_concept,
// table, subheading. Each type is mapped to preserve ALL teaching fields.
// ─────────────────────────────────────────────────────────────────────────────
const normalizeMathsContent = (content) => {
  if (!content?.sections) return content;

  return {
    ...content,
    sections: content.sections.map(section => ({
      ...section,
      content: (section.content || []).map(item => {

        // ── topic_intro ──────────────────────────────────────────────────────
        // Renders as a "text" card with a "📘 What We'll Learn" heading
        if (item.type === 'topic_intro') {
          return {
            ...item,
            type: 'text',
            text: item.text || item.title || '',
            explanation: [
              item.explanation || '',
              item.why_it_matters ? `Why it matters: ${item.why_it_matters}` : '',
              item.prerequisite ? `Before we begin: ${item.prerequisite}` : '',
            ].filter(Boolean).join('\n'),
            _badge: 'WHAT WE\'LL LEARN',
            _badgeColor: 'yellow',
          };
        }

        // ── concept ──────────────────────────────────────────────────────────
        // Plain teaching explanation — renders as text card
        if (item.type === 'concept') {
          return {
            ...item,
            type: 'text',
            text: item.text || '',
            explanation: [
              item.explanation || '',
              item.visual_hint ? `💭 ${item.visual_hint}` : '',
            ].filter(Boolean).join('\n'),
            _heading: item.heading || '',
          };
        }

        // ── definition ───────────────────────────────────────────────────────
        // Renders as text card with structured definition content
        if (item.type === 'definition') {
          const bodyLines = [
            `📖 Definition: ${item.term || ''}`,
            item.text || item.formal_statement || item.statement || '',
          ].filter(Boolean).join('\n');
          const explanationLines = [
            item.plain_english || item.explanation || '',
            item.example_instance ? `Example: ${item.example_instance}` : '',
            item.memory_tip ? `💡 Remember: ${item.memory_tip}` : '',
          ].filter(Boolean).join('\n');
          return {
            ...item,
            type: 'text',
            text: bodyLines,
            explanation: explanationLines,
            _badge: 'DEFINITION',
            _badgeColor: 'purple',
          };
        }

        // ── theorem ──────────────────────────────────────────────────────────
        // Renders as text card
        if (item.type === 'theorem') {
          const bodyLines = [
            `📐 ${item.name || 'Theorem'}`,
            item.text || item.statement || '',
          ].filter(Boolean).join('\n');
          const explanationLines = [
            item.what_it_means || item.explanation || '',
            item.intuition ? `Intuition: ${item.intuition}` : '',
            item.use_case ? `When to use: ${item.use_case}` : '',
          ].filter(Boolean).join('\n');
          return {
            ...item,
            type: 'text',
            text: bodyLines,
            explanation: explanationLines,
            _badge: 'THEOREM',
            _badgeColor: 'teal',
          };
        }

        // ── note ─────────────────────────────────────────────────────────────
        if (item.type === 'note') {
          return {
            ...item,
            type: 'text',
            text: `${item.label ? item.label + ': ' : ''}${item.text || item.content || ''}`,
            explanation: item.explanation || item.why_important || '',
            _badge: item.label || 'NOTE',
            _badgeColor: 'amber',
          };
        }

        // ── activity ─────────────────────────────────────────────────────────
        if (item.type === 'activity') {
          return {
            ...item,
            type: 'text',
            text: `Activity: ${item.title || ''}\n${item.text || item.instruction || ''}`,
            explanation: item.explanation || item.what_to_verify || item.expected_result || item.purpose || '',
            _badge: 'ACTIVITY',
            _badgeColor: 'teal',
          };
        }

        // ── formula ──────────────────────────────────────────────────────────
        // Renders as equation card. Variables become derivation steps so they
        // appear in the step-by-step panel. quick_example is the final_result.
        if (item.type === 'formula') {
          // Build variables as derivation steps
          const varSteps = Array.isArray(item.variables)
            ? item.variables.map(v => ({
              step: `${v.symbol} = ${v.meaning}`,
              explanation: v.unit ? `Unit: ${v.unit}` : '',
            }))
            : [];

          // If derivation steps exist, append them after variables
          const derivationSteps = Array.isArray(item.derivation)
            ? item.derivation.map(s => ({
              step: s.step || '',
              explanation: `${s.statement || ''} — ${s.reason || ''}`.replace(/^—\s*/, ''),
            }))
            : [];

          const allSteps = [...varSteps, ...derivationSteps];

          const finalParts = [
            item.quick_example || '',
            item.when_to_use ? `When to use: ${item.when_to_use}` : '',
            item.common_mistake ? `⚠️ Common mistake: ${item.common_mistake}` : '',
          ].filter(Boolean).join('\n');

          return {
            ...item,
            type: 'equation',
            equation: item.formula_latex || item.formula || '',
            derivation: allSteps.length > 0 ? allSteps : undefined,
            final_result: finalParts || undefined,
            application: item.when_to_use || undefined,
            _formulaName: item.name || '',
          };
        }

        // ── proof ────────────────────────────────────────────────────────────
        // Renders as equation card — equation shows what's being proved,
        // derivation steps show each proof step with its reason
        if (item.type === 'proof') {
          const proofSteps = Array.isArray(item.steps)
            ? item.steps.map(s => ({
              step: s.step || s.action || `Step ${s.step_no || ''}`,
              explanation: [
                s.statement || s.math || s.working || '',
                s.reason ? `Reason: ${s.reason}` : '',
              ].filter(Boolean).join(' — '),
            }))
            : [];

          return {
            ...item,
            type: 'equation',
            equation: item.proving || item.for || '',
            derivation: proofSteps.length > 0 ? proofSteps : undefined,
            final_result: [
              item.conclusion || '',
              item.key_insight ? `Key insight: ${item.key_insight}` : '',
            ].filter(Boolean).join('\n') || undefined,
            _proofSetup: item.setup || '',
          };
        }

        // ── worked_example ───────────────────────────────────────────────────
        // Renders as example card (green problem + blue solution)
        if (item.type === 'worked_example') {
          // Build solution string from structured steps (for display)
          let solutionLines = [];
          // Also build flat TTS steps array for step-by-step reading
          const ttsSteps = [];

          if (item.given) {
            solutionLines.push(`Given: ${item.given}`);
            ttsSteps.push(`Given: ${item.given}`);
          }
          if (item.find) {
            solutionLines.push(`Find: ${item.find}`);
            ttsSteps.push(`Find: ${item.find}`);
          }
          if (item.method) {
            solutionLines.push(`Method: ${item.method}`);
            ttsSteps.push(`Method: ${item.method}`);
          }

          if (Array.isArray(item.steps)) {
            item.steps.forEach(s => {
              const stepNum = s.step_no || '';
              if (s.narration) solutionLines.push(`Step ${stepNum}: ${s.narration}`);
              if (s.working) solutionLines.push(`  ${s.working}`);
              if (s.result) solutionLines.push(`  → ${s.result}`);
              // TTS: combine narration + working + result into one spoken chunk per step
              const spokenStep = [
                s.narration ? `Step ${stepNum}: ${s.narration}` : '',
                s.working ? s.working : '',
                s.result ? `Result: ${s.result}` : '',
              ].filter(Boolean).join('. ');
              if (spokenStep.trim()) ttsSteps.push(spokenStep);
            });
          }

          if (item.final_answer) {
            solutionLines.push(`\nFinal Answer: ${item.final_answer}`);
            ttsSteps.push(`Final Answer: ${item.final_answer}`);
          }
          if (item.verify) {
            solutionLines.push(`✓ Check: ${item.verify}`);
            ttsSteps.push(`Check: ${item.verify}`);
          }
          if (item.common_mistake) {
            solutionLines.push(`⚠️ Watch out: ${item.common_mistake}`);
            ttsSteps.push(`Watch out: ${item.common_mistake}`);
          }

          const problemHeader = item.example_no
            ? `${item.example_no}: ${item.problem || ''}`
            : item.problem || '';

          return {
            ...item,
            type: 'example',
            problem: problemHeader,
            solution: solutionLines.join('\n'),
            _ttsSteps: ttsSteps,           // ← used by readAloud for step-by-step TTS
            _whatThisTestes: item.what_this_tests || '',
          };
        }

        // ── exercise ─────────────────────────────────────────────────────────
        // Renders as example card. Multi-part questions get all parts solved.
        if (item.type === 'exercise') {
          let solutionLines = [];
          const ttsSteps = [];

          if (item.approach) {
            solutionLines.push(`Approach: ${item.approach}`);
            ttsSteps.push(`Approach: ${item.approach}`);
          }

          // Multi-part question
          if (Array.isArray(item.parts)) {
            item.parts.forEach(part => {
              solutionLines.push(`\n${part.part || ''}: ${part.problem || ''}`);
              ttsSteps.push(`${part.part || 'Part'}: ${part.problem || ''}`);
              if (Array.isArray(part.steps)) {
                part.steps.forEach(s => {
                  if (s.narration) solutionLines.push(`  Step ${s.step_no || ''}: ${s.narration}`);
                  if (s.working) solutionLines.push(`    ${s.working}`);
                  if (s.result) solutionLines.push(`    → ${s.result}`);
                  const spokenStep = [
                    s.narration ? `Step ${s.step_no || ''}: ${s.narration}` : '',
                    s.working ? s.working : '',
                    s.result ? `Result: ${s.result}` : '',
                  ].filter(Boolean).join('. ');
                  if (spokenStep.trim()) ttsSteps.push(spokenStep);
                });
              }
              if (part.answer) {
                solutionLines.push(`  Answer: ${part.answer}`);
                ttsSteps.push(`Answer: ${part.answer}`);
              }
            });
          } else if (Array.isArray(item.steps)) {
            item.steps.forEach(s => {
              if (s.narration) solutionLines.push(`Step ${s.step_no || ''}: ${s.narration}`);
              if (s.working) solutionLines.push(`  ${s.working}`);
              if (s.result) solutionLines.push(`  → ${s.result}`);
              const spokenStep = [
                s.narration ? `Step ${s.step_no || ''}: ${s.narration}` : '',
                s.working ? s.working : '',
                s.result ? `Result: ${s.result}` : '',
              ].filter(Boolean).join('. ');
              if (spokenStep.trim()) ttsSteps.push(spokenStep);
            });
            if (item.final_answer) {
              solutionLines.push(`\nAnswer: ${item.final_answer}`);
              ttsSteps.push(`Answer: ${item.final_answer}`);
            }
          } else if (item.solution) {
            solutionLines.push(item.solution);
            ttsSteps.push(item.solution);
          }

          if (item.tip) {
            solutionLines.push(`\n💡 Tip: ${item.tip}`);
            ttsSteps.push(`Tip: ${item.tip}`);
          }

          const problemHeader = item.question_no
            ? `${item.question_no}: ${item.problem || ''}`
            : item.problem || '';

          return {
            ...item,
            type: 'example',
            problem: problemHeader,
            solution: solutionLines.join('\n'),
            _ttsSteps: ttsSteps,           // ← used by readAloud for step-by-step TTS
          };
        }

        // ── diagram (new prompt type) ─────────────────────────────────────────
        // Map to diagram_concept which the frontend already renders
        if (item.type === 'diagram') {
          return {
            ...item,
            type: 'diagram_concept',
            title: item.figure_no
              ? `${item.figure_no}${item.title ? ': ' + item.title : ''}`
              : item.title || '',
            mistral_image_id: item.mistral_image_id || '',
            explanation: [
              item.what_to_look_at || '',
              item.mathematical_meaning || '',
              item.observation || '',
            ].filter(Boolean).join(' '),
          };
        }

        // ── summary_table ────────────────────────────────────────────────────
        if (item.type === 'summary_table') {
          return {
            ...item,
            type: 'table',
            title: item.title || '',
            headers: item.headers || [],
            rows: item.rows || [],
            explanation: item.how_to_use || '',
          };
        }

        // All other types (text, equation, example, diagram_concept,
        // diagram_reference, table, subheading) — pass through unchanged
        return item;
      }),
    })),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// normalizeEnglishContent
// Maps English prompt types into renderer types.
//
//  passage     → text          book text + teacher note in explanation panel
//  dialogue    → dialogue      NEW dedicated type — conversation card
//  author_note → text          amber badge card
//  question    → example       question as problem, answer as solution
//  glossary    → table         4 cols: Word | Meaning | Example | Explanation
// ─────────────────────────────────────────────────────────────────────────────
const normalizeEnglishContent = (content) => {
  if (!content?.sections) return content;
  return {
    ...content,
    sections: content.sections.map(section => ({
      ...section,
      content: (section.content || []).map(item => {

        // ── passage ──────────────────────────────────────────────────────────
        if (item.type === 'passage') {
          return {
            ...item,
            type: 'text',
            text: item.text || '',
            explanation: [
              item.explanation || '',
              item.what_to_notice ? `👁 Notice: ${item.what_to_notice}` : '',
              item.tone ? `🎭 Tone: ${item.tone}` : '',
            ].filter(Boolean).join('\n'),
            _badge: 'PASSAGE',
            _badgeColor: 'blue',
          };
        }

        // ── dialogue — keep as 'dialogue' so the renderer shows a chat card ─
        if (item.type === 'dialogue') {
          return {
            ...item,
            type: 'dialogue',
            speakers: item.speakers || '',
            text: item.text || '',
            what_it_reveals: item.what_it_reveals || '',
            tone: item.tone || '',
          };
        }

        // ── author_note ───────────────────────────────────────────────────────
        if (item.type === 'author_note') {
          return {
            ...item,
            type: 'text',
            text: item.text || '',
            explanation: item.explanation || '',
            _badge: item.title || 'ABOUT THE AUTHOR',
            _badgeColor: 'amber',
          };
        }

        // ── question ─────────────────────────────────────────────────────────
        if (item.type === 'question') {
          const problemText = item.question_no
            ? `${item.question_no}: ${item.question_text || ''}`
            : item.question_text || item.problem || '';
          // answer may be a plain string OR an object like { table_data: [[row], [row]] }
          const rawAnswer = item.answer || item.solution || '';
          const answerIsTable = rawAnswer && typeof rawAnswer === 'object' && Array.isArray(rawAnswer.table_data);
          const solutionStr = answerIsTable
            ? (item.tip ? `💡 Tip: ${item.tip}` : '')
            : [typeof rawAnswer === 'string' ? rawAnswer : JSON.stringify(rawAnswer), item.tip ? `💡 Tip: ${item.tip}` : ''].filter(Boolean).join('\n');
          return {
            ...item,
            type: 'example',
            problem: problemText,
            solution: solutionStr,
            answer_table: answerIsTable ? rawAnswer.table_data : null,
            _badge: 'QUESTION',
          };
        }

        // ── glossary → table with 4 columns ──────────────────────────────────
        if (item.type === 'glossary') {
          const words = Array.isArray(item.words) ? item.words : [];
          return {
            ...item,
            type: 'table',
            title: item.title || 'Word Meanings',
            headers: ['Word', 'Meaning', 'Example from text', 'Explanation'],
            rows: words.map(w => [
              w.word || '',
              w.meaning || '',
              w.example_from_text || '',
              w.explanation || '',
            ]),
            explanation: '',
          };
        }

        return item;
      }),
    })),
  };
};

const LineByLineReader = () => {
  const utteranceRef = useRef(null);
  const ttsAbortRef = useRef(null); // AbortController for TTS fetch stream
  const autoPlayRef = useRef(false); // Tracks autoplay without stale closure
  const autoPlayTimerRef = useRef(null); // Tracks the pause-between-segments timer

  const { chapterId } = useParams();
  const navigate = useNavigate();

  const [pageImages, setPageImages] = useState({});
  const [segments, setSegments] = useState([]);

  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [activeEquationStep, setActiveEquationStep] = useState(0);
  const [showFinalResult, setShowFinalResult] = useState(false);



  const [chapterData, setChapterData] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
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
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(0); // seconds remaining before next segment
  const segmentStartTime = useRef(Date.now());

  const [highlightedWordIndex, setHighlightedWordIndex] = useState(-1);
  const [currentWords, setCurrentWords] = useState([]);
  const [mainTextWordCount, setMainTextWordCount] = useState(0); // how many words belong to main text (rest = explanation)
  const [currentChunk, setCurrentChunk] = useState({ current: 0, total: 0 });
  const [teacherBoardWords, setTeacherBoardWords] = useState([]);
  const [teacherBoardHighlightIndex, setTeacherBoardHighlightIndex] = useState(-1);
  const [equationStepChars, setEquationStepChars] = useState({});
  const [activeStepUnderline, setActiveStepUnderline] = useState(-1);
  const [explanationWords, setExplanationWords] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenAttempted = useRef(false);
  const [showExitDialog, setShowExitDialog] = useState(false);


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

    // Always stop audio when fullscreen changes (exit or enter)
    stopReading();

    setIsFullscreen(isCurrentlyFullscreen);

    // Navigate back when fullscreen is exited
    if (!isCurrentlyFullscreen && !loading && fullscreenAttempted.current) {
      // Check if device is mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.innerWidth <= 1024);

      if (isMobile) {
        // On mobile, show exit confirmation dialog
        setShowExitDialog(true);
      } else {
        // On desktop, navigate back to table of contents
        if (chapter?.book_id) {
          navigate(`/subjects`);
        } else {
          navigate(-1);
        }
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



  // Deepgram TTS function — uses cached FTP audio if available, else streams
  const speakWithDeepgram = async (text, stepInfo = null, isTeacherBoard = false, segmentIndex = null) => {
    try {
      setIsLoadingAudio(true);
      const token = localStorage.getItem("token");

      // Abort any previous TTS fetch stream
      if (ttsAbortRef.current) {
        ttsAbortRef.current.abort();
      }
      const abortController = new AbortController();
      ttsAbortRef.current = abortController;

      // Stop any existing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }

      const streamUrl = `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/tts`;
      const mediaSource = new MediaSource();
      const blobUrl = URL.createObjectURL(mediaSource);

      // Words for highlight — show immediately, don't clear on end
      const words = text.split(/\s+/).filter(Boolean);
      if (isTeacherBoard) {
        setTeacherBoardWords(words);
      } else {
        setCurrentWords(words);
      }

      // Track word highlight via timeupdate (not loadedmetadata duration)
      // We estimate total duration as words * 0.35s average speaking pace
      // and update highlight index based on actual currentTime
      const estimatedDuration = words.length * 0.38;

      // ── Check if backend returns a cached URL or a stream ──────────────────
      let probeResponse;
      try {
        probeResponse = await fetch(streamUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text, segmentIndex }),
          signal: abortController.signal,
        });
      } catch (e) {
        if (e.name === "AbortError") return;
        console.error("TTS fetch failed:", e);
        setIsLoadingAudio(false);
        setIsReading(false);
        return;
      }

      const contentType = probeResponse.headers.get("content-type") || "";

      // ── CACHED: backend returned JSON with audioUrl → play directly ────────
      if (contentType.includes("application/json")) {
        const { audioUrl: cachedUrl } = await probeResponse.json();
        const cachedAudio = new Audio(cachedUrl);
        audioRef.current = cachedAudio;

        // word highlight via rAF — same logic as streaming path
        let cachedRafId = null;
        let cachedLastIdx = -1;
        const trackCached = () => {
          if (!audioRef.current || audioRef.current !== cachedAudio) return;
          const dur = cachedAudio.duration && isFinite(cachedAudio.duration) ? cachedAudio.duration : estimatedDuration;
          const prog = cachedAudio.currentTime / Math.max(dur, 0.1);
          const idx = Math.min(Math.floor(prog * words.length), words.length - 1);
          if (idx !== cachedLastIdx && idx >= 0) {
            cachedLastIdx = idx;
            if (isTeacherBoard) setTeacherBoardHighlightIndex(idx);
            else setHighlightedWordIndex(idx);
          }
          cachedRafId = requestAnimationFrame(trackCached);
        };
        cachedAudio.addEventListener('timeupdate', () => {
          if (cachedRafId === null) cachedRafId = requestAnimationFrame(trackCached);
        });

        cachedAudio.onended = () => {
          if (cachedRafId) { cancelAnimationFrame(cachedRafId); cachedRafId = null; }
          if (isTeacherBoard) setTeacherBoardHighlightIndex(words.length - 1);
          else setHighlightedWordIndex(words.length - 1);
          setActiveStepUnderline(-1);
          if (currentSegment?.type !== 'equation' || !stepInfo) setIsReading(false);
          if (autoPlayRef.current && currentSegment?.type !== 'equation') {
            const PAUSE_SECONDS = 5;
            let remaining = PAUSE_SECONDS;
            setAutoPlayCountdown(remaining);
            const tick = () => {
              remaining -= 1;
              setAutoPlayCountdown(remaining);
              if (remaining <= 0) {
                setAutoPlayCountdown(0);
                if (autoPlayRef.current) goToNextSegment();
              } else { autoPlayTimerRef.current = setTimeout(tick, 1000); }
            };
            autoPlayTimerRef.current = setTimeout(tick, 1000);
          }
        };
        cachedAudio.onerror = () => { setIsReading(false); setAutoPlayMode(false); };

        setIsLoadingAudio(false);
        setIsReading(true);
        cachedAudio.play().catch((e) => console.error("Cached audio play failed:", e));
        return;
      }

      // ── STREAMING: pipe Deepgram stream through MediaSource (existing path) ─
      const audio = new Audio();
      audioRef.current = audio;
      audio.src = blobUrl;

      mediaSource.addEventListener("sourceopen", async () => {
        let sourceBuffer;
        try {
          sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
        } catch (e) {
          console.error("Failed to add source buffer:", e);
          setIsLoadingAudio(false);
          return;
        }

        // reuse the already-fetched streaming response
        const response = probeResponse;

        setIsLoadingAudio(false);
        setIsReading(true);

        // Start playing as soon as first chunk arrives
        audio.play().catch(() => { });

        const reader = response.body.getReader();

        // Queue-based pump: chunks are queued and appended one at a time
        // This prevents InvalidStateError when chunks arrive faster than SourceBuffer processes
        const chunkQueue = [];
        let isAppending = false;
        let streamDone = false;

        const tryAppendNext = () => {
          if (isAppending || chunkQueue.length === 0) return;
          if (abortController.signal.aborted) return;
          if (mediaSource.readyState !== "open") return;

          isAppending = true;
          const chunk = chunkQueue.shift();
          try {
            sourceBuffer.appendBuffer(chunk);
          } catch (e) {
            console.error("appendBuffer error:", e);
            isAppending = false;
          }
        };

        sourceBuffer.addEventListener("updateend", () => {
          isAppending = false;
          if (streamDone && chunkQueue.length === 0) {
            try { mediaSource.endOfStream(); } catch (_) { }
          } else {
            tryAppendNext();
          }
        });

        const pump = async () => {
          while (true) {
            if (abortController.signal.aborted) {
              reader.cancel();
              return;
            }
            const { done, value } = await reader.read();
            if (done) {
              streamDone = true;
              // If nothing is currently appending and queue is empty, end stream now
              if (!isAppending && chunkQueue.length === 0) {
                try { mediaSource.endOfStream(); } catch (_) { }
              }
              return;
            }
            chunkQueue.push(value);
            tryAppendNext();
          }
        };

        pump().catch(err => {
          if (err.name !== "AbortError") console.error("Stream pump error:", err);
        });
      });

      // Equation step typing animation (unchanged logic)
      if (stepInfo) {
        audio.addEventListener('loadedmetadata', () => {
          const { stepIndex, stepText, explanationText } = stepInfo;
          const stepTypingDuration = 3000;
          const charDuration = stepTypingDuration / stepText.length;
          let charIndex = 0;
          const typingInterval = setInterval(() => {
            if (charIndex <= stepText.length) {
              setEquationStepChars(prev => ({ ...prev, [stepIndex]: charIndex }));
              charIndex++;
            } else {
              clearInterval(typingInterval);
              if (explanationText) {
                startExplanationReveal(stepIndex, explanationText, audio.duration - stepTypingDuration);
              }
            }
          }, charDuration);
          setActiveStepUnderline(stepIndex);
          audio.typingInterval = typingInterval;
        });
      }

      const attachAudioHandlers = (audioEl, wordList, estDuration, sInfo, isBoard, urlToRevoke) => {
        let handlerRafId = null;
        let lastIdx = -1;

        const trackW = () => {
          if (!audioRef.current || audioRef.current !== audioEl) return;
          const dur = audioEl.duration && isFinite(audioEl.duration) ? audioEl.duration : estDuration;
          const prog = audioEl.currentTime / Math.max(dur, 0.1);
          const idx = Math.min(Math.floor(prog * wordList.length), wordList.length - 1);
          if (idx !== lastIdx && idx >= 0) {
            lastIdx = idx;
            if (isBoard) setTeacherBoardHighlightIndex(idx);
            else setHighlightedWordIndex(idx);
          }
          handlerRafId = requestAnimationFrame(trackW);
        };

        const onTimeUpdate = () => {
          if (handlerRafId === null) handlerRafId = requestAnimationFrame(trackW);
        };
        audioEl.addEventListener('timeupdate', onTimeUpdate);

        if (sInfo) {
          audioEl.addEventListener('loadedmetadata', () => {
            const { stepIndex, stepText, explanationText } = sInfo;
            const stepTypingDuration = 3000;
            const charDuration = stepTypingDuration / stepText.length;
            let charIndex = 0;
            const typingInterval = setInterval(() => {
              if (charIndex <= stepText.length) {
                setEquationStepChars(prev => ({ ...prev, [stepIndex]: charIndex }));
                charIndex++;
              } else {
                clearInterval(typingInterval);
                if (explanationText) startExplanationReveal(sInfo.stepIndex, explanationText, audioEl.duration - stepTypingDuration);
              }
            }, charDuration);
            setActiveStepUnderline(stepIndex);
            audioEl.typingInterval = typingInterval;
          });
        }

        audioEl.onended = () => {
          if (audioEl.highlightInterval) clearInterval(audioEl.highlightInterval);
          if (audioEl.typingInterval) clearInterval(audioEl.typingInterval);
          if (audioEl.explanationInterval) clearInterval(audioEl.explanationInterval);
          audioEl.removeEventListener('timeupdate', onTimeUpdate);
          if (handlerRafId) { cancelAnimationFrame(handlerRafId); handlerRafId = null; }
          if (isBoard) setTeacherBoardHighlightIndex(wordList.length - 1);
          else setHighlightedWordIndex(wordList.length - 1);
          setActiveStepUnderline(-1);
          if (currentSegment?.type !== 'equation' || !sInfo) setIsReading(false);
          if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
          if (autoPlayRef.current && currentSegment?.type !== 'equation') {
            const PAUSE_SECONDS = 5;
            let remaining = PAUSE_SECONDS;
            setAutoPlayCountdown(remaining);
            const tick = () => {
              remaining -= 1;
              setAutoPlayCountdown(remaining);
              if (remaining <= 0) {
                setAutoPlayCountdown(0);
                if (autoPlayRef.current) { goToNextSegment(); }
              } else { autoPlayTimerRef.current = setTimeout(tick, 1000); }
            };
            autoPlayTimerRef.current = setTimeout(tick, 1000);
          }
        };

        audioEl.onerror = (e) => {
          console.error('Audio playback error:', e);
          setIsReading(false);
          setAutoPlayMode(false);
          setActiveStepUnderline(-1);
        };
      };

      // ── Streaming path word highlight ────────────────────────────────────
      let streamRafId = null;
      let streamLastIdx = -1;
      const trackStream = () => {
        if (!audioRef.current || audioRef.current !== audio) return;
        const dur = audio.duration && isFinite(audio.duration) ? audio.duration : estimatedDuration;
        const prog = audio.currentTime / Math.max(dur, 0.1);
        const idx = Math.min(Math.floor(prog * words.length), words.length - 1);
        if (idx !== streamLastIdx && idx >= 0) {
          streamLastIdx = idx;
          if (isTeacherBoard) setTeacherBoardHighlightIndex(idx);
          else setHighlightedWordIndex(idx);
        }
        streamRafId = requestAnimationFrame(trackStream);
      };
      audio.addEventListener('timeupdate', () => {
        if (streamRafId === null) streamRafId = requestAnimationFrame(trackStream);
      });

      audio.onended = () => {
        if (audio.highlightInterval) clearInterval(audio.highlightInterval);
        if (audio.typingInterval) clearInterval(audio.typingInterval);
        if (audio.explanationInterval) clearInterval(audio.explanationInterval);
        if (streamRafId) { cancelAnimationFrame(streamRafId); streamRafId = null; }

        if (isTeacherBoard) setTeacherBoardHighlightIndex(words.length - 1);
        else setHighlightedWordIndex(words.length - 1);
        setActiveStepUnderline(-1);

        if (currentSegment?.type !== 'equation' || !stepInfo) {
          setIsReading(false);
        }

        URL.revokeObjectURL(blobUrl);

        if (autoPlayRef.current && currentSegment?.type !== 'equation') {
          const PAUSE_SECONDS = 5;
          let remaining = PAUSE_SECONDS;
          setAutoPlayCountdown(remaining);
          const tick = () => {
            remaining -= 1;
            setAutoPlayCountdown(remaining);
            if (remaining <= 0) {
              setAutoPlayCountdown(0);
              if (autoPlayRef.current) goToNextSegment();
            } else {
              autoPlayTimerRef.current = setTimeout(tick, 1000);
            }
          };
          autoPlayTimerRef.current = setTimeout(tick, 1000);
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

    // Strip markdown symbols for clean TTS
    const clean = (str) => (str || '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/💡|👁|🎭|🔍|📖|💬|⚠️|✓/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    content.forEach((item, idx) => {

      // ── subheading ────────────────────────────────────────────────────────
      if (item.type === 'subheading') {
        queue.push({ id: `sub-${idx}`, text: `Section: ${clean(item.subheading)}` });
      }

      // ── text (passage, author_note, concept, definition, theorem, note, activity, topic_intro) ──
      if (item.type === 'text') {
        if (item.text) queue.push({ id: `text-${idx}`, text: clean(item.text) });
        if (item.explanation) queue.push({ id: `text-exp-${idx}`, text: clean(item.explanation) });
      }

      // ── dialogue (English) ────────────────────────────────────────────────
      if (item.type === 'dialogue') {
        const spokenText = item.speakers
          ? `${item.speakers} says: ${clean(item.text)}`
          : clean(item.text);
        if (spokenText) queue.push({ id: `dlg-${idx}`, text: spokenText });
        if (item.what_it_reveals) queue.push({ id: `dlg-exp-${idx}`, text: clean(item.what_it_reveals) });
        if (item.tone) queue.push({ id: `dlg-tone-${idx}`, text: `Tone: ${clean(item.tone)}` });
      }

      // ── example (question / worked_example / exercise) ────────────────────
      if (item.type === 'example') {
        if (item.problem) queue.push({ id: `ex-${idx}`, text: clean(item.problem) });
        if (item.solution) queue.push({ id: `ex-sol-${idx}`, text: clean(item.solution) });
      }

      // ── equation (formula / proof) ────────────────────────────────────────
      if (item.type === 'equation') {
        if (item.equation) queue.push({ id: `eq-${idx}`, text: `Equation: ${clean(item.equation)}` });
        if (Array.isArray(item.derivation)) {
          item.derivation.forEach((step, sIdx) => {
            if (step.step) queue.push({ id: `eq-${idx}-step-${sIdx}`, text: clean(step.step) });
            if (step.explanation) queue.push({ id: `eq-${idx}-exp-${sIdx}`, text: clean(step.explanation) });
          });
        }
        if (item.final_result) queue.push({ id: `eq-${idx}-final`, text: clean(item.final_result) });
      }

      // ── diagram_concept / diagram_reference ───────────────────────────────
      if (item.type === 'diagram_concept' || item.type === 'diagram_reference') {
        const title = item.title || item.reference || 'this diagram';
        queue.push({ id: `diag-${idx}`, text: `Looking at ${clean(title)}.` });
        if (item.explanation) queue.push({ id: `diag-exp-${idx}`, text: clean(item.explanation) });
      }

      // ── table (glossary / summary_table) ─────────────────────────────────
      if (item.type === 'table') {
        if (item.title) queue.push({ id: `tbl-${idx}`, text: clean(item.title) });
        if (Array.isArray(item.rows)) {
          item.rows.forEach((row, rIdx) => {
            // For glossary: row = [word, meaning, example, explanation]
            // Read as "word means meaning"
            const word = clean(row[0]);
            const meaning = clean(row[1]);
            const explanation = clean(row[3] || row[2] || '');
            if (word && meaning) {
              queue.push({
                id: `tbl-${idx}-row-${rIdx}`,
                text: `${word} means ${meaning}${explanation ? '. ' + explanation : ''}`,
              });
            }
          });
        }
        if (item.explanation) queue.push({ id: `tbl-exp-${idx}`, text: clean(item.explanation) });
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
    // Stop all audio when component unmounts (navigate away, back button, etc.)
    return () => {
      if (ttsAbortRef.current) {
        ttsAbortRef.current.abort();
        ttsAbortRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, [chapterId]);

  useEffect(() => {
    const wasAutoPlaying = autoPlayRef.current;

    // Stop current audio but preserve autoplay state if it was active
    if (ttsAbortRef.current) {
      ttsAbortRef.current.abort();
      ttsAbortRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setIsReading(false);
    setIsLoadingAudio(false);
    setHighlightedWordIndex(-1);
    setCurrentWords([]);
    setMainTextWordCount(0);
    setActiveEquationStep(0);
    setExplanationWords({});
    setEquationStepChars({});
    setShowFinalResult(false);

    // If autoplay was running, start reading the new segment after a short render delay
    if (wasAutoPlaying) {
      autoPlayRef.current = true;
      setAutoPlayMode(true);
      autoPlayTimerRef.current = setTimeout(() => {
        readAloud();
      }, 400); // small delay to let the new segment render first
    }
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

      // Fetch content and saved progress in parallel
      const [contentRes, progressRes] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/content`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/progress`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(() => ({ data: null })),
      ]);

      setChapter(contentRes.data.chapter);
      setChapterData(normalizeEnglishContent(normalizeMathsContent(contentRes.data.content)));
      setNavigation(contentRes.data.navigation);

      const imageMap = {};
      (contentRes.data.segments || []).forEach(seg => {
        imageMap[seg.page] = seg.image_path;
      });
      setPageImages(imageMap);
      setSegments(contentRes.data.segments || []);

      // Restore last position from saved progress
      const savedProgress = progressRes.data;
      if (savedProgress?.lastPosition?.paragraph_id) {
        // paragraph_id is stored as "pageX_segY"
        const match = savedProgress.lastPosition.paragraph_id.match(/^page(\d+)_seg(\d+)$/);
        if (match) {
          const savedPage = parseInt(match[1]);
          const savedSeg = parseInt(match[2]);
          const sections = contentRes.data.content?.sections || [];
          // Validate the saved position still exists in the content
          if (savedPage < sections.length && savedSeg < (sections[savedPage]?.content?.length || 0)) {
            setCurrentPageIndex(savedPage);
            setCurrentSegmentIndex(savedSeg);
            console.log(`▶️ Resuming from page ${savedPage}, segment ${savedSeg}`);
          }
        }
      } else {
        // No saved progress — start from beginning
        setCurrentPageIndex(0);
        setCurrentSegmentIndex(0);
        if (contentRes.data.content?.sections?.[0]?.content?.[0]?.page_number) {
          setCurrentPdfPage(contentRes.data.content.sections[0].content[0].page_number);
        }
      }

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

  // // If we have a subheading followed by content, use the next segment as current
  // if (isSubheading && nextSegment && nextSegment.type !== 'subheading') {
  //   currentSegment = nextSegment;
  // }

  const saveSegmentProgress = async (segmentIdx, pageIdx) => {
    try {
      const token = localStorage.getItem("token");
      const seg = chapterData?.sections?.[pageIdx]?.content?.[segmentIdx];
      if (!seg) return;

      const timeSpent = Math.round((Date.now() - segmentStartTime.current) / 1000);
      const segmentId = seg.id || seg.segment_id || `page${pageIdx}_seg${segmentIdx}`;
      const pageNumber = chapterData?.sections?.[pageIdx]?.page_range?.[0] || pageIdx + 1;

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/books/chapters/${chapterId}/progress`,
        {
          paragraph_id: segmentId,
          page_number: pageNumber,
          segment_id: segmentId,
          time_spent_seconds: timeSpent,
          completed: 1,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Progress save failed:", err);
    }
  };

  const isLastSegment = () => {
    const isLastSeg = currentSegmentIndex >= currentSection.content.length - 1;
    const isLastPage = currentPageIndex >= (chapterData?.sections?.length || 0) - 1;
    return isLastSeg && isLastPage;
  };

  const goToNextSegment = () => {
    saveSegmentProgress(currentSegmentIndex, currentPageIndex);
    segmentStartTime.current = Date.now();

    let nextSegIdx = currentSegmentIndex + 1;
    let nextPageIdx = currentPageIndex;

    // If past end of current section, move to next page
    if (nextSegIdx >= currentSection.content.length) {
      if (currentPageIndex < (chapterData?.sections?.length || 0) - 1) {
        nextPageIdx = currentPageIndex + 1;
        nextSegIdx = 0;
      }
    }

    // Skip ALL consecutive subheadings
    while (chapterData?.sections?.[nextPageIdx]?.content?.[nextSegIdx]?.type === 'subheading') {
      nextSegIdx += 1;
      // If skipping pushed past the end of this page, go to next page
      if (nextSegIdx >= (chapterData?.sections?.[nextPageIdx]?.content?.length || 0)) {
        if (nextPageIdx < (chapterData?.sections?.length || 0) - 1) {
          nextPageIdx += 1;
          nextSegIdx = 0;
        } else {
          break;
        }
      }
    }

    if (nextPageIdx !== currentPageIndex) {
      setCurrentPageIndex(nextPageIdx);
    }
    setCurrentSegmentIndex(nextSegIdx);
    setShowDetailedExplanation(false);
  };

  const goToPreviousSegment = () => {
    let prevSegIdx = currentSegmentIndex - 1;
    let prevPageIdx = currentPageIndex;

    // If before start of current section, move to previous page
    if (prevSegIdx < 0) {
      if (currentPageIndex > 0) {
        prevPageIdx = currentPageIndex - 1;
        prevSegIdx = chapterData.sections[prevPageIdx].content.length - 1;
      } else {
        return; // already at very beginning
      }
    }

    // Skip ALL consecutive subheadings going backwards
    while (chapterData?.sections?.[prevPageIdx]?.content?.[prevSegIdx]?.type === 'subheading') {
      prevSegIdx -= 1;
      // If skipping pushed before start of this page, go to previous page
      if (prevSegIdx < 0) {
        if (prevPageIdx > 0) {
          prevPageIdx -= 1;
          prevSegIdx = chapterData.sections[prevPageIdx].content.length - 1;
        } else {
          prevSegIdx = 0;
          break;
        }
      }
    }

    if (prevPageIdx !== currentPageIndex) {
      setCurrentPageIndex(prevPageIdx);
    }
    setCurrentSegmentIndex(prevSegIdx);
    setShowDetailedExplanation(false);
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
        textToRead = cleanForTTS(String(customText));
        console.log('Custom text to read:', textToRead.substring(0, 100));
      }
      else if (currentSegment?.type === 'equation') {
        // Step-by-step equation reading with pauses
        setActiveEquationStep(0);
        setEquationStepChars({});

        const waitForAudio = () => new Promise((resolve) => {
          if (audioRef.current) {
            audioRef.current.addEventListener('ended', resolve, { once: true });
          } else { resolve(); }
        });

        // Read main equation
        await speakWithDeepgram(cleanForTTS(`Equation: ${currentSegment.equation || ''}`));
        await waitForAudio();
        await new Promise(resolve => setTimeout(resolve, 600));

        // Read each derivation step
        if (showExplanation && Array.isArray(currentSegment.derivation)) {
          for (let idx = 0; idx < currentSegment.derivation.length; idx++) {
            const step = currentSegment.derivation[idx];
            setActiveEquationStep(idx);
            const stepText = cleanForTTS(
              `Step ${idx + 1}: ${step.step || ''}. ${step.explanation || ''}`
            );
            if (stepText.trim()) {
              await speakWithDeepgram(stepText, {
                stepIndex: idx,
                stepText: step.step,
                explanationText: step.explanation,
              });
              await waitForAudio();
              await new Promise(resolve => setTimeout(resolve, 600));
            }
          }
        }

        // Read final result
        if (currentSegment.final_result) {
          setShowFinalResult(true);
          await speakWithDeepgram(cleanForTTS(`Final result: ${currentSegment.final_result}`));
          await waitForAudio();
        }

        setSpeakingIndex(null);
        setIsReading(false);
        return;
      }
      else if (currentSegment?.type === 'example') {
        // Step-by-step reading — problem first, then each solution step with a pause
        const waitForAudio = () => new Promise((resolve) => {
          if (audioRef.current) {
            audioRef.current.addEventListener('ended', resolve, { once: true });
          } else { resolve(); }
        });

        // Read problem statement
        const problemText = cleanForTTS(currentSegment.problem || '');
        if (problemText) {
          await speakWithDeepgram(problemText);
          await waitForAudio();
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (showExplanation) {
          // Prefer the structured _ttsSteps array (maths worked_example / exercise)
          // Fall back to splitting the solution string if _ttsSteps wasn't built
          const steps = Array.isArray(currentSegment._ttsSteps) && currentSegment._ttsSteps.length > 0
            ? currentSegment._ttsSteps
            : (currentSegment.solution || '').split('\n').filter(l => l.trim().length > 2);

          for (const step of steps) {
            const spoken = cleanForTTS(step);
            if (!spoken.trim()) continue;
            await speakWithDeepgram(spoken);
            await waitForAudio();
            await new Promise(resolve => setTimeout(resolve, 400));
          }
        }

        setSpeakingIndex(null);
        setIsReading(false);
        return;
      }
      else if (currentSegment?.type === 'subheading') {
        textToRead = cleanForTTS(`Section: ${currentSegment.subheading}`);
      }
      else if (currentSegment?.type === 'dialogue') {
        const speaker = currentSegment.speakers ? `${currentSegment.speakers} says: ` : '';
        textToRead = cleanForTTS(speaker + (currentSegment.text || ''));
        if (showExplanation && currentSegment.what_it_reveals) {
          textToRead += `. ${cleanForTTS(currentSegment.what_it_reveals)}`;
        }
        if (showExplanation && currentSegment.tone) {
          textToRead += `. Tone: ${cleanForTTS(currentSegment.tone)}`;
        }
      }
      else if (currentSegment?.type === 'table') {
        textToRead = cleanForTTS(currentSegment.title || 'Word Meanings') + '. ';
        if (Array.isArray(currentSegment.rows)) {
          currentSegment.rows.forEach(row => {
            const word = cleanForTTS(row[0] || '');
            const meaning = cleanForTTS(row[1] || '');
            const extra = cleanForTTS(row[3] || row[2] || '');
            if (word && meaning) {
              textToRead += `${word} means ${meaning}. `;
              if (extra) textToRead += `${extra}. `;
            }
          });
        }
      }
      else if (
        currentSegment?.type === 'diagram_concept' ||
        currentSegment?.type === 'diagram_reference'
      ) {
        const title = cleanForTTS(currentSegment.title || currentSegment.reference || 'this diagram');
        textToRead = `${title}. `;
        if (currentSegment.explanation) {
          const mainText = cleanForTTS(currentSegment.explanation);
          if (showExplanation) {
            setMainTextWordCount(title.split(/\s+/).filter(Boolean).length + 1);
          }
          textToRead += mainText;
        }
      }
      else {
        // text — passage, author_note, concept, definition, theorem, note, topic_intro, etc.
        const mainText = cleanForTTS(currentSegment?.text || '');
        textToRead = mainText;
        if (showExplanation && currentSegment?.explanation) {
          setMainTextWordCount(mainText.split(/\s+/).filter(Boolean).length);
          textToRead += `. ${cleanForTTS(currentSegment.explanation)}`;
        } else {
          setMainTextWordCount(0); // 0 means all words are main text
        }
      }

      if (!textToRead.trim()) {
        console.log('No text to read');
        return;
      }

      // Final clean — catches any markup that slipped through
      textToRead = cleanForTTS(textToRead);

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

      await speakWithDeepgram(textToRead, null, false, currentSegmentIndex);

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

    // Clean all markup — LaTeX, markdown, emojis, symbols
    const cleanText = cleanForTTS(String(text));

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
    autoPlayRef.current = false;

    // Cancel any pending autoplay pause timer
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }

    // Abort the fetch stream — this stops audio even after navigate
    if (ttsAbortRef.current) {
      ttsAbortRef.current.abort();
      ttsAbortRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    setIsReading(false);
    setAutoPlayMode(false);
    setIsLoadingAudio(false);
    setHighlightedWordIndex(-1);
    setCurrentWords([]);
    setMainTextWordCount(0);
    setTeacherBoardWords([]);
    setTeacherBoardHighlightIndex(-1);
    setCurrentChunk({ current: 0, total: 0 });
    setAutoPlayCountdown(0);
  };


  const toggleAutoPlay = () => {
    if (autoPlayMode) {
      autoPlayRef.current = false;
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      stopReading();
    } else {
      autoPlayRef.current = true;
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


  const handleExitClass = () => {
    setShowExitDialog(false);
    if (chapter?.book_id) {
      navigate(`/subjects`);
    } else {
      navigate(-1);
    }
  };

  const handleReturnToFullscreen = async () => {
    setShowExitDialog(false);
    await enterFullscreen();
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
              {currentSection?.page_range?.[0] ?? currentPageIndex + 1}/{chapterData?.sections?.[chapterData.sections.length - 1]?.page_range?.slice(-1)[0] ?? chapterData?.sections?.length}
            </button>

            {/* Tips Toggle */}
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className={`flex-shrink-0 p-1.5 rounded-md transition-colors shadow-sm ${showExplanation
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
                  Ch {chapter?.chapter_no} • Page {currentSection?.page_range?.[0] ?? currentPageIndex + 1}/{chapterData?.sections?.[chapterData.sections.length - 1]?.page_range?.slice(-1)[0] ?? chapterData?.sections?.length}
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
                    <div className="font-bold text-sm">Page {section.page_range?.[0] ?? idx + 1}</div>
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
                            {autoPlayCountdown > 0 ? `Next in ${autoPlayCountdown}s` : 'Auto-Play'}
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
                                  // ✅ NEW: Use image_url directly from segment (Mistral OCR pipeline)
                                  // Falls back to old pageSeg.image_path for backwards compatibility
                                  const diagramImageUrl = currentSegment.image_url
                                    || ((() => {
                                      const pageNum = currentSegment.page || currentSegment.page_number || currentPdfPage;
                                      const pageSeg = segments.find(s => s.page === pageNum);
                                      return pageSeg?.image_path ? `${import.meta.env.VITE_CDN_URL}${pageSeg.image_path}` : null;
                                    })());

                                  return (
                                    <div className="mb-6">
                                      {/* Two-column layout for diagrams */}
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                                        {/* LEFT: Diagram Image */}
                                        <div className="order-1">
                                          <div className="bg-white rounded-2xl shadow-lg p-3 border-4 border-purple-400">
                                            {(currentSegment.title || currentSegment.reference) && (
                                              <p className="text-center mb-2 text-sm font-semibold text-purple-700 bg-purple-50 py-2 rounded-lg">
                                                📍 {currentSegment.title || currentSegment.reference}
                                              </p>
                                            )}
                                            {diagramImageUrl ? (
                                              <img
                                                src={diagramImageUrl}
                                                alt={currentSegment.title || currentSegment.reference || "Diagram"}
                                                className="w-full rounded-lg shadow-md object-contain max-h-72"
                                                onError={(e) => {
                                                  console.error('Diagram image failed to load:', diagramImageUrl);
                                                  e.target.style.display = 'none';
                                                  e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                                                }}
                                              />
                                            ) : (
                                              <div className="flex flex-col items-center justify-center h-48 text-purple-400 bg-purple-50 rounded-lg border-2 border-dashed border-purple-300">
                                                <span className="text-4xl mb-2">📊</span>
                                                <p className="text-sm text-purple-500 text-center px-4">
                                                  {currentSegment.title || "Diagram"}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* RIGHT: Explanation */}
                                        <div className="order-2">
                                          {(currentSegment.description || currentSegment.explanation) && (
                                            <div className="bg-purple-100 rounded-2xl shadow-lg p-4 border-4 border-purple-400" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
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
                                              {currentSegment.explanation && (
                                                <p className="text-xs sm:text-sm leading-relaxed text-slate-700 chalk-text" style={{ wordSpacing: '0.15em' }}>
                                                  {isReading && currentWords.length > 0 ? (() => {
                                                    // title words are mainTextWordCount, rest is explanation
                                                    const expWords = mainTextWordCount > 0
                                                      ? currentWords.slice(mainTextWordCount)
                                                      : currentWords;
                                                    const expHighlightIdx = mainTextWordCount > 0
                                                      ? highlightedWordIndex - mainTextWordCount
                                                      : highlightedWordIndex;
                                                    return expWords.map((word, idx) => (
                                                      <span
                                                        key={idx}
                                                        className="inline-block transition-colors duration-100"
                                                        style={{
                                                          marginRight: '0.3em',
                                                          color: idx === expHighlightIdx
                                                            ? '#7c3aed'
                                                            : idx < expHighlightIdx
                                                              ? 'rgba(30,41,59,0.45)'
                                                              : 'rgb(30,41,59)',
                                                          fontWeight: idx === expHighlightIdx ? '700' : 'inherit',
                                                          textShadow: idx === expHighlightIdx ? '0 0 12px rgba(124,58,237,0.35)' : 'none',
                                                        }}
                                                      >
                                                        {word}
                                                      </span>
                                                    ));
                                                  })() : renderMixedText(currentSegment.explanation)}
                                                </p>
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
                                    {currentSegment?.type === 'dialogue' && (
                                      <span
                                        className="px-3 py-1 bg-orange-300 text-orange-900 text-xs font-bold rounded-lg border-2 border-orange-500 shadow-sm"
                                        style={{ fontFamily: 'Comic Sans MS, cursive' }}
                                      >
                                        💬 DIALOGUE
                                      </span>
                                    )}
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

                                  {/* Text content - don't show for diagram-only, example, or equation segments (they have their own display) */}
                                  {currentSegment?.type !== 'diagram' && currentSegment?.type !== 'diagram_concept' && currentSegment?.type !== 'diagram_reference' && currentSegment?.type !== 'example' && currentSegment?.type !== 'equation' && currentSegment?.type !== 'dialogue' && currentSegment?.type !== 'table' && (
                                    <p
                                      className="text-base sm:text-lg md:text-xl leading-relaxed transition-all text-slate-800"
                                      style={{ fontFamily: 'Comic Sans MS, cursive', wordSpacing: '0.15em' }}
                                    >
                                      {isReading && currentWords.length > 0 ? (() => {
                                        // Only show the main-text portion of currentWords here.
                                        // If mainTextWordCount > 0, slice to that; else show all.
                                        const mainWords = mainTextWordCount > 0
                                          ? currentWords.slice(0, mainTextWordCount)
                                          : currentWords;
                                        return mainWords.map((word, idx) => (
                                          <span
                                            key={idx}
                                            className="inline-block transition-colors duration-100"
                                            style={{
                                              marginRight: '0.3em',
                                              color: idx === highlightedWordIndex
                                                ? '#2563eb'
                                                : idx < highlightedWordIndex
                                                  ? 'rgba(30,41,59,0.45)'
                                                  : 'rgb(30,41,59)',
                                              fontWeight: idx === highlightedWordIndex ? '700' : 'inherit',
                                              textShadow: idx === highlightedWordIndex ? '0 0 12px rgba(37,99,235,0.35)' : 'none',
                                            }}
                                          >
                                            {word}
                                          </span>
                                        ));
                                      })() : (
                                        (currentSegment?.text || currentSegment?.reference || currentSegment?.title || '')
                                          .split('\n').map((line, i) => line.trim()
                                            ? <span key={i} style={{ display: 'block' }}>{renderMixedText(line)}</span>
                                            : null)
                                      )}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* ── DIALOGUE CARD ─────────────────────────────────── */}
                        {currentSegment?.type === 'dialogue' && (
                          <div className="mb-6 space-y-4" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                            {/* Speaker label */}
                            {currentSegment.speakers && (
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">💬</span>
                                <span className="text-sm font-bold text-orange-700 uppercase tracking-wide px-3 py-1 bg-orange-100 rounded-full border-2 border-orange-300">
                                  {currentSegment.speakers}
                                </span>
                              </div>
                            )}
                            {/* Dialogue text — speech-bubble style */}
                            <div className="bg-orange-50 rounded-2xl shadow-lg p-4 sm:p-6 border-4 border-orange-300">
                              <div className="text-base sm:text-lg leading-relaxed text-slate-800 font-medium" style={{ wordSpacing: '0.15em' }}>
                                {(currentSegment.text || '').split('\n').map((line, i) =>
                                  line.trim() ? <p key={i} className="mb-1">{renderMixedText(line)}</p> : null
                                )}
                              </div>
                            </div>
                            {/* What it reveals */}
                            {currentSegment.what_it_reveals && (
                              <div className="bg-purple-50 rounded-2xl shadow-lg p-4 sm:p-6 border-4 border-purple-300">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-xl">🔍</span>
                                  <h3 className="text-base font-bold text-purple-800">What this reveals</h3>
                                </div>
                                <p className="text-sm sm:text-base leading-relaxed text-slate-700">
                                  {renderMixedText(currentSegment.what_it_reveals)}
                                </p>
                                {currentSegment.tone && (
                                  <p className="mt-2 text-sm text-purple-600 font-semibold">
                                    🎭 Tone: {currentSegment.tone}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

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
                              <div className="text-sm sm:text-base leading-relaxed text-slate-700 chalk-text space-y-1" style={{ wordSpacing: '0.15em' }}>
                                {(() => {
                                  const lines = currentSegment.problem.split('\n');
                                  const rendered = [];
                                  let i = 0;
                                  while (i < lines.length) {
                                    const line = lines[i];
                                    // Detect markdown table block: line starts with |
                                    if (line.trim().startsWith('|')) {
                                      const tableLines = [];
                                      while (i < lines.length && lines[i].trim().startsWith('|')) {
                                        tableLines.push(lines[i]);
                                        i++;
                                      }
                                      // Parse header, separator, rows
                                      const nonSep = tableLines.filter(l => !l.replace(/\|/g, '').replace(/-/g, '').replace(/\s/g, ''));
                                      const allRows = tableLines.filter(l => !/^\s*\|[\s\-|]+\|\s*$/.test(l));
                                      const headerRow = allRows[0];
                                      const dataRows = allRows.slice(1);
                                      const parseRow = (r) => r.split('|').map(c => c.trim()).filter((c, ci, arr) => ci !== 0 || c !== '').filter((c, ci, arr) => ci !== arr.length - 1 || c !== '');
                                      const headers = headerRow ? parseRow(headerRow) : [];
                                      rendered.push(
                                        <div key={`tbl-${i}`} className="overflow-x-auto rounded-xl border-2 border-green-300 shadow-sm my-2">
                                          <table className="w-full border-collapse text-sm">
                                            {headers.length > 0 && (
                                              <thead>
                                                <tr className="bg-green-200">
                                                  {headers.map((h, hi) => (
                                                    <th key={hi} className="border border-green-300 px-3 py-2 text-left font-bold text-slate-700">{renderMixedText(h)}</th>
                                                  ))}
                                                </tr>
                                              </thead>
                                            )}
                                            <tbody>
                                              {dataRows.map((row, ri) => (
                                                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                                                  {parseRow(row).map((cell, ci) => (
                                                    <td key={ci} className="border border-green-300 px-3 py-2 text-slate-600">{renderMixedText(cell)}</td>
                                                  ))}
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      );
                                    } else {
                                      if (line.trim()) rendered.push(<p key={i}>{renderMixedText(line)}</p>);
                                      i++;
                                    }
                                  }
                                  return rendered;
                                })()}
                              </div>
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
                                  {(() => {
                                    // Renders solution string — handles markdown tables, bullets, numbered steps, bold/italic, LaTeX
                                    const renderInline = (text) => {
                                      const mathParts = text.split(/(\$[^$]+\$)/g);
                                      return mathParts.map((part, i) => {
                                        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
                                          try { return <InlineMath key={i} math={part.slice(1, -1).trim()} />; }
                                          catch { return <span key={i}>{part}</span>; }
                                        }
                                        const mdParts = part.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
                                        return mdParts.map((mp, j) => {
                                          if (mp.startsWith('**') && mp.endsWith('**'))
                                            return <strong key={`${i}-${j}`}>{mp.slice(2, -2)}</strong>;
                                          if (mp.startsWith('*') && mp.endsWith('*'))
                                            return <em key={`${i}-${j}`}>{mp.slice(1, -1)}</em>;
                                          return <span key={`${i}-${j}`}>{mp}</span>;
                                        });
                                      });
                                    };
                                    const parseRow = (r) => {
                                      const cells = r.split('|');
                                      const trimmed = cells[0].trim() === '' ? cells.slice(1) : cells;
                                      const final = trimmed[trimmed.length - 1]?.trim() === '' ? trimmed.slice(0, -1) : trimmed;
                                      return final.map(c => c.trim());
                                    };
                                    const lines = currentSegment.solution.split('\n');
                                    const rendered = [];
                                    let i = 0;
                                    while (i < lines.length) {
                                      const line = lines[i];
                                      // ── Markdown table block ──────────────────────────────
                                      if (line.trim().startsWith('|')) {
                                        const tableLines = [];
                                        while (i < lines.length && lines[i].trim().startsWith('|')) {
                                          tableLines.push(lines[i]);
                                          i++;
                                        }
                                        const allRows = tableLines.filter(l => !/^\s*\|[\s\-:|]+\|\s*$/.test(l));
                                        const headerRow = allRows[0];
                                        const dataRows = allRows.slice(1);
                                        const headers = headerRow ? parseRow(headerRow) : [];
                                        const colCount = headers.length;
                                        rendered.push(
                                          <div key={`tbl-${i}`} className="overflow-x-auto rounded-xl border-2 border-blue-300 shadow-sm my-3">
                                            <table className="w-full border-collapse text-sm" style={{ tableLayout: 'auto' }}>
                                              {headers.length > 0 && (
                                                <thead>
                                                  <tr className="bg-blue-200">
                                                    {headers.map((h, hi) => (
                                                      <th key={hi} className="border border-blue-300 px-3 py-2 text-left font-bold text-slate-700 text-xs sm:text-sm">{renderInline(h)}</th>
                                                    ))}
                                                  </tr>
                                                </thead>
                                              )}
                                              <tbody>
                                                {dataRows.map((row, ri) => {
                                                  const cells = parseRow(row);
                                                  while (cells.length < colCount) cells.push('');
                                                  return (
                                                    <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                                                      {cells.map((cell, ci) => (
                                                        <td key={ci} className="border border-blue-300 px-3 py-2 text-slate-700 text-xs sm:text-sm">{renderInline(cell)}</td>
                                                      ))}
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        );
                                        continue;
                                      }
                                      // ── Bullet point ──────────────────────────────────────
                                      if (line.trim().match(/^\*\s+\S/) || line.trim().match(/^\*\s*\*\*/)) {
                                        const content = line.trim().replace(/^\*\s*/, '');
                                        rendered.push(
                                          <div key={i} className="mb-2 pl-4 flex gap-2">
                                            <span className="text-slate-500 mt-1 flex-shrink-0">•</span>
                                            <p className="text-sm text-slate-600 chalk-text">{renderInline(content)}</p>
                                          </div>
                                        );
                                        i++; continue;
                                      }
                                      // ── Numbered step ─────────────────────────────────────
                                      if (line.trim().match(/^\d+\./)) {
                                        rendered.push(
                                          <div key={i} className="mb-2 mt-3">
                                            <p className="text-sm text-slate-700 chalk-text font-bold">{renderInline(line)}</p>
                                          </div>
                                        );
                                        i++; continue;
                                      }
                                      // ── Regular paragraph ─────────────────────────────────
                                      if (line.trim()) {
                                        rendered.push(
                                          <p key={i} className="text-sm text-slate-700 chalk-text mb-1 leading-relaxed">
                                            {renderInline(line)}
                                          </p>
                                        );
                                      }
                                      i++;
                                    }
                                    return rendered;
                                  })()}
                                </div>
                              </div>
                            )}
                            {/* Answer table — shown when answer is structured table_data */}
                            {currentSegment.answer_table && Array.isArray(currentSegment.answer_table) && currentSegment.answer_table.length > 1 && (
                              <div className="bg-blue-50 rounded-2xl shadow-lg p-4 sm:p-6 border-4 border-blue-400" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="p-2 bg-blue-500 rounded-lg border-2 border-blue-600 shadow-md">
                                    <span className="text-2xl">✅</span>
                                  </div>
                                  <h2 className="text-xl font-bold text-slate-800 chalk-text">Answer</h2>
                                </div>
                                <div className="overflow-x-auto rounded-xl border-2 border-blue-300 shadow-sm">
                                  <table className="w-full border-collapse text-sm">
                                    <thead>
                                      <tr className="bg-blue-200">
                                        {currentSegment.answer_table[0].map((h, hi) => (
                                          <th key={hi} className="border border-blue-300 px-3 py-2 text-left font-bold text-slate-700">{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {currentSegment.answer_table.slice(1).map((row, ri) => (
                                        <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                                          {row.map((cell, ci) => (
                                            <td key={ci} className="border border-blue-300 px-3 py-2 text-slate-700">{renderMixedText(String(cell))}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                                {currentSegment.solution && (
                                  <p className="mt-3 text-sm text-slate-600 chalk-text">{currentSegment.solution}</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}




                        {/* ── TABLE ─────────────────────────────────────────── */}
                        {currentSegment?.type === 'table' && (
                          <div className="mb-6 animate-slideIn" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                            {/* Title */}
                            {currentSegment.title && (
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl">📊</span>
                                <h3 className="text-base sm:text-lg font-bold text-slate-800 chalk-text">
                                  {currentSegment.title}
                                </h3>
                              </div>
                            )}

                            {/* Table */}
                            <div className="overflow-x-auto rounded-xl border-2 border-blue-300 shadow-md">
                              <table className="w-full border-collapse text-sm sm:text-base">
                                {/* Headers */}
                                {currentSegment.headers && currentSegment.headers.length > 0 && (
                                  <thead>
                                    <tr className="bg-blue-500 text-white">
                                      {currentSegment.headers.map((header, hi) => (
                                        <th
                                          key={hi}
                                          className="px-4 py-3 text-left font-bold chalk-text border-r border-blue-400 last:border-r-0"
                                        >
                                          {renderMixedText(String(header))}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                )}
                                {/* Rows */}
                                <tbody>
                                  {(currentSegment.rows || []).map((row, ri) => {
                                    // Highlight the row currently being read by TTS.
                                    // TTS reads each row as "word means meaning. explanation."
                                    // We divide total words evenly across rows to find active row.
                                    const totalRows = (currentSegment.rows || []).length;
                                    const wordsPerRow = currentWords.length > 0 && totalRows > 0
                                      ? Math.ceil(currentWords.length / totalRows)
                                      : 0;
                                    const activeRowIndex = isReading && wordsPerRow > 0
                                      ? Math.min(Math.floor(highlightedWordIndex / wordsPerRow), totalRows - 1)
                                      : -1;
                                    const isActiveRow = activeRowIndex === ri;
                                    return (
                                      <tr
                                        key={ri}
                                        style={{
                                          background: isActiveRow
                                            ? 'linear-gradient(90deg, #dbeafe, #eff6ff)'
                                            : ri % 2 === 0 ? '#ffffff' : '#eff6ff',
                                          transition: 'background 0.3s ease',
                                          boxShadow: isActiveRow ? 'inset 3px 0 0 #2563eb' : 'none',
                                        }}
                                      >
                                        {(Array.isArray(row) ? row : [row]).map((cell, ci) => (
                                          <td
                                            key={ci}
                                            className="px-4 py-3 chalk-text border-t border-blue-100 border-r last:border-r-0 leading-relaxed"
                                            style={{
                                              color: isActiveRow ? '#1e40af' : '#374151',
                                              fontWeight: isActiveRow && ci === 0 ? '700' : 'inherit',
                                              transition: 'color 0.3s ease',
                                            }}
                                          >
                                            {renderMixedText(String(cell))}
                                          </td>
                                        ))}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            {/* Explanation */}
                            {showExplanation && currentSegment.explanation && (
                              <div className="mt-4 bg-yellow-100 rounded-2xl p-4 border-4 border-yellow-400 animate-chalkWrite">
                                <div className="flex items-center gap-2 mb-2">
                                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                                  <span className="font-bold text-slate-800 chalk-text">💡 Simple Explanation</span>
                                </div>
                                <p className="text-sm sm:text-base leading-relaxed text-slate-700 chalk-text">
                                  {renderMixedText(currentSegment.explanation)}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Explanation Card - Whiteboard Style */}
                        {showExplanation && currentSegment?.explanation && currentSegment?.type !== 'diagram' && currentSegment?.type !== 'diagram_concept' && currentSegment?.type !== 'diagram_reference' && currentSegment?.type !== 'table' && currentSegment?.type !== 'dialogue' && (
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
                            <p className="text-sm sm:text-base leading-relaxed text-slate-700 chalk-text" style={{ wordSpacing: '0.15em' }}>
                              {isReading && currentWords.length > 0 && mainTextWordCount > 0 ? (() => {
                                // Show explanation words (everything after mainTextWordCount)
                                const expWords = currentWords.slice(mainTextWordCount);
                                const expHighlightIdx = highlightedWordIndex - mainTextWordCount;
                                return expWords.map((word, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block transition-colors duration-100"
                                    style={{
                                      marginRight: '0.3em',
                                      color: idx === expHighlightIdx
                                        ? '#b45309'               // current word — amber
                                        : idx < expHighlightIdx
                                          ? 'rgba(120,80,20,0.45)'  // already spoken — faded
                                          : 'rgb(92,61,12)',         // upcoming — normal dark amber
                                      fontWeight: idx === expHighlightIdx ? '700' : 'inherit',
                                      textShadow: idx === expHighlightIdx ? '0 0 10px rgba(180,83,9,0.3)' : 'none',
                                    }}
                                  >
                                    {word}
                                  </span>
                                ));
                              })() : renderMixedText(currentSegment.explanation)}
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

                            {/* Main Equation — rendered with KaTeX */}
                            <div className="p-4 mb-6 overflow-x-auto">
                              {(() => {
                                // Strip outer $$ if present and render with BlockMath
                                const raw = (currentSegment.equation || '').trim().replace(/^\$\$/, '').replace(/\$\$$/, '').trim();
                                try {
                                  return <BlockMath math={raw} />;
                                } catch {
                                  return (
                                    <p className="text-base font-mono text-center text-slate-800 font-bold chalk-text break-all">
                                      {currentSegment.equation}
                                    </p>
                                  );
                                }
                              })()}
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
                                          {/* Step title — word highlight when this step is active */}
                                          <p className="text-base sm:text-lg font-bold text-slate-800 mb-2 chalk-text relative">
                                            <span className={`${activeStepUnderline === index ? 'underline-animation' : ''}`}>
                                              {activeStepUnderline === index && isReading && currentWords.length > 0
                                                ? currentWords.map((word, widx) => (
                                                  <span
                                                    key={widx}
                                                    className="inline-block transition-colors duration-100"
                                                    style={{
                                                      marginRight: '0.25em',
                                                      color: widx === highlightedWordIndex
                                                        ? '#2563eb'
                                                        : widx < highlightedWordIndex
                                                          ? 'rgba(30,41,59,0.45)'
                                                          : 'rgb(30,41,59)',
                                                      fontWeight: widx === highlightedWordIndex ? '800' : 'inherit',
                                                      textShadow: widx === highlightedWordIndex ? '0 0 10px rgba(37,99,235,0.3)' : 'none',
                                                    }}
                                                  >
                                                    {word}
                                                  </span>
                                                ))
                                                : step.step}
                                            </span>
                                          </p>

                                          {/* Step explanation — word reveal animation */}
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

                                              if (revealedCount === 0) return renderMixedText(cleanExplanation);

                                              return words.map((word, wordIdx) => (
                                                <span
                                                  key={wordIdx}
                                                  style={{
                                                    color: wordIdx < revealedCount ? 'rgb(51,65,85)' : 'rgba(51,65,85,0.25)',
                                                    transition: 'color 0.3s ease',
                                                  }}
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
                                  {renderMixedText(currentSegment.application)}
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
                  {chapterData?.sections?.[chapterData.sections.length - 1]?.page_range?.slice(-1)[0] ?? chapterData?.sections?.length} pages available
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
                    {section.page_range?.[0] ?? idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-0.5">Page {section.page_range?.[0] ?? idx + 1}</div>
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
                className="flex cursor-pointer items-center justify-center gap-1.5 px-4 md:px-6 py-2.5 md:py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md min-w-[80px] md:min-w-[100px]"
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
                onClick={() => {
                  if (isLastSegment()) {
                    saveSegmentProgress(currentSegmentIndex, currentPageIndex);
                    setShowCompletionModal(true);
                  } else {
                    goToNextSegment();
                  }
                }}
                className={`flex cursor-pointer items-center justify-center gap-1.5 px-4 md:px-6 py-2.5 md:py-3 text-white rounded-xl font-medium transition-all shadow-lg min-w-[80px] md:min-w-[100px] ${isLastSegment()
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  }`}
              >
                <span className="text-sm md:text-base">{isLastSegment() ? '🎉 Finish' : 'Next'}</span>
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

      {/* 🎉 Chapter Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md mx-4 shadow-2xl border-4 border-green-400 text-center animate-bounce-once">
            {/* Trophy */}
            <div className="text-7xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              Chapter Complete!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-base">
              You’ve finished <strong className="text-gray-900 dark:text-white">{chapter?.chapter_title}</strong>. Amazing work! 🌟
            </p>

            {/* 100% Progress Ring */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="url(#completionGrad)" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset="0"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                  <defs>
                    <linearGradient id="completionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-green-600">100%</span>
                  <span className="text-xs text-gray-500">Complete</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  navigate(`/book/${chapter?.book_id}`);
                }}
                className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-2xl text-lg shadow-lg transition-all"
              >
                📚 Back to Table of Contents
              </button>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="w-full py-2 px-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-2xl transition-all"
              >
                Stay &amp; Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Exit Dialog with Black Screen */}
      {showExitDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
          <div className="bg-gray-900 border-2 border-red-500 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <X className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Exit Class?
                </h2>
                <p className="text-gray-400">
                  If you exit now, you'll leave the current learning session and return to the table of contents.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleReturnToFullscreen}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                >
                  Continue Learning
                </button>
                <button
                  onClick={handleExitClass}
                  className="w-full py-4 px-6 bg-gray-800 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition-all border border-gray-700"
                >
                  Exit to Table of Contents
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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