/**
 * normalizeMathsContent
 * Maps the rich maths JSON types from mathsPrompt.js into the types the
 * frontend renderer already handles: text, equation, example, diagram_concept,
 * table, subheading. Each type is mapped to preserve ALL teaching fields.
 */
export const normalizeMathsContent = (content) => {
  if (!content?.sections) return content;

  return {
    ...content,
    sections: content.sections.map(section => ({
      ...section,
      content: (section.content || []).map(item => {

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

        if (item.type === 'formula') {
          const varSteps = Array.isArray(item.variables)
            ? item.variables.map(v => ({
              step: `${v.symbol} = ${v.meaning}`,
              explanation: v.unit ? `Unit: ${v.unit}` : '',
            }))
            : [];

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

        if (item.type === 'worked_example') {
          let solutionLines = [];
          const ttsSteps = [];

          if (item.given) { solutionLines.push(`Given: ${item.given}`); ttsSteps.push(`Given: ${item.given}`); }
          if (item.find) { solutionLines.push(`Find: ${item.find}`); ttsSteps.push(`Find: ${item.find}`); }
          if (item.method) { solutionLines.push(`Method: ${item.method}`); ttsSteps.push(`Method: ${item.method}`); }

          if (Array.isArray(item.steps)) {
            item.steps.forEach(s => {
              const stepNum = s.step_no || '';
              if (s.narration) solutionLines.push(`Step ${stepNum}: ${s.narration}`);
              if (s.working) solutionLines.push(`  ${s.working}`);
              if (s.result) solutionLines.push(`  → ${s.result}`);
              const spokenStep = [
                s.narration ? `Step ${stepNum}: ${s.narration}` : '',
                s.working ? s.working : '',
                s.result ? `Result: ${s.result}` : '',
              ].filter(Boolean).join('. ');
              if (spokenStep.trim()) ttsSteps.push(spokenStep);
            });
          }

          if (item.final_answer) { solutionLines.push(`\nFinal Answer: ${item.final_answer}`); ttsSteps.push(`Final Answer: ${item.final_answer}`); }
          if (item.verify) { solutionLines.push(`✓ Check: ${item.verify}`); ttsSteps.push(`Check: ${item.verify}`); }
          if (item.common_mistake) { solutionLines.push(`⚠️ Watch out: ${item.common_mistake}`); ttsSteps.push(`Watch out: ${item.common_mistake}`); }

          const problemHeader = item.example_no
            ? `${item.example_no}: ${item.problem || ''}`
            : item.problem || '';

          return {
            ...item,
            type: 'example',
            problem: problemHeader,
            solution: solutionLines.join('\n'),
            _ttsSteps: ttsSteps,
            _whatThisTestes: item.what_this_tests || '',
          };
        }

        if (item.type === 'exercise') {
          let solutionLines = [];
          const ttsSteps = [];

          if (item.approach) { solutionLines.push(`Approach: ${item.approach}`); ttsSteps.push(`Approach: ${item.approach}`); }

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
              if (part.answer) { solutionLines.push(`  Answer: ${part.answer}`); ttsSteps.push(`Answer: ${part.answer}`); }
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
            if (item.final_answer) { solutionLines.push(`\nAnswer: ${item.final_answer}`); ttsSteps.push(`Answer: ${item.final_answer}`); }
          } else if (item.solution) {
            solutionLines.push(item.solution);
            ttsSteps.push(item.solution);
          }

          if (item.tip) { solutionLines.push(`\n💡 Tip: ${item.tip}`); ttsSteps.push(`Tip: ${item.tip}`); }

          const problemHeader = item.question_no
            ? `${item.question_no}: ${item.problem || ''}`
            : item.problem || '';

          return {
            ...item,
            type: 'example',
            problem: problemHeader,
            solution: solutionLines.join('\n'),
            _ttsSteps: ttsSteps,
          };
        }

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

        return item;
      }),
    })),
  };
};

/**
 * normalizeEnglishContent
 * Maps English prompt types into renderer types.
 *  passage     → text
 *  dialogue    → dialogue
 *  author_note → text (amber badge)
 *  question    → example
 *  glossary    → table
 */
export const normalizeEnglishContent = (content) => {
  if (!content?.sections) return content;
  return {
    ...content,
    sections: content.sections.map(section => ({
      ...section,
      content: (section.content || []).map(item => {

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

        if (item.type === 'question') {
          const problemText = item.question_no
            ? `${item.question_no}: ${item.question_text || ''}`
            : item.question_text || item.problem || '';
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