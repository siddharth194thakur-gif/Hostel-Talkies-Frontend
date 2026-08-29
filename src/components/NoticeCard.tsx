import React, { useState } from 'react';
import {
  BellRing,
  Calendar,
  Building,
  AlertTriangle,
  FileText,
  Paperclip,
  ShieldCheck,
  Clock,
  Share2,
  Check,
  ExternalLink,
  Megaphone,
} from 'lucide-react';
import { Notice } from '../types';

interface NoticeCardProps {
  notice: Notice;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const shareText = `📌 [Notice] ${notice.title}\n${notice.content}\n\nIssued by: ${notice.created_by_name} • HostelTalkies`;
    if (navigator.share) {
      navigator.share({
        title: notice.title,
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isUrgent = notice.priority === 'urgent';
  const isImportant = notice.priority === 'important';

  const getPriorityBadge = () => {
    if (isUrgent) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide bg-rose-500 text-white shadow-xs shadow-rose-500/20">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>URGENT ACTION</span>
        </span>
      );
    }
    if (isImportant) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-brand-50 text-brand-700 border border-brand-200">
          <BellRing className="w-3.5 h-3.5 text-brand-600" />
          <span>IMPORTANT</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <Megaphone className="w-3.5 h-3.5 text-slate-500" />
        <span>OFFICIAL CIRCULAR</span>
      </span>
    );
  };

  return (
    <article
      className={`relative rounded-3xl border transition-all duration-300 hover:-translate-y-1 p-5 sm:p-6 space-y-4 bg-white overflow-hidden animate-fade-in-up ${
        isUrgent
          ? 'border-rose-300/80 shadow-md shadow-rose-100/50 hover:shadow-xl'
          : isImportant
          ? 'border-brand-200/80 shadow-subtle hover:shadow-card-hover hover:border-brand-300'
          : 'border-slate-200/80 shadow-subtle hover:shadow-card-hover hover:border-slate-300'
      }`}
    >
      {/* Top Priority Accent Strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          isUrgent
            ? 'bg-gradient-to-r from-rose-500 via-red-500 to-amber-500'
            : isImportant
            ? 'bg-gradient-to-r from-brand-600 to-indigo-600'
            : 'bg-slate-200'
        }`}
      />

      {/* Header Meta: Priority, Target Audience & Published Date */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {getPriorityBadge()}

          {/* Target Hostel Pill */}
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-full">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {notice.target_hostel_name ? (
                <>
                  <span className="font-bold text-slate-800">{notice.target_hostel_name}</span>
                  {notice.target_block_name && ` (${notice.target_block_name})`}
                </>
              ) : (
                'Campus-Wide (All Hostels)'
              )}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {new Date(notice.publish_date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Notice Title & Body */}
      <div className="space-y-2">
        <h3
          className={`text-base sm:text-lg font-extrabold tracking-tight leading-snug ${
            isUrgent ? 'text-rose-950' : 'text-slate-900'
          }`}
        >
          {notice.title}
        </h3>

        <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100/90 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
          {notice.content}
        </div>
      </div>

      {/* Optional Attachment Card */}
      {notice.attachment && (
        <div className="pt-1">
          <a
            href={notice.attachment}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-brand-50/80 hover:bg-brand-100/80 text-brand-900 border border-brand-200/80 text-xs font-bold rounded-xl transition-all active:scale-98 shadow-2xs group"
          >
            <div className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span>Official Attachment Document</span>
            <ExternalLink className="w-3.5 h-3.5 text-brand-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      )}

      {/* Footer: Official Seal & Expiry / Share */}
      <div className="pt-3.5 border-t border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Issued by Authority:{' '}
            <strong className="text-slate-800 font-bold">
              {notice.created_by_name || 'Administration'}
            </strong>{' '}
            {notice.created_by_role && (
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                ({notice.created_by_role})
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {notice.expiry_date && (
            <span className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/80 font-medium">
              <Clock className="w-3 h-3" />
              <span>Valid till: {new Date(notice.expiry_date).toLocaleDateString()}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-brand-600 transition cursor-pointer"
            title="Share Notice"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

