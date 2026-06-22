import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Layers, CheckCircle2, Bookmark, Award } from 'lucide-react';
import { Flashcard } from '../types';

interface FlashcardsTabProps {
  flashcards?: Flashcard[];
  onGenerate: () => void;
  isGenerating: boolean;
  onUpdateFlashcard?: (id: string, updates: Partial<Flashcard>) => void;
}

export default function FlashcardsTab({
  flashcards = [],
  onGenerate,
  isGenerating,
  onUpdateFlashcard,
}: FlashcardsTabProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const activeCard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleToggleMastered = (e: React.MouseEvent, cardId: string, currentVal: boolean) => {
    e.stopPropagation(); // prevent flipping when clicking action button
    if (onUpdateFlashcard) {
      onUpdateFlashcard(cardId, { mastered: !currentVal });
    }
  };

  const masteredCount = flashcards.filter((f) => f.mastered).length;
  const progressPercent = flashcards.length > 0 ? Math.round((masteredCount / flashcards.length) * 100) : 0;

  return (
    <div id="flashcard-section" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Active Recall Flashcards ({flashcards.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Perfect for vocabulary terms, equations, and fast historical or conceptual self-testing.
          </p>
        </div>
        <button
          id="btn-trigger-flashcards"
          onClick={() => {
            setCurrentIndex(0);
            setIsFlipped(false);
            onGenerate();
          }}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-xs text-white rounded-lg transition font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          {flashcards.length > 0 ? 'Regenerate Flashcards' : 'Generate Flashcards'}
        </button>
      </div>

      {isGenerating ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-700">Composing interactive flashcards...</p>
          <p className="text-xs text-slate-400">Gemini is translating notes into concise terms-and-explanations cards.</p>
        </div>
      ) : flashcards.length > 0 && activeCard ? (
        <div className="max-w-xl mx-auto space-y-6">
          {/* Progress bar */}
          <div className="bg-slate-100 h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-indigo-500 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Card {currentIndex + 1} of {flashcards.length}</span>
            <span className="flex items-center gap-1.5 font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
              <Award className="w-3.5 h-3.5 text-indigo-500" />
              {masteredCount}/{flashcards.length} Mastered ({progressPercent}%)
            </span>
          </div>

          {/* Interactive Card Canvas */}
          <div
            id={`flashcard-item-${currentIndex}`}
            onClick={handleFlip}
            className="group cursor-pointer select-none perspective-lg relative h-72 w-full transition-transform duration-300 transform-style-3d active:scale-[0.98]"
          >
            {/* Inner rotatable element */}
            <div
              className={`absolute inset-0 w-full h-full duration-500 rounded-2xl transition-all shadow-md transform-style-3d ${
                isFlipped ? 'rotate-y-180 bg-indigo-50/10 border-indigo-200 border-2' : 'bg-white border-slate-100 border'
              }`}
            >
              {/* CARD FRONT face */}
              <div 
                className={`absolute inset-0 w-full h-full p-8 flex flex-col justify-between backface-hidden ${
                  isFlipped ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question Term</span>
                  <button
                    id={`btn-mastered-front-${activeCard.id}`}
                    type="button"
                    onClick={(e) => handleToggleMastered(e, activeCard.id, !!activeCard.mastered)}
                    className={`p-1.5 rounded-lg transition ${
                      activeCard.mastered 
                        ? 'text-emerald-600 bg-emerald-50' 
                        : 'text-slate-300 hover:text-indigo-500 hover:bg-slate-50'
                    }`}
                    title={activeCard.mastered ? "Mark unfinished" : "Mark as Mastered"}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-lg md:text-xl font-semibold text-slate-800 text-center leading-snug px-4 py-2 my-auto">
                  {activeCard.q}
                </p>

                <div className="text-center text-[10px] font-medium text-slate-400 animate-pulse">
                  Click/Tap card to flip and reveal answer
                </div>
              </div>

              {/* CARD BACK face */}
              <div 
                className={`absolute inset-0 w-full h-full p-8 flex flex-col justify-between rotate-y-180 backface-hidden ${
                  isFlipped ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Revision Answer</span>
                  <button
                    id={`btn-mastered-back-${activeCard.id}`}
                    type="button"
                    onClick={(e) => handleToggleMastered(e, activeCard.id, !!activeCard.mastered)}
                    className={`p-1.5 rounded-lg transition ${
                      activeCard.mastered 
                        ? 'text-emerald-600 bg-emerald-50' 
                        : 'text-slate-300 hover:text-indigo-500 hover:bg-slate-50'
                    }`}
                    title={activeCard.mastered ? "Mark unfinished" : "Mark as Mastered"}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-sm md:text-base text-slate-700 text-center overflow-y-auto leading-relaxed my-auto max-h-36 px-2 pr-1">
                  {activeCard.a}
                </div>

                <div className="flex justify-center items-center gap-1.5 text-[10px] font-semibold text-indigo-600">
                  <Bookmark className="w-3.5 h-3.5" />
                  {activeCard.mastered ? "Mastered Candidate!" : "Click to view question again"}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center px-4">
            <button
              id="btn-prev-card"
              onClick={handlePrev}
              className="flex items-center gap-1 py-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 font-medium text-xs transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <div className="text-center">
              <button
                id="btn-tap-alternative"
                onClick={handleFlip}
                className="text-xs text-indigo-600 font-medium hover:underline bg-indigo-50 px-3 py-1.5 rounded-lg"
              >
                Flip Card
              </button>
            </div>
            <button
              id="btn-next-card"
              onClick={handleNext}
              className="flex items-center gap-1 py-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 font-medium text-xs transition"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-sm font-medium text-slate-700">No Flashcards Generated Yet</p>
            <p className="text-xs text-slate-400">
              Transform your lecture notes or textbooks into interactive, flippable memory booster flashcards.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
