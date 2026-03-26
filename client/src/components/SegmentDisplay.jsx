import { Lightbulb } from 'lucide-react';
import renderMixedText from '../utils/renderMixedText';

// ─── Shared word-highlight renderer ──────────────────────────────────────────

const HighlightedWords = ({ words, highlightedIndex, color = '#2563eb', shadowColor = 'rgba(37,99,235,0.35)' }) =>
  words.map((word, idx) => (
    <span
      key={idx}
      style={{
        marginRight: '0.3em',
        display: 'inline-block',
        color: idx === highlightedIndex ? color : idx < highlightedIndex ? 'rgba(30,41,59,0.45)' : 'rgb(30,41,59)',
        fontWeight: idx === highlightedIndex ? '700' : 'inherit',
        textShadow: idx === highlightedIndex ? `0 0 12px ${shadowColor}` : 'none',
        transition: 'color 0.1s',
      }}
    >
      {word}
    </span>
  ));

// ─── Shared: parse markdown table row ────────────────────────────────────────

const parseRow = (r) => {
  const cells = r.split('|');
  const trimmed = cells[0].trim() === '' ? cells.slice(1) : cells;
  const final = trimmed[trimmed.length - 1]?.trim() === '' ? trimmed.slice(0, -1) : trimmed;
  return final.map(c => c.trim());
};

// ─────────────────────────────────────────────────────────────────────────────
// TEXT SEGMENT
// ─────────────────────────────────────────────────────────────────────────────

