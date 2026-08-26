import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  Bookmark,
  Share2,
  Flag,
  Trash2,
  Building,
  Calendar,
  MessageSquare,
  MessageCircle,
  Handshake,
  Send,
  ArrowLeft,
  ShieldAlert,
  User as UserIcon,
  Tag,
  Clock,
  Eye,
} from 'lucide-react';
import api, { getMediaUrl } from '../api/client';
import { Post, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { ReportModal } from '../components/ReportModal';
import { BorrowModal } from '../components/BorrowModal';
import { ConfirmationDialog } from './../components/ConfirmationDialog';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { BackButton } from '../components/BackButton';
import { GenderIcon } from '../components/GenderIcon';

export const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPost = async () => {
    try {
      const res = await api.get<Post>(`/posts/${id}/`);
      setPost(res.data);
      setIsLiked(res.data.is_liked);
      setLikesCount(res.data.likes_count);
      setIsSaved(res.data.is_saved);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  if (isLoading) {
    return <LoadingSkeleton count={1} />;
  }

  if (!post) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Post Not Found</h2>
        <p className="text-xs text-slate-500">This post may have been deleted or hidden by an administrator.</p>
        <Link to="/home" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">
          Back to Home
        </Link>
      </div>
    );
  }

  const isAuthor = user?.id === post.author;
  const isAdmin = user?.is_staff || user?.is_hostel_admin;

  const handleToggleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const prev = isLiked;
    const count = likesCount;
    setIsLiked(!prev);
    setLikesCount(prev ? count - 1 : count + 1);

    try {
      const res = await api.post(`/posts/${post.id}/toggle_like/`);
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likes_count);
    } catch (err) {
      setIsLiked(prev);
      setLikesCount(count);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const prev = isSaved;
    setIsSaved(!prev);
    try {
      const res = await api.post(`/posts/${post.id}/toggle_save/`);
      setIsSaved(res.data.saved);
    } catch (err) {
      setIsSaved(prev);
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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const res = await api.post<Comment>(`/posts/${post.id}/add_comment/`, {
        content: commentText.trim(),
      });
      setPost((prev) => prev ? {
        ...prev,
        comments: [...(prev.comments || []), res.data],
        comments_count: (prev.comments_count || 0) + 1,
      } : null);
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.delete(`/posts/comments/${commentId}/`);
      setPost((prev) => prev ? {
        ...prev,
        comments: (prev.comments || []).filter((c) => c.id !== commentId),
        comments_count: Math.max(0, (prev.comments_count || 1) - 1),
      } : null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async () => {
    try {
      await api.delete(`/posts/${post.id}/`);
      navigate('/home');
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post('/messages/start/', {
        recipient_id: post.author,
        post_id: post.id,
        message: `Hi! I saw your post "${post.title}". Is it still available?`,
      });
      navigate(`/messages/${res.data.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-xs">
      {/* Back button */}
      <div>
        <BackButton fallback="/home" />
      </div>

      {/* Main Post Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
        {/* Images gallery */}
        {post.images && post.images.length > 0 && (
          <div className="space-y-3">
            <div className="aspect-video bg-slate-900/5 rounded-2xl overflow-hidden relative border border-slate-100 flex items-center justify-center">
              <img
                src={post.images[activeImageIndex]?.image}
                alt={post.title}
                className="w-full h-full object-contain max-h-[420px]"
              />
            </div>

            {post.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {post.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                      activeImageIndex === idx ? 'border-brand-600 ring-2 ring-brand-100' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.image} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Post Metadata & Details */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pt-2">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {getPostTypeBadge()}
              {post.category_name && (
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {post.category_name}
                </span>
              )}
              {post.condition && post.condition !== 'na' && (
                <span className="text-[11px] font-semibold text-slate-600 capitalize bg-slate-100 px-2.5 py-0.5 rounded-full">
                  Condition: {post.condition.replace('_', ' ')}
                </span>
              )}
              {post.status && post.status !== 'available' && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {post.status.toUpperCase()}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-3 text-slate-400 text-xs">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{post.views_count} views</span>
              </span>
            </div>
          </div>

          {/* Price Box */}
          <div className="sm:text-right shrink-0">
            {post.post_type === 'giveaway' ? (
              <span className="text-2xl font-black text-emerald-600">FREE</span>
            ) : post.price && parseFloat(post.price) > 0 ? (
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-brand-600 tracking-tight">₹{post.price}</span>
                <span className="block text-[10px] text-slate-400 font-medium">Negotiable directly</span>
              </div>
            ) : post.location ? (
              <span className="text-xs font-medium text-slate-500">📍 {post.location}</span>
            ) : null}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 text-sm">Description & Details</h3>
          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            {post.description}
          </p>
        </div>

        {/* Author Details Box */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 font-bold text-base flex items-center justify-center shrink-0 overflow-hidden">
              {post.author_detail?.profile?.avatar ? (
                <img
                  src={getMediaUrl(post.author_detail.profile.avatar)}
                  alt="Author"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span>{post.author_detail?.full_name?.[0] || 'U'}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <div className="font-bold text-slate-900 text-sm">
                  {post.author_detail?.full_name || post.author_detail?.username}
                </div>
                <GenderIcon gender={post.author_detail?.profile?.gender} badge showLabel />
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                {post.hostel_name && (
                  <span className="inline-flex items-center gap-1 text-slate-700">
                    <Building className="w-3.5 h-3.5 text-brand-600" />
                    <span>{post.hostel_name}</span>
                  </span>
                )}
                {post.block_name && <span>• {post.block_name}</span>}
                {post.author_detail?.profile?.room_number && (
                  <span>• Room {post.author_detail.profile.room_number}</span>
                )}
              </div>
            </div>
          </div>

          {!isAuthor && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {['borrow', 'lend'].includes(post.post_type) && (
                <button
                  onClick={() => setShowBorrowModal(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm transition active:scale-95 text-xs"
                >
                  <Handshake className="w-4 h-4" />
                  <span>Request to Borrow</span>
                </button>
              )}

              <button
                onClick={handleStartChat}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm hover:shadow-badge transition active:scale-95 text-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat with Resident</span>
              </button>
            </div>
          )}
        </div>

        {/* Social / Sharing Strip */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border font-semibold transition active:scale-95 ${
                isLiked
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount} Likes</span>
            </button>

            <button
              onClick={handleToggleSave}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border font-semibold transition active:scale-95 ${
                isSaved
                  ? 'bg-indigo-50 border-indigo-200 text-brand-600'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold transition active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors focus:outline-none cursor-pointer"
              title="Report Post"
            >
              <Flag className="w-4 h-4" />
            </button>

            {(isAuthor || isAdmin) && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors focus:outline-none cursor-pointer"
                title="Delete Post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div id="comments" className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-brand-600" />
          <h3 className="font-bold text-slate-900 text-base">
            Community Comments ({post.comments?.length || 0})
          </h3>
        </div>

        {/* Comment Input */}
        <form onSubmit={handleAddComment} className="flex items-center gap-2">
          <input
            type="text"
            required
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a public question or comment..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 focus:bg-white focus:border-brand-500 outline-none"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || isSubmittingComment}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-full transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Post</span>
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-3 divide-y divide-slate-100">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment) => {
              const isCommentAuthor = user?.id === comment.author;
              return (
                <div key={comment.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {comment.author_detail?.full_name?.[0] || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">
                          {comment.author_detail?.full_name || comment.author_detail?.username}
                        </span>
                        <GenderIcon gender={comment.author_detail?.profile?.gender} />
                        <span className="text-[10px] text-slate-400">
                          • {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>

                  {(isCommentAuthor || isAdmin) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1 text-slate-300 hover:text-rose-600 transition"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-center text-xs text-slate-400 py-4">No comments yet. Be the first to comment!</p>
          )}
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

      {showBorrowModal && (
        <BorrowModal
          postId={post.id}
          postTitle={post.title}
          onClose={() => setShowBorrowModal(false)}
          onRequestSubmitted={fetchPost}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmationDialog
          title="Delete Post"
          message={`Are you sure you want to permanently delete "${post.title}"?`}
          confirmLabel="Delete Post"
          danger
          onConfirm={handleDeletePost}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};
