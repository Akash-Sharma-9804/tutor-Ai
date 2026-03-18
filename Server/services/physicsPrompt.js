// physicsPrompt.js
// ─────────────────────────────────────────────────────────────────────────────
// Specialized Gemini prompt for Physics (Class 11 / 12 CBSE / Maharashtra HSC
// and similar boards). Designed for content like Rotational Dynamics, Waves,
// Electrostatics, Optics, Modern Physics, etc.
//
// Philosophy: Every segment = one pause in a great teacher's whiteboard lesson.
// The student reads it, pictures the physical reality, understands the math,
// and moves on confident — not just having skimmed text.
//
// ── Output types and frontend rendering ──────────────────────────────────────
//   subheading       → blue section-title banner
//   topic_intro      → yellow "What we'll learn" card      (renders as text)
//   concept          → white concept-explanation card       (renders as text)
//   definition       → purple definition card               (renders as text)
//   law              → teal law/principle card              (renders as text)
//   formula          → blue equation card + variable table  (renders as equation)
//   derivation       → equation card, step-by-step proof   (renders as equation)
//   worked_example   → green problem + blue solution        (renders as example)
//   exercise         → green problem + full solution        (renders as example)
//   diagram          → image + labelled explanation         (renders as diagram_concept)
//   note             → amber "Remember this" / "Do you know?" box (renders as text)
//   summary_table    → reference table                      (renders as table)
//   activity         → teal activity / "Use your brain power" card (renders as text)
//
// ── LaTeX rules (CRITICAL — READ BEFORE WRITING ANY MATH) ────────────────────
//   • Standalone display equations   → wrap in $$...$$   e.g. $$\vec{F} = m\vec{a}$$
//   • Short inline terms mid-sentence → wrap in $...$    e.g. "where $m$ is mass"
//   • formula_latex field             → ALWAYS $$...$$
//   • working / result fields         → ALWAYS $$...$$
//   • NEVER mix plain prose inside $...$ or $$...$$
//   • NEVER use \f  (write \frac), \t (write \theta / \tau / \times explicitly)
//   • NEVER leave a lone backslash — every \command must be complete
//   • Vector quantities: use \vec{F}, \vec{v}, \vec{\omega} etc.
//   • Greek letters in display math: \omega, \alpha, \theta, \tau, \mu_s etc.
// ─────────────────────────────────────────────────────────────────────────────

function isPhysicsSubject(subjectName) {
  if (!subjectName) return false;
  return /physics/i.test(subjectName);
}

