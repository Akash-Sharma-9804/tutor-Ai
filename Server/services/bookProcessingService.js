const axios = require("axios");
const path = require("path");
const { uploadFileToFTP } = require("./uploadToFTP");
// console.log("hehe boii");
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMBEDDING_MODEL = "text-embedding-3-small";

// Rate limiting helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate embedding for text
 */
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("❌ Failed to generate embedding:", error);
    throw error;
  }
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 5000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.response?.status === 429 && i < maxRetries - 1) {
        const waitTime = initialDelay * Math.pow(2, i);
        console.log(
          `⏳ Rate limited. Waiting ${waitTime / 1000}s before retry ${
            i + 1
          }/${maxRetries}...`,
        );
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }
}

/**
 * Process a page range (chunk) of PDF with Gemini
 * @param {string} pdfBase64 - Base64 encoded PDF
 * @param {number} startPage - Starting page number
 * @note Processes a SINGLE page only (page-locked)

 * @param {object} bookMetadata - Book metadata
 * @returns {Promise<Array>} - Array of processed sections
 */
async function processPageChunk(
  pageText,
  startPage,
  bookMetadata,
  chunkIndex,
  retryMode = false,
  pageImageBase64 = null
)

{

  console.log(
  `\n📄 Processing page ${startPage} (Chunk ${chunkIndex})...`,
);


 const geminiRes = await retryWithBackoff(
      async () => {
        console.log(`🔧 Calling Gemini API for page ${startPage}...`);
        
        // Verify API key exists
        if (!process.env.GEMINI_API_KEY) {
          throw new Error("GEMINI_API_KEY is not set in environment variables");
        }
        
      const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const response = await axios.post(
`https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [
                {
                 text: `${retryMode ? 
`🚨🚨🚨 CRITICAL - RETRY MODE ACTIVATED 🚨🚨🚨

THE PREVIOUS ATTEMPT FAILED - IT RETURNED EMPTY CONTENT OR INVALID DATA.

MANDATORY REQUIREMENTS FOR THIS RETRY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. You MUST generate content for this page - empty responses are NOT acceptable
2. Even if the page text seems minimal or unclear, create at least 1-3 content items
3. If there's ANY diagram/figure/image mentioned, include it with explanation
4. Every content item needs an explanation (minimum 2 sentences)
5. Return VALID JSON with properly populated content arrays
6. DO NOT return empty [] for the content field under any circumstances
7. DO NOT return {"error":"incomplete"}

THIS IS YOUR FINAL ATTEMPT - GENERATE CONTENT NOW!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

` 
: ""}

You are an expert CBSE Class ${bookMetadata.class} ${bookMetadata.subject} teacher creating study material for Class ${bookMetadata.class} students.

PAGE CONTINUATION RULE (CRITICAL):
- This page may be a continuation from the previous page.
- DO NOT restate earlier explanations or definitions.
- ONLY explain what is present on THIS page.
- If a derivation, example, or explanation starts mid-way, continue ONLY from the visible steps.
- Do NOT assume missing steps — they may exist on previous pages.

- NEVER say “cannot solve” or “beyond class level” — ALWAYS solve using the visible information.

The following text is EXACTLY from page ${startPage} of the textbook.
Do NOT add, repeat, or infer content from any other page.

TEXT FROM PAGE ${startPage}:
"""
${pageText}
"""

DIAGRAMS DETECTED ON THIS PAGE ONLY:
${pageText.toLowerCase().includes('fig') || pageText.toLowerCase().includes('diagram') || pageText.toLowerCase().includes('image') || pageText.toLowerCase().includes('picture') || pageText.toLowerCase().includes('observe') || pageText.toLowerCase().includes('activity') || pageText.toLowerCase().includes('look') ? 
  `🚨🚨🚨 VISUAL ELEMENTS DETECTED ON THIS PAGE 🚨🚨🚨
  
  YOU MUST INCLUDE DIAGRAM OBJECTS WITH EXPLANATIONS:
  - Use "diagram_concept" for educational diagrams (with 3-5 sentence explanation)
  - Use "diagram_reference" for activity/observation images (with 1-2 sentence explanation)
  - NEVER skip diagrams or leave explanation fields empty
  - Format: {"type": "diagram_concept", "title": "...", "explanation": "..."}` 
  : 
  'No obvious diagram keywords found, but carefully check for any visual content.'}

Now analyze the text carefully and create detailed, student-friendly explanations appropriate for Class ${bookMetadata.class} level.

⚠️⚠️⚠️ CONTENT GENERATION IS MANDATORY ⚠️⚠️⚠️
Every page MUST have content in the content array. Even if text is minimal, generate at least 1-2 items.

📝 HANDLING PAGES WITH MINIMAL TEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If this page has very little text (under 50 characters), you MUST still:

1. Extract ANY visible text and include it as a "text" content item
2. Provide explanation based on what you CAN see
3. If there's a heading/title, include it as "subheading" type
4. If there's a diagram reference, include it with explanation
5. If the page appears to be mostly visual, describe what type of visual content it likely contains

NEVER return empty content arrays, even for near-empty pages.

Example for minimal text page:
{
  "sections": [{
    "heading": "Page Content",
    "page_range": [${startPage}, ${startPage}],
    "content": [
      {
        "type": "text",
        "text": "[whatever text is visible, even if just a word or two]",
        "explanation": "This appears to be [describe what you can infer from the minimal text - a title, a caption, a heading, etc.]"
      }
    ]
  }]
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL INSTRUCTIONS:
1. FIRST classify the content type:
   - THEORY / CONCEPT → explain line by line.
   - EXERCISE / QUESTION / NUMERICAL / PROBLEM → SOLVE completely.

2. DO NOT treat questions like theory.


3. GROUPING RULE (VERY IMPORTANT):
   - DO NOT create a separate content block for every single line.
   - Merge consecutive related lines into ONE meaningful paragraph.
   - Each "text" block MUST represent a complete idea or thought
from the textbook and contain at least 2–4 logically connected sentences.
Do NOT split content just because of line breaks in the PDF.

   - Do NOT split content unless the topic clearly changes.

4. HANDLING RULES BASED ON CONTENT TYPE:

A. THEORY / CONCEPT CONTENT:
   - Explain line by line in 2–3 sentence segments.
   - Use simple language suitable for Class ${bookMetadata.class}.
   - Explain meanings, ideas, and real-life relevance.

B. EXERCISES / QUESTIONS / PROBLEMS:
   - Detect by patterns such as:
     • numbering (1.1, 1.14, 2.3, etc.)
     • question words ("What is", "Find", "Calculate", "Determine", "Solve")
     • parts like (a), (b), (c)
     • presence of numbers, units, symbols, or equations
   - DO NOT explain the question text.
   - SOLVE the problem fully, step by step, like a teacher.

   - Structure solutions as:
     {
       "type": "example",
       "problem": "Exact question text from the PDF",
       "solution": "Clear step-by-step solution explaining each step"
     }

C. EQUATIONS / FORMULAS (STRICT):

- The equation string MUST be copied EXACTLY as it appears in the PDF text.
- Do NOT reorder symbols.
- Do NOT simplify the equation text itself.
- Preserve:
  • subscripts
  • superscripts
  • Greek letters
  • vector notation
- Explanation and derivation go in separate fields ONLY.

   - When an equation or formula appears or is used, output:
     {
       "type": "equation",
       "equation": "Equation as written in the PDF",
       "derivation": [ 
         {
           "step": "Step 1",
           "explanation": "Why this step is taken, explained at Class ${bookMetadata.class} level"
         }
       ],
       "final_result": "Final simplified result",
       "application": "Where and how students use this equation"
     }

6. Do NOT skip ANY text from the page. Even minimal text needs explanation.

7. DIAGRAM HANDLING (CRITICAL AND NON-NEGOTIABLE):

7a. DETECTION - Include diagrams if the page mentions:
    - "Fig", "Figure", "Diagram", "Image", "Picture", "observe", "activity", "look at"
    - Any numbered figures (e.g., "Fig 1.1", "Figure 2")
    - Visual references ("as shown", "see the diagram", "in the picture")

7b. CLASSIFICATION:
    - diagram_concept: Scientific/mathematical/geographic educational diagrams
    - diagram_reference: Activity images, observation tasks, craft instructions

7c. EXPLANATION REQUIREMENTS (MANDATORY):
    ✓ diagram_concept → MUST have 3-5 sentence detailed explanation
    ✓ diagram_reference → MUST have 1-2 sentence description
    ✓ NEVER leave explanation field empty or use just "note" field
    ✓ If unsure, write at minimum: "This diagram relates to [topic] discussed above"

7d. OUTPUT FORMAT:
    For concepts: {"type": "diagram_concept", "title": "Diagram title", "explanation": "Detailed 3-5 sentences explaining what students learn"}
    For activities: {"type": "diagram_reference", "title": "Activity name", "explanation": "Brief 1-2 sentence purpose"}

7e. PLACEMENT RULES:
    - Expand figure captions, don't copy them verbatim
    - Place diagram objects BEFORE the text referring to them
    - Never mention diagrams from other pages
    - Each diagram needs its own complete object
7f. DO NOT embed diagram explanation inside normal text blocks
7g. Place the diagram object BEFORE the text that refers to it
7h. NEVER describe or reference diagrams from any other page

DIAGRAM OUTPUT EXAMPLES:

Example 1 (Science diagram):
{
  "type": "diagram_concept",
  "title": "Structure of a Plant Cell",
  "explanation": "This diagram shows the internal structure of a plant cell with all its major organelles. The cell wall provides rigid structure, while the cell membrane controls what enters and exits. Inside, we can see the nucleus (control center), chloroplasts (for photosynthesis), and vacuole (storage). This helps students visualize how different parts work together to keep the cell functioning."
}

Example 2 (Activity image):
{
  "type": "diagram_reference", 
  "title": "Observation Activity",
  "explanation": "This image supports the hands-on activity where students observe different materials"
}



STRUCTURAL RULES (VERY IMPORTANT):

A. PAGE / CHAPTER HEADINGS
- If a line is a page title or chapter heading (large font, centered, repeated on pages),
  DO NOT include it in the output at all.
- Example to IGNORE completely:
  "Electric Charges and Fields"

B. SUBHEADINGS / SECTION TITLES (STRUCTURAL ONLY)
- Subheadings are STRUCTURAL MARKERS, not learning content.
- If a line is a section title, numbered heading, or subsection label
  (e.g. "1.1 INTRODUCTION", "2.3 Climate of India", "Chapter 4 Minerals"),
 output ONLY:

{
  "type": "subheading",
  "subheading": "exact heading text"
}

  

- NEVER include subheading text inside any "text" block.
- NEVER explain, paraphrase, or expand a subheading.
- The content following a subheading must be explained, not the subheading itself.


C. BODY TEXT
- Only body paragraphs should be treated as explainable text.

YOU ARE A JSON API.  
RETURN ONLY VALID JSON.  
DO NOT include markdown, explanations, comments, or trailing text.

CONTENT GENERATION REQUIREMENTS (CRITICAL):

1. NEVER return empty content arrays - every page has something to explain
2. If page has very little text, still analyze and explain what IS there
3. If a diagram exists, explanation is MANDATORY
4. DO NOT return {"error":"incomplete"} - always try to generate content
5. If content is too long, prioritize:
   - All text blocks (merged properly)
   - All diagrams with explanations
   - All equations with derivations
   - All examples with solutions

6. MINIMUM OUTPUT REQUIREMENT:
   - Every page MUST have at least 1-2 content items in the "content" array
   - Even if page only has a heading and diagram, output both
   - Never output empty [] for content field

CRITICAL RULES (NON-NEGOTIABLE):
- Output MUST be valid JSON
- NO trailing commas
- NO missing brackets
- NO text outside JSON
- DO NOT include fields named: key_terms, simplified, summary, bullet_points

- If you cannot finish, return EXACTLY:
  {"error":"incomplete"}

OUTPUT FORMAT (STRICT JSON ONLY):

{
  "sections": [
    {
      "heading": "Main topic or section heading from this page",
      "page_range": [${startPage}, ${startPage}],
      "content": [

        {
  "type": "text",
  "text": "2-3 sentences exactly as written in the PDF",
  "explanation": "A clear, connected explanation of AT LEAST 2–4 full sentences. 
Explain the idea like a teacher in class, connecting sentences together.
Do NOT repeat the same sentence in different words. 
Focus on meaning, cause, and understanding."

}
,
             {
          "type": "diagram_concept",
          "title": "Name or caption of the educational diagram",
          "explanation": "Detailed 3-5 sentence explanation: What does this diagram show? What are the key components? How does it help understand the concept? What should students observe? Example: 'This diagram shows the water cycle, illustrating how water moves through different states. The arrows indicate the direction of water movement from evaporation to condensation to precipitation. Students can see how the sun's energy drives this continuous process. This helps visualize the concept that water constantly recycles in nature.'"
        },
        {
          "type": "diagram_reference",
          "title": "Activity or observation image name",
          "explanation": "Brief 1-2 sentence purpose. Example: 'This image shows the materials needed for the observation activity. Students should use this as a reference while conducting their experiment.'"
        }
,

        {
          "type": "example",
          "problem": "Example problem from PDF",
          "solution": "Step-by-step solution with explanation of each step"
        },

        {
          "type": "equation",
          "equation": "EXACT equation text copied verbatim from the PDF"

          "derivation": [
            {
              "step": "Step 1: Starting equation or given information",
              "explanation": "Why we start here and what it means for Class ${bookMetadata.class} students"
            },
            {
              "step": "Step 2: Next mathematical operation",
              "explanation": "What operation we performed and why (using Class ${bookMetadata.class} level mathematics)"
            }
          ],
          "final_result": "Final simplified form",
          "application": "When and how Class ${bookMetadata.class} students would use this equation"
        }
      ]
    }
  ]
}

QUALITY REQUIREMENTS:
- Explanations must be LONG, clear, and teacher-like (5–8 sentences if needed)
- Explain WHY concepts work, not just WHAT they are
- Use real-life analogies familiar to Class ${bookMetadata.class} students
- For diagrams: explain every visible part and interaction
- For equations: explain every step and the rule used
- Maintain strict JSON validity at all times


QUALITY REQUIREMENTS:
- Explanations must be 3-5 complete sentences, tailored for Class ${bookMetadata.class} comprehension level
- Use analogies and real-life examples relevant to Class ${bookMetadata.class} students' experiences
- For EVERY equation/formula: provide step-by-step derivation with explanation for EACH step
- For EVERY mathematical problem: show complete working, explain each operation, and verify the answer
- Explain WHY things work, not just WHAT they are, using reasoning appropriate for Class ${bookMetadata.class}
- Make it conversational like a Class ${bookMetadata.class} teacher explaining to their student
- For diagrams: explain what each part represents and how they connect
- Use mathematical terminology that Class ${bookMetadata.class} students have learned
- When solving equations, explain the mathematical rules (like "inverse operations") being applied`,
                },
               ...(pageImageBase64 ? [{
  inlineData: {
    mimeType: "image/webp",
    data: pageImageBase64
  }
}] : []),


              ],
            },
          ],
          generationConfig: {
  temperature: 0.2,
  topP: 0.9,
  maxOutputTokens: 16384
},
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ],


        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 180000, // 3 minutes per chunk (for detailed processing)
        },
     );
      
      // Check if response is valid
      if (!response || !response.data) {
        throw new Error("Invalid response structure from Gemini API");
      }
      
      if (response.data.error) {
        console.error("Gemini API Error:", response.data.error);
        throw new Error(`Gemini API Error: ${response.data.error.message || 'Unknown error'}`);
      }
      
      return response;
    },
    3,
    5000,
  );

  // Parse response
  const rawOutput =
  geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // ⚠️ VALIDATION: Check if response is too short or empty
  if (!rawOutput || rawOutput.trim().length < 50) {
    console.error(`❌ Empty or too short response from Gemini for page ${startPage}`);
    console.error(`Response length: ${rawOutput.length} chars`);
    
    if (!retryMode) {
      console.log(`🔄 Retrying page ${startPage} due to empty response...`);
      await delay(3000);
      return await processPageChunk(pageText, startPage, bookMetadata, chunkIndex, true);
    }
    
    throw new Error("EMPTY_RESPONSE_FROM_GEMINI");
  }


  // Robust JSON cleaning to handle all markdown variations
  let cleanedOutput = rawOutput.trim();

  // Remove all variations of markdown code blocks (global replace)
  cleanedOutput = cleanedOutput.replace(/```json\s*/gi, "");
  cleanedOutput = cleanedOutput.replace(/```\s*/g, "");
 cleanedOutput = cleanedOutput.trim();

// 🔥 Strip unstable fields if model sneaks them in
cleanedOutput = cleanedOutput.replace(
  /"key_terms"\s*:\s*\[[^\]]*\]\s*,?/gi,
  ""
);

cleanedOutput = cleanedOutput.replace(
  /"simplified"\s*:\s*"[^"]*"\s*,?/gi,
  ""
);


  // Additional safety: remove any remaining backticks at start/end
  while (cleanedOutput.startsWith("`")) {
    cleanedOutput = cleanedOutput.substring(1);
  }
  while (cleanedOutput.endsWith("`")) {
    cleanedOutput = cleanedOutput.substring(0, cleanedOutput.length - 1);
  }

  cleanedOutput = cleanedOutput.trim();

  // Find JSON boundaries if needed
  // Find JSON boundaries and extract only the JSON part
  const jsonStart = cleanedOutput.indexOf("{");
  const jsonEnd = cleanedOutput.lastIndexOf("}");
  
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    // Extract only the JSON portion, removing any trailing text
    cleanedOutput = cleanedOutput.substring(jsonStart, jsonEnd + 1);
  }


  try {
    if (cleanedOutput.includes('"error":"incomplete"')) {
  throw new Error("MODEL_RETURNED_INCOMPLETE_JSON");
}

// 🔥 Pre-sanitize: fix unescaped control characters inside JSON string values
// This handles raw newlines, tabs, and backslashes that break JSON.parse
function sanitizeJsonString(str) {
  // Fix unescaped newlines/tabs inside string values only
  // Replace literal newlines inside quoted strings with \n
  return str.replace(/"((?:[^"\\]|\\.)*)"/gs, (match, inner) => {
    const fixed = inner
      .replace(/\r\n/g, '\\n')
      .replace(/\r/g, '\\n')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t');
    return `"${fixed}"`;
  });
}

