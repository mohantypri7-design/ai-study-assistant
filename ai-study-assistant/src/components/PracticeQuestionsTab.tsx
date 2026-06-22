import React, { useState } from 'react';
import { HelpCircle, RefreshCw, FileQuestion, ChevronDown, ChevronUp, Check, Award } from 'lucide-react';
import { ExamQuestion } from '../types';

interface PracticeQuestionsTabProps {
  questions?: ExamQuestion[];
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function PracticeQuestionsTab({
  questions = [],
  onGenerate,
  isGenerating,
}: PracticeQuestionsTabProps) {
  const [openedQuestions, setOpenedQuestions] = useState<Record<string, boolean>>({});

  const toggleToggleAnswer = (id: string) => {
    setOpenedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div id="questions-section" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-indigo-500" />
            Exam High-Frequency Questions
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Key conceptual exam queries mapped from core text with scoring point markings and collapsible model solutions.
          </p>
        </div>
        <button
          id="btn-trigger-questions"
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-xs text-white rounded-lg transition font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          {questions.length > 0 ? 'Regenerate Exam Questions' : 'Generate Questions'}
        </button>
      </div>

      {isGenerating ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-700">Synthesizing exam questions...</p>
          <p className="text-xs text-slate-400">Gemini is weighting concept frequency and formulating sample short/long grading prompts.</p>
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-4 max-w-3xl mx-auto">
          {questions.map((q, idx) => {
            const isOpen = !!openedQuestions[q.id];
            return (
              <div
                id={`exam-question-${q.id}`}
                key={q.id}
                className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm transition hover:border-slate-200"
              >
                {/* Header Collapsible Trigger */}
                <button
                  id={`btn-toggle-q-${q.id}`}
                  onClick={() => toggleToggleAnswer(q.id)}
                  className="w-full flex items-start justify-between text-left p-5 focus:outline-none"
                >
                  <div className="flex gap-4 items-start pr-4">
                    <span className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold leading-none grow-0 shrink-0 mt-0.5">
                      Q{idx + 1}
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-800 leading-snug">
                        {q.question}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        <Award className="w-3 h-3" />
                        {q.points || 'General Score'}
                      </span>
                    </div>
                  </div>
                  <div className="text-slate-400 shrink-0 mt-1">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Collapsible Answer Pane */}
                {isOpen && (
                  <div className="border-t border-slate-50 bg-slate-50/50 p-5 space-y-3 text-xs leading-relaxed animate-fade-in">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Model Answer & Scoring Rubric:</span>
                    </div>
                    <div className="text-slate-600 whitespace-pre-line text-sm pl-0">
                      {q.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mx-auto">
            <FileQuestion className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-sm font-medium text-slate-700">No Exam Questions Generated</p>
            <p className="text-xs text-slate-400">
              Transform study notes into weighted questions modeled after real curriculum examinations, complete with scoring guides.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
