import React, { useState, useEffect } from 'react';
import { Bookmark, Sparkles } from 'lucide-react';
import api from '../api/client';
import { Post } from '../types';
import { PostCard } from '../components/PostCard';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';
import { BackButton } from '../components/BackButton';

export const SavedPostsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchSavedPosts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get<{ results: Post[] } | Post[]>('/posts/?saved=true');
      setPosts(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load saved posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <BackButton fallback="/home" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Saved Items & Posts</h1>
        <p className="text-xs text-slate-500">Items and discussions you have bookmarked for later</p>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
          <p className="text-sm font-semibold text-rose-700">{error}</p>
          <button
            type="button"
            onClick={fetchSavedPosts}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition active:scale-95"
          >
            Retry Loading
          </button>
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onPostUpdated={fetchSavedPosts} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No saved items yet"
          message="Click the bookmark icon on any post or marketplace listing to save it here."
        />
      )}
    </div>
  );
};