let chunkData;
try {
  chunkData = JSON.parse(cleanedOutput);
} catch (e) {
  console.log("🧠 JSON broken, trying auto-repair...");

  let fixed = cleanedOutput;

  // 🛠️ Step 1: Sanitize unescaped newlines inside string values
  try {
    fixed = sanitizeJsonString(fixed);
  } catch(sanitizeErr) {
    // ignore sanitize error, continue with original
  }

  // 🛠️ Step 2: Auto-fix common JSON structural issues
  fixed = fixed.replace(/,\s*}/g, "}"); // trailing commas before }
  fixed = fixed.replace(/,\s*]/g, "]"); // trailing commas before ]

  // 🛠️ Step 3: Close missing brackets if needed
  const openBraces = (fixed.match(/{/g) || []).length;
  const closeBraces = (fixed.match(/}/g) || []).length;
  const openBrackets = (fixed.match(/\[/g) || []).length;
  const closeBrackets = (fixed.match(/]/g) || []).length;

  if (closeBraces < openBraces) {
    fixed += "}".repeat(openBraces - closeBraces);
  }
  if (closeBrackets < openBrackets) {
    fixed += "]".repeat(openBrackets - closeBrackets);
  }

  try {
    chunkData = JSON.parse(fixed);
    console.log("✅ JSON auto-repaired successfully!");
  } catch (e2) {
    console.log("❌ Auto-repair failed, retrying with simplified prompt...");
    throw new Error("RETRY_CHUNK");
  }
}


