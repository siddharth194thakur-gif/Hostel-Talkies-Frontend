import React from 'react';
import { User } from 'lucide-react';

interface GenderIconProps {
  gender?: string | null;
  showLabel?: boolean;
  badge?: boolean;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
}

export const GenderIcon: React.FC<GenderIconProps> = ({
  gender,
  showLabel = false,
  badge = false,
  className = '',
  size = 'sm',
}) => {
  const normalized = (gender || '').toLowerCase().trim();

  const isMale = normalized === 'male' || normalized === 'boy' || normalized === 'm';
  const isFemale = normalized === 'female' || normalized === 'girl' || normalized === 'f';

  if (isMale) {
    if (badge) {
      return (
        <span
          title="Male Resident"
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs ${className}`}
        >
          <svg className="w-3 h-3 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="14" r="5" />
            <line x1="19" y1="5" x2="13.6" y2="10.4" />
            <polyline points="15 5 19 5 19 9" />
          </svg>
          {showLabel && <span>Male</span>}
        </span>
      );
    }

    return (
      <span
        title="Male"
        className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-sky-50 text-sky-600 border border-sky-200/70 font-bold shrink-0 ${className}`}
      >
        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="14" r="5" />
          <line x1="19" y1="5" x2="13.6" y2="10.4" />
          <polyline points="15 5 19 5 19 9" />
        </svg>
      </span>
    );
  }

  if (isFemale) {
    if (badge) {
      return (
        <span
          title="Female Resident"
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs ${className}`}
        >
          <svg className="w-3 h-3 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="9" r="5" />
            <line x1="12" y1="14" x2="12" y2="21" />
            <line x1="9" y1="18" x2="15" y2="18" />
          </svg>
          {showLabel && <span>Female</span>}
        </span>
      );
    }

    return (
      <span
        title="Female"
        className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-rose-50 text-rose-600 border border-rose-200/70 font-bold shrink-0 ${className}`}
      >
        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="9" r="5" />
          <line x1="12" y1="14" x2="12" y2="21" />
          <line x1="9" y1="18" x2="15" y2="18" />
        </svg>
      </span>
    );
  }

  // Default / Neutral fallback if badge is requested
  if (badge && showLabel) {
    return (
      <span
        title="Resident"
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs ${className}`}
      >
        <User className="w-3 h-3 text-slate-400" />
        <span>Resident</span>
      </span>
    );
  }

  return null;
};
