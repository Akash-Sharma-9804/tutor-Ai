import { InlineMath } from "react-katex";

/**
 * Renders text containing inline LaTeX ($...$) mixed with plain text.
 * Also heals old-processed-book corruption where \f and \t were mangled.
 */
// eslint-disable-next-line no-control-regex
const FORM_FEED_RE = /\x0C([a-zA-Z{])/g;
// eslint-disable-next-line no-control-regex
const TAB_RE = /\x09([a-zA-Z{])/g;

const renderMixedText = (text) => {
  if (!text || typeof text !== 'string') return text;

  // Heal form-feed (U+000C) and tab (U+0009) corruption from old sanitizeJsonString bug
  text = text
    .replace(FORM_FEED_RE, '\\$1')
    .replace(TAB_RE, '\\$1');

  // Don't try to parse if no $ signs and no LaTeX commands
  if (!text.includes('$') && !/\\[a-zA-Z]/.test(text)) return text;

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

    // Check for bare LaTeX commands like \vec{} \frac{}{} \omega, Greek chars
    const bareLatexPattern = /\\[a-zA-Z]+(\{[^}]*\})*|[αβγδεζθλμνξπρστφχψωΩΓΔΛΣΦΨ]/;
    if (bareLatexPattern.test(part)) {
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

export default renderMixedText;