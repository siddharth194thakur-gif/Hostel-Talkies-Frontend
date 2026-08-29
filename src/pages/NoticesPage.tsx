import React, { useState, useEffect } from 'react';
import {
  BellRing,
  AlertTriangle,
  Search,
  Building,
  ShieldCheck,
  Megaphone,
  X,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';
import api from '../api/client';
import { Notice, Hostel } from '../types';
import { NoticeCard } from '../components/NoticeCard';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';

export const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedHostel, setSelectedHostel] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Hostels for filtering
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const res = await api.get<{ results: Hostel[] } | Hostel[]>('/hostels/');
        setHostels(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch (err) {
        console.error('Failed to load hostels', err);
      }
    };
    fetchHostels();
  }, []);

  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedPriority) params.append('priority', selectedPriority);
      if (selectedHostel) params.append('target_hostel', selectedHostel);
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
  }, [selectedPriority, selectedHostel, searchQuery]);

  const urgentCount = notices.filter((n) => n.priority === 'urgent').length;
  const importantCount = notices.filter((n) => n.priority === 'important').length;

  return (
    <div className="space-y-6 text-xs">
      {/* Official Executive Hero Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 w-36 h-36 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-brand-500/20 text-brand-300 rounded-full border border-brand-400/30 backdrop-blur-xs flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                <span>Verified Authority Broadcasts</span>
              </span>
              {urgentCount > 0 && (
                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-rose-500/30 text-rose-300 rounded-full border border-rose-400/40 animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  <span>{urgentCount} Urgent Alert{urgentCount > 1 ? 's' : ''}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Official Notice Board
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Official circulars, mess timings, maintenance schedules, and administrative advisories issued by hostel wardens and campus management.
            </p>
          </div>

          {/* Quick Stats Pill Cards */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[90px]">
              <span className="block text-xl font-black text-white">{notices.length}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Circulars
              </span>
            </div>
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[90px]">
              <span className="block text-xl font-black text-brand-300">{urgentCount + importantCount}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Priority
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Multi-Filters */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search circulars by keyword, title, or authority..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-900 focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none transition placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Hostel Filter Dropdown */}
          <div className="w-full sm:w-60 shrink-0">
            <select
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none transition cursor-pointer"
            >
              <option value="">🏛️ All Campus Hostels</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setSelectedPriority('')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              selectedPriority === ''
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            All Notices ({notices.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedPriority('urgent')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedPriority === 'urgent'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50/80 text-rose-700 hover:bg-rose-100 border border-rose-200/80'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Urgent Action</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedPriority('important')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedPriority === 'important'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-brand-50/80 text-brand-700 hover:bg-brand-100 border border-brand-200/80'
            }`}
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Important Updates</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedPriority('normal')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              selectedPriority === 'normal'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-slate-500" />
            <span>General Circulars</span>
          </button>

          {(selectedPriority || selectedHostel || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedPriority('');
                setSelectedHostel('');
                setSearchQuery('');
              }}
              className="ml-auto text-[11px] font-bold text-brand-600 hover:text-brand-700 underline shrink-0 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Notices Feed List */}
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
          title="No circulars found"
          message="No active official notices found matching your selected criteria."
        />
      )}
    </div>
  );
};

