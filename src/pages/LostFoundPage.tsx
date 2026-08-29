import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  X,
  ShieldCheck,
  Compass,
  Radio,
} from 'lucide-react';
import api from '../api/client';
import { Post } from '../types';
import { PostCard } from '../components/PostCard';
import { SearchWithHistory } from '../components/SearchWithHistory';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';

export const LostFoundPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLostFound = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab === 'all') {
        params.append('post_type', 'lost_found');
      } else {
        params.append('post_type', activeTab);
      }
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get<{ results: Post[] } | Post[]>(`/posts/?${params.toString()}`);
      setPosts(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLostFound();
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab, searchQuery]);

  const lostCount = posts.filter((p) => p.post_type === 'lost').length;
  const foundCount = posts.filter((p) => p.post_type === 'found').length;

  return (
    <div className="space-y-6 text-xs">
      {/* 3D Lost & Found Recovery Hero Hub */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950/60 to-slate-900 text-white overflow-hidden banner-3d border border-slate-800 animate-fade-in">
        <div className="absolute -right-12 -top-12 w-52 h-52 bg-rose-500/20 rounded-full blur-3xl pointer-events-none animate-ambient-float" />
        <div className="absolute right-36 bottom-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none animate-glow-pulse" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 transform-3d">
          <div className="space-y-2.5 max-w-xl translate-z-20">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-300 rounded-full border border-rose-400/30 backdrop-blur-xs flex items-center gap-1.5 shadow-2xs">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Campus Recovery Hub</span>
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/10 text-slate-300 rounded-full border border-white/10 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Verified Hostel Community</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight translate-z-30 drop-shadow-md">
              Lost &amp; Found Central
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed translate-z-20">
              Report missing ID cards, keys, earphone cases, calculators, or help fellow hostelers quickly recover their misplaced belongings.
            </p>

            <div className="pt-1.5 flex flex-wrap gap-2.5 translate-z-40">
              <Link
                to="/create-post?type=lost"
                className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-xs rounded-2xl btn-3d-rose flex items-center gap-2 cursor-pointer"
              >
                <AlertCircle className="w-4 h-4" />
                <span>🚨 Report Lost Item</span>
              </Link>
              <Link
                to="/create-post?type=found"
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs rounded-2xl btn-3d-emerald flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>✅ Report Found Item</span>
              </Link>
            </div>
          </div>

          {/* Quick Stats Pill Cards */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[85px]">
              <span className="block text-xl font-black text-white">{posts.length}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Reports
              </span>
            </div>
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[85px]">
              <span className="block text-xl font-black text-rose-400">{lostCount || 'Active'}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Lost
              </span>
            </div>
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[85px]">
              <span className="block text-xl font-black text-emerald-400">{foundCount || 'Safe'}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Found
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Mode Tabs & Real-time Search */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl font-black text-xs transition-all shrink-0 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            All Reports
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lost')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs transition-all shrink-0 cursor-pointer ${
              activeTab === 'lost'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Missing (Lost)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('found')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs transition-all shrink-0 cursor-pointer ${
              activeTab === 'found'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Recovered (Found)</span>
          </button>
        </div>

        <div className="w-full sm:w-72">
          <SearchWithHistory
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            placeholder="Search keys, ID cards, hostel block..."
            storageKey="ht_search_history_lostfound"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <LoadingSkeleton count={6} />
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onPostUpdated={fetchLostFound} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No lost or found reports active"
          message="Everything seems accounted for! Report an item if you misplaced or found something in your hostel."
          actionText="Report an Item"
          onAction={() => window.location.href = '/create-post?type=lost'}
        />
      )}
    </div>
  );
};

