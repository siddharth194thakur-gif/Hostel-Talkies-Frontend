import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, Building, Tag } from 'lucide-react';
import api from '../api/client';
import { Post, Category, Hostel } from '../types';
import { PostCard } from '../components/PostCard';
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
      const list = Array.isArray(res.data) ? res.data : res.data.results || [];
      setPosts(list);
    } catch (err) {
      console.error('Failed to load explore feed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedType, selectedCategory, selectedHostel, selectedCondition]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleResetFilters = () => {
    setSelectedType('');
    setSelectedCategory('');
    setSelectedHostel('');
    setSelectedCondition('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Explore Feed</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Discover everything happening across your campus community</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none shadow-subtle placeholder:text-slate-400"
          />
        </form>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Filter className="w-3.5 h-3.5 text-brand-600" />
            <span>Filter Feed</span>
          </div>
          {(selectedType || selectedCategory || selectedHostel || selectedCondition || searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-brand-600 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {/* Post Type */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs transition"
          >
            <option value="">All Post Types</option>
            <option value="buy_sell">Buy & Sell</option>
            <option value="giveaway">Free Giveaway</option>
            <option value="exchange">Exchange</option>
            <option value="borrow">Borrow Request</option>
            <option value="lend">Lend Offer</option>
            <option value="lost">Lost Item</option>
            <option value="found">Found Item</option>
            <option value="roommate">Roommate</option>
            <option value="study">Study Talk</option>
            <option value="general">General</option>
          </select>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs transition"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Hostel */}
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs transition"
          >
            <option value="">All Hostels</option>
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          {/* Condition */}
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs transition"
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
          message="Try adjusting your search criteria or reset filters."
          actionText="Reset Filters"
          onAction={handleResetFilters}
        />
      )}
    </div>
  );
};