export const TextSegment = ({
  segment, currentSection, currentPageIndex,
  isReading, currentWords, highlightedWordIndex, mainTextWordCount,
}) => {
  const text = segment?.text || segment?.reference || segment?.title || '';
  const mainWords = isReading && currentWords.length > 0
    ? (mainTextWordCount > 0 ? currentWords.slice(0, mainTextWordCount) : currentWords)
    : [];

  return (
    <p
      className="text-base sm:text-lg md:text-xl leading-relaxed text-slate-800"
      style={{ fontFamily: 'Comic Sans MS, cursive', wordSpacing: '0.15em' }}
    >
      {mainWords.length > 0
        ? <HighlightedWords words={mainWords} highlightedIndex={highlightedWordIndex} />
        : text.split('\n').map((line, i) =>
            line.trim() ? <span key={i} style={{ display: 'block' }}>{renderMixedText(line)}</span> : null
          )}
    </p>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DIALOGUE SEGMENT
// ─────────────────────────────────────────────────────────────────────────────

export const DialogueSegment = ({ segment }) => (
  <div className="mb-4 space-y-3"  >
    {segment.speakers && (
      <div className="flex items-center gap-2">
        <span className="text-2xl">💬</span>
        <span className="text-sm font-bold text-orange-700 px-3 py-1 bg-orange-100 rounded-full border-2 border-orange-300">
          {segment.speakers}
        </span>
      </div>
    )}
    <div className="bg-orange-50 rounded-2xl p-4 sm:p-6 border-4 border-orange-300 shadow-lg">
      <div className="text-base sm:text-lg leading-relaxed text-slate-800 font-medium" style={{ wordSpacing: '0.15em' }}>
        {(segment.text || '').split('\n').map((line, i) =>
          line.trim() ? <p key={i} className="mb-1">{renderMixedText(line)}</p> : null
        )}
      </div>
    </div>
    {segment.what_it_reveals && (
      <div className="bg-purple-50 rounded-2xl p-4 border-4 border-purple-300 shadow-lg">
        <p className="text-xs font-bold text-purple-700 mb-2">🔍 What this reveals</p>
        <p className="text-sm sm:text-base leading-relaxed text-slate-700">{renderMixedText(segment.what_it_reveals)}</p>
        {segment.tone && <p className="mt-2 text-sm text-purple-600 font-semibold">🎭 Tone: {segment.tone}</p>}
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE SEGMENT
// ─────────────────────────────────────────────────────────────────────────────

const renderSolutionBlock = (text, borderColor = 'border-blue-300', headerColor = 'bg-blue-200') => {
  const lines = text.split('\n');
  const result = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim().startsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { tableLines.push(lines[i]); i++; }
      const rows = tableLines.filter(l => !/^\s*\|[\s\-:|]+\|\s*$/.test(l));
      const headers = rows[0] ? parseRow(rows[0]) : [];
      const dataRows = rows.slice(1);
      result.push(
        <div key={`t${i}`} className={`overflow-x-auto rounded-xl border-2 ${borderColor} shadow-sm my-3`}>
          <table className="w-full border-collapse text-sm">
            {headers.length > 0 && (
              <thead><tr className={headerColor}>
                {headers.map((h, hi) => <th key={hi} className={`border ${borderColor} px-3 py-2 text-left font-bold text-slate-700`}>{renderMixedText(h)}</th>)}
              </tr></thead>
            )}
            <tbody>
              {dataRows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                  {parseRow(row).map((cell, ci) => <td key={ci} className={`border ${borderColor} px-3 py-2 text-slate-700`}>{renderMixedText(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      if (line.trim().match(/^\d+\./)) {
        result.push(<p key={i} className="text-sm font-bold text-slate-700 mb-1 mt-2">{renderMixedText(line)}</p>);
      } else if (line.trim().match(/^\*\s/)) {
        result.push(
          <div key={i} className="mb-1 pl-4 flex gap-2">
            <span className="text-slate-400 mt-1">•</span>
            <p className="text-sm text-slate-600">{renderMixedText(line.replace(/^\*\s*/, ''))}</p>
          </div>
        );
      } else if (line.trim()) {
        result.push(<p key={i} className="text-sm text-slate-700 mb-1 leading-relaxed">{renderMixedText(line)}</p>);
      }
      i++;
    }
  }
  return result;
};

export const ExampleSegment = ({ segment }) => (
  <div className="mb-4 space-y-4"  >
    <div className="bg-green-100 rounded-2xl p-4 sm:p-6 border-4 border-green-400 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <span className="p-2 bg-green-500 rounded-lg border-2 border-green-600 shadow-md text-2xl">📝</span>
        <h2 className="text-xl font-bold text-slate-800">Example Problem</h2>
      </div>
      <div className="text-sm sm:text-base leading-relaxed text-slate-700 space-y-1">
        {renderSolutionBlock(segment.problem || '', 'border-green-300', 'bg-green-200')}
      </div>
    </div>
    {segment.solution && (
      <div className="bg-blue-50 rounded-2xl p-4 sm:p-6 border-4 border-blue-400 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <span className="p-2 bg-blue-500 rounded-lg border-2 border-blue-600 shadow-md text-2xl">✅</span>
          <h2 className="text-xl font-bold text-slate-800">Solution</h2>
        </div>
        {renderSolutionBlock(segment.solution)}
      </div>
    )}
    {segment.answer_table?.length > 1 && (
      <div className="bg-blue-50 rounded-2xl p-4 sm:p-6 border-4 border-blue-400 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">✅</span>
          <h2 className="text-xl font-bold text-slate-800">Answer</h2>
        </div>
        <div className="overflow-x-auto rounded-xl border-2 border-blue-300 shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead><tr className="bg-blue-200">
              {segment.answer_table[0].map((h, hi) => <th key={hi} className="border border-blue-300 px-3 py-2 text-left font-bold text-slate-700">{h}</th>)}
            </tr></thead>
            <tbody>
              {segment.answer_table.slice(1).map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                  {row.map((cell, ci) => <td key={ci} className="border border-blue-300 px-3 py-2 text-slate-700">{renderMixedText(String(cell))}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {segment.solution && <p className="mt-3 text-sm text-slate-600">{segment.solution}</p>}
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// EQUATION SEGMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Strips outer $ or $$ from a string and returns the inner content.
 */
const stripDollars = (s) => {
  if (s.startsWith('$$') && s.endsWith('$$') && s.length > 4) return s.slice(2, -2).trim();
  if (s.startsWith('$') && s.endsWith('$') && s.length > 2) return s.slice(1, -1).trim();
  return s.trim();
};

/**
 * Tries BlockMath, returns null on failure so caller can fallback.
 */
const SafeBlockMath = ({ math }) => {
  try { return <div className="overflow-x-auto py-2"><BlockMath math={math} /></div>; }
  catch { return null; }
};

/**
 * Used when the equation string is a mix of a LaTeX block + trailing plain text,
 * e.g.: $\begin{array}...\end{array}WhenP = 1bar, K_H = S. Thus, K_H is...$
 *
 * Strategy: find the last \end{...} → everything before+including it is pure LaTeX
 * → render with BlockMath. Everything after is plain prose → render with renderMixedText.
 */
const DirtyEquation = ({ raw }) => {
  const inner = stripDollars(raw);

  // Split at the last \end{...}
  const endIdx = inner.lastIndexOf('\\end{');
  if (endIdx !== -1) {
    // find closing } of \end{...}
    const closeIdx = inner.indexOf('}', endIdx + 5);
    if (closeIdx !== -1) {
      const latexPart = inner.slice(0, closeIdx + 1).trim();
      const plainPart = inner.slice(closeIdx + 1).trim();
      return (
        <div className="space-y-3 py-2">
          {(() => { try { return <div className="overflow-x-auto"><BlockMath math={latexPart} /></div>; } catch { return <p className="font-mono text-sm text-slate-600 break-all p-2 bg-gray-50 rounded">{latexPart}</p>; } })()}
          {plainPart && (
            <p className="text-base sm:text-lg text-slate-800 leading-relaxed" style={{ fontFamily: 'Comic Sans MS, cursive', wordSpacing: '0.1em' }}>
              {renderMixedText(plainPart)}
            </p>
          )}
        </div>
      );
    }
  }

  // No \end{} — render entire inner as plain mixed text (inline math will still render)
  return (
    <p className="text-base sm:text-lg text-slate-800 leading-relaxed py-2" style={{ fontFamily: 'Comic Sans MS, cursive', wordSpacing: '0.1em' }}>
      {renderMixedText(inner)}
    </p>
  );
};

/**
 * Detects whether the content inside a single $...$ is "dirty" —
 * i.e. contains plain English prose mixed with LaTeX (KaTeX will choke).
 */
const isDirtyInner = (inner) =>
  /\\end\{[^}]+\}/.test(inner) ||          // has \end{...} → likely an array/aligned block with trailing text
  /[a-zA-Z]{4,}\s+[a-zA-Z]{3,}/.test(      // two consecutive plain words (not LaTeX commands)
    inner.replace(/\\[a-zA-Z]+\{[^}]*\}/g, '').replace(/\\[a-zA-Z]+/g, '')
  );

const renderEquationField = (raw) => {
  if (!raw) return null;
  const s = raw.trim();

  // ── Case 1: $$...$$ ──────────────────────────────────────────────────────
  if (s.startsWith('$$') && s.endsWith('$$') && s.length > 4) {
    const inner = s.slice(2, -2).trim();
    if (isDirtyInner(inner)) return <DirtyEquation raw={inner} />;
    const el = <SafeBlockMath math={inner} />;
    return el || <DirtyEquation raw={inner} />;
  }

  // ── Case 2: multiple $...$ tokens → render inline with renderMixedText ──
  // e.g. "$P_1 = x_1 P_1^0$ and $P_2 = x_2 P_2^0$"
  const tokens = s.match(/\$[^$]+\$/g) || [];
  if (tokens.length > 1) {
    return (
      <p className="text-base sm:text-lg font-semibold text-slate-800 leading-relaxed text-center py-2" style={{ wordSpacing: '0.1em' }}>
        {renderMixedText(s)}
      </p>
    );
  }

  // ── Case 3: single $...$ ─────────────────────────────────────────────────
  if (s.startsWith('$') && s.endsWith('$') && s.length > 2) {
    const inner = s.slice(1, -1).trim();
    if (isDirtyInner(inner)) return <DirtyEquation raw={inner} />;
    const el = <SafeBlockMath math={inner} />;
    return el || <DirtyEquation raw={inner} />;
  }

  // ── Case 4: no $ wrappers — bare LaTeX string ────────────────────────────
  const el = <SafeBlockMath math={s} />;
  return el || <DirtyEquation raw={s} />;
};

export const EquationSegment = ({
  segment, activeEquationStep, activeStepUnderline,
  isReading, currentWords, highlightedWordIndex,
  equationStepChars, explanationWords, showFinalResult,
}) => {
  // Determine if this is a proof/derivation (has steps but equation is plain text title)
  const isDerivation = segment.derivation?.length > 0;
  const equationIsPlainText = segment.equation && !/[\\$^_{}]/.test(segment.equation);
  const headerTitle = isDerivation && equationIsPlainText
    ? segment.equation
    : 'Mathematical Equation';

  return (
    <div className="mb-4 animate-slideIn"  >
      <div className="flex items-center gap-3 mb-4 pb-3 border-b-4 border-blue-400">
        <span className="text-3xl">{isDerivation ? '📐' : '🔢'}</span>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">{headerTitle}</h2>
      </div>

      {/* Only show the equation block if it's actual LaTeX math, not a plain text title */}
      {segment.equation && !equationIsPlainText && (
        <div className="p-4 mb-4">
          {renderEquationField(segment.equation)}
        </div>
      )}

      {/* Show proof setup if present */}
      {segment._proofSetup && (
        <div className="bg-slate-50 rounded-xl p-4 mb-4 border-2 border-slate-200">
          <p className="text-sm text-slate-600 leading-relaxed">{renderMixedText(segment._proofSetup)}</p>
        </div>
      )}

      {segment.derivation?.length > 0 && (
        <div className="space-y-4 mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b-2 border-slate-300">
            <span>📝</span> Step-by-Step:
          </h3>
          {segment.derivation.slice(0, activeEquationStep + 1).map((step, idx) => {
            // Split explanation on newline so statement ($$...$$) and reason render separately
            const rawExp = String(step.explanation || '');
            // For word-reveal TTS: strip math markers to get plain words
            const cleanExp = rawExp.replace(/\$\$[\s\S]+?\$\$/g, '').replace(/\$[^$]+\$/g, '').replace(/\*\*/g, '').replace(/##/g, '').replace(/^- /gm, '').replace(/\n+/g, ' ').trim();
            const expWords = cleanExp.split(/\s+/).filter(Boolean);
            const revealed = explanationWords[idx] || 0;
            return (
              <div key={idx} className="p-5 border-l-4 border-blue-400 pl-6 animate-chalkWrite" style={{ animationDelay: `${idx * 0.25}s` }}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">{idx + 1}</div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-slate-800 mb-2">
                      <span className={activeStepUnderline === idx ? 'underline-animation' : ''}>
                        {activeStepUnderline === idx && isReading && currentWords.length > 0
                          ? <HighlightedWords words={currentWords} highlightedIndex={highlightedWordIndex} />
                          : renderMixedText(step.step)}
                      </span>
                    </p>
                    <div className="text-sm sm:text-base leading-relaxed text-slate-700 space-y-1">
                      {revealed === 0
                        ? rawExp.split('\n').map((line, li) =>
                            line.trim() ? (
                              <div key={li} className={line.trim().startsWith('Reason:') ? 'text-slate-500 italic text-xs mt-1' : ''}>
                                {renderMixedText(line)}
                              </div>
                            ) : null
                          )
                        : expWords.map((word, wi) => (
                          <span key={wi} style={{ color: wi < revealed ? 'rgb(51,65,85)' : 'rgba(51,65,85,0.25)', transition: 'color 0.3s' }}>
                            {word}{' '}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {segment.final_result && showFinalResult && (
        <div className="p-5 border-4 border-green-400 rounded-xl mb-4 bg-green-50">
          <p className="text-xs font-bold text-slate-600 mb-1">✅ Final Result</p>
          <div className="text-base font-semibold text-slate-800">{renderMixedText(segment.final_result)}</div>
        </div>
      )}

      {segment.application && (
        <div className="bg-purple-50 rounded-xl p-5 border-4 border-purple-400">
          <p className="text-xs font-bold text-slate-600 mb-1">💡 Real-World Application</p>
          <p className="text-base text-slate-700 leading-relaxed">{renderMixedText(segment.application)}</p>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DIAGRAM SEGMENT
// ─────────────────────────────────────────────────────────────────────────────

export const DiagramSegment = ({
  segment, segments, currentPdfPage,
  isReading, currentWords, highlightedWordIndex, mainTextWordCount,
}) => {
  const imageUrl = segment.image_url || (() => {
    const pg = segment.page || segment.page_number || currentPdfPage;
    const s = segments.find(s => s.page === pg);
    return s?.image_path ? `${import.meta.env.VITE_CDN_URL}${s.image_path}` : null;
  })();

  const expWords = mainTextWordCount > 0 ? currentWords.slice(mainTextWordCount) : currentWords;
  const expIdx   = mainTextWordCount > 0 ? highlightedWordIndex - mainTextWordCount : highlightedWordIndex;

  return (
    <div className="mb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl shadow-lg p-3 border-4 border-purple-400">
        {(segment.title || segment.reference) && (
          <p className="text-center mb-2 text-sm font-semibold text-purple-700 bg-purple-50 py-2 rounded-lg">
            📍 {segment.title || segment.reference}
          </p>
        )}
        {imageUrl
          ? <img src={imageUrl} alt={segment.title || 'Diagram'} className="w-full rounded-lg object-contain max-h-72" />
          : <div className="flex flex-col items-center justify-center h-48 text-purple-400 bg-purple-50 rounded-lg border-2 border-dashed border-purple-300">
              <span className="text-4xl mb-2">📊</span>
              <p className="text-sm text-center px-4">{segment.title || 'Diagram'}</p>
            </div>
        }
      </div>
      {(segment.description || segment.explanation) && (
        <div className="bg-purple-100 rounded-2xl p-4 border-4 border-purple-400 shadow-lg"  >
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="h-6 w-6 text-purple-600" />
            <h2 className="text-lg font-bold text-slate-800">💡 Understanding the Diagram</h2>
          </div>
          {segment.description && <p className="text-sm leading-relaxed text-slate-700 mb-3">{segment.description}</p>}
          {segment.explanation && (
            <p className="text-sm leading-relaxed text-slate-700" style={{ wordSpacing: '0.15em' }}>
              {isReading && expWords.length > 0
                ? <HighlightedWords words={expWords} highlightedIndex={expIdx} color="#7c3aed" shadowColor="rgba(124,58,237,0.35)" />
                : renderMixedText(segment.explanation)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE SEGMENT
// ─────────────────────────────────────────────────────────────────────────────

export const TableSegment = ({
  segment, showExplanation,
  isReading, currentWords, highlightedWordIndex,
}) => {
  const rows = segment.rows || [];
  const wordsPerRow = isReading && currentWords.length > 0 && rows.length > 0
    ? Math.ceil(currentWords.length / rows.length) : 0;
  const activeRow = wordsPerRow > 0
    ? Math.min(Math.floor(highlightedWordIndex / wordsPerRow), rows.length - 1) : -1;

  return (
    <div className="mb-4 animate-slideIn"  >
      {segment.title && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📊</span>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">{segment.title}</h3>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border-2 border-blue-300 shadow-md">
        <table className="w-full border-collapse text-sm sm:text-base">
          {segment.headers?.length > 0 && (
            <thead><tr className="bg-blue-500 text-white">
              {segment.headers.map((h, hi) => <th key={hi} className="px-4 py-3 text-left font-bold border-r border-blue-400 last:border-r-0">{renderMixedText(String(h))}</th>)}
            </tr></thead>
          )}
          <tbody>
            {rows.map((row, ri) => {
              const isActive = activeRow === ri;
              return (
                <tr key={ri} style={{
                  background: isActive ? 'linear-gradient(90deg,#dbeafe,#eff6ff)' : ri % 2 === 0 ? '#fff' : '#eff6ff',
                  boxShadow: isActive ? 'inset 3px 0 0 #2563eb' : 'none',
                  transition: 'background 0.3s',
                }}>
                  {(Array.isArray(row) ? row : [row]).map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 border-t border-blue-100 border-r last:border-r-0 leading-relaxed"
                      style={{ color: isActive ? '#1e40af' : '#374151', fontWeight: isActive && ci === 0 ? '700' : 'inherit', transition: 'color 0.3s' }}>
                      {renderMixedText(String(cell))}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showExplanation && segment.explanation && (
        <div className="mt-3 bg-yellow-100 rounded-2xl p-4 border-4 border-yellow-400 animate-chalkWrite">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span className="font-bold text-slate-800">💡 Simple Explanation</span>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-slate-700">{renderMixedText(segment.explanation)}</p>
        </div>
      )}
    </div>
  );
};