import React from 'react';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';

export const LoadingSkeleton: React.FC<{ count?: number; type?: 'card' | 'list' }> = ({
  count = 6,
  type = 'card',
}) => {
  return (
    <div
      className={
        type === 'card'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse'
          : 'space-y-4 animate-pulse'
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 bg-slate-200 rounded w-1/2" />
              <div className="h-2.5 bg-slate-100 rounded w-1/3" />
            </div>
          </div>
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-16 bg-slate-100 rounded-xl" />
          <div className="flex justify-between items-center pt-2">
            <div className="h-4 bg-slate-200 rounded w-16" />
            <div className="h-6 bg-slate-200 rounded-lg w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const EmptyState: React.FC<{
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}> = ({
  title = 'No items found',
  message = 'There are currently no items or posts matching your criteria.',
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="text-center py-12 px-4 rounded-2xl bg-white border border-slate-200/80 p-8 max-w-md mx-auto my-8 shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
        {icon || <Inbox className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-xs transition active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export const ErrorState: React.FC<{
  message?: string;
  onRetry?: () => void;
}> = ({ message = 'Failed to load content from the server.', onRetry }) => {
  return (
    <div className="text-center py-10 px-4 rounded-2xl bg-rose-50 border border-rose-200/70 max-w-md mx-auto my-8">
      <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
      <h4 className="font-bold text-rose-900 text-sm">Something went wrong</h4>
      <p className="text-xs text-rose-700 mt-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};
