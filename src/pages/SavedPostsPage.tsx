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

  const fetchSavedPosts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ results: Post[] } | Post[]>('/posts/?saved=true');
      setPosts(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error(err);
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
