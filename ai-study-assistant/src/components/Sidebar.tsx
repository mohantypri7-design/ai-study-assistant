import React from 'react';
import { Plus, BookOpen, Trash2, Calendar, FileText } from 'lucide-react';
import { StudySession } from '../types';

interface SidebarProps {
  sessions: StudySession[];
  activeSessionId: string | null;
  onSelectSession: (id: string | null) => void;
  onDeleteSession: (id: string) => void;
}

export default function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
}: SidebarProps) {
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div id="study-sidebar" className="bg-white border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col h-full">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
        <h2 className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          Saved Blueprints
        </h2>
        <button
          id="btn-sidebar-new"
          onClick={() => onSelectSession(null)}
          className="p-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          New Unit
        </button>
      </div>

      {/* Session list container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[220px] lg:max-h-none">
        {sessions.length === 0 ? (
          <div className="text-center py-8 px-4 text-slate-400 space-y-1">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300 opacity-60" />
            <p className="text-xs font-medium text-slate-400">No active sessions</p>
            <p className="text-[10px]">Your blueprints will auto-save here.</p>
          </div>
        ) : (
          sessions.map((sess) => {
            const isActive = sess.id === activeSessionId;
            return (
              <div
                id={`session-item-${sess.id}`}
                key={sess.id}
                className={`group flex items-center justify-between p-2.5 rounded-xl transition ${
                  isActive
                    ? 'bg-indigo-50/70 border-indigo-100/40 border text-indigo-950 font-medium'
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                {/* Information click wrapper */}
                <button
                  id={`btn-load-session-${sess.id}`}
                  onClick={() => onSelectSession(sess.id)}
                  className="flex-1 flex gap-2.5 items-start text-left"
                >
                  <span className={`p-1.5 rounded-lg mt-0.5 ${
                    isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {sess.docType === 'pdf' ? (
                      <BookOpen className="w-3.5 h-3.5" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold leading-tight pr-1 line-clamp-1">
                      {sess.name}
                    </p>
                    <div className="flex gap-1.5 items-center mt-0.5 text-[9px] text-slate-400">
                      <Calendar className="w-3 h-3 text-slate-300" />
                      <span>{formatDate(sess.createdAt)}</span>
                      {sess.docSize && (
                        <>
                          <span>•</span>
                          <span>{sess.docSize}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>

                {/* Delete button option */}
                <button
                  id={`btn-delete-session-${sess.id}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(sess.id);
                  }}
                  className="text-slate-300 hover:text-rose-500 p-1 rounded-lg hover:bg-slate-100/40 opacity-0 group-hover:opacity-100 transition shrink-0"
                  title="Delete Blueprint"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Brief disclaimer status marker */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 leading-tight shrink-0">
        <p className="font-semibold text-slate-500">Hackathon Spec Tier</p>
        <p className="mt-0.5">Outputs rendered server-side on Google Cloud Run utilizing Gemini 3.5 Flash.</p>
      </div>
    </div>
  );
}