// 🔒 Normalize subheading structure (frontend-safe)
chunkData.sections?.forEach((section, sectionIndex) => {
  section.content = section.content?.map((item, contentIndex) => {

    // normalize subheading
    if (item.type === "subheading") {
      return {
        type: "subheading",
        subheading: item.subheading || item.text || ""
      };
    }

    // 🔥 ADD METADATA FOR DIAGRAMS
    if (item.type === "diagram_concept" || item.type === "diagram_reference") {
      return {
        ...item,
        page: section.page_range?.[0],        // ✅ page number
        segment_index: contentIndex           // ✅ position in page
      };
    }

    return item;
  });
});


// 🧠 Ensure every diagram has an explanation
chunkData.sections?.forEach(section => {
  section.content = section.content?.map(item => {
    if (item.type === "diagram" && !item.description) {
  throw new Error("DIAGRAM_EXPLANATION_MISSING");
}

    return item;
  });
});


  console.log(
      `✅ Chunk ${chunkIndex}: Processed ${
        chunkData.sections?.length || 0
      } sections`,
    );

    // Count total segments
    const totalSegments =
      chunkData.sections?.reduce(
        (sum, section) => sum + (section.content?.length || 0),
        0,
      ) || 0;
    console.log(`   Total segments in chunk: ${totalSegments}`);

    // ⚠️ CRITICAL VALIDATION: Check for empty or missing content
    const hasNoSections = !chunkData.sections || chunkData.sections.length === 0;
    const hasEmptyContent = chunkData.sections?.some(
      section => !section.content || section.content.length === 0
    );

    if (hasNoSections || hasEmptyContent || totalSegments === 0) {
      console.warn(`⚠️⚠️⚠️ EMPTY CONTENT DETECTED for page ${startPage}`);
      console.warn(`  - Has sections: ${!hasNoSections}`);
      console.warn(`  - Has empty content: ${hasEmptyContent}`);
      console.warn(`  - Total segments: ${totalSegments}`);
      
      // If this is not already a retry, try once more with stricter instructions
      if (!retryMode) {
        console.log(`🔄 RETRYING page ${startPage} with strict content requirements...`);
        await delay(3000); // Wait before retry
        return await processPageChunk(pageText, startPage, bookMetadata, chunkIndex, true);
      }
      
      // If retry also failed, create minimal fallback content
      console.warn(`⚠️ CREATING FALLBACK CONTENT for page ${startPage} (retry failed)`);
      const fallbackText = pageText.substring(0, 500).trim() || "Page content available";
      
      return [{
        heading: `Content from Page ${startPage}`,
        page_range: [startPage, startPage],
        content: [
          {
            type: "text",
            text: fallbackText,
            explanation: "This page contains content that requires manual review. The automated processing was unable to generate detailed explanations. Please review the source material directly."
          }
        ]
      }];
    }

    // ⚠️ FIX: Ensure all diagrams have explanations
    chunkData.sections?.forEach((section, sIdx) => {
      section.content?.forEach((item, iIdx) => {
        // Fix diagram_concept without explanation
        if (item.type === "diagram_concept" && !item.explanation) {
          console.warn(`⚠️ Adding missing explanation for diagram_concept in section ${sIdx}`);
          item.explanation = "This diagram illustrates an important concept related to the topic being discussed.";
        }
        // Fix diagram_reference with only note field
        if (item.type === "diagram_reference") {
          if (!item.explanation && item.note) {
            // Convert note to explanation
            item.explanation = item.note;
            delete item.note;
          } else if (!item.explanation && !item.note) {
            item.explanation = "This image supports the learning activity or observation task.";
          }
        }
      });
    });

    return chunkData.sections || [];
} catch (parseError) {
    console.error(`❌ JSON Parse Error for chunk ${chunkIndex}`);
    console.error("Parse error:", parseError.message);
    
    // Check if this is a 404 error
    if (parseError.message && parseError.message.includes('404')) {
      console.error('❌ 404 ERROR - This usually means:');
      console.error('   1. Invalid model name (check if gemini-1.5-flash-latest is available)');
      console.error('   2. Invalid API key');
      console.error('   3. API endpoint URL is wrong');
      console.error('   4. Gemini API access not enabled for your project');
      
      // Create fallback content for 404 errors
      console.warn(`⚠️ Creating fallback content for page ${startPage} due to API error`);
      return [{
        heading: `Content from Page ${startPage}`,
        page_range: [startPage, startPage],
        content: [
          {
            type: "text",
            text: pageText.substring(0, 500).trim() || "Page content",
            explanation: "Content extraction failed due to API error. Please check: 1) Gemini API key is valid, 2) Model name is correct, 3) API access is enabled. Manual review required."
          }
        ]
      }];
    }
    
    console.error("First 500 chars:", cleanedOutput?.substring(0, 500) || "No output");
    console.error(
      "Last 500 chars:",
      cleanedOutput?.substring(Math.max(0, (cleanedOutput?.length || 0) - 500)) || "No output",
    );

    // Try to salvage partial JSON by adding missing closing braces
   throw new Error("INVALID_JSON_FROM_MODEL");

  }
}
/**
 * Split PDF into smaller page chunks for processing
 * @param {number} totalPages - Total pages in PDF (estimated)
 * @param {number} chunkSize - Pages per chunk
 * @returns {Array} - Array of {startPage, endPage} objects
 */
