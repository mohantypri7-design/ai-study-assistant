import React, { useState, useRef, useEffect } from 'react';
import { Send, GraduationCap, User, MessageSquare, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../types';

interface TutorChatTabProps {
  chatHistory?: ChatMessage[];
  onSendMessage: (text: string) => void;
  isSending: boolean;
}

export default function TutorChatTab({
  chatHistory = [],
  onSendMessage,
  isSending,
}: TutorChatTabProps) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to lowest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleSuggestionClick = (text: string) => {
    if (isSending) return;
    onSendMessage(text);
  };

  const suggestions = [
    "What are the top 3 key takeaways from these study files?",
    "Can you formulate a real-life analogy to explain this material simply?",
    "Find and define the most difficult terms or vocabulary from this text."
  ];

  return (
    <div id="chat-section" className="flex flex-col h-[520px] bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden shadow-inner">
      {/* Mini header */}
      <div className="bg-white border-b border-slate-100 px-5 py-3.5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
            <GraduationCap className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">AI Document Study mentor</h4>
            <p className="text-[10px] text-emerald-500 font-medium">Ready to explain & clarify concepts</p>
          </div>
        </div>
      </div>

      {/* Messages Canvas */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-indigo-100/30 flex items-center justify-center text-indigo-500 mx-auto">
              <MessageSquare className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-slate-700">Chat with your study material</h5>
              <p className="text-[11px] text-slate-400">
                Ask specific questions, ask for analogies, simplify difficult sections, or verify homework answers using details inside your document.
              </p>
            </div>

            {/* Quick Suggestions list */}
            <div className="col-1 gap-2 pt-2 text-left w-full">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Suggested Prompts:</p>
              {suggestions.map((s, idx) => (
                <button
                  id={`btn-chat-suggest-${idx}`}
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full text-left font-medium text-xs text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-100/30 px-3.5 py-2.5 rounded-xl transition mb-2 shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 pr-1">
            {chatHistory.map((msg, idx) => {
              const isTutor = msg.role === 'model';
              return (
                <div
                  id={`chat-msg-${idx}`}
                  key={idx}
                  className={`flex gap-3 max-w-[85%] ${isTutor ? '' : 'ml-auto flex-row-reverse'}`}
                >
                  {/* System/User Avatar bubble */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    isTutor ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isTutor ? <GraduationCap className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                  </div>

                  {/* Message bubble speech panel */}
                  <div className={`rounded-2xl p-3 px-4 text-xs leading-relaxed space-y-1 ${
                    isTutor 
                      ? 'bg-white text-slate-700 border border-slate-100 shadow-sm' 
                      : 'bg-indigo-600 text-white font-medium'
                  }`}>
                    <p className={`whitespace-pre-line text-xs font-semibold uppercase tracking-wider ${isTutor ? 'text-indigo-600' : 'text-indigo-100'}`}>
                      {isTutor ? 'AI Study Tutor' : 'You'}
                    </p>
                    <p className="whitespace-pre-line text-[13px]">
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {/* Thinking / Loading Bubble */}
            {isSending && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4.5 h-4.5" />
                </div>
                <div className="bg-white text-slate-500 rounded-2xl p-3 px-4 border border-slate-100 shadow-sm text-xs flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Message action Input bar */}
      <form onSubmit={handleSubmit} className="bg-white border-t border-slate-100 p-3 flex gap-2 items-center shrink-0">
        <input
          id="chat-input-text"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isSending}
          placeholder="Ask a specific query on these notes... (e.g., Explain page 2, verify equation, etc.)"
          className="flex-1 text-xs border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition disabled:bg-slate-50 disabled:text-slate-400"
          required
        />
        <button
          id="btn-send-message"
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="w-11 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white flex items-center justify-center rounded-xl shadow-sm transition shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
