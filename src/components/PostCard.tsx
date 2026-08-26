import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Building,
  Calendar,
  MoreVertical,
  Flag,
  Share2,
  Trash2,
  Tag,
  ArrowRight,
  Handshake,
  HelpCircle,
} from 'lucide-react';
import { Post } from '../types';
import api, { getMediaUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ReportModal } from './ReportModal';
import { ConfirmationDialog } from './ConfirmationDialog';
import { GenderIcon } from './GenderIcon';

interface PostCardProps {
  post: Post;
  onPostUpdated?: () => void;
  onPostDeleted?: (id: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isSaved, setIsSaved] = useState(post.is_saved);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAuthor = user?.id === post.author;
  const isAdmin = user?.is_staff || user?.is_hostel_admin;

  // Close menu on click outside
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    // Optimistic UI
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await api.post(`/posts/${post.id}/toggle_like/`);
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likes_count);
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    const prevSaved = isSaved;
    setIsSaved(!prevSaved);
    try {
      const res = await api.post(`/posts/${post.id}/toggle_save/`);
      setIsSaved(res.data.saved);
    } catch (err) {
      setIsSaved(prevSaved);
    }
  };

  const handleDeletePost = async () => {
    try {
      await api.delete(`/posts/${post.id}/`);
      if (onPostDeleted) onPostDeleted(post.id);
      if (onPostUpdated) onPostUpdated();
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  };

  const getPostTypeBadge = () => {
    switch (post.post_type) {
      case 'buy_sell':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-100">Buy & Sell</span>;
      case 'giveaway':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">Free Giveaway</span>;
      case 'exchange':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-100">Exchange</span>;
      case 'borrow':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">Borrow Request</span>;
      case 'lend':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-100">Lend Offer</span>;
      case 'lost':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-100">Lost Item</span>;
      case 'found':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">Found Item</span>;
      case 'roommate':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">Roommate</span>;
      case 'study':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">Study Talk</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200">Community</span>;
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card-hover hover:border-slate-300 transition-shadow duration-200 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Header: Author info & Hostel details */}
        <div className="p-4 flex items-start justify-between gap-3 border-b border-slate-100/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center overflow-hidden shrink-0 border border-brand-100">
              {post.author_detail?.profile?.avatar ? (
                <img
                  src={getMediaUrl(post.author_detail.profile.avatar)}
                  alt="Author"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span>{post.author_detail?.full_name?.[0] || post.author_detail?.username?.[0] || 'U'}</span>
              )}
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-semibold text-xs text-slate-900 truncate">
                  {post.author_detail?.full_name || post.author_detail?.username}
                </span>
                <GenderIcon gender={post.author_detail?.profile?.gender} />
              </div>
              
              {/* Privacy-aware hostel display */}
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium truncate">
                {post.hostel_name && (
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <Building className="w-3 h-3 text-slate-400" />
                    <span>{post.hostel_name}</span>
                  </span>
                )}
                {post.block_name && <span>• {post.block_name}</span>}
                {post.author_detail?.profile?.room_number && <span>• Rm {post.author_detail.profile.room_number}</span>}
              </div>
            </div>
          </div>

          {/* Action Menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-elevated border border-slate-100 py-1 z-30 text-xs text-slate-700 animate-in fade-in duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    setShowReportModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 text-rose-600 text-left transition-colors font-medium cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5 shrink-0" />
                  <span>Report Post</span>
                </button>

                {(isAuthor || isAdmin) && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-rose-50 text-rose-600 text-left border-t border-slate-100 transition-colors font-medium cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Delete Post</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Image Carousel / Banner if present */}
        {post.images && post.images.length > 0 && (
          <Link to={`/posts/${post.id}`} className="block relative aspect-video bg-slate-50 overflow-hidden">
            <img
              src={post.images[0].image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
            {post.images.length > 1 && (
              <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-900/60 backdrop-blur-xs text-white text-[10px] font-semibold rounded-full">
                +{post.images.length - 1} photos
              </span>
            )}
          </Link>
        )}

        {/* Post Content */}
        <div className="p-4 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {getPostTypeBadge()}
            {post.category_name && (
              <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-md">
                {post.category_name}
              </span>
            )}
            {post.condition && post.condition !== 'na' && (
              <span className="text-[10px] font-medium text-slate-500 capitalize bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-md">
                {post.condition.replace('_', ' ')}
              </span>
            )}
          </div>

          <Link to={`/posts/${post.id}`} className="block group-hover:text-brand-600 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 line-clamp-1 leading-snug">
              {post.title}
            </h3>
          </Link>

          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
            {post.description}
          </p>

          {/* Price or Location Details */}
          <div className="pt-2 flex items-center justify-between">
            {post.post_type === 'giveaway' ? (
              <span className="text-xs font-extrabold text-emerald-600 tracking-tight px-2 py-0.5 bg-emerald-50 rounded-md">FREE</span>
            ) : post.price && parseFloat(post.price) > 0 ? (
              <span className="text-sm font-bold text-brand-600 tracking-tight">₹{post.price}</span>
            ) : post.location ? (
              <span className="text-[11px] text-slate-500 font-medium truncate max-w-[170px]">📍 {post.location}</span>
            ) : (
              <span className="text-[11px] text-slate-400">Hostel Community</span>
            )}

            <span className="text-[10px] text-slate-400">
              {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Social Actions */}
      <div className="px-4 py-2.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs">
        <div className="flex items-center gap-3.5">
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-1 text-xs font-medium transition-colors ${
              isLiked ? 'text-rose-600 font-semibold' : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
          </button>

          <Link
            to={`/posts/${post.id}#comments`}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{post.comments_count || 0}</span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleSave}
            className={`p-1.5 rounded-lg transition-colors ${
              isSaved ? 'text-brand-600 bg-brand-50' : 'text-slate-400 hover:text-brand-600 hover:bg-slate-100'
            }`}
            title="Save post"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <Link
            to={`/posts/${post.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-brand-600 hover:border-brand-300 font-semibold transition text-[11px] shadow-2xs"
          >
            <span>View</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Modals */}
      {showReportModal && (
        <ReportModal
          reportType="post"
          targetId={String(post.id)}
          targetTitle={post.title}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmationDialog
          title="Delete Post"
          message={`Are you sure you want to delete "${post.title}"? This action cannot be undone.`}
          confirmLabel="Delete Post"
          danger
          onConfirm={handleDeletePost}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </article>
  );
};