function createPageChunks(totalPages, chunkSize = 10) {
  const chunks = [];
  for (let i = 1; i <= totalPages; i += chunkSize) {
    chunks.push({
      startPage: i,
      endPage: Math.min(i + chunkSize - 1, totalPages),
    });
  }
  return chunks;
}

/**
 * Convert PDF pages to images in batches to avoid FTP timeout
 */
async function convertPDFPagesSequential(pdfBuffer, bookMetadata) {
  const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
  const { createCanvas } = require("canvas");

  const pdfData = new Uint8Array(pdfBuffer);
  const pdf = await pdfjsLib.getDocument({ 
    data: pdfData,
    useSystemFonts: true,
    disableFontFace: false,
  }).promise;

  const uploadedPages = [];
  const BATCH_SIZE = 5; // Process 5 pages at a time in parallel

  for (
    let batchStart = 1;
    batchStart <= pdf.numPages;
    batchStart += BATCH_SIZE
  ) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, pdf.numPages);
    console.log(`\n📦 Processing image batch: pages ${batchStart}-${batchEnd}`);

    // Process batch in parallel
    const batchPromises = [];

    for (let pageNum = batchStart; pageNum <= batchEnd; pageNum++) {
      const pagePromise = (async (num) => {
        try {
          console.log(`🖼 Rendering page ${num}/${pdf.numPages}`);

          const page = await pdf.getPage(num);
          const viewport = page.getViewport({ scale: 2 });

          const canvas = createCanvas(viewport.width, viewport.height);
          const ctx = canvas.getContext("2d");

          await page.render({ canvasContext: ctx, viewport }).promise;

        

          // 🔹 Extract text + positions for highlighting
        // 🔹 Extract text + positions for highlighting
const textContent = await page.getTextContent();

const rawLines = textContent.items.map((item) => {
  const [a, b, c, d, e, f] = item.transform;

  return {
    text: item.str,
    bbox: {
      x: e * 2,
      y: (viewport.height - f) * 2,
      w: item.width * 2,
      h: item.height * 2,
    },
  };
});

const scaledHeight = viewport.height * 2;

// Filter lines to remove headers, footers, and noise
const lines = rawLines.filter(l => {
  // ❌ Remove headers (top 5%)
  if (l.bbox.y < scaledHeight * 0.05) return false;

  // ❌ Remove footers (bottom 5%)
  if (l.bbox.y > scaledHeight * 0.95) return false;

  // ❌ Remove tiny stray text (page numbers, running headers)
  if (l.bbox.h < 12 && l.text.trim().length < 10) return false;

  return true;
});

const pageText = lines
  .map(l => l.text)
  .join(" ")
  .replace(/\s+/g, " ")
  .trim();


// 📐 Detect diagram bounding boxes (NOW lines exists)
// 📐 Detect diagram bounding boxes (use rawLines for detection)
const diagrams = detectDiagrams(
  rawLines,
  viewport.width * 2,
  viewport.height * 2
);

// 🎯 Crop each diagram accurately
const diagramImages = [];

for (let i = 0; i < diagrams.length; i++) {
  const d = diagrams[i];

  const dCanvas = createCanvas(d.w, d.h);
  const dCtx = dCanvas.getContext("2d");

  dCtx.drawImage(
    canvas,
    d.x,
    d.y,
    d.w,
    d.h,
    0,
    0,
    d.w,
    d.h
  );

  const diagramWebp = dCanvas.toDataURL("image/webp", 0.8);
  const diagramBuffer = Buffer.from(diagramWebp.split(",")[1], "base64");

  const diagramPath = await uploadFileToFTP(
    diagramBuffer,
    `page-${num}-diagram-${i + 1}.webp`,
    `${remoteDir}/diagrams`
  );

  diagramImages.push({
    id: `p${num}_d${i + 1}`,
    page: num,
    image_path: diagramPath.remotePath,
    bbox: d,
    caption: d.caption,
  });
}

// 🔍 Detect diagram regions (layout-based, deterministic)
function detectDiagrams(lines, pageWidth, pageHeight) {
  // sort lines top → bottom
  const sorted = [...lines].sort((a, b) => a.bbox.y - b.bbox.y);

  const diagrams = [];
  let prevBottom = 0;

  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i];

    const gap = curr.bbox.y - prevBottom;

    // large vertical gap → possible diagram
    if (gap > 100 || /fig|figure/i.test(curr.text)) {

      // look ahead for caption
      const caption = sorted.find(
        l =>
          l.bbox.y > prevBottom &&
          l.bbox.y < curr.bbox.y &&
          /fig|figure/i.test(l.text)
      );

      if (caption) {
        diagrams.push({
          x: 0,
          y: prevBottom,
          w: pageWidth,
          h: curr.bbox.y - prevBottom,
          caption: caption.text,
        });
      }
    }

    prevBottom = Math.max(prevBottom, curr.bbox.y + curr.bbox.h);
  }

  return diagrams;
}

          const webpData = canvas.toDataURL("image/webp", 0.7);
          const imgBuffer = Buffer.from(webpData.split(",")[1], "base64");

        const remoteDir = `/books/${bookMetadata.schoolName}/${bookMetadata.className}/${bookMetadata.subjectNameForPath}/ch${bookMetadata.chapterNum}/pages`;
          // Retry logic for FTP upload
          let uploadSuccess = false;
          let retryCount = 0;
          const MAX_RETRIES = 3;
          let ftpRes;

          while (!uploadSuccess && retryCount < MAX_RETRIES) {
            try {
              ftpRes = await uploadFileToFTP(
                imgBuffer,
                `page-${num}.webp`,
                remoteDir,
              );
              uploadSuccess = true;
            } catch (uploadError) {
              retryCount++;
              if (retryCount < MAX_RETRIES) {
                console.log(
                  `⚠️ Upload failed for page ${num}, retrying (${retryCount}/${MAX_RETRIES})...`,
                );
                await delay(2000);
              } else {
                throw uploadError;
              }
            }
          }

        return {
  page: num,
  path: ftpRes.remotePath,
  lines,
  pageText,          // ✅ ADD THIS
  diagrams: diagramImages,
    pageImageBase64: imgBuffer.toString("base64") // ✅ ADD
};


        } catch (error) {
          console.error(`❌ Error processing page ${num}:`, error.message);
          throw error;
        }
      })(pageNum);

      batchPromises.push(pagePromise);
    }

    // Wait for entire batch to complete
    const batchResults = await Promise.all(batchPromises);
    uploadedPages.push(...batchResults);

    // Small delay between batches
    if (batchEnd < pdf.numPages) {
      console.log(`✅ Batch complete. Pausing 1 second...`);
      await delay(1000);
    }
  }

  // Sort by page number
  uploadedPages.sort((a, b) => a.page - b.page);
  console.log(`\n✅ All ${uploadedPages.length} pages converted and uploaded`);

  return uploadedPages;
}

