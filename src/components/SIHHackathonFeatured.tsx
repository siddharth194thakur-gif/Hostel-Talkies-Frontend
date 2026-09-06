import React, { useState } from 'react';
import {
  Flame,
  Sparkles,
  Calendar,
  Users,
  ExternalLink,
  FileText,
  Share2,
  MapPin,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Eye,
  Mail,
  GraduationCap,
  X,
  ZoomIn,
} from 'lucide-react';
import { Event } from '../types';

interface SIHHackathonFeaturedProps {
  event?: Event;
}

export const SIHHackathonFeatured: React.FC<SIHHackathonFeaturedProps> = ({ event }) => {
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const registrationUrl = 'https://forms.gle/YLZTDtHaQTDESos7';
  const noticeImageUrl = '/sih-2026-notice.jpg';

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const shareText = `🔥 Smart India Hackathon (SIH) 2026 – Internal Round\n🏛️ Organized by: Institution’s Innovation Council (IIC), UNSIET, VBSPU\n\n📅 Important Dates:\n• Problem Statements: 21 Aug 2026\n• PPT Deadline: 12 Sep 2026\n• Final Hackathon: 15 Sep 2026\n\n👥 Team Size: 6 Members (At least 1 female member mandatory!)\n\n🚀 Register on Google Form: ${registrationUrl}\n\nView on HostelTalkies!`;

    if (navigator.share) {
      navigator.share({
        title: 'Smart India Hackathon (SIH) 2026 – Internal Round',
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* ─── Gen-Z Premium Tech Hackathon Spotlight Card ─── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-2 border-indigo-500/40 shadow-2xl shadow-indigo-950/50 text-white p-5 sm:p-7 md:p-8 animate-fade-in group">
        {/* Neon Ambient Background Blurs */}
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-gradient-to-br from-brand-500/25 to-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 top-1/2 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Subtle Tech Grid lines overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 space-y-6">
          {/* Header Row: Badges & Share */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500/30 to-amber-500/30 border border-rose-400/40 text-rose-200 text-[11px] font-black tracking-wider uppercase backdrop-blur-md shadow-xs">
                <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
                <span>SIH 2026 • INTERNAL ROUND</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-indigo-300" />
                <span>Featured Showcase</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold tracking-wider uppercase">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Official University Notice</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold border border-white/10 transition backdrop-blur-sm cursor-pointer active:scale-95 ml-auto"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-300" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          {/* Main Title & University Info */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200">
              Smart India Hackathon (SIH) 2026
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm font-semibold text-indigo-300/90">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Institution’s Innovation Council (IIC)</span>
              </span>
              <span className="hidden sm:inline text-indigo-500">•</span>
              <span>Faculty of Engineering and Technology (UNSIET), VBSPU</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-4xl pt-1">
              National-level innovation &amp; problem-solving platform. Form a team, tackle real-world problem statements, build technological prototypes, and represent our university on the national stage!
            </p>
          </div>

          {/* Highlights Grid (Dates, Team Size, Notice Preview) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
            {/* 1. Important Dates Card (5 cols) */}
            <div className="md:col-span-4 rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-md flex flex-col justify-between space-y-3 hover:border-indigo-500/40 transition">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">Important Dates</h4>
                  <span className="text-[10px] text-slate-400">Strict Timelines</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2 p-2 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-slate-300 font-medium">Problem Statements</span>
                  <span className="font-bold text-amber-200 shrink-0 text-right">21 Aug 2026</span>
                </div>

                <div className="flex items-start justify-between gap-2 p-2 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-slate-300 font-medium">PPT Submission Deadline</span>
                  <span className="font-black text-rose-300 shrink-0 text-right">12 Sep 2026</span>
                </div>

                <div className="flex items-start justify-between gap-2 p-2 rounded-xl bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-400/30">
                  <span className="text-white font-bold">Final Hackathon Round</span>
                  <span className="font-black text-emerald-300 shrink-0 text-right">15 Sep 2026</span>
                </div>
              </div>
            </div>

            {/* 2. Team Requirements & Guidelines (4 cols) */}
            <div className="md:col-span-4 rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-md flex flex-col justify-between space-y-3 hover:border-indigo-500/40 transition">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-300">Team Composition</h4>
                  <span className="text-[10px] text-slate-400">Eligibility Criteria</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-semibold">Team Size</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/30 font-black text-indigo-200">
                      6 Members
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Strictly 6 members per registered squad.</p>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-300 font-black text-[11px]">
                    <span className="text-sm">♀️</span>
                    <span>FEMALE MEMBER REQUIREMENT</span>
                  </div>
                  <p className="text-[11px] text-rose-200/90 font-medium">
                    At least <strong>1 female member is mandatory</strong> in each participating team.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Official Notice Document Preview (4 cols) */}
            <div className="md:col-span-4 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 p-4 backdrop-blur-md flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-300" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">Official Circular</h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 font-bold">
                  Signed
                </span>
              </div>

              {/* Clickable Image Preview */}
              <div
                onClick={() => setShowNoticeModal(true)}
                className="relative rounded-xl overflow-hidden cursor-pointer group/thumb border border-white/20 bg-black/40 aspect-[4/3] flex items-center justify-center"
              >
                <img
                  src={noticeImageUrl}
                  alt="Official SIH 2026 Notice"
                  className="w-full h-full object-cover object-top opacity-90 group-hover/thumb:scale-105 group-hover/thumb:opacity-100 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col items-center justify-end p-2.5 text-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-600/90 hover:bg-brand-500 text-white text-[10px] font-bold shadow-md transition">
                    <ZoomIn className="w-3 h-3" />
                    <span>Click to View Full Notice</span>
                  </span>
                </div>
              </div>

              {/* Coordinator contact chip */}
              <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1">
                <span className="truncate">SPOC: <strong>Dr. Satyam K. Upadhyay</strong></span>
                <span className="truncate text-slate-400">UNSIET</span>
              </div>
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="text-slate-300 font-semibold">UNSIET, VBS Purvanchal University</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <a href="mailto:usatym2508@gmail.com" className="hover:text-cyan-300 transition">
                  usatym2508@gmail.com
                </a>
              </span>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowNoticeModal(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 backdrop-blur-md transition active:scale-95 cursor-pointer shadow-sm"
              >
                <FileText className="w-4 h-4 text-cyan-300" />
                <span>View Notice</span>
              </button>

              <a
                href={registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white text-xs font-extrabold shadow-lg shadow-brand-500/30 transition-all duration-200 active:scale-95 hover:shadow-brand-500/50 cursor-pointer"
              >
                <span>Register Now</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── High-Resolution Notice Modal ─── */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-100 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300 text-[10px] font-bold uppercase">
                    SIH 2026
                  </span>
                  <h3 className="text-sm font-black text-white">Smart India Hackathon Official Notice</h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Faculty of Engineering and Technology (UNSIET), VBSPU Jaunpur
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNoticeModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Scrollable Image with High Details */}
            <div className="p-4 overflow-y-auto flex-1 bg-slate-950 flex flex-col items-center">
              <div className="bg-white rounded-2xl overflow-hidden shadow-xl max-w-full border border-slate-200">
                <img
                  src={noticeImageUrl}
                  alt="Smart India Hackathon SIH 2026 Official Circular Notice"
                  className="w-full h-auto object-contain max-h-[68vh]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <a
                href={noticeImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white font-semibold transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                <span>Open Notice Image in New Tab</span>
              </a>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition text-xs"
                >
                  Close
                </button>

                <a
                  href={registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition shadow-md shadow-brand-600/30 text-xs"
                >
                  <span>Register on Google Form</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
