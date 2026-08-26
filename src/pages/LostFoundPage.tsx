import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/client';
import { Post } from '../types';
import { PostCard } from '../components/PostCard';
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
    fetchLostFound();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Lost & Found Hub</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Report missing belongings or help peers recover found campus items</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/create-post?type=lost"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/80 text-xs font-bold rounded-xl shadow-2xs transition active:scale-95"
          >
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>Report Lost</span>
          </Link>
          <Link
            to="/create-post?type=found"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-bold rounded-xl shadow-2xs transition active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Report Found</span>
          </Link>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'all' ? 'bg-brand-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setActiveTab('lost')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'lost' ? 'bg-red-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-red-50 hover:text-red-700 border border-slate-200'
            }`}
          >
            Lost Items
          </button>
          <button
            onClick={() => setActiveTab('found')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'found' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
            }`}
          >
            Found Items
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchLostFound();
          }}
          className="relative w-full sm:w-64"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keys, cards, location..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none shadow-subtle placeholder:text-slate-400"
          />
        </form>
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
          title="No lost or found items reported"
          message="Everything seems to be in order! Check back later if you misplace something."
          actionText="Report an Item"
          onAction={() => window.location.href = '/create-post?type=lost'}
        />
      )}
    </div>
  );
};
