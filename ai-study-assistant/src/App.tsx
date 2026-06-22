import React, { useState, useEffect } from 'react';
import { Sparkles, GraduationCap, Info, FileText, ArrowLeft, RefreshCw, AlertCircle, Bookmark } from 'lucide-react';
import { StudySession, Flashcard, MCQ, ExamQuestion } from './types';
import UploadPane from './components/UploadPane';
import Sidebar from './components/Sidebar';
import SummaryTab from './components/SummaryTab';
import FlashcardsTab from './components/FlashcardsTab';
import McqQuizTab from './components/McqQuizTab';
import PracticeQuestionsTab from './components/PracticeQuestionsTab';
import TutorChatTab from './components/TutorChatTab';

const LOCAL_STORAGE_KEY = 'ai_study_assistant_sessions_v1';
const REQUEST_TIMEOUT_MS = 60000;

async function postStudyGenerate(payload: Record<string, unknown>) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch('/api/study/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await res.json()
      : { error: await res.text() };

    if (!res.ok) {
      throw new Error(data.error || 'The study generator could not complete the request.');
    }

    return data;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('The AI request took too long. Please try again with a shorter document or retry in a moment.');
    }
    throw err;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export default function App() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  // Loading and processing states
  const [isInitializing, setIsInitializing] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isGeneratingMcqs, setIsGeneratingMcqs] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isSendingChatMessage, setIsSendingChatMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active view layout tab
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'mcqs' | 'questions' | 'chat'>('summary');

  // Load saved study sessions from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StudySession[];
        setSessions(parsed);
        if (parsed.length > 0) {
          // Default load the most recent session
          setActiveSessionId(parsed[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load local storage sessions", e);
    }
  }, []);

  // Sync state changes back to localStorage
  const saveSessionsToLocal = (updatedSessions: StudySession[]) => {
    setSessions(updatedSessions);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSessions));
    } catch (e) {
      console.error("Local Storage quota exceeded or unavailable", e);
    }
  };

  const persistSessions = (updater: (current: StudySession[]) => StudySession[]) => {
    setSessions(current => {
      const updated = updater(current);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Local Storage quota exceeded or unavailable", e);
      }
      return updated;
    });
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  // Handles creating a new Study Session from file/text notes
  const handleSessionCreated = async (sessionData: {
    name: string;
    docType: 'pdf' | 'text';
    docName: string;
    textData?: string;
    pdfData?: string;
    pdfMimeType?: string;
    docSize?: string;
  }) => {
    setIsInitializing(true);
    setErrorMessage(null);

    const newSession: StudySession = {
      id: `session_${Date.now()}`,
      name: sessionData.name,
      docType: sessionData.docType,
      docName: sessionData.docName,
      docSize: sessionData.docSize,
      createdAt: Date.now(),
      textData: sessionData.textData,
      pdfData: sessionData.pdfData,
      pdfMimeType: sessionData.pdfMimeType,
      chatHistory: [],
    };

    // Add to state
    const nextSessions = [newSession, ...sessions];
    saveSessionsToLocal(nextSessions);
    setActiveSessionId(newSession.id);
    setIsInitializing(false);
    
    // Automatically trigger generating the initial summary for a seamless experience
    triggerGenerateSummary(newSession);
  };

  const updateActiveSession = (updater: (sess: StudySession) => Partial<StudySession>) => {
    if (!activeSessionId) return;
    const nextSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          ...updater(s),
        };
      }
      return s;
    });
    saveSessionsToLocal(nextSessions);
  };

  // 1. Generate Summary Request
  const triggerGenerateSummary = async (sessionToUse = activeSession) => {
    if (!sessionToUse) return;
    setIsGeneratingSummary(true);
    setErrorMessage(null);
    setActiveTab('summary');

    try {
      const payload = {
        type: 'summary',
        docType: sessionToUse.docType,
        data: sessionToUse.docType === 'pdf' ? sessionToUse.pdfData : sessionToUse.textData,
        mimeType: sessionToUse.pdfMimeType,
      };

      const data = await postStudyGenerate(payload);

      // Update session in list
      persistSessions(current => current.map(s => {
        if (s.id === sessionToUse.id) {
          return { ...s, summary: data.result };
        }
        return s;
      }));

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred generating summary');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // 2. Generate Flashcards Request
  const triggerGenerateFlashcards = async () => {
    if (!activeSession) return;
    setIsGeneratingFlashcards(true);
    setErrorMessage(null);

    try {
      const payload = {
        type: 'flashcards',
        docType: activeSession.docType,
        data: activeSession.docType === 'pdf' ? activeSession.pdfData : activeSession.textData,
        mimeType: activeSession.pdfMimeType,
      };

      const data = await postStudyGenerate(payload);

      const generatedCards: Flashcard[] = (data.result || []).map((c: any, index: number) => ({
        id: `card_${Date.now()}_${index}`,
        q: c.q,
        a: c.a,
        mastered: false,
      }));

      updateActiveSession(() => ({ flashcards: generatedCards }));

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred generating flashcards');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  // Handle flashcard update (e.g. Mastered checkbox toggles)
  const handleUpdateFlashcard = (cardId: string, updates: Partial<Flashcard>) => {
    if (!activeSession) return;
    const cards = activeSession.flashcards || [];
    const nextCards = cards.map(c => {
      if (c.id === cardId) {
        return { ...c, ...updates };
      }
      return c;
    });
    updateActiveSession(() => ({ flashcards: nextCards }));
  };

  // 3. Generate MCQs Request
  const triggerGenerateMCQs = async () => {
    if (!activeSession) return;
    setIsGeneratingMcqs(true);
    setErrorMessage(null);

    try {
      const payload = {
        type: 'mcqs',
        docType: activeSession.docType,
        data: activeSession.docType === 'pdf' ? activeSession.pdfData : activeSession.textData,
        mimeType: activeSession.pdfMimeType,
      };

      const data = await postStudyGenerate(payload);

      if (!Array.isArray(data.result)) {
        console.log("MCQ RESPONSE:", data);
        throw new Error("Backend returned invalid MCQ data");
      }
      
      const generatedMcqs: MCQ[] = data.result.map((m: any, index: number) => ({
        id: `mcq_${Date.now()}_${index}`,
        question: m.question,
        options: m.options,
        answerIndex: m.answerIndex,
        explanation: m.explanation,
      }));

      updateActiveSession(() => ({ mcqs: generatedMcqs }));

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred generating MCQs assessment');
    } finally {
      setIsGeneratingMcqs(false);
    }
  };

  // 4. Generate Exam Questions Request
  const triggerGenerateQuestions = async () => {
    if (!activeSession) return;
    setIsGeneratingQuestions(true);
    setErrorMessage(null);

    try {
      const payload = {
        type: 'questions',
        docType: activeSession.docType,
        data: activeSession.docType === 'pdf' ? activeSession.pdfData : activeSession.textData,
        mimeType: activeSession.pdfMimeType,
      };

      const data = await postStudyGenerate(payload);

      if (!Array.isArray(data.result)) {
        console.log("QUESTION RESPONSE:", data);
        throw new Error("Backend returned invalid Question data");
      }
      
      const generatedQuestions: ExamQuestion[] = data.result.map((q: any, index: number) => ({
        id: `question_${Date.now()}_${index}`,
        question: q.question,
        points: q.points,
        answer: q.answer,
      }));

      updateActiveSession(() => ({ questions: generatedQuestions }));

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred generating exam questions');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // 5. Send Chat Message Document RAG
  const handleSendMessage = async (text: string) => {
    if (!activeSession) return;
    
    // Append user message instantly to history state
    const newUserMsgList = [...(activeSession.chatHistory || []), { role: 'user' as const, text }];
    updateActiveSession(() => ({ chatHistory: newUserMsgList }));
    
    setIsSendingChatMessage(true);
    setErrorMessage(null);

    try {
      const payload = {
        type: 'chat',
        docType: activeSession.docType,
        data: activeSession.docType === 'pdf' ? activeSession.pdfData : activeSession.textData,
        mimeType: activeSession.pdfMimeType,
        userMessage: text,
        chatHistory: activeSession.chatHistory || [],
      };

      const data = await postStudyGenerate(payload);

      const nextChatList = [...newUserMsgList, { role: 'model' as const, text: data.result }];
      updateActiveSession(() => ({ chatHistory: nextChatList }));

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error communicating with AI tutor');
    } finally {
      setIsSendingChatMessage(false);
    }
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    const list = sessions.filter(s => s.id !== id);
    saveSessionsToLocal(list);
    if (activeSessionId === id) {
      setActiveSessionId(list.length > 0 ? list[0].id : null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800 antialiased">
      {/* Top Banner Branding */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <GraduationCap className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 id="app-title" className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
              AI Study Assistant
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Blueprint SDK</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Accelerate recall, synthesize notes, and self-assess</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-indigo-50/40 border border-indigo-100/20 px-3 py-1 bg-white rounded-lg text-xs text-indigo-700">
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span className="font-semibold">Powered by Gemini Flash</span>
        </div>
      </header>

      {/* Main Workspace Frame container */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        
        {/* Dynamic Sidebar history panels */}
        <aside className="w-full lg:w-64 shrink-0 bg-white">
          <Sidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={(id) => {
              setActiveSessionId(id);
              setErrorMessage(null);
            }}
            onDeleteSession={handleDeleteSession}
          />
        </aside>

        {/* Core workspace panels */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          
          {/* Error Board container */}
          {errorMessage && (
            <div id="error-board" className="max-w-4xl mx-auto mb-6 bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-800 flex items-start gap-3 text-xs leading-relaxed animate-fade-in shadow-sm">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold uppercase tracking-wider text-[10px] text-rose-700 mb-0.5">AI Engine Incident</p>
                <p>{errorMessage}</p>
                <p className="mt-1 font-medium text-[10px] text-rose-600">Tip: Check if your GEMINI_API_KEY environment variable is configured in the Secrets panel, then try again.</p>
              </div>
            </div>
          )}

          {!activeSession ? (
            /* Upload materials block when no loaded session or creating new unit */
            <div className="py-8 md:py-12 animate-fade-in">
              <div className="text-center max-w-lg mx-auto space-y-3 mb-8">
                <span className="text-4xl text-indigo-500">📚</span>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Generate Study Materials</h2>
                <p className="text-sm text-slate-500 text-slate-500/80 leading-relaxed">
                  Upload a course PDF document or copy-paste lecture transcripts, meeting memos, outline guides, or chapter texts.
                </p>
              </div>
              <UploadPane onSessionCreated={handleSessionCreated} isProcessing={isInitializing} />
            </div>
          ) : (
            /* Active study board panel dashboard */
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Material information card header */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                    <FileText className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 line-clamp-1">{activeSession.name}</h2>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 uppercase font-semibold tracking-wider">
                      <span>{activeSession.docType === 'pdf' ? 'PDF Multimodal' : 'Plain Text Notes'}</span>
                      {activeSession.docSize && (
                        <>
                          <span>•</span>
                          <span>{activeSession.docSize}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  id="btn-return-landing"
                  onClick={() => setActiveSessionId(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 text-xs font-semibold rounded-lg transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Select Different Material
                </button>
              </div>

              {/* Task Hub Options Navigation Panel */}
              <div className="bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm flex flex-wrap gap-1">
                <button
                  id="tab-select-summary"
                  onClick={() => setActiveTab('summary')}
                  className={`flex-1 min-w-[120px] text-center py-2.5 rounded-xl text-xs font-semibold tracking-tight transition ${
                    activeTab === 'summary'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  📖 Revision Summary
                </button>
                <button
                  id="tab-select-flashcards"
                  onClick={() => setActiveTab('flashcards')}
                  className={`flex-1 min-w-[120px] text-center py-2.5 rounded-xl text-xs font-semibold tracking-tight transition ${
                    activeTab === 'flashcards'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  ⚡ Memory Flashcards
                </button>
                <button
                  id="tab-select-mcqs"
                  onClick={() => setActiveTab('mcqs')}
                  className={`flex-1 min-w-[120px] text-center py-2.5 rounded-xl text-xs font-semibold tracking-tight transition ${
                    activeTab === 'mcqs'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  📝 MCQ Assessment
                </button>
                <button
                  id="tab-select-questions"
                  onClick={() => setActiveTab('questions')}
                  className={`flex-1 min-w-[120px] text-center py-2.5 rounded-xl text-xs font-semibold tracking-tight transition ${
                    activeTab === 'questions'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  🎓 Exam Practice
                </button>
                <button
                  id="tab-select-chat"
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 min-w-[120px] text-center py-2.5 rounded-xl text-xs font-semibold tracking-tight transition ${
                    activeTab === 'chat'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  💬 Chat with Tutor
                </button>
              </div>

              {/* Submodule View Panel Loader dispatcher */}
              <div className="min-h-[320px]">
                {activeTab === 'summary' && (
                  <SummaryTab
                    summary={activeSession.summary}
                    isGenerating={isGeneratingSummary}
                    onGenerate={() => triggerGenerateSummary(activeSession)}
                  />
                )}
                
                {activeTab === 'flashcards' && (
                  <FlashcardsTab
                    flashcards={activeSession.flashcards}
                    isGenerating={isGeneratingFlashcards}
                    onGenerate={triggerGenerateFlashcards}
                    onUpdateFlashcard={handleUpdateFlashcard}
                  />
                )}

                {activeTab === 'mcqs' && (
                  <McqQuizTab
                    mcqs={activeSession.mcqs}
                    isGenerating={isGeneratingMcqs}
                    onGenerate={triggerGenerateMCQs}
                  />
                )}

                {activeTab === 'questions' && (
                  <PracticeQuestionsTab
                    questions={activeSession.questions}
                    isGenerating={isGeneratingQuestions}
                    onGenerate={triggerGenerateQuestions}
                  />
                )}

                {activeTab === 'chat' && (
                  <TutorChatTab
                    chatHistory={activeSession.chatHistory}
                    onSendMessage={handleSendMessage}
                    isSending={isSendingChatMessage}
                  />
                )}
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
