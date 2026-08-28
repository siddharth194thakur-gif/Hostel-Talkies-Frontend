import React, { useEffect } from 'react';
import { X, Mail, Heart, Sparkles, ExternalLink } from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const supportedBy = [
    'Abhishek Yadav',
    'Aman Verma',
    'Ritesh Chaudhary',
    'Prince Singh',
    'Shubham Yadav',
    'Satish Kumar Singh',
    'Mridul Gupta',
    'Sameer Pratap Singh',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
              HT
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Hostel<span className="text-brand-600">Talkies</span>
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Supported By
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-center sm:text-left">
          {/* Section 1: Developer Credit */}
          <div className="space-y-1.5 bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Designed & Developed by
            </span>
            <div className="text-base font-extrabold text-slate-900">
              Siddharth Singh
            </div>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              BTech CSE student currently learning, experimenting, and building with technology.
            </p>
          </div>

          {/* Section 2: Supported By */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Supported by
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
              {supportedBy.map((name) => (
                <div
                  key={name}
                  className="px-3 py-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2 hover:border-brand-300 transition"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                  <span className="truncate">{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clean Separator */}
          <hr className="border-slate-150" />

          {/* Section 3: Need Help / Contact Support */}
          <div className="space-y-3 bg-gradient-to-br from-indigo-50/40 via-purple-50/20 to-slate-50 rounded-2xl p-4.5 border border-indigo-100/60">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-800 block">
                Need help?
              </span>
              <a
                href="mailto:siddharth.hosteltalkies0022@gmail.com"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline transition block break-all"
              >
                siddharth.hosteltalkies0022@gmail.com
              </a>
            </div>

            <a
              href="mailto:siddharth.hosteltalkies0022@gmail.com"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-badge transition active:scale-98"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Support</span>
            </a>
          </div>
        </div>

        {/* Modal Footer / Copyright */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            © 2026 HostelTalkies. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