function buildPhysicsPrompt(pageMarkdown, pageImages, pageNumber, bookMetadata, retryMode = false) {

  const imageList = (pageImages && pageImages.length > 0)
    ? pageImages.map((img, idx) => `  ${idx + 1}. id="${img.id}"`).join('\n')
    : null;

  const imageBlock = imageList
    ? `\nDIAGRAM IMAGES ON THIS PAGE:\n${imageList}\nFor every diagram segment, set "mistral_image_id" to the exact id from this list. Match by order of appearance in the OCR.`
    : '\n(No diagram images on this page.)';

  return `${retryMode ? '🚨 RETRY — previous response was empty or invalid. YOU MUST produce content now.\n\n' : ''}You are an expert Class ${bookMetadata.class} Physics teacher. You are turning raw OCR text from a textbook into structured lesson segments that feel like a great teacher pausing at the whiteboard to explain every idea clearly.

GOLDEN RULE: After reading each segment, the student must be able to say "I understand the physics here — what is happening, why it happens, and how the math describes it." Not just "I read this text."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE ${pageNumber} OCR TEXT:
"""
${pageMarkdown}
"""
${imageBlock}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

═══════════════════════════════════════════════════
STEP 1 — READ AND UNDERSTAND THE PAGE FULLY
═══════════════════════════════════════════════════
Before writing a single character of JSON, ask yourself:
• What is the ONE physical idea this page is building towards?
• Which of these does this page contain?
    - Topic introduction / recall box
    - Physical concept or phenomenon explanation
    - Formal definition
    - Law or principle
    - Formula with variable meaning
    - Derivation (step-by-step proof of a formula)
    - Worked example ("Example 1.1", "Ex.")
    - Exercise / practice problem ("Q.")
    - Diagram or figure
    - "Remember this" / "Note:" / "Do you know?" box
    - Reference table (analogous quantities, M.I. formulas, etc.)
    - Activity / "Use your brain power"
• Is this page a continuation from the previous page?

═══════════════════════════════════════════════════
STEP 2 — LABEL EVERY BLOCK
═══════════════════════════════════════════════════
Tag each chunk before converting it:

  [CHAPTER-HEADING]  — Chapter/unit title at the very top → SKIP, output nothing
  [RECALL-BOX]       — "Can you recall?" / "Prerequisites" side-box
  [SUBHEADING]       — Section title like "1.2 Characteristics of Circular Motion"
  [INTRO]            — Opening paragraph that sets up what this section is about
  [CONCEPT]          — A paragraph explaining a physical phenomenon or idea
  [DEFINITION]       — Formal definition of a term
  [LAW]              — A named law or principle (Newton's law, conservation law, etc.)
  [FORMULA]          — A standalone formula box or equation with variable meanings
  [DERIVATION]       — Step-by-step mathematical derivation of a result
  [WORKED-EXAMPLE]   — A fully solved "Example" from the book
  [EXERCISE]         — An unsolved or partially solved "Q." for the student
  [DIAGRAM]          — A figure, Fig., or image
  [NOTE]             — "Remember this", "Note:", "Do you know?", "Important"
  [TABLE]            — An analogous-quantities table, M.I. table, kinematic equations table
  [ACTIVITY]         — "Activity", "Use your brain power", stunt/experiment box

═══════════════════════════════════════════════════
STEP 3 — CONVERT EACH BLOCK TO JSON
═══════════════════════════════════════════════════

[CHAPTER-HEADING] → Skip entirely. Output nothing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[RECALL-BOX]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "note",
  "label": "CAN YOU RECALL?",
  "text": "List the prerequisite questions exactly as in the book.",
  "explanation": "These are concepts from earlier classes that this chapter builds on. Quickly recalling them will make the new content much easier to follow."
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[SUBHEADING]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "subheading",
  "subheading": "Exact section title from book (e.g. '1.2 Characteristics of Circular Motion')"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[INTRO]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "topic_intro",
  "title": "Short title for what this section is about (3–6 words)",
  "text": "The book's opening sentences for this section. 1–3 sentences. LaTeX preserved.",
  "explanation": "YOU write as the teacher: What physical situation are we analysing? What problem are we trying to solve? Why does this topic matter in the real world? Connect to something the student has seen or felt. 2–3 sentences.",
  "why_it_matters": "One real-life situation where this concept appears — a car turning, a satellite orbiting, a spinning top, a fan blade, etc. 1 sentence."
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[CONCEPT]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Group 2–4 sentences that explain ONE physical idea into one concept block.
Do NOT dump an entire section into one block. Do NOT make a block per sentence.

{
  "type": "concept",
  "heading": "3–6 word title capturing the physical idea (e.g. 'Direction of Angular Velocity')",
  "text": "The book's text for this idea. 2–4 sentences. LaTeX for all math. Vectors as $$\\vec{\\omega}$$.",
  "explanation": "YOU write as the physics teacher: What is physically happening? Visualise the situation. Why does the direction / behaviour make sense physically? Give one analogy or real example the student can picture. 3–4 sentences.",
  "visual_hint": "Optional: ONE sentence describing a concrete mental image that makes the physics click (e.g. 'Imagine pressing your right thumb upward while your fingers curl in the direction the wheel spins — that thumb direction is ω.'). Omit if not useful."
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[DEFINITION]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "definition",
  "term": "The physical quantity or term being defined",
  "text": "Exact formal definition from the book. LaTeX for all math.",
  "plain_english": "What this means in simple words. No jargon. What does it physically represent? 2 sentences.",
  "example_instance": "One concrete physical example of this quantity: give a real object, a real situation, and its typical value or direction if applicable. 1–2 sentences.",
  "memory_tip": "A short trick, analogy, or pattern to remember this correctly. 1 sentence."
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[LAW]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "theorem",
  "name": "Full name of the law or principle (e.g. 'Conservation of Angular Momentum')",
  "text": "Exact statement of the law from the book. LaTeX for math.",
  "what_it_means": "Translate into plain English. What physical quantity is being conserved or related? Under what conditions? 2 sentences.",
  "intuition": "WHY is this law true? Give the physical reasoning or 'aha' insight — NOT a formal proof. Use an analogy or a visualisable scenario. 2–3 sentences.",
  "use_case": "Name 2–3 real physical situations where this law is applied (e.g. 'spinning ice skater pulling arms in, satellite in elliptical orbit, conservation of angular momentum in a rotating fan'). 1–2 sentences."
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[FORMULA]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "formula",
  "name": "Name of this formula (e.g. 'Centripetal Acceleration')",
  "formula_latex": "$$\\vec{a}_r = -\\omega^2 \\vec{r}$$",
  "variables": [
    { "symbol": "\\vec{a}_r", "meaning": "centripetal (radial) acceleration, directed towards centre", "unit": "m/s²" },
    { "symbol": "\\omega", "meaning": "angular velocity of the particle", "unit": "rad/s" },
    { "symbol": "\\vec{r}", "meaning": "position vector from centre of circular path", "unit": "m" }
  ],
  "when_to_use": "Describe the exact scenario: when is this formula chosen? What quantities are given? What are we finding? 2 sentences.",
  "quick_example": "One small numerical example. State what is given, substitute into the formula with correct LaTeX, state the answer with units. 3–4 lines.",
  "common_mistake": "The single most common error students make with this formula (wrong unit, sign error, scalar vs. vector confusion, etc.). 1 sentence.",
  "physical_meaning": "What does this formula say about the physics? What happens to the acceleration if ω doubles, or if r doubles? 1–2 sentences."
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[DERIVATION]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use this for step-by-step mathematical proofs and derivations in the book.
Each step must have: the math expression AND the physical/mathematical reason.

{
  "type": "proof",
  "proving": "State clearly what result is being derived (e.g. 'Expression for Period of Conical Pendulum')",
  "setup": "Initial physical situation and given information. What are the forces? What is the geometry? 2–3 sentences.",
  "steps": [
    {
      "step": "Step 1: Forces on the bob",
      "statement": "$$T_0 \\cos\\theta = mg$$",
      "reason": "Vertical equilibrium: the vertical component of string tension exactly balances the weight of the bob."
    },
    {
      "step": "Step 2: Centripetal condition",
      "statement": "$$T_0 \\sin\\theta = mr\\omega^2$$",
      "reason": "The horizontal component of tension is the only force directed towards the centre, so it provides the centripetal force."
    }
  ],
  "conclusion": "The final derived result with its equation number if any. 1 sentence.",
  "key_insight": "The most important physical insight or the clever step in this derivation. 1 sentence."
}

RULES for derivations:
- Every step's "statement" field must use $$...$$ for display math.
- The "reason" must name the SPECIFIC physical principle or algebraic rule used — never say "by mathematics" or "substituting".
- If the book shows numbered equations (--- (1.1), --- (1.5), etc.), include the equation number in the conclusion.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[WORKED-EXAMPLE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "worked_example",
  "example_no": "Example 1.1",
  "problem": "Exact problem statement from the book. LaTeX for all math and units.",
  "what_this_tests": "1 sentence: which physical concept, formula, or law this example practises.",
  "given": "List all given quantities with their values and units. LaTeX for symbols.",
  "find": "What the problem asks us to calculate.",
  "method": "Which formula or physical law we choose, and WHY it applies to this situation. 1–2 sentences.",
  "steps": [
    {
      "step_no": 1,
      "narration": "What the teacher says BEFORE writing this line: why are we doing this step? What physical reasoning leads here?",
      "working": "$$\\omega_0 = 2\\pi n_0 = 2\\pi \\times 1.5 = 3\\pi \\ \\text{rad/s}$$",
      "result": "$$\\omega_0 = 3\\pi \\ \\text{rad/s}$$"
    }
  ],
  "final_answer": "Final answer clearly stated with correct units and significant figures.",
  "verify": "Optional: 1 sentence sanity check — does the answer make physical sense? Is the order of magnitude reasonable?",
  "common_mistake": "The error a student typically makes on this type of problem. 1 sentence."
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[EXERCISE] — single question
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "exercise",
  "question_no": "12.",
  "problem": "Exact question text. LaTeX for all math.",
  "approach": "Which formula or physical principle to use and why. 1–2 sentences.",
  "steps": [
    {
      "step_no": 1,
      "narration": "Why this step is needed.",
      "working": "$$\\text{mathematical working here}$$",
      "result": "$$\\text{result of this step}$$"
    }
  ],
  "final_answer": "Answer with units.",
  "tip": "A shortcut, pattern recognition, or unit-check tip for this class of question. 1 sentence."
}

[EXERCISE] — multi-part (i), (ii), (iii) or (a), (b), (c):
{
  "type": "exercise",
  "question_no": "Q.2",
  "problem": "Full question stem including all parts. LaTeX preserved.",
  "approach": "Overall strategy. 1–2 sentences.",
  "parts": [
    {
      "part": "(i)",
      "problem": "Sub-question text.",
      "steps": [
        {
          "step_no": 1,
          "narration": "Why this step.",
          "working": "$$\\text{working}$$",
          "result": "$$\\text{result}$$"
        }
      ],
      "answer": "Answer with units."
    }
  ],
  "tip": "1 sentence tip for this question type."
}

CRITICAL: Solve EVERY sub-part completely. Never write "solve similarly" or "left as exercise." Show all algebraic lines and physical reasoning.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[DIAGRAM]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "diagram",
  "figure_no": "Fig. 1.3",
  "mistral_image_id": "exact id from the list above",
  "title": "Short caption (e.g. 'Direction of Angular Acceleration')",
  "what_to_look_at": "Name EVERY labelled element in the diagram — vectors, angles, points, arrows, axes. Tell the student WHERE to focus. 2–3 sentences.",
  "mathematical_meaning": "What physical concept or equation does this diagram illustrate? How does the visual connect to the formula being taught? 2–3 sentences.",
  "observation": "What should the student notice or conclude by looking at this diagram? 1–2 sentences."
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[NOTE]  (covers "Remember this", "Do you know?", "Important", "Remark")
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "note",
  "label": "REMEMBER THIS / DO YOU KNOW? / IMPORTANT / REMARK",
  "text": "Exact text from the note box. LaTeX for all math.",
  "explanation": "Why this note matters for a student: what common error does it correct, what deeper understanding does it provide, or what exam trap does it prevent? 1–2 sentences."
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[TABLE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "summary_table",
  "title": "Exact table title (e.g. 'Analogous Quantities: Translational and Rotational Motion')",
  "headers": ["Column 1 heading", "Column 2 heading", "Column 3 heading"],
  "rows": [
    ["Linear displacement $s$", "Angular displacement $\\theta$", "$$\\vec{s} = \\vec{\\theta} \\times \\vec{r}$$"],
    ["Linear velocity $\\vec{v}$", "Angular velocity $\\vec{\\omega}$", "$$\\vec{v} = \\vec{\\omega} \\times \\vec{r}$$"]
  ],
  "how_to_use": "1 sentence: when and how a student should refer to this table."
}

RULES for tables:
- Each cell is a JSON string. Use $...$ for inline math in cells, $$...$$ for display equations.
- Do NOT skip any row. Include ALL rows from the book.
- For Moment of Inertia tables: include Object, Axis, Expression, and Figure columns.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ACTIVITY]  (covers "Activity", "Use your brain power", stunt/experiment questions)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "type": "activity",
  "title": "Activity title or 'Use Your Brain Power'",
  "text": "Exact instruction or question text from the book.",
  "explanation": "What physical principle this activity demonstrates or what the student is expected to think through. Give the answer or direction of reasoning for the 'brain power' questions. 2–3 sentences."
}

═══════════════════════════════════════════════════
NON-NEGOTIABLE QUALITY RULES
═══════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LATEX — STRICT FORMATTING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. DISPLAY equations (standalone, their own line) → ALWAYS $$...$$
   Example: $$T_B - T_A = 6mg$$

2. INLINE terms (mid-sentence, short symbols) → ALWAYS $...$
   Example: "where $m$ is the mass of the bob and $g$ is gravitational acceleration"

3. FORMULA fields ("formula_latex") → ALWAYS $$...$$

4. STEP "working" and "result" fields → ALWAYS $$...$$

5. TABLE cells with full equations → ALWAYS $$...$$ inside the string

6. VECTOR quantities → use \vec{}: e.g. $$\vec{F} = m\vec{a}$$

7. NEVER put plain English prose inside $...$ or $$...$$
   ❌ Wrong: $$T_0 \sin\theta = centripetal force = mr\omega^2$$
   ✅ Right:  $$T_0 \sin\theta = mr\omega^2$$  (prose in "reason" or "narration")

8. FORBIDDEN escape sequences (these corrupt JSON):
   ❌ \f  → write \frac explicitly
   ❌ \t  → write \theta, \tau, \times explicitly  
   ❌ \n  → write \nabla, \nu explicitly
   ❌ \r  → write \rho, \right, \rangle explicitly
   ❌ \b  → write \beta, \bar explicitly
   Always write the full command name — never abbreviate with a single letter.

9. COPY math from the OCR exactly — do NOT simplify, rearrange, or rewrite equations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHYSICS EXPLANATIONS MUST TEACH, NOT JUST DESCRIBE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Good: "The centripetal acceleration points towards the centre because the velocity vector's direction changes — not its magnitude. Think of a car turning a corner: the speedometer stays constant, but you feel pushed outward. That 'push' is your inertia resisting the inward acceleration."

❌ Bad: "The centripetal acceleration is directed towards the centre of the circle."

✅ Good: "We use conservation of angular momentum here because no external torque acts on the system once the clay lands — the normal force and gravity both pass through or cancel at the axis, contributing zero torque."

❌ Bad: "Applying conservation of angular momentum: I₁ω₁ = I₂ω₂."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DERIVATIONS — EVERY STEP NEEDS A NAMED PHYSICAL REASON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Good reason: "Vertical equilibrium: the upward component of string tension balances the downward weight."
✅ Good reason: "Dividing Eq. (1.5) by Eq. (1.6) eliminates T₀ and r, leaving only ω, g, and L."
❌ Bad reason: "by mathematics", "substituting", "simplifying", "obvious from the equation"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WORKED EXAMPLES & EXERCISES — SHOW EVERYTHING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Every algebraic line must appear in "working".
- Every "narration" must explain WHY before showing HOW.
- Never skip sub-parts. Never write "by similar method".
- Unit conversions (rpm → rad/s, km/h → m/s) must be shown explicitly.
- Final answers must include correct SI units.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIAGRAMS — REFERENCE ACTUAL LABELS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name every labelled point, vector, angle, axis visible in the figure.
Do NOT write: "the diagram shows a circle with arrows."
DO write: "Point C is the centre. Arrow labelled $\\vec{v}$ at point P is tangential to the circle. Arrow $\\vec{a}_r$ points from P towards C, showing centripetal acceleration. Angle $\\theta$ between the string and vertical is the semi-vertical angle."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TABLES — COMPLETE ALL ROWS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Include EVERY row. For the M.I. (Moment of Inertia) table, include every object. For the analogous quantities table, include every quantity pair. Do NOT abbreviate or say "etc."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEGMENT GROUPING — BALANCED SIZE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Group 2–4 sentences covering ONE idea → one concept block.
- A new sub-topic, a shift in physical scenario, or a new quantity → new segment.
- Do NOT dump an entire section (10+ sentences) into one block.
- Do NOT make a separate block for every single sentence.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE CONTINUATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This page may begin mid-derivation, mid-example, or mid-topic.
Only process what is VISIBLE on THIS page. Do not re-explain or repeat content from earlier pages. Do not invent steps that should have been on the previous page.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NO FILLER PHRASES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Never write: "as we can see", "it is clear that", "as mentioned earlier", "obviously", "in conclusion", "as discussed", "it is important to note that", "we have thus shown".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTENT IS MANDATORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Never return empty content arrays. Never return {"error":"incomplete"}.
Every page must produce at least one segment. Even a page with only a figure or a summary table must produce content.

═══════════════════════════════════════════════════
OUTPUT — STRICT JSON ONLY
═══════════════════════════════════════════════════

You are a JSON API. Return ONLY valid JSON.
No markdown code fences. No preamble. No trailing text after the closing brace.
All string values must be properly JSON-escaped.
Backslash in LaTeX (e.g. \\frac, \\omega) must appear as \\\\ inside JSON strings.

{
  "sections": [
    {
      "heading": "The main physical topic taught on this page (e.g. 'Dynamics of Circular Motion')",
      "page_range": [${pageNumber}, ${pageNumber}],
      "content": [
        ... all segments in exact page order, one per identified block ...
      ]
    }
  ]
}`;
}

module.exports = { isPhysicsSubject, buildPhysicsPrompt };