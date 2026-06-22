# AI Study Assistant — Development Log & Hackathon Report

## 🧠 Development Log

### AI Tool Used
- **Google AI Studio Coding Agent** with Antigravity engineering framework

### Model Used
- **Gemini 3.5 Flash** (`gemini-3.5-flash`) via the modern `@google/genai` TypeScript SDK on Node.js/Express.

---

### 📌 Prompts Employed

#### 1. Summary Generation Prompt
```
Summarize the provided study materials/notes into a highly structured student revision guide.
Use rich Markdown format with clean typography, styled headers, lists, bullet points, and key terms in **bold**.
Include distinct sections for:
1. Core Concepts & Definitions
2. Key Topics Explained (use examples where appropriate)
3. Main Takeaways
```

#### 2. Active Recall Flashcards Prompt
```
Generate 6 to 10 highly effective, active-recall flashcards from the provided study content.
Each card must focus on a single crisp term, question, or concept.
Return exactly a JSON array matching the specified schema. Ensure all fields are filled.
```

#### 3. MCQ Diagnostic Assessment Prompt
```
Generate 5 to 8 challenging and educational multiple choice questions (MCQs) from the provided materials.
Each question should have exactly 4 options. Include the index of the correct answer (0 to 3) and a detailed educational explanation why it's correct.
Return exactly a JSON array matching the specified schema.
```

#### 4. Exam Practice Questions Prompt
```
Extract the 5 most important and frequently asked exam-style questions from the provided materials.
Vary the difficulty. For each question, provide a weight category (e.g. '5 Marks', 'Short Conceptual', '10 Marks (Essay)') and a model answer demonstrating scoring points.
Return exactly a JSON array matching the specified schema.
```

#### 5. Chat Tutor Prompt
```
You are a friendly, brilliant, and supportive AI Study Tutor. 
Your task is to help the student understand and study the uploaded PDF or Notes.
Refer strictly and accurately to facts, concepts, and data loaded in the document.
If the answer cannot be found in the document, use your general knowledge, but clearly state if you are supplementing information beyond the document.

Here is the conversation history so far:
{history}

Student Question: "{userMessage}"

Provide a comprehensive, conversational, and highly helpful response. Use Markdown for nice lists, bullets, and math formatting if necessary.
```

---

### 💻 AI Generated Code Architecture
- **PDF Multimodal Passage**: Express handles raw base64 data conversion, sending complex PDF context directly into Gemini Flash.
- **Express Backend Router**: Centralized API route `/api/study/generate` validating keys lazily and executing tasks efficiently.
- **Tailwind v4 HUD**: Elegant dashboard using off-white grid frames and Inter/Space Grotesk typography.
- **Interactive Componentry**: 3D rotation animations for active recall, modular quiz diagnostics, and collapsible exam sheets.

---

### 🔧 Manual Optimizations & Code Hardening
- **JSON Fence Protection**: Implemented protective cleaning filters `cleanJsonResponse` on Express endpoints to strip any extraneous markdown formatting blocks (e.g. ` ```json ` blocks) before running `JSON.parse`.
- **Express Payload Expansion**: Increased JSON body parsing capabilities to `25mb` on Express middlewares so that larger textbook PDFs can be securely ingested as Base64 strings without triggering the HTTP payload limit.
- **Flipping 3D Render**: Designed custom `.perspective-lg`, `.transform-style-3d`, and `.backface-hidden` CSS classes directly in `/src/index.css` to enable flippable 3D card movements in standard browsers.

---

### 🚧 Challenges & Solutions

#### Challenge: Massive PDF files & Token Windows
- **Issue**: Standard text extractors often fail on large PDFs, OCR-scanned images, or textbooks, resulting in empty transcripts or crashing due to server memory allocation limitations.
- **Creative Hack**: Bypassed normal client-side script parses by passing PDF files as direct Base64 stream objects using Gemini 3.5's native **multimodal input structures**. Since Gemini can view, process, reads, and OCR documents directly, we bypassed token crashes entirely.
