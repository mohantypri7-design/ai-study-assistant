import React, { useState } from 'react';
import { HelpCircle, RefreshCw, CheckCircle, XCircle, ArrowRight, BookOpen, RotateCcw } from 'lucide-react';
import { MCQ } from '../types';

interface McqQuizTabProps {
  mcqs?: MCQ[];
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function McqQuizTab({ mcqs = [], onGenerate, isGenerating }: McqQuizTabProps) {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);

  const activeQuestion = mcqs[currentQuizIndex];
  
  // Handles selecting an option for the current question
  const handleSelectOption = (optionIndex: number) => {
    // If already answered, do not allow changes
    if (selectedAnswers[currentQuizIndex] !== undefined) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuizIndex]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuizIndex < mcqs.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswers({});
    setQuizFinished(false);
  };

  // Helper to count correct answers
  const getCorrectAnswersCount = () => {
    let count = 0;
    mcqs.forEach((mcq, idx) => {
      if (selectedAnswers[idx] === mcq.answerIndex) {
        count++;
      }
    });
    return count;
  };

  const correctCount = getCorrectAnswersCount();
  const percentage = mcqs.length > 0 ? Math.round((correctCount / mcqs.length) * 100) : 0;

  const getEncouragement = () => {
    if (percentage === 100) return "Outstanding! You have masterfully retained 100% of these concepts! 🏆";
    if (percentage >= 80) return "Excellent job! You have a solid understanding of this content! 🌟";
    if (percentage >= 60) return "Good attempt! Review the explanations to lock in the rest. 📚";
    return "Keep studying! Review the course material, and try again. Practice makes perfect! 💪";
  };

  return (
    <div id="quiz-section" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            Interactive MCQ Assessment ({mcqs.length} Questions)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Test your comprehension of the notes with interactive multiple choice questions and instant explanations.
          </p>
        </div>
        <button
          id="btn-trigger-mcqs"
          onClick={() => {
            handleReset();
            onGenerate();
          }}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-xs text-white rounded-lg transition font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          {mcqs.length > 0 ? 'Regenerate Assessment' : 'Generate MCQs'}
        </button>
      </div>

      {isGenerating ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-700">Assembling interactive questions...</p>
          <p className="text-xs text-slate-400">Gemini is parsing your content to craft context-aware test modules.</p>
        </div>
      ) : quizFinished ? (
        // Scorecard display
        <div className="bg-white rounded-2xl border border-slate-100 p-8 max-w-xl mx-auto shadow-sm text-center space-y-6">
          <div className="space-y-2">
            <span className="text-6xl">🎉</span>
            <h4 className="text-xl font-bold text-slate-800 mt-2">Practice Exam Completed!</h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Ready to review your study diagnostic? Here is your score breakdown:
            </p>
          </div>

          <div className="bg-indigo-50/50 rounded-xl p-6 max-w-xs mx-auto border border-indigo-100/50">
            <p className="text-xs font-semibold text-indigo-600 tracking-widest uppercase">Your Grade</p>
            <p className="text-5xl font-black text-indigo-900 mt-1">{correctCount} <span className="text-2xl font-normal text-slate-400">/ {mcqs.length}</span></p>
            <p className="text-sm font-semibold text-slate-500 mt-1">{percentage}% Accuracy</p>
          </div>

          <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl italic max-w-md mx-auto leading-relaxed border border-slate-100">
            {getEncouragement()}
          </p>

          <button
            id="btn-quiz-reset"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Restart Quiz
          </button>
        </div>
      ) : mcqs.length > 0 && activeQuestion ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Tracker */}
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Assessment Question {currentQuizIndex + 1} of {mcqs.length}</span>
            <span className="font-semibold text-indigo-600">Current Score: {correctCount}/{Object.keys(selectedAnswers).length || 0}</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
            <h4 className="text-base font-semibold text-slate-800">
              {activeQuestion.question}
            </h4>

            {/* MCQ Options */}
            <div className="grid grid-cols-1 gap-3">
              {activeQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQuizIndex] === idx;
                const isCorrect = activeQuestion.answerIndex === idx;
                const answered = selectedAnswers[currentQuizIndex] !== undefined;
                
                let optionStyle = "border-slate-100 hover:bg-slate-50 hover:border-slate-200 bg-white";
                let decorationIcon = null;

                if (answered) {
                  if (isCorrect) {
                    optionStyle = "bg-emerald-50 border-emerald-400 text-emerald-900";
                    decorationIcon = <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />;
                  } else if (isSelected) {
                    optionStyle = "bg-rose-50 border-rose-300 text-rose-900";
                    decorationIcon = <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
                  } else {
                    optionStyle = "opacity-50 border-slate-100 bg-slate-50/50 text-slate-400";
                  }
                }

                return (
                  <button
                    id={`btn-mcq-opt-${idx}`}
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={answered}
                    className={`flex items-center justify-between text-left p-4 rounded-xl border text-sm font-medium transition cursor-pointer ${optionStyle}`}
                  >
                    <span className="flex gap-3 items-center">
                      <span className={`w-6 h-6 rounded-lg ${
                        isSelected ? 'bg-indigo-600 text-white' : answered && isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                      } flex items-center justify-center text-xs font-bold grow-0 shrink-0`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {option}
                    </span>
                    {decorationIcon}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation Plate */}
            {selectedAnswers[currentQuizIndex] !== undefined && (
              <div className="bg-slate-50 p-4 md:p-5 rounded-xl border border-slate-100 text-slate-600 text-xs leading-relaxed space-y-2 animate-fade-in">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span>Revision Explain Answer:</span>
                  {selectedAnswers[currentQuizIndex] === activeQuestion.answerIndex ? (
                    <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded ml-2">Correct</span>
                  ) : (
                    <span className="text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded ml-2">Incorrect</span>
                  )}
                </div>
                <p>{activeQuestion.explanation}</p>
                
                {/* Advanced action to proceed */}
                <div className="flex justify-end pt-2">
                  <button
                    id="btn-quiz-proceed"
                    onClick={handleNext}
                    className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-4 py-2 rounded-lg font-medium shadow-sm"
                  >
                    {currentQuizIndex === mcqs.length - 1 ? 'Finish Assessment' : 'Next Question'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-sm font-medium text-slate-700">No Assessment Module Generated</p>
            <p className="text-xs text-slate-400">
              Run the Assessment Generator to compile a comprehensive, active multiple choice assessment based directly on your study files.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
