/**
 * Shared types for the AI Study Assistant
 */

export interface Flashcard {
  id: string;
  q: string;
  a: string;
  mastered?: boolean;
}

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  answerIndex: number; // 0-based index of correct option
  explanation: string;
}

export interface ExamQuestion {
  id: string;
  question: string;
  points: string; // e.g. "5 Marks", "Short Answer"
  answer: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface StudySession {
  id: string;
  name: string;
  docType: 'pdf' | 'text';
  docName: string;
  docSize?: string;
  createdAt: number;
  
  // Stored outputs
  summary?: string;
  flashcards?: Flashcard[];
  mcqs?: MCQ[];
  questions?: ExamQuestion[];
  chatHistory?: ChatMessage[];
  
  // Original materials for re-runs
  textData?: string;
  pdfData?: string; // base64 string
  pdfMimeType?: string;
}
