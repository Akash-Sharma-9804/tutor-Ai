/**
 * cleanForTTS — strips ALL markup before sending to Deepgram.
 * Handles: LaTeX ($...$ $$...$$), markdown (**bold** *italic* ## #),
 *          emojis, HTML tags, arrows, math symbols.
 */
const cleanForTTS = (str) => {
  if (!str) return '';
  return String(str)
    // Heal form-feed (U+000C) and tab (U+0009) corruption from old sanitizeJsonString bug
    // eslint-disable-next-line no-control-regex
    .replace(/\x0C([a-zA-Z])/g, '\\$1')
    // eslint-disable-next-line no-control-regex
    .replace(/\x09([a-zA-Z])/g, '\\$1')
    // LaTeX display math $$...$$
    .replace(/\$\$[\s\S]*?\$\$/g, 'equation')
    // LaTeX inline math $...$ → spoken words
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
    // Markdown
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/`[^`]+`/g, '')
    // HTML
    .replace(/<[^>]+>/g, '')
    // Emoji & symbols
    .replace(/[✓✗⚠️💡👁🎭🔍📖💬📐💭📝✅]/g, '')
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
    // Math/arrow symbols → spoken
    .replace(/→/g, ' equals ').replace(/≈/g, ' approximately ')
    .replace(/≠/g, ' not equal to ').replace(/≤/g, ' less than or equal to ')
    .replace(/≥/g, ' greater than or equal to ').replace(/°/g, ' degrees ')
    // Cleanup
    .replace(/\n+/g, '. ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\.\s*\.\s*/g, '. ')
    .trim();
};

export default cleanForTTS;