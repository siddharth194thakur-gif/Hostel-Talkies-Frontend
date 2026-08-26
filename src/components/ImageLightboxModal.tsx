import React from 'react';
import { X, Download, ZoomIn, ExternalLink } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  src: string;
  alt?: string;
  senderName?: string;
  timestamp?: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  src,
  alt = 'Image preview',
  senderName,
  timestamp,
  onClose,
}) => {
  if (!isOpen || !src) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between text-white z-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col">
          {senderName && <span className="text-sm font-bold">{senderName}</span>}
          {timestamp && <span className="text-xs text-white/60">{timestamp}</span>}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={src}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            title="Download image"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image View */}
      <div
        className="flex-1 flex items-center justify-center p-2 sm:p-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[78vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform"
        />
      </div>

      {/* Bottom Hint */}
      <div className="text-center text-xs text-white/50 pb-2">
        Click anywhere outside the image to close
      </div>
    </div>
  );
};
