import React from 'react';
import { BellRing, Calendar, Building, AlertCircle, CheckCircle2, Download, Paperclip } from 'lucide-react';
import { Notice } from '../types';

interface NoticeCardProps {
  notice: Notice;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice }) => {
  const getPriorityBadge = () => {
    switch (notice.priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-red-50 text-red-600 border border-red-100">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>URGENT</span>
          </span>
        );
      case 'important':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-100">
            <BellRing className="w-3.5 h-3.5" />
            <span>IMPORTANT</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
            <span>Notice</span>
          </span>
        );
    }
  };

  return (
    <article
      className={`rounded-2xl border transition-shadow duration-200 p-5 space-y-3.5 bg-white shadow-subtle hover:shadow-card-hover ${
        notice.priority === 'urgent'
          ? 'border-red-200/80 ring-1 ring-red-100/50'
          : notice.priority === 'important'
          ? 'border-brand-200/70'
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {getPriorityBadge()}
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-150 px-2.5 py-0.5 rounded-full">
            <Building className="w-3 h-3 text-slate-400" />
            <span>{notice.target_hostel_name || 'All Hostels'}</span>
          </span>
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          {new Date(notice.publish_date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">{notice.title}</h3>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
          {notice.content}
        </p>
      </div>

      {notice.attachment && (
        <div className="pt-1">
          <a
            href={notice.attachment}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-600 border border-slate-200 text-xs font-semibold rounded-xl transition"
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Download Attachment</span>
          </a>
        </div>
      )}

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Issued by: <strong className="text-slate-600 font-medium">{notice.created_by_name}</strong></span>
        {notice.expiry_date && (
          <span>Expires: {new Date(notice.expiry_date).toLocaleDateString()}</span>
        )}
      </div>
    </article>
  );
};
