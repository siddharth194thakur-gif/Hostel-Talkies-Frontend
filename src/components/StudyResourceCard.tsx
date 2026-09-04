import React, { useState } from 'react';
import {
  BookOpen,
  Download,
  FileText,
  ExternalLink,
  User as UserIcon,
  GraduationCap,
  Sparkles,
  Layers,
  Share2,
  Check,
  Building,
  Zap,
} from 'lucide-react';
import { StudyResource } from '../types';
import api from '../api/client';

interface StudyResourceCardProps {
  resource: StudyResource;
}

export const StudyResourceCard: React.FC<StudyResourceCardProps> = ({ resource }) => {
  const [downloads, setDownloads] = useState(resource.downloads_count);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    try {
      await api.post(`/study/${resource.id}/track_download/`);
      setDownloads((prev) => prev + 1);
    } catch (err) {
      // ignore
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const shareText = `📚 [Study Resource] ${resource.title} (${resource.course_name})\nCheck it on HostelTalkies Academic Vault!`;
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTypeTheme = () => {
    switch (resource.resource_type) {
      case 'notes':
        return {
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
          iconBg: 'from-blue-500 to-indigo-600',
          label: 'LECTURE NOTES',
          icon: FileText,
        };
      case 'pyq':
        return {
          badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
          iconBg: 'from-purple-500 to-violet-600',
          label: 'SOLVED PYQ PAPERS',
          icon: GraduationCap,
        };
      case 'book':
      case 'reference_material':
        return {
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          iconBg: 'from-emerald-500 to-teal-600',
          label: 'REFERENCE MATERIAL',
          icon: BookOpen,
        };
      case 'pdf':
        return {
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          iconBg: 'from-amber-500 to-orange-600',
          label: 'CHEATSHEET / FORMULAS',
          icon: Zap,
        };
      case 'lab_file':
        return {
          badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
          iconBg: 'from-orange-500 to-red-500',
          label: 'LAB FILE / MANUAL',
          icon: Layers,
        };
      case 'syllabus':
        return {
          badgeBg: 'bg-green-50 text-green-700 border-green-200',
          iconBg: 'from-green-500 to-emerald-600',
          label: 'SYLLABUS',
          icon: BookOpen,
        };
      case 'important_questions':
        return {
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
          iconBg: 'from-rose-500 to-pink-600',
          label: 'IMPORTANT QUESTIONS',
          icon: Sparkles,
        };
      case 'study_material':
        return {
          badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
          iconBg: 'from-sky-500 to-blue-600',
          label: 'STUDY MATERIAL',
          icon: FileText,
        };
      case 'assignment':
        return {
          badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
          iconBg: 'from-violet-500 to-purple-600',
          label: 'ASSIGNMENT',
          icon: FileText,
        };
      default:
        return {
          badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
          iconBg: 'from-slate-600 to-slate-800',
          label: 'ACADEMIC MATERIAL',
          icon: FileText,
        };
    }
  };


  const theme = getTypeTheme();
  const Icon = theme.icon;

  return (
    <article className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle hover:shadow-card-hover hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 p-5 sm:p-6 flex flex-col justify-between space-y-4 group animate-fade-in-up">
      <div className="space-y-3.5">
        {/* Header: Icon + Type Badge + Course Tag */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${theme.iconBg} text-white flex items-center justify-center shadow-md shadow-slate-200 shrink-0 group-hover:scale-105 transition-transform`}
            >
              <Icon className="w-5 h-5" />
            </div>

            <div>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider border uppercase ${theme.badgeBg}`}
              >
                {theme.label}
              </span>
              <div className="text-xs font-extrabold text-slate-900 mt-0.5 line-clamp-1">
                {resource.course_name}
              </div>
            </div>
          </div>

          {resource.course_code && (
            <span className="px-2.5 py-1 text-[11px] font-black bg-slate-900 text-white rounded-xl shadow-2xs shrink-0 tracking-tight">
              {resource.course_code}
            </span>
          )}
        </div>

        {/* Title */}
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
            {resource.title}
          </h3>
        </div>

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100/80 font-normal">
            {resource.description}
          </p>
        )}

        {/* Tags Matrix: Semester, Department & Unit */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px] font-semibold text-slate-600">
          {resource.semester && (
            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 border border-slate-200/60">
              📅 {resource.semester}
            </span>
          )}
          {resource.department && (
            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 border border-slate-200/60">
              🏛️ {resource.department}
            </span>
          )}
          {resource.unit && (
            <span className="px-2.5 py-1 bg-brand-50 rounded-lg text-brand-700 border border-brand-200/60">
              📖 {resource.unit}
            </span>
          )}
        </div>

      </div>

      {/* Footer: Contributor & Download CTA */}
      <div className="pt-3.5 border-t border-slate-150 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
          <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[9px] shrink-0">
            {resource.uploader_detail?.full_name?.[0] || 'U'}
          </div>
          <span className="truncate text-[11px] font-medium text-slate-500">
            {resource.uploader_detail?.full_name || 'Academic Contributor'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Share Resource"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          {resource.file ? (
            <a
              href={resource.file}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDownload}
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-badge transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get PDF ({downloads})</span>
            </a>
          ) : resource.external_link ? (
            <a
              href={resource.external_link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-brand-50 text-slate-800 hover:text-brand-700 border border-slate-200 text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brand-600" />
              <span>Open Link</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
};

