import React, { useState, useRef } from 'react';
import { Upload, FileText, LayoutGrid, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadPaneProps {
  onSessionCreated: (sessionData: {
    name: string;
    docType: 'pdf' | 'text';
    docName: string;
    textData?: string;
    pdfData?: string;
    pdfMimeType?: string;
    docSize?: string;
  }) => void;
  isProcessing: boolean;
}

export default function UploadPane({ onSessionCreated, isProcessing }: UploadPaneProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [pastedName, setPastedName] = useState('My Paste Notes');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [base64Data, setBase64Data] = useState<string>('');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    setBase64Data('');
    setPastedText('');
    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
      setError("Only PDF and standard text files (.txt) are supported!");
      return;
    }
    
    setSelectedFile(file);
    setIsReadingFile(true);

    const reader = new FileReader();
    reader.onerror = () => {
      setIsReadingFile(false);
      setSelectedFile(null);
      setError('Could not read that file. Please try selecting it again.');
    };

    if (file.type === 'application/pdf') {
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Split out the "data:application/pdf;base64," header to get raw base64
        const base64Str = result.split(',')[1];
        setBase64Data(base64Str);
        setIsReadingFile(false);
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (e) => {
        const textStr = e.target?.result as string;
        setPastedText(textStr);
        setIsReadingFile(false);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'upload') {
      if (!selectedFile) return;
      
      if (selectedFile.type === 'application/pdf') {
        if (!base64Data) {
          setError('Still preparing the PDF. Please wait a moment and try again.');
          return;
        }
        onSessionCreated({
          name: selectedFile.name.replace(/\.[^/.]+$/, ""),
          docType: 'pdf',
          docName: selectedFile.name,
          pdfData: base64Data,
          pdfMimeType: selectedFile.type,
          docSize: formatBytes(selectedFile.size)
        });
      } else {
        if (!pastedText.trim()) {
          setError('This text file appears to be empty.');
          return;
        }
        onSessionCreated({
          name: selectedFile.name.replace(/\.[^/.]+$/, ""),
          docType: 'text',
          docName: selectedFile.name,
          textData: pastedText,
          docSize: formatBytes(selectedFile.size)
        });
      }
    } else {
      if (!pastedText.trim()) return;
      onSessionCreated({
        name: pastedName.trim() || 'My Notes',
        docType: 'text',
        docName: 'Pasted Copy',
        textData: pastedText,
        docSize: formatBytes(new Blob([pastedText]).size)
      });
    }
  };

  return (
    <div id="upload-container" className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-2xl mx-auto">
      <div className="flex justify-center space-x-1 bg-slate-50 p-1.5 rounded-xl mb-6">
        <button
          id="btn-tab-upload"
          type="button"
          onClick={() => { setActiveTab('upload'); setError(null); }}
          className={`w-1/2 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'upload'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
        <button
          id="btn-tab-paste"
          type="button"
          onClick={() => { setActiveTab('paste'); setError(null); }}
          className={`w-1/2 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'paste'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Paste Study Text
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div id="upload-error-banner" className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs font-medium animate-fade-in">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'upload' ? (
          <div className="space-y-4">
            <div
              id="drop-zone"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={handleUploadClick}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/40'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/10'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <input
                id="file-selector"
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept="application/pdf, text/plain"
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedFile.type === 'application/pdf' ? 'PDF Document' : 'Text Document'} • {formatBytes(selectedFile.size)}
                    </p>
                  </div>
                  <button
                    id="btn-change-file"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setBase64Data('');
                      setPastedText('');
                      setIsReadingFile(false);
                    }}
                    className="text-xs text-indigo-600 font-medium hover:underline mt-2"
                  >
                    Change file
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-700">
                      Drag and drop your file here, or <span className="text-indigo-600 hover:underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Supports PDF and TXT study materials
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="input-paste-name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Study Material Title
              </label>
              <input
                id="input-paste-name"
                type="text"
                value={pastedName}
                onChange={(e) => setPastedName(e.target.value)}
                placeholder="Physics Chapter 4 notes, History exam outline, etc."
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
                required
              />
            </div>
            <div>
              <label htmlFor="input-paste-text" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Copy and Paste Text Notes
              </label>
              <textarea
                id="input-paste-text"
                rows={8}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste definitions, formulas, raw web content, textbook excerpts, or lectures here..."
                className="w-full text-sm border border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition"
                required
              />
            </div>
          </div>
        )}

        <button
          id="btn-process-material"
          type="submit"
          disabled={isProcessing || isReadingFile || (activeTab === 'upload' ? !selectedFile : !pastedText.trim())}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-sm text-sm transition flex items-center justify-center gap-2"
        >
          <LayoutGrid className="w-4 h-4" />
          {isProcessing ? 'Processing Study Material...' : isReadingFile ? 'Preparing File...' : 'Initialize Study Blueprint'}
        </button>
      </form>
    </div>
  );
}
