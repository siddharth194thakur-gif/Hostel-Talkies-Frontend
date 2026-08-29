import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Gift,
  RefreshCw,
  Handshake,
  PlusCircle,
  Search,
  Filter,
  Sparkles,
  Tag,
  ShieldCheck,
  Zap,
  X,
  Layers,
} from 'lucide-react';
import api from '../api/client';
import { Post, Category } from '../types';
import { PostCard } from '../components/PostCard';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';

export const MarketplacePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'buy_sell' | 'giveaway' | 'exchange' | 'borrow'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get<{ results: Category[] } | Category[]>('/posts/categories/?post_type=marketplace');
        setCategories(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  const fetchMarketplacePosts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab === 'all') {
        params.append('post_type', 'marketplace');
      } else {
        params.append('post_type', activeTab);
      }
      if (selectedCategory) params.append('category', selectedCategory);
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
      fetchMarketplacePosts();
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab, selectedCategory, searchQuery]);

  const tabs = [
    { id: 'all', label: 'All Marketplace', icon: ShoppingBag },
    { id: 'buy_sell', label: 'Buy & Sell', icon: Tag },
    { id: 'giveaway', label: 'Free Giveaways', icon: Gift },
    { id: 'exchange', label: 'Exchange & Barter', icon: RefreshCw },
    { id: 'borrow', label: 'Borrow & Lend', icon: Handshake },
  ];

  const giveawayCount = posts.filter((p) => p.post_type === 'giveaway').length;

  return (
    <div className="space-y-6 text-xs">
      {/* Luxury Marketplace Hero Hub */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden shadow-xl border border-slate-800 animate-fade-in">
        <div className="absolute -right-12 -top-12 w-52 h-52 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-ambient-float" />
        <div className="absolute right-36 bottom-0 w-40 h-40 bg-brand-500/20 rounded-full blur-2xl pointer-events-none animate-glow-pulse" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30 backdrop-blur-xs flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Campus Marketplace • Peer Trade</span>
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/10 text-slate-300 rounded-full border border-white/10 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>100% Student Verified</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Hostel Marketplace &amp; Deals
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Buy, sell, giveaway, and barter pre-loved hostel essentials, electronics, coolers, study tables, bicycles, and books within your hostel community.
            </p>
          </div>

          {/* Quick Stats & Post CTA */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[85px]">
              <span className="block text-xl font-black text-white">{posts.length}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Live Deals
              </span>
            </div>
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[85px]">
              <span className="block text-xl font-black text-emerald-300">{giveawayCount}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Free Stuff
              </span>
            </div>
            <Link
              to="/create-post?type=buy_sell"
              className="px-4 py-3.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Post an Item</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Control Bar: Mode Tabs, Search & Category Filter Chips */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-subtle space-y-3">
        {/* Marketplace Mode Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter Chips */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              className={`px-3.5 py-1.5 rounded-xl font-bold shrink-0 transition-all text-xs cursor-pointer ${
                selectedCategory === ''
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === String(c.id) ? '' : String(c.id))}
                className={`px-3.5 py-1.5 rounded-xl font-semibold shrink-0 transition-all text-xs cursor-pointer ${
                  selectedCategory === String(c.id)
                    ? 'bg-brand-600 text-white shadow-xs font-bold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, coolers, cycles..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none shadow-2xs placeholder:text-slate-400 font-medium transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <LoadingSkeleton count={6} />
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onPostUpdated={fetchMarketplacePosts} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No marketplace listings found"
          message="No items match your selected filter. Why not be the first to list an item?"
          actionText="List an Item"
          onAction={() => window.location.href = '/create-post?type=buy_sell'}
        />
      )}
    </div>
  );
};

