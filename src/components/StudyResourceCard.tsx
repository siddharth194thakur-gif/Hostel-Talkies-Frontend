import React, { useState } from 'react';
import { BookOpen, Download, FileText, ExternalLink, User as UserIcon } from 'lucide-react';
import { StudyResource } from '../types';
import api from '../api/client';

interface StudyResourceCardProps {
  resource: StudyResource;
}

export const StudyResourceCard: React.FC<StudyResourceCardProps> = ({ resource }) => {
  const [downloads, setDownloads] = useState(resource.downloads_count);

  const handleDownload = async () => {
    try {
      await api.post(`/study/${resource.id}/track_download/`);
      setDownloads((prev) => prev + 1);
    } catch (err) {
      // ignore
    }
  };

  const getResourceTypeBadge = () => {
    switch (resource.resource_type) {
      case 'notes':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-100">Notes & Summaries</span>;
      case 'pyq':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">PYQ Papers</span>;
      case 'book':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">E-Book</span>;
      case 'pdf':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-100">PDF Cheatsheet</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200">Study Resource</span>;
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card-hover hover:border-slate-300 transition-shadow duration-200 p-5 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {getResourceTypeBadge()}
          {resource.semester && (
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-md">
              {resource.semester}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-snug">{resource.title}</h3>
          <div className="text-xs font-semibold text-brand-600 mt-1">
            {resource.course_name} {resource.course_code && `(${resource.course_code})`}
          </div>
        </div>

        {resource.description && (
          <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">{resource.description}</p>
        )}

        {resource.department && (
          <div className="text-[10px] text-slate-400 font-medium">
            Dept: {resource.department}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
          <span className="truncate max-w-[120px] font-medium text-[11px]">{resource.uploader_detail?.full_name || 'Student'}</span>
        </div>

        {resource.file ? (
          <a
            href={resource.file}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDownload}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-badge transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ({downloads})</span>
          </a>
        ) : resource.external_link ? (
          <a
            href={resource.external_link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-600 border border-slate-200 text-xs font-semibold rounded-xl transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Link</span>
          </a>
        ) : null}
      </div>
    </article>
  );
};
