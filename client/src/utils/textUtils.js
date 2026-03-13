/**
 * Safely converts any value (string, array, object) to a plain string.
 * Avoids circular reference crashes.
 */
export const safeText = (value, seen = new Set()) => {
  if (!value) return '';
  if (typeof value === 'string') return value;

  if (typeof value === 'object') {
    if (seen.has(value)) return '';
    seen.add(value);
  }

  if (Array.isArray(value)) {
    return value.map(v => safeText(v, seen)).join('. ');
  }
  if (typeof value === 'object') {
    return Object.values(value).map(v => safeText(v, seen)).join('. ');
  }
  return String(value);
};

/**
 * Splits text into chunks at sentence boundaries, respecting maxSize.
 */
export const chunkTextIntelligently = (text, maxSize) => {
  const chunks = [];
  let currentChunk = '';

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxSize) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

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

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

/**
 * Builds a flat narration queue from a page's content array for sequential TTS.
 */
export const buildNarrationQueue = (content) => {
  const queue = [];

  const clean = (str) => (str || '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/💡|👁|🎭|🔍|📖|💬|⚠️|✓/g, '')
    .replace(/\n+/g, ' ')
    .trim();

  content.forEach((item, idx) => {
    if (item.type === 'subheading') {
      queue.push({ id: `sub-${idx}`, text: `Section: ${clean(item.subheading)}` });
    }

    if (item.type === 'text') {
      if (item.text) queue.push({ id: `text-${idx}`, text: clean(item.text) });
      if (item.explanation) queue.push({ id: `text-exp-${idx}`, text: clean(item.explanation) });
    }

    if (item.type === 'dialogue') {
      const spokenText = item.speakers
        ? `${item.speakers} says: ${clean(item.text)}`
        : clean(item.text);
      if (spokenText) queue.push({ id: `dlg-${idx}`, text: spokenText });
      if (item.what_it_reveals) queue.push({ id: `dlg-exp-${idx}`, text: clean(item.what_it_reveals) });
      if (item.tone) queue.push({ id: `dlg-tone-${idx}`, text: `Tone: ${clean(item.tone)}` });
    }

    if (item.type === 'example') {
      if (item.problem) queue.push({ id: `ex-${idx}`, text: clean(item.problem) });
      if (item.solution) queue.push({ id: `ex-sol-${idx}`, text: clean(item.solution) });
    }

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

    if (item.type === 'diagram_concept' || item.type === 'diagram_reference') {
      const title = item.title || item.reference || 'this diagram';
      queue.push({ id: `diag-${idx}`, text: `Looking at ${clean(title)}.` });
      if (item.explanation) queue.push({ id: `diag-exp-${idx}`, text: clean(item.explanation) });
    }

    if (item.type === 'table') {
      if (item.title) queue.push({ id: `tbl-${idx}`, text: clean(item.title) });
      if (Array.isArray(item.rows)) {
        item.rows.forEach((row, rIdx) => {
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
};