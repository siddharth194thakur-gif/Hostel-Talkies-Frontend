import React, { useState, useEffect } from 'react';
import { X, Send, FileText, Image as ImageIcon, Video, Music, Paperclip, FileCode, FileArchive } from 'lucide-react';

interface AttachmentComposerModalProps {
  file: File | null;
  isOpen: boolean;
  isSending: boolean;
  onSend: (file: File, caption: string) => Promise<void>;
  onClose: () => void;
}

export const AttachmentComposerModal: React.FC<AttachmentComposerModalProps> = ({
  file,
  isOpen,
  isSending,
  onSend,
  onClose,
}) => {
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  if (!isOpen || !file) return null;

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isZip = file.name.toLowerCase().endsWith('.zip') || file.name.toLowerCase().endsWith('.rar');
  const isDoc = file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx');
  const isPpt = file.name.toLowerCase().endsWith('.ppt') || file.name.toLowerCase().endsWith('.pptx');
  const isXls = file.name.toLowerCase().endsWith('.xls') || file.name.toLowerCase().endsWith('.xlsx');

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileCategoryLabel = () => {
    if (isImage) return 'Photo';
    if (isVideo) return 'Video';
    if (isAudio) return 'Voice / Audio Note';
    if (isPdf) return 'PDF Document';
    if (isDoc) return 'Word Document';
    if (isPpt) return 'PowerPoint Presentation';
    if (isXls) return 'Excel Spreadsheet';
    if (isZip) return 'Archive File';
    return 'File Attachment';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || isSending) return;
    await onSend(file, caption.trim());
    setCaption('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              {isImage ? (
                <ImageIcon className="w-4 h-4" />
              ) : isVideo ? (
                <Video className="w-4 h-4" />
              ) : isAudio ? (
                <Music className="w-4 h-4" />
              ) : isZip ? (
                <FileArchive className="w-4 h-4 text-amber-600" />
              ) : (
                <FileText className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm block">Review {getFileCategoryLabel()}</span>
              <span className="text-[10px] text-slate-400">Ready to send in conversation</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Media Preview Container */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col items-center justify-center bg-slate-900/5 min-h-[220px]">
          {isImage && previewUrl && (
            <div className="relative max-h-[320px] w-full flex items-center justify-center rounded-2xl overflow-hidden bg-black/5 p-2">
              <img
                src={previewUrl}
                alt="Upload preview"
                className="max-h-[300px] max-w-full object-contain rounded-xl shadow-md"
              />
            </div>
          )}

          {isVideo && previewUrl && (
            <div className="relative max-h-[320px] w-full flex items-center justify-center rounded-2xl overflow-hidden bg-black p-2">
              <video
                src={previewUrl}
                controls
                className="max-h-[280px] max-w-full rounded-lg"
              />
            </div>
          )}

          {!isImage && !isVideo && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center max-w-xs w-full space-y-3">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xs ${
                  isPdf
                    ? 'bg-rose-50 text-rose-600'
                    : isDoc
                    ? 'bg-blue-50 text-blue-600'
                    : isXls
                    ? 'bg-emerald-50 text-emerald-600'
                    : isPpt
                    ? 'bg-amber-50 text-amber-600'
                    : isZip
                    ? 'bg-purple-50 text-purple-600'
                    : isAudio
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isAudio ? (
                  <Music className="w-8 h-8" />
                ) : isZip ? (
                  <FileArchive className="w-8 h-8" />
                ) : (
                  <FileText className="w-8 h-8" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 break-all">{file.name}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold uppercase">
                    {file.name.split('.').pop() || 'FILE'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{formatFileSize(file.size)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 text-[11px] text-slate-500 font-medium">
            {file.name} • {formatFileSize(file.size)}
          </div>
        </div>

        {/* Caption & Send Form */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white space-y-3">
          <div className="relative">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add an optional caption..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none transition"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-brand-500/20 active:scale-95 transition disabled:opacity-50"
            >
              {isSending ? (
                <span>Sending...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

