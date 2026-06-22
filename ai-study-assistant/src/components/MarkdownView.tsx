import React from 'react';

interface MarkdownViewProps {
  content: string;
}

export default function MarkdownView({ content }: MarkdownViewProps) {
  if (!content) return null;

  // Split lines and parse basic styling: bold, headers, blockquotes, code
  const lines = content.split('\n');
  
  return (
    <div className="space-y-4 text-slate-700 leading-relaxed text-sm">
      {lines.map((line, idx) => {
        let trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        // Horizontal line
        if (trimmed === '---' || trimmed === '***') {
          return <hr key={idx} className="my-6 border-slate-100" />;
        }

        // Headers
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="text-2xl font-bold text-slate-800 tracking-tight mt-6 mb-2">
              {parseInlineMarkdown(trimmed.slice(2))}
            </h1>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-lg font-semibold text-indigo-900 border-b border-indigo-50/50 pb-1.5 mt-5 mb-2">
              {parseInlineMarkdown(trimmed.slice(3))}
            </h2>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-base font-semibold text-slate-800 mt-4 mb-2">
              {parseInlineMarkdown(trimmed.slice(4))}
            </h3>
          );
        }

        // Blockquotes
        if (trimmed.startsWith('>')) {
          const content = trimmed.replace(/^>\s*/, '');
          return (
            <blockquote key={idx} className="border-l-4 border-indigo-500 bg-indigo-50/30 px-4 py-2.5 rounded-r-lg italic text-slate-600 my-3">
              {parseInlineMarkdown(content)}
            </blockquote>
          );
        }

        // Code block placeholders
        if (trimmed.startsWith('```')) {
          return null; // Basic simplification - omit the fence lines themselves
        }

        // Lists (un-ordered)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const listContent = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-4 py-0.5">
              <span className="text-indigo-500 font-bold leading-5">•</span>
              <p className="flex-1">{parseInlineMarkdown(listContent)}</p>
            </div>
          );
        }

        // Lists (numbered)
        if (/^\d+\.\s+/.test(trimmed)) {
          const match = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (match) {
            const num = match[1];
            const listContent = match[2];
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-4 py-0.5">
                <span className="text-indigo-600 font-mono text-xs font-semibold pt-0.5">{num}.</span>
                <p className="flex-1">{parseInlineMarkdown(listContent)}</p>
              </div>
            );
          }
        }

        // Standard Paragraph
        return (
          <p key={idx} className="text-slate-600">
            {parseInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

// Simple parser for inline Markdown (e.g. bold **, italic *, and inline code `)
function parseInlineMarkdown(text: string): React.ReactNode {
  if (!text) return '';

  const parts: React.ReactNode[] = [];
  let currentIndex = 0;

  // Pattern matching for bold, italic, code inline
  // regex for: **bold**, *italic*, `code`
  const regex = /(\*\*|`|\*)(.*?)\1/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    const delimiter = match[1];
    const innerText = match[2];

    // Push preceding normal text
    if (matchIndex > currentIndex) {
      parts.push(text.slice(currentIndex, matchIndex));
    }

    if (delimiter === '**') {
      parts.push(<strong key={matchIndex} className="font-bold text-slate-900">{innerText}</strong>);
    } else if (delimiter === '*') {
      parts.push(<em key={matchIndex} className="italic text-slate-800">{innerText}</em>);
    } else if (delimiter === '`') {
      parts.push(<code key={matchIndex} className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono text-xs text-orange-600">{innerText}</code>);
    }

    currentIndex = regex.lastIndex;
  }

  // Push remaining text
  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}