/**
 * Main processing function - processes entire PDF in chunks
 */
async function processBookFromPDF(
  pdfPublicURL,
  bookId,
  bookMetadata,
  dbConnection,
) {
  try {
    console.log("📥 Downloading PDF from FTP...");
    const pdfRes = await axios.get(pdfPublicURL, {
      responseType: "arraybuffer",
      timeout: 60000,
    });

    const pdfBuffer = Buffer.from(pdfRes.data);

    // Check PDF size
    const sizeMB = pdfBuffer.length / (1024 * 1024);
    console.log(`📄 PDF size: ${sizeMB.toFixed(2)} MB`);

    if (sizeMB > 50) {
      throw new Error(
        "PDF too large (>50MB). Please split into smaller files.",
      );
    }

  const pdfBase64 = pdfBuffer.toString("base64");

    // Get school, class, and subject names for folder structure
    const [schoolSubjectInfo] = await dbConnection.query(
      `SELECT sc.name as school_name, c.class_name, s.name as subject_name
       FROM books b
       JOIN subjects s ON b.subject_id = s.id
       JOIN classes c ON s.class_id = c.id
       JOIN schools sc ON c.school_id = sc.id
       WHERE b.id = ?`,
      [bookId]
    );

    const schoolName = schoolSubjectInfo[0]?.school_name || 'Unknown';
    const classNum = schoolSubjectInfo[0]?.class_name?.match(/\d+/)?.[0] || bookMetadata.class || '1';
    const className = `Class ${classNum}`;
    const subjectNameForPath = schoolSubjectInfo[0]?.subject_name || bookMetadata.subject;
    const chapterNum = String(bookMetadata.chapter_number || 1).padStart(2, '0');

    // Add folder path info to bookMetadata so nested functions can access it
    bookMetadata.schoolName = schoolName;
    bookMetadata.className = className;
    bookMetadata.subjectNameForPath = subjectNameForPath;
    bookMetadata.chapterNum = chapterNum;

    // Estimate page count (rough: 1 page ≈ 50-100KB)
// Estimate page count (rough: 1 page ≈ 50-100KB)
const estimatedPages = Math.ceil(sizeMB * 15); // Rough estimate
console.log(`📊 Estimated pages (before conversion): ${estimatedPages}`);



    // For detailed student explanations, process 1 page at a time to avoid truncation
    // For detailed student explanations, process 1 page at a time to avoid truncation
    const PAGES_PER_CHUNK = 1; // 1 page per chunk for maximum detail

// ⚠️ actualPages will be calculated AFTER image conversion
let actualPages = 0;
let chunks = [];



    console.log(`🔪 Split into ${chunks.length} chunks:`);
    chunks.forEach((chunk, idx) => {
      console.log(
        `   Chunk ${idx + 1}: Pages ${chunk.startPage}-${chunk.endPage}`,
      );
    });

   // ✨ START IMAGE CONVERSION FIRST (REQUIRED) ✨
console.log("\n🚀 Starting image conversion...");
console.log("   📸 Extracting page text + images");

const imageResult = {
  convertedPages: await convertPDFPagesSequential(
    pdfBuffer,
    bookMetadata
  ),
  segmentsJsonPath: null
};

console.log(
  "\n✅ Image conversion completed:",
  imageResult.convertedPages.length,
  "pages"
);

// ✅ NOW calculate actual pages dynamically
actualPages = imageResult.convertedPages.length;
chunks = createPageChunks(actualPages, PAGES_PER_CHUNK);


// Generate highlight mapping JSON
const segments = imageResult.convertedPages.map((p) => ({
  page: p.page,
  image_path: p.path,
  pageText: p.pageText || "",
  lines: p.lines || [],
  diagrams: p.diagrams || []
}));

const jsonBuffer = Buffer.from(JSON.stringify({ segments }, null, 2));
const ftpSegRes = await uploadFileToFTP(
  jsonBuffer,
  "segments.json",
  `/books/${bookMetadata.schoolName}/${bookMetadata.className}/${bookMetadata.subjectNameForPath}/ch${bookMetadata.chapterNum}`
);

imageResult.segmentsJsonPath = ftpSegRes.url;


    // Process Gemini chunks (this runs in parallel with image conversion)
    const allSections = [];

    for (let i = 0; i < chunks.length; i++) {
  const chunk = chunks[i];

  // ✅ DECLARE pageData OUTSIDE try
  const pageData = imageResult.convertedPages.find(
    p => p.page === chunk.startPage
  );

  try {


if (!pageData?.pageText || pageData.pageText.trim().length < 30) {
  console.warn(
    `⚠️ Page ${chunk.startPage} has very little text. Using raw text fallback.`
  );

  pageData.pageText = pageData.lines
    .map(l => l.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}


const chunkSections = await processPageChunk(
  pageData.pageText,
  chunk.startPage,
  bookMetadata,
  i + 1,
  false,
  pageData.pageImageBase64 // ✅ PASS IMAGE
);

        chunkSections.forEach(section => {
  allSections.push(section);
});


        // Rate limiting: Wait between chunks (important for free tier)
        // Rate limiting: Wait between chunks (important for API stability)
        if (i < chunks.length - 1) {
          console.log("⏳ Waiting 2 seconds before next chunk...");
          await delay(2000);
        }
     } catch (chunkError) {
  console.error(`❌ Failed to process chunk ${i + 1}:`, chunkError.message);

  // Retry for both RETRY_CHUNK and INVALID_JSON_FROM_MODEL errors
  if (chunkError.message === "RETRY_CHUNK" || chunkError.message === "INVALID_JSON_FROM_MODEL") {
    console.log("🔁 Retrying chunk with same prompt (attempt 2)...");

    try {
      // First retry: use same full prompt (retryMode=false) to preserve segment count
      const retrySections = await processPageChunk(
        pageData.pageText,
        chunk.startPage,
        bookMetadata,
        i + 1,
        false // keep full prompt on first retry
      );

      retrySections.forEach(section => allSections.push(section));
      console.log(`✅ Retry succeeded for chunk ${i + 1}`);
      
      // Wait before next chunk
      if (i < chunks.length - 1) {
        console.log("⏳ Waiting 2 seconds before next chunk...");
        await delay(2000);
      }
      continue;
    } catch (retryError) {
      console.error(`❌ Retry (attempt 2) failed for chunk ${i + 1}:`, retryError.message);
      console.log("🔁 Retrying chunk with safer mode (attempt 3)...");

      // Second retry: now use safer/simplified retryMode=true as last resort
      try {
        const retrySections2 = await processPageChunk(
          pageData.pageText,
          chunk.startPage,
          bookMetadata,
          i + 1,
          true // safer mode only on last retry
        );

        retrySections2.forEach(section => allSections.push(section));
        console.log(`✅ Safe-mode retry succeeded for chunk ${i + 1}`);

        if (i < chunks.length - 1) {
          console.log("⏳ Waiting 2 seconds before next chunk...");
          await delay(2000);
        }
        continue;
      } catch (retryError2) {
       // Create fallback content
        const fallbackSection = {
          heading: `Content from Page ${chunk.startPage}`,
          page_range: [chunk.startPage, chunk.startPage],
          content: [
            {
              type: "text",
              text: pageData.pageText?.substring(0, 500).trim() || "Page content available",
              explanation: "This page requires manual review. Automated processing encountered difficulties."
            }
          ]
        };
        allSections.push(fallbackSection);
        continue;
      }
    }
  }

  console.log("⚠️ Skipping failed chunk and continuing...");
  continue;
}

    }

    
    // 🔗 Attach diagrams to sections AFTER image conversion
// if (imageResult?.convertedPages?.length) {
//   for (const section of allSections) {
//     const pageNum = section.page_range?.[0];
//     if (!pageNum) continue;

//     const pageData = imageResult.convertedPages.find(
//       p => p.page === pageNum
//     );

//     if (pageData?.diagrams?.length) {
//       section.content = [
//         ...pageData.diagrams.map(d => ({
//           type: "diagram",
//           diagram_id: d.id,
//           image_path: d.image_path,
//           caption: d.caption,
//           bbox: d.bbox,
//           page: pageNum
//         })),
//         ...section.content
//       ];
//     }
//   }
// }

allSections.forEach(section => {
  const pageNum = section.page_range?.[0];
  if (!pageNum) return;

  const pageData = imageResult.convertedPages.find(
    p => p.page === pageNum
  );

  if (!pageData?.diagrams?.length) return;

  let diagramPointer = 0;

  section.content = section.content.map(item => {
    if (
      (item.type === "diagram_concept" || item.type === "diagram_reference") &&
      pageData.diagrams[diagramPointer]
    ) {
      const d = pageData.diagrams[diagramPointer++];
      return {
        ...item,
        diagram_id: d.id,
        image_path: d.image_path,
        bbox: d.bbox
      };
    }
    return item;
  });
});



    const segmentsJsonPath = imageResult?.segmentsJsonPath || null;
    console.log("✅ All background tasks completed!");
    if (segmentsJsonPath) {
      console.log("📍 Segments JSON saved at:", segmentsJsonPath);
    }

    console.log(`\n✅ Processed all chunks successfully`);
    console.log(`   Total sections: ${allSections.length}`);

    // Count total segments across all sections
    const totalSegments = allSections.reduce(
      (sum, section) => sum + (section.content?.length || 0),
      0,
    );
    console.log(`   Total reading segments: ${totalSegments}`);
    console.log(`\n✅ Processed all chunks successfully`);
    console.log(`   Total sections: ${allSections.length}`);

    // Create final chapter structure
    const chapterData = {
      chapter_title: bookMetadata.chapter_title || bookMetadata.title || "Chapter 1",
      chapter_number: bookMetadata.chapter_number || 1,
      total_pages: actualPages,

      sections: allSections,
      key_concepts: [], // Aggregate from all sections if needed
      summary: "Complete chapter processed in segments",
      metadata: {
        board: bookMetadata.board,
        class: bookMetadata.class,
        subject: bookMetadata.subject,
        author: bookMetadata.author,
        chunks_processed: chunks.length,
        total_segments: totalSegments,
      },
    };

    // Upload to FTP
   // Get school and subject names for folder structure
   // Upload to FTP
    const contentJsonBuffer = Buffer.from(JSON.stringify(chapterData, null, 2));
    const ftpPath = `/books/${bookMetadata.schoolName}/${bookMetadata.className}/${bookMetadata.subjectNameForPath}/ch${bookMetadata.chapterNum}`;

    console.log(`💾 Uploading chapter content JSON to FTP at ${ftpPath}...`);
    const ftpResult = await uploadFileToFTP(
      contentJsonBuffer,
      "content.json",
      ftpPath,
    );

    // Save to database
    // Save to database
   console.log(`💾 Saving chapter metadata to database...`);
    
    // Check if chapter exists
    const [existingChapter] = await dbConnection.query(
      `SELECT id FROM book_chapters WHERE book_id = ? AND chapter_no = ?`,
      [bookId, bookMetadata.chapter_number || 1]
    );

    if (existingChapter.length > 0) {
      // Update existing chapter with processing results
      await dbConnection.query(
        `UPDATE book_chapters 
         SET content_json_path = ?, 
             segments_json_path = ?, 
             total_segments = ? 
         WHERE book_id = ? AND chapter_no = ?`,
        [
          ftpResult.url,
          segmentsJsonPath,
          totalSegments,
          bookId,
          bookMetadata.chapter_number || 1
        ]
      );
      console.log(`✅ Chapter ${bookMetadata.chapter_number} metadata updated with processing results`);
    } else {
      // Insert new chapter (shouldn't happen in normal flow)
      await dbConnection.query(
        `INSERT INTO book_chapters 
         (book_id, chapter_no, chapter_title, content_json_path, segments_json_path, total_segments) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          bookId,
          bookMetadata.chapter_number || 1,
          chapterData.chapter_title,
          ftpResult.url,
          segmentsJsonPath,
          totalSegments
        ]
      );
      console.log(`✅ Chapter ${bookMetadata.chapter_number} metadata created with processing results`);
    }

    return {
      success: true,
      chapters: 1,
      pages_processed: actualPages,

      chunks_processed: chunks.length,
      total_segments: totalSegments,
      chapterData: chapterData,
    };
  } catch (error) {
    console.error("❌ Book processing failed:", error.message);

    if (error.response?.status === 429) {
      throw new Error(
        "Rate limit exceeded. Please enable billing in Google AI Studio.",
      );
    }

    if (error.response?.status === 403) {
      throw new Error(
        "API access forbidden. Check API key and billing status.",
      );
    }

    if (error.response?.status === 400) {
      throw new Error("Invalid request to Gemini API. Check PDF format.");
    }

    throw error;
  }
}

/**
 * Helper functions for backward compatibility
 */
function detectChapterBoundaries(pages) {
  const chapters = [];
  let currentChapter = null;
  let chapterNumber = 0;

  const chapterPatterns = [
    /^#+\s*(chapter|lesson|unit)\s*(\d+)/i,
    /^(chapter|lesson|unit)\s*(\d+)/i,
    /^(\d+)\.\s*(chapter|lesson|unit)/i,
  ];

  pages.forEach((page, pageIdx) => {
    const lines = page.markdown.split("\n");
    let foundChapter = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      for (const pattern of chapterPatterns) {
        const match = trimmedLine.match(pattern);
        if (match) {
          if (currentChapter) {
            chapters.push(currentChapter);
          }

          chapterNumber++;
          currentChapter = {
            chapter_no: chapterNumber,
            chapter_title: trimmedLine,
            start_page: pageIdx + 1,
            end_page: pageIdx + 1,
            pages: [],
          };
          foundChapter = true;
          break;
        }
      }

      if (foundChapter) break;
    }

    if (currentChapter) {
      currentChapter.end_page = pageIdx + 1;
      currentChapter.pages.push({
        page_number: pageIdx + 1,
        markdown: page.markdown,
      });
    } else if (chapters.length === 0) {
      if (!currentChapter) {
        currentChapter = {
          chapter_no: 1,
          chapter_title: "Introduction",
          start_page: 1,
          end_page: pageIdx + 1,
          pages: [],
        };
      }
      currentChapter.end_page = pageIdx + 1;
      currentChapter.pages.push({
        page_number: pageIdx + 1,
        markdown: page.markdown,
      });
    }
  });

  if (currentChapter) {
    chapters.push(currentChapter);
  }

  return chapters;
}

function structurePageContent(pageMarkdown, pageNumber) {
  const paragraphs = [];
  const lines = pageMarkdown.split("\n");
  let currentParagraph = [];
  let paragraphIndex = 0;

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine === "") {
      if (currentParagraph.length > 0) {
        paragraphs.push({
          paragraph_id: `p${pageNumber}_${paragraphIndex + 1}`,
          text: currentParagraph.join(" ").trim(),
        });
        paragraphIndex++;
        currentParagraph = [];
      }
    } else {
      currentParagraph.push(trimmedLine);
    }
  });

  if (currentParagraph.length > 0) {
    paragraphs.push({
      paragraph_id: `p${pageNumber}_${paragraphIndex + 1}`,
      text: currentParagraph.join(" ").trim(),
    });
  }

  return paragraphs;
}

function createSemanticChunksFromStructure(
  structuredPages,
  minWords = 150,
  maxWords = 400,
) {
  const chunks = [];
  let currentChunk = {
    paragraphs: [],
    text: "",
    page_numbers: [],
    paragraph_ids: [],
    wordCount: 0,
  };

  structuredPages.forEach((page) => {
    page.paragraphs.forEach((para) => {
      const words = para.text.split(/\s+/).filter((w) => w.length > 0);
      const paraWordCount = words.length;

      if (
        currentChunk.wordCount > 0 &&
        currentChunk.wordCount + paraWordCount > maxWords
      ) {
        if (currentChunk.wordCount >= minWords) {
          chunks.push({
            chunk_text: currentChunk.text.trim(),
            page_numbers: [...new Set(currentChunk.page_numbers)].sort(
              (a, b) => a - b,
            ),
            paragraph_ids: [...currentChunk.paragraph_ids],
          });
        }

        currentChunk = {
          paragraphs: [],
          text: "",
          page_numbers: [],
          paragraph_ids: [],
          wordCount: 0,
        };
      }

      currentChunk.text += (currentChunk.text ? " " : "") + para.text;
      currentChunk.page_numbers.push(page.page_number);
      currentChunk.paragraph_ids.push(para.paragraph_id);
      currentChunk.wordCount += paraWordCount;
    });
  });

  if (currentChunk.wordCount >= minWords) {
    chunks.push({
      chunk_text: currentChunk.text.trim(),
      page_numbers: [...new Set(currentChunk.page_numbers)].sort(
        (a, b) => a - b,
      ),
      paragraph_ids: [...currentChunk.paragraph_ids],
    });
  } else if (currentChunk.wordCount > 0 && chunks.length > 0) {
    const lastChunk = chunks[chunks.length - 1];
    lastChunk.chunk_text += " " + currentChunk.text;
    lastChunk.page_numbers = [
      ...new Set([...lastChunk.page_numbers, ...currentChunk.page_numbers]),
    ].sort((a, b) => a - b);
    lastChunk.paragraph_ids = [
      ...lastChunk.paragraph_ids,
      ...currentChunk.paragraph_ids,
    ];
  }

  return chunks;
}

module.exports = {
  generateEmbedding,
  processBookFromPDF,
  detectChapterBoundaries,
  structurePageContent,
  createSemanticChunksFromStructure,
};