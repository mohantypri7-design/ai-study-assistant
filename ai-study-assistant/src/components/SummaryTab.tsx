import React, { useState } from 'react';
import { Copy, Download, RefreshCw, Check, Sparkles } from 'lucide-react';
import MarkdownView from './MarkdownView';

interface SummaryTabProps {
  summary?: string;
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function SummaryTab({ summary, onGenerate, isGenerating }: SummaryTabProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!summary) return;
    const blob = new Blob([summary], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'study_revision_summary.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="summary-section" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            AI Revision Summary Guide
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured study guide focusing on key educational terms and concept highlights.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          {summary && (
            <>
              <button
                id="btn-copy-summary"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-xs text-slate-600 rounded-lg hover:bg-slate-50 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                id="btn-download-summary"
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-xs text-slate-600 rounded-lg hover:bg-slate-50 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Download .md
              </button>
            </>
          )}
          <button
            id="btn-trigger-summary"
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-xs text-white rounded-lg transition font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {summary ? 'Regenerate Summary' : 'Generate Summary'}
          </button>
        </div>
      </div>

      {isGenerating ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700">Synthesizing study guide...</p>
            <p className="text-xs text-slate-400">Gemini is structuring concepts, highlighting key terminology and formatting bullet points.</p>
          </div>
        </div>
      ) : summary ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
          <MarkdownView content={summary} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mx-auto">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <p className="text-sm font-medium text-slate-700">No Summary Generated Yet</p>
            <p className="text-xs text-slate-400">
              Click the button above to synthesize a customized revision summary of your uploaded notes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
