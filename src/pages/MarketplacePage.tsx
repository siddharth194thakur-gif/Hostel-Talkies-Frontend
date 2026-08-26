import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Gift, RefreshCw, Handshake, PlusCircle, Search, Filter } from 'lucide-react';
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
    fetchMarketplacePosts();
  }, [activeTab, selectedCategory]);

  const tabs = [
    { id: 'all', label: 'All Marketplace', icon: ShoppingBag },
    { id: 'buy_sell', label: 'Buy & Sell', icon: ShoppingBag },
    { id: 'giveaway', label: 'Free Giveaways', icon: Gift },
    { id: 'exchange', label: 'Exchange & Barter', icon: RefreshCw },
    { id: 'borrow', label: 'Borrow & Lend', icon: Handshake },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Hostel Marketplace</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Buy, sell, giveaway, and exchange pre-loved hostel essentials</p>
        </div>

        <Link
          to="/create-post?type=buy_sell"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-badge transition-all active:scale-95 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post an Item</span>
        </Link>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all duration-200 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Category Filter Chips */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition-all text-xs ${
              selectedCategory === ''
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(selectedCategory === String(c.id) ? '' : String(c.id))}
              className={`px-3 py-1 rounded-lg font-medium shrink-0 transition-all text-xs ${
                selectedCategory === String(c.id)
                  ? 'bg-brand-600 text-white shadow-2xs font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchMarketplacePosts();
          }}
          className="relative w-full sm:w-64"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none shadow-subtle placeholder:text-slate-400"
          />
        </form>
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
          message="No items match your selected filter. Why not list your own item?"
          actionText="List an Item"
          onAction={() => window.location.href = '/create-post'}
        />
      )}
    </div>
  );
};
