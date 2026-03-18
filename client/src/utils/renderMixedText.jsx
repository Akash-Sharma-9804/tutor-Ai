import { InlineMath, BlockMath } from "react-katex";

// eslint-disable-next-line no-control-regex
const FORM_FEED_RE = /\x0C([a-zA-Z{])/g;
// eslint-disable-next-line no-control-regex
const TAB_RE = /\x09([a-zA-Z{])/g;

/**
 * Renders text that mixes LaTeX and plain prose. Handles:
 *  - $$...$$ blocks  → <BlockMath> (rendered as a centred block)
 *  - $...$ tokens    → <InlineMath>
 *  - bare \commands  → <InlineMath> per command
 *  - plain text      → <span>
 *
 * Split order matters: match $$$$ BEFORE $$ so the longer token wins.
 */
const renderMixedText = (text) => {
  if (!text || typeof text !== 'string') return text;

  // Heal form-feed / tab corruption from old sanitizeJsonString bug
  text = text
    .replace(FORM_FEED_RE, '\\$1')
    .replace(TAB_RE, '\\$1');

  if (!text.includes('$') && !/\\[a-zA-Z]/.test(text)) return text;

  // Split on $$...$$ first (block), then $...$ (inline)
  // The regex alternation puts $$$$ before $$ so greedy match is correct.
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^$]+\$)/g);

  return parts.map((part, i) => {

    // ── Block math $$...$$
    if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
      const math = part.slice(2, -2).trim();
      try { return <div key={i} className="overflow-x-auto my-2"><BlockMath math={math} /></div>; }
      catch { return <span key={i}>{part}</span>; }
    }

    // ── Inline math $...$
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const math = part.slice(1, -1).trim();
      try { return <InlineMath key={i} math={math} />; }
      catch { return <span key={i}>{part}</span>; }
    }

    // ── Bare LaTeX commands / Greek letters
    const bareLatexPattern = /\\[a-zA-Z]+(\{[^}]*\})*/;
  if (bareLatexPattern.test(part)) {
      const subParts = part.split(/(\\[a-zA-Z]+(?:\{[^}]*\})*(?:\{[^}]*\})*|[αβγδεζθλμνξπρστφχψωΩΓΔΛΣΦΨ])/g);
      return (
        <span key={i}>
          {subParts.map((sub, si) => {
            if (/^\\[a-zA-Z]/.test(sub) || /^[αβγδεζθλμνξπρστφχψωΩΓΔΛΣΦΨ]$/.test(sub)) {
              try { return <InlineMath key={si} math={sub} />; }
              catch { return <span key={si}>{sub}</span>; }
            }
            return <span key={si}>{sub}</span>;
          })}
        </span>
      );
    }

    return <span key={i}>{part}</span>;
  });
};

export default renderMixedText;