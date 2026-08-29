import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Building,
  Tag,
  Sparkles,
  Compass,
  ShoppingBag,
  Gift,
  Repeat,
  Users,
  AlertCircle,
  MessageSquare,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import api from '../api/client';
import { Post, Category, Hostel } from '../types';
import { PostCard } from '../components/PostCard';
import { SearchWithHistory } from '../components/SearchWithHistory';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';

export const ExplorePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);

  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedHostel, setSelectedHostel] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);

  // Fetch filter metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, hostelRes] = await Promise.all([
          api.get<{ results: Category[] } | Category[]>('/posts/categories/'),
          api.get<{ results: Hostel[] } | Hostel[]>('/hostels/'),
        ]);
        const catData = catRes.data as any;
        const hostelData = hostelRes.data as any;
        setCategories(Array.isArray(catData) ? catData : (Array.isArray(catData?.results) ? catData.results : []));
        setHostels(Array.isArray(hostelData) ? hostelData : (Array.isArray(hostelData?.results) ? hostelData.results : []));
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType) params.append('post_type', selectedType);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedHostel) params.append('hostel', selectedHostel);
      if (selectedCondition) params.append('condition', selectedCondition);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get<{ results: Post[] } | Post[]>(`/posts/?${params.toString()}`);
      const list = Array.isArray(res.data) ? res.data : (res.data as any)?.results || [];
      setPosts(list);
    } catch (err) {
      console.error('Failed to load explore feed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedType, selectedCategory, selectedHostel, selectedCondition, searchQuery]);

  const handleResetFilters = () => {
    setSelectedType('');
    setSelectedCategory('');
    setSelectedHostel('');
    setSelectedCondition('');
    setSearchQuery('');
  };

  const discoveryPills = [
    { label: 'All Feeds', value: '', icon: Compass },
    { label: 'Buy & Sell', value: 'buy_sell', icon: ShoppingBag },
    { label: 'Free Giveaways', value: 'giveaway', icon: Gift },
    { label: 'Exchange & Barter', value: 'exchange', icon: Repeat },
    { label: 'Roommate Search', value: 'roommate', icon: Users },
    { label: 'Lost & Found', value: 'lost', icon: AlertCircle },
    { label: 'Discussions', value: 'general', icon: MessageSquare },
  ];

  const activeFiltersCount = [
    selectedType,
    selectedCategory,
    selectedHostel,
    selectedCondition,
    searchQuery,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 text-xs">
      {/* 3D Explore Discovery Hero Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden banner-3d border border-slate-800 animate-fade-in">
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-brand-500/20 rounded-full blur-3xl pointer-events-none animate-ambient-float" />
        <div className="absolute right-36 bottom-0 w-44 h-44 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none animate-glow-pulse" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 transform-3d">
          <div className="space-y-2.5 max-w-xl translate-z-20">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-brand-500/20 text-brand-300 rounded-full border border-brand-400/30 backdrop-blur-xs flex items-center gap-1.5 shadow-2xs">
                <Compass className="w-3.5 h-3.5 text-brand-400" />
                <span>Universal Campus Feed</span>
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/10 text-slate-300 rounded-full border border-white/10">
                Live Discoveries
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight translate-z-30 drop-shadow-md">
              Explore Campus Feed
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed translate-z-20">
              Discover marketplace deals, roommate searches, free giveaways, book exchanges, and hostel discussions across all student residences.
            </p>
          </div>

          {/* Quick Real-time Discovery Counters */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto translate-z-40">
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[85px]">
              <span className="block text-xl font-black text-white">{posts.length}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Posts
              </span>
            </div>
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[85px]">
              <span className="block text-xl font-black text-brand-300">{hostels.length || 5}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Hostels
              </span>
            </div>
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[85px]">
              <span className="block text-xl font-black text-emerald-300">{categories.length || 8}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Tags
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Discovery Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {discoveryPills.map((pill) => {
          const Icon = pill.icon;
          const isActive = selectedType === pill.value;
          return (
            <button
              key={pill.value}
              type="button"
              onClick={() => setSelectedType(pill.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 scale-[1.02]'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 shadow-2xs hover:border-slate-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Control Bar with Instant Search */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-subtle space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input with History */}
          <div className="flex-1">
            <SearchWithHistory
              value={searchQuery}
              onChange={(val) => setSearchQuery(val)}
              placeholder="Search items, keywords, model, authors..."
              storageKey="ht_search_history_explore"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] font-bold text-slate-700">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-600" />
              <span>Filters ({activeFiltersCount})</span>
            </div>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-brand-600 hover:text-brand-700 underline px-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Selects */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 border-t border-slate-100 text-xs">
          {/* Post Type Dropdown */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-2xl text-slate-800 focus:bg-white focus:border-brand-500 outline-none text-xs font-semibold transition cursor-pointer"
          >
            <option value="">All Post Types</option>
            <option value="buy_sell">Buy &amp; Sell</option>
            <option value="giveaway">Free Giveaway</option>
            <option value="exchange">Exchange &amp; Barter</option>
            <option value="borrow">Borrow Request</option>
            <option value="lend">Lend Offer</option>
            <option value="lost">Lost Item</option>
            <option value="found">Found Item</option>
            <option value="roommate">Roommate Search</option>
            <option value="study">Study Talk</option>
            <option value="general">General</option>
            <option value="others">Others</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-2xl text-slate-800 focus:bg-white focus:border-brand-500 outline-none text-xs font-semibold transition cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Hostel Dropdown */}
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-2xl text-slate-800 focus:bg-white focus:border-brand-500 outline-none text-xs font-semibold transition cursor-pointer"
          >
            <option value="">All Hostels</option>
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          {/* Condition Dropdown */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-2xl text-slate-800 focus:bg-white focus:border-brand-500 outline-none text-xs font-semibold transition cursor-pointer"
          >
            <option value="">Any Condition</option>
            <option value="new">Brand New</option>
            <option value="like_new">Like New</option>
            <option value="good">Good Condition</option>
            <option value="used">Used / Fair</option>
          </select>
        </div>
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <LoadingSkeleton count={6} />
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onPostUpdated={fetchPosts} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No posts matching your filters"
          message="Try adjusting your search keywords or reset active filters."
          actionText="Reset Filters"
          onAction={handleResetFilters}
        />
      )}
    </div>
  );
};

