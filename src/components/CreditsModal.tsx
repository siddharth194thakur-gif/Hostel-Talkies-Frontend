import React, { useEffect, useState } from 'react';
import {
  X,
  Mail,
  Heart,
  Sparkles,
  Code2,
  Copy,
  Check,
  ExternalLink,
  Users,
  ShieldCheck,
} from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

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

  const supportEmail = 'siddharth.hosteltalkies0022@gmail.com';

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(supportEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const supportedBy = [
    { name: 'Abhishek Yadav', initials: 'AY', color: 'from-blue-500 to-indigo-600' },
    { name: 'Aman Verma', initials: 'AV', color: 'from-emerald-500 to-teal-600' },
    { name: 'Ritesh Chaudhary', initials: 'RC', color: 'from-purple-500 to-violet-600' },
    { name: 'Prince Singh', initials: 'PS', color: 'from-amber-500 to-orange-600' },
    { name: 'Shubham Yadav', initials: 'SY', color: 'from-rose-500 to-pink-600' },
    { name: 'Satish Kumar Singh', initials: 'SK', color: 'from-cyan-500 to-blue-600' },
    { name: 'Mridul Gupta', initials: 'MG', color: 'from-fuchsia-500 to-purple-600' },
    { name: 'Sameer Pratap Singh', initials: 'SP', color: 'from-teal-500 to-emerald-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100/90 overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Top Gradient Banner Header */}
        <div className="relative px-6 py-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden shrink-0">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-20 bottom-0 w-24 h-24 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-brand-500/30 border border-white/20 shrink-0">
                HT
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Hostel<span className="text-brand-400">Talkies</span>
                  </h3>
                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-white/10 text-brand-300 rounded-full border border-white/10 backdrop-blur-xs">
                    Campus Network
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">
                  Designed with passion • Supported by community
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors active:scale-95 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-left">
          {/* Section 1: Developer Card */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-br from-brand-50/60 via-white to-indigo-50/40 border border-brand-100/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-brand-700 text-[10px] font-extrabold uppercase tracking-wider">
                <Code2 className="w-3.5 h-3.5 text-brand-600" />
                <span>Creator &amp; Lead Developer</span>
              </div>
              <span className="px-2 py-0.5 bg-brand-100/70 text-brand-800 text-[10px] font-bold rounded-md">
                BTech CSE
              </span>
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight">
                Siddharth Singh
              </h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
                BTech CSE student currently learning, experimenting, and building modern technology solutions for campus communities.
              </p>
            </div>
          </div>

          {/* Section 2: Supported By Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-800">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Supported By
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">
                8 Contributors
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {supportedBy.map((item) => (
                <div
                  key={item.name}
                  className="px-3.5 py-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-brand-200 hover:bg-slate-50/60 transition-all flex items-center gap-2.5 group"
                >
                  <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${item.color} text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                  >
                    {item.initials}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Need Help & Support Desk */}
          <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-800">
                <Mail className="w-3.5 h-3.5 text-brand-600" />
                <span className="text-xs font-bold">Help &amp; Support Inquiries</span>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-3 rounded-xl border border-slate-200/70">
              <span className="text-xs font-semibold text-slate-700 truncate select-all">
                {supportEmail}
              </span>
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-xs hover:shadow-badge transition-all active:scale-95 shrink-0"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Clean Footer */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-150 flex items-center justify-between text-[11px] text-slate-400 font-medium shrink-0">
          <span>© 2026 HostelTalkies</span>
          <span className="flex items-center gap-1 text-slate-500 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Campus Platform
          </span>
        </div>
      </div>
    </div>
  );
};

