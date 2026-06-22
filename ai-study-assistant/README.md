# AI Study Assistant — Final Project Blueprint
Welcome to the core documentation and implementation guide of the **AI Study Assistant** (Final Project Blueprint). This application enables students to turn complex PDFs and textual notes into powerful study formats—containing structured summaries, active-recall flashcards, mock multiple-choice question assessments, and textbook practice exams.

---

## 🏗️ 1. System Architecture

The following block diagram outlines the sequence of data processing and execution within the AI Study Assistant, showing the interface between raw file intakes, our TypeScript backend layer, and the Gemini 3.5 Flash Multimodal inference.

```
       ┌────────────────────────┐
       │     User Upload        │ (PDF / TXT / Copied Note)
       └───────────┬────────────┘
                   │
                   ▼ (Base64 Binary encoding or string stream)
       ┌────────────────────────┐
       │     Node.js Server     │ (Vite Dev / Express Production Router)
       └───────────┬────────────┘
                   │
                   ▼ (Multimodal Part package)
       ┌────────────────────────┐
       │   AI Engine Gemini     │ (gemini-3.5-flash with custom schema)
       └───────────┬────────────┘
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
 ┌──────────────┐    ┌──────────────┐
 │ Raw Text/MD  │    │  JSON Array  │
 └──────┬───────┘    └──────┬───────┘
        ▼                   ▼
 ┌──────────────┐    ┌──────────────┐
 │ - Summaries  │    │ - Flashcards │
 │ - Chat Tutor │    │ - MCQ Quiz   │
 └──────┬───────┘    │ - Exam Qs    │
        │            └──────┬───────┘
        └─────────┬─────────┘
                  ▼
       ┌────────────────────────┐
       │     React Study UI     │ (Interactive Game assessing,
       └────────────────────────┘  Flippable Cards & Collapsibles)
```

---

## ⚙️ 2. Tech Stack Setup

The implementation is structured with an ultra-modular **Full-Stack Node.js (Express + Vite + React + TS)** layout:

- **Frontend Platform**: React 19 + TypeScript + Tailwind CSS (v4) for premium styles, custom Google fonts, and fluid, high-contrast typography.
- **Backend Infrastructure**: Express.js server, running Vite as internal middleware in development mode and bundling everything cleanly via `esbuild` for production.
- **AI Core**: Google Gemini SDK (`@google/genai`) invoking **Gemini 3.5 Flash** (`gemini-3.5-flash`) on the backend. This allows secure secret API key handling and avoids exposing credentials to client browsers.
- **Storage Persistence**: Robust `localStorage` browser caching lets users save their active study blueprints, revision notes, active-recall card mastered status, quiz scorings, and messages on-device permanently.

---

## 🚀 3. Core MVP Features Implemented

### **Level 1 (MANDATORY)**
- [x] **File Drop Upload**: Fully functional drag-and-drop or file selector accepting PDF documents and TXT course guides.
- [x] **Direct Text-Copying**: Copy-paste notes canvas with titles to allow immediate studying without creating file files.
- [x] **Revision Summary Engine**: Generates a high-quality Markdown revision guide with bolded key terms, structured topics, and summaries.

### **Level 2 (GOOD SCORE)**
- [x] **Active Recall Flashcards**: Interactive 3D flipping card panels with correct-wrong master status tracking.
- [x] **Interactive Assessments (MCQs)**: Multiple-choice diagnostics rendering 4 option buttons, revealing color answers instantly with corrective explanations. Includes a final diagnostic scorecard.
- [x] **Exam Practice Questions**: Conceptual mock exams with collapsible textbook model answers for self-study.

### **Level 3 (BONUS MARKS)**
- [x] **Multimodal PDF Processing**: PDF binaries are read directly in the client and passed as multimodal parts to Gemini, enabling OCR translation of scanned chapters, equations, handwriting, and diagrams.
- [x] **Tutor Chatbot (RAG)**: Chat directly with your study text or PDF. Ask follow-up queries, simplify passages, and outline difficult homework problems in real-time.
- [x] **Session Save & Resume**: Store multiple note files in the directory. Easily switch, load, rename, or delete past session units.
- [x] **Markdown Download**: Easy option to export summaries as clean `.md` files.

---

## 🧾 4. AI Prompt Blueprints (System Schemas)

1. **Summary:**
   - Prompt focuses on a clean typographic layout with structured definitions, headers, examples, and key takeaways in markdown.
2. **Flashcards:**
   - Demands `application/json` output, strictly typed with `Type.ARRAY` containing `q` (question term) and `a` (core study answer).
3. **MCQs:**
   - Formulates complex options arrays of exactly 4 elements, along with zero-based `answerIndex` and a comprehensive revision explanation.
4. **Questions:**
   - Conceptual exams divided into weights (e.g. `5 Marks`, `10 Marks`, `Short Answer`) with textbook solutions.

---

## 💻 5. Folder Hierarchy

```
AI-study-assistant/
│
├── server.ts                 # Full-stack entry, Express server & Gemini routes
├── vite.config.ts            # Vite asset router and HMR configurations
├── package.json              # App scripts and core dependencies
├── tsconfig.json             # TypeScript rules definition
├── index.html                # Web wrapper shell
│
├── src/
│   ├── main.tsx              # DOM mounter
│   ├── App.tsx               # Main layout coordinator, tabs routing and local storage
│   ├── index.css             # Tailwind v4 imports, Google Fonts, and custom 3D flipping card utilities
│   ├── types.ts              # Core type system declarations
│   │
│   └── components/
│       ├── UploadPane.tsx    # File drag-and-drop & paste logic
│       ├── Sidebar.tsx       # Past study session memory selector
│       ├── SummaryTab.tsx    # Summaries with MD downloads
│       ├── MarkdownView.tsx  # Dynamic custom renderer compiling MD into Tailwind HTML
│       ├── FlashcardsTab.tsx # Interactive flippable memory cards
│       ├── McqQuizTab.tsx    # Assessment with grades & scorecards
│       ├── PracticeQuestionsTab.tsx # Mock exam sheets with collapsible answer cards
│       └── TutorChatTab.tsx  # Interactive study chatbot
```
