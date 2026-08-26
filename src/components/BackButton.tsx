import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallback?: string;
  className?: string;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  fallback = '/home',
  className = '',
  label = 'Back',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Check if there is history to go back to in the current session
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 bg-white hover:bg-brand-50 border border-slate-200/90 hover:border-brand-200 rounded-xl shadow-2xs transition-all duration-150 active:scale-95 group cursor-pointer ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition-transform group-hover:-translate-x-0.5" />
      <span>{label}</span>
    </button>
  );
};
