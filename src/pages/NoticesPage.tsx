import React, { useState, useEffect } from 'react';
import { BellRing, AlertCircle, Search, Filter } from 'lucide-react';
import api from '../api/client';
import { Notice } from '../types';
import { NoticeCard } from '../components/NoticeCard';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';

export const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedPriority) params.append('priority', selectedPriority);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get<{ results: Notice[] } | Notice[]>(`/notices/?${params.toString()}`);
      setNotices(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotices();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedPriority, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Official Notice Board</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Verified announcements and updates issued by campus administration</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchNotices();
          }}
          className="relative w-full sm:w-64"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notices..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none shadow-subtle placeholder:text-slate-400"
          />
        </form>
      </div>

      {/* Priority Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setSelectedPriority('')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
            selectedPriority === ''
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          All Notices
        </button>
        <button
          onClick={() => setSelectedPriority('urgent')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            selectedPriority === 'urgent'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white text-red-600 hover:bg-red-50 border border-red-200/80'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Urgent</span>
        </button>
        <button
          onClick={() => setSelectedPriority('important')}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            selectedPriority === 'important'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white text-brand-700 hover:bg-brand-50 border border-brand-200/80'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          <span>Important</span>
        </button>
        <button
          onClick={() => setSelectedPriority('normal')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
            selectedPriority === 'normal'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
          }`}
        >
          General
        </button>
      </div>

      {/* Notices List */}
      {isLoading ? (
        <LoadingSkeleton count={3} type="list" />
      ) : notices.length > 0 ? (
        <div className="space-y-4">
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No notices found"
          message="No active official notices found matching your criteria."
        />
      )}
    </div>
  );
};
