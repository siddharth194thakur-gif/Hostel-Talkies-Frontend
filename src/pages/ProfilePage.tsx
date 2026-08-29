import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building, Calendar, Edit3, MessageSquare, MoreVertical,
  GraduationCap, Ban, Flag, Check, AlertCircle, X, ShieldCheck,
  User, Mail, Phone, Lock, Bell, Bookmark, BookOpen, LogOut,
  ChevronRight, Shield, ShieldAlert, Sparkles, SlidersHorizontal,
  Layers, Package, Compass, Eye, KeyRound, Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Post, PublicUser } from '../types';
import api, { getMediaUrl } from '../api/client';
import { PostCard } from '../components/PostCard';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';
import { BackButton } from '../components/BackButton';
import { GenderIcon } from '../components/GenderIcon';
import { ReportModal } from '../components/ReportModal';
import { CreditsModal } from '../components/CreditsModal';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();

  const isOwnProfile = !userId || parseInt(userId) === user?.id;

  const [profileUser, setProfileUser] = useState<PublicUser | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState(false);

  // Tabs for Own Profile: 'activity' | 'settings' | 'blocked'
  const [activeTab, setActiveTab] = useState<'activity' | 'settings' | 'blocked'>('activity');
  const [activityFilter, setActivityFilter] = useState<'all' | 'marketplace' | 'lost_found'>('all');
  const [settingsSection, setSettingsSection] = useState<'account' | 'privacy' | 'notifications' | 'messages' | 'security' | 'all'>('all');

  // Options Menu & Block/Report state (when viewing other profiles)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showBlockConfirmModal, setShowBlockConfirmModal] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Logout confirmation modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Supported By modal
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  // Blocked Accounts (Own Profile Only - Private)
  const [blockedUsers, setBlockedUsers] = useState<PublicUser[]>([]);
  const [isLoadingBlocked, setIsLoadingBlocked] = useState(false);
  const [unblockingId, setUnblockingId] = useState<number | null>(null);

  const fetchBlockedUsers = async () => {
    if (!isOwnProfile) return;
    setIsLoadingBlocked(true);
    try {
      const res = await api.get<PublicUser[]>('/auth/blocked-users/');
      setBlockedUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load blocked users', err);
    } finally {
      setIsLoadingBlocked(false);
    }
  };

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      if (isOwnProfile) {
        // Own profile
        const postsRes = await api.get<{ results: Post[] } | Post[]>('/posts/?my_posts=true');
        setUserPosts(Array.isArray(postsRes.data) ? postsRes.data : postsRes.data.results || []);
        fetchBlockedUsers();
      } else {
        // Another student's profile
        const [userRes, postsRes] = await Promise.all([
          api.get<PublicUser>(`/auth/users/${userId}/`),
          api.get<{ results: Post[] } | Post[]>(`/posts/?author=${userId}`),
        ]);
        setProfileUser(userRes.data);
        setUserPosts(Array.isArray(postsRes.data) ? postsRes.data : postsRes.data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [userId, user?.id]);

  const handleUnblockFromList = async (targetId: number) => {
    setUnblockingId(targetId);
    try {
      await api.post(`/auth/users/${targetId}/unblock/`);
      setBlockedUsers(prev => prev.filter(u => u.id !== targetId));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to unblock user.');
    } finally {
      setUnblockingId(null);
    }
  };

  // Start or Open Direct Chat
  const handleStartChat = async () => {
    if (!profileUser || isStartingChat) return;
    setIsStartingChat(true);
    try {
      const res = await api.post('/messages/start/', {
        recipient_id: profileUser.id,
      });
      if (res.data?.id) {
        navigate(`/messages/${res.data.id}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Could not start conversation with this user.');
    } finally {
      setIsStartingChat(false);
    }
  };

  // Block User Confirm (When on other user's profile)
  const handleConfirmBlock = async () => {
    if (!profileUser || isBlocking) return;
    setIsBlocking(true);
    try {
      await api.post(`/auth/users/${profileUser.id}/block/`);
      setProfileUser(prev => prev ? { ...prev, is_blocked_by_me: true } : null);
      setShowBlockConfirmModal(false);
      setShowOptionsMenu(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to block user.');
    } finally {
      setIsBlocking(false);
    }
  };

  // Unblock User (When on other user's profile)
  const handleUnblockUser = async () => {
    if (!profileUser || isBlocking) return;
    setIsBlocking(true);
    try {
      await api.post(`/auth/users/${profileUser.id}/unblock/`);
      setProfileUser(prev => prev ? { ...prev, is_blocked_by_me: false } : null);
      setShowOptionsMenu(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to unblock user.');
    } finally {
      setIsBlocking(false);
    }
  };

  // Handle Logout
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const displayName = isOwnProfile ? (user?.full_name || user?.username) : (profileUser?.full_name || profileUser?.username);
  const usernameHandle = isOwnProfile ? (user?.username || user?.email?.split('@')[0]) : (profileUser?.username || profileUser?.email?.split('@')[0]);
  const avatarUrl = isOwnProfile ? user?.profile?.avatar : profileUser?.profile?.avatar;
  const initialLetter = (displayName || 'U').charAt(0).toUpperCase();
  const gender = isOwnProfile ? user?.profile?.gender : profileUser?.profile?.gender;
  const programme = isOwnProfile ? user?.profile?.programme : profileUser?.profile?.programme;
  const branch = isOwnProfile ? user?.profile?.branch : profileUser?.profile?.branch;
  const hostelName = isOwnProfile ? user?.profile?.hostel_detail?.name : profileUser?.profile?.hostel_name;
  const blockName = isOwnProfile ? user?.profile?.block_detail?.name : profileUser?.profile?.block_name;
  const roomNumber = isOwnProfile ? user?.profile?.room_detail?.room_number : profileUser?.profile?.room_number;
  const bio = isOwnProfile ? user?.profile?.bio : profileUser?.profile?.bio;
  const phone = isOwnProfile ? user?.profile?.phone_number : null;
  const joinedDate = isOwnProfile ? user?.date_joined : profileUser?.date_joined;
  const isBlocked = !isOwnProfile && profileUser?.is_blocked_by_me;

  // Filtered Posts
  const filteredPosts = userPosts.filter(post => {
    if (activityFilter === 'marketplace') {
      return ['buy_sell', 'giveaway', 'exchange', 'borrow', 'lend'].includes(post.post_type);
    }
    if (activityFilter === 'lost_found') {
      return ['lost', 'found'].includes(post.post_type);
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-12">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <BackButton fallback="/home" />
        {isOwnProfile && (
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            My Account
          </span>
        )}
      </div>

      {/* 4K Ultra-Luxury Executive Resident Passport Banner */}
      <div className="rounded-[36px] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-9 banner-3d border border-indigo-500/30 relative overflow-hidden space-y-6 animate-fade-in">
        {/* Ambient 4K Spatial Glow Lights */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-brand-500/25 rounded-full blur-3xl pointer-events-none animate-ambient-float" />
        <div className="absolute right-48 bottom-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none animate-glow-pulse" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transform-3d">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0 translate-z-20">
            {/* 4K High-Definition Avatar with Iridescent Ring & Verification Badge */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white font-black text-3xl flex items-center justify-center shadow-2xl overflow-hidden border-2 border-white/40 ring-4 ring-purple-500/30 ring-offset-4 ring-offset-slate-950">
                {avatarUrl ? (
                  <img
                    src={getMediaUrl(avatarUrl)}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{initialLetter}</span>
                )}
              </div>

              {/* Verified Shield Badge on Avatar */}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-xl border-2 border-slate-950 flex items-center justify-center shadow-lg" title="Verified Campus Resident">
                <ShieldCheck className="w-4 h-4 text-white stroke-[2.5]" />
              </div>
            </div>

            {/* Resident Information */}
            <div className="space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-brand-500/25 text-brand-300 rounded-full border border-brand-400/40 backdrop-blur-md flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  <span>RESIDENT PASSPORT</span>
                </span>
                <span className="text-[10px] font-extrabold text-white/90 bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                  ID: #{user?.id ? String(user.id).padStart(4, '0') : '0022'}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight truncate translate-z-30 drop-shadow-md">
                  {displayName}
                </h1>
                <GenderIcon gender={gender} badge showLabel />
              </div>

              {usernameHandle && (
                <p className="text-xs font-bold text-brand-300 flex items-center gap-1">
                  <span>@{usernameHandle}</span>
                </p>
              )}

              {/* Academic & Room Credentials */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-200 font-medium">
                {programme && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white rounded-xl border border-white/15 backdrop-blur-md font-bold">
                    <GraduationCap className="w-3.5 h-3.5 text-brand-300" />
                    <span>{programme}{branch ? ` • ${branch}` : ''}</span>
                  </span>
                )}
                {hostelName && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white rounded-xl border border-white/15 backdrop-blur-md font-bold">
                    <Building className="w-3.5 h-3.5 text-indigo-300" />
                    <span>{hostelName}{blockName ? ` • Block ${blockName}` : ''}{roomNumber ? ` • Rm ${roomNumber}` : ''}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center w-full md:w-auto justify-end translate-z-40">
            {isOwnProfile ? (
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Link
                  to="/profile/edit"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white text-xs font-black rounded-2xl btn-3d-brand cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Edit Profile</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="p-2.5 text-slate-300 hover:text-rose-400 hover:bg-white/10 rounded-2xl border border-white/15 backdrop-blur-md transition cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {isBlocked ? (
                  <button
                    disabled
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 text-slate-400 text-xs font-semibold rounded-2xl cursor-not-allowed border border-slate-700"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Blocked</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartChat}
                    disabled={isStartingChat}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white text-xs font-black rounded-2xl btn-3d-brand cursor-pointer disabled:opacity-50"
                  >
                    <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{isStartingChat ? 'Opening...' : 'Send Message'}</span>
                  </button>
                )}

                {/* Profile Three-Dot Options Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                    className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-2xl border border-white/15 backdrop-blur-md transition cursor-pointer"
                    title="Profile Options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showOptionsMenu && (
                    <div
                      className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-30 space-y-1 animate-in zoom-in-95 duration-100 text-slate-900"
                      onClick={() => setShowOptionsMenu(false)}
                    >
                      {isBlocked ? (
                        <button
                          onClick={handleUnblockUser}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl flex items-center gap-2.5 transition"
                        >
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>Unblock User</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowBlockConfirmModal(true)}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition"
                        >
                          <Ban className="w-4 h-4 text-rose-500" />
                          <span>Block User</span>
                        </button>
                      )}

                      <button
                        onClick={() => setShowReportModal(true)}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 transition"
                      >
                        <Flag className="w-4 h-4 text-slate-400" />
                        <span>Report Profile</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bio Statement */}
        {bio ? (
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-xs text-slate-200 leading-relaxed translate-z-20">
            <p className="font-normal italic">"{bio}"</p>
          </div>
        ) : isOwnProfile ? (
          <div className="p-3.5 bg-white/5 backdrop-blur-sm rounded-2xl border border-dashed border-white/15 text-xs text-slate-400 translate-z-20">
            <span>No bio added yet. Introduce yourself to hostel mates using the <strong>Edit Profile</strong> button.</span>
          </div>
        ) : null}

        {/* 4K Spatial HUD Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10 text-center translate-z-30">
          <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <span className="block text-xl font-black text-white">{userPosts.length}</span>
            <span className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">Posts &amp; Deals</span>
          </div>

          <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <span className="block text-xl font-black text-brand-300">
              {new Date(joinedDate || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
            </span>
            <span className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">Resident Since</span>
          </div>

          <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <span className="block text-xl font-black text-emerald-300">Verified</span>
            <span className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">Campus Standing</span>
          </div>

          {isOwnProfile ? (
            <button
              onClick={() => setActiveTab('blocked')}
              className="p-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 transition text-center cursor-pointer"
            >
              <span className="block text-xl font-black text-white">{blockedUsers.length}</span>
              <span className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">Privacy Controls</span>
            </button>
          ) : (
            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="block text-xl font-black text-purple-300">{hostelName ? 'Resident' : 'Member'}</span>
              <span className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider">Hostel Status</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Tabbed Navigation for Own Profile */}
      {isOwnProfile && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-xl transition whitespace-nowrap ${
              activeTab === 'activity'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>My Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-xl transition whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Account & Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('blocked')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-xl transition whitespace-nowrap ${
              activeTab === 'blocked'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Ban className="w-4 h-4" />
            <span>Blocked Users ({blockedUsers.length})</span>
          </button>
        </div>
      )}

      {/* ────────────────────────────────────────── */}
      {/* SECTION 1: MY ACTIVITY TAB (Own Profile)   */}
      {/* ────────────────────────────────────────── */}
      {(!isOwnProfile || activeTab === 'activity') && (
        <div className="space-y-5">
          {/* Quick Shortcuts Cards (Own Profile only) */}
          {isOwnProfile && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <Link
                to="/saved"
                className="p-4 bg-white rounded-2xl border border-slate-200/80 card-3d-luxury flex items-center justify-between group transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-2xs group-hover:scale-105 transition-transform">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 group-hover:text-brand-600 transition-colors">Saved Posts</h4>
                    <p className="text-[11px] text-slate-500">Bookmarked items</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/study"
                className="p-4 bg-white rounded-2xl border border-slate-200/80 card-3d-luxury flex items-center justify-between group transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 group-hover:text-brand-600 transition-colors">Study Repository</h4>
                    <p className="text-[11px] text-slate-500">Notes &amp; PYQs</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/create-post"
                className="p-4 bg-white rounded-2xl border border-slate-200/80 card-3d-luxury flex items-center justify-between group transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100 shadow-2xs group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 group-hover:text-brand-600 transition-colors">Create Post</h4>
                    <p className="text-[11px] text-slate-500">List an item or ask</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}

          {/* Activity Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {isOwnProfile ? 'My Community Posts' : `Posts by ${displayName}`}
              </h2>
              <p className="text-xs text-slate-500">
                {isOwnProfile ? 'Manage all your active marketplace, lost & found, and discussion posts' : 'All listings and updates published by this student'}
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActivityFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activityFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({userPosts.length})
              </button>
              <button
                onClick={() => setActivityFilter('marketplace')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activityFilter === 'marketplace' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Marketplace
              </button>
              <button
                onClick={() => setActivityFilter('lost_found')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activityFilter === 'lost_found' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lost & Found
              </button>
            </div>
          </div>

          {/* Post Grid */}
          {isLoading ? (
            <LoadingSkeleton count={3} />
          ) : filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} onPostUpdated={fetchProfileData} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                activityFilter === 'all'
                  ? (isOwnProfile ? "You haven't posted yet" : "No posts yet")
                  : `No ${activityFilter === 'marketplace' ? 'marketplace' : 'lost & found'} posts`
              }
              message={
                isOwnProfile
                  ? "Share something with your hostel mates, sell an unused item, or report a lost possession."
                  : "This resident has not posted in this category yet."
              }
              actionText={isOwnProfile ? "Create New Post" : undefined}
              onAction={isOwnProfile ? () => navigate('/create-post') : undefined}
            />
          )}
        </div>
      )}

      {/* ────────────────────────────────────────── */}
      {/* SECTION 2: ACCOUNT & SETTINGS TAB          */}
      {/* ────────────────────────────────────────── */}
      {isOwnProfile && activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Account Information Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Account Information</h3>
                <p className="text-xs text-slate-500">Your verified student registration details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Full Name</span>
                <span className="font-bold text-slate-800 text-sm">{user?.full_name || user?.username}</span>
              </div>

              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Registered Email</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-800 truncate">{user?.email}</span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">Verified</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Hostel Allocation</span>
                <span className="font-bold text-slate-800">
                  {hostelName || 'Not Assigned'}{blockName ? ` • ${blockName}` : ''}{roomNumber ? ` • Room ${roomNumber}` : ''}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Academic Branch</span>
                <span className="font-bold text-slate-800">
                  {programme || 'Student'}{branch ? ` (${branch})` : ''}
                </span>
              </div>

              {phone && (
                <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-1 sm:col-span-2">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">Contact Phone (Private)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{phone}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-200/70 px-2 py-0.5 rounded-md">Only visible to you</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Privacy & Safety Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Privacy & Visibility</h3>
                <p className="text-xs text-slate-500">Manage how you appear to other campus residents</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-800">Campus Directory Visibility</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Only authenticated hostel residents can search your name in the global search bar.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full shrink-0">
                  Protected
                </span>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-800">Private Direct Messages</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Students can contact you directly without seeing your personal phone number.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full shrink-0">
                  Active
                </span>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-800">Blocked Accounts Management</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Prevent specific individuals from sending you messages or starting chats.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('blocked')}
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl transition text-[11px] shrink-0"
                >
                  Manage ({blockedUsers.length})
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Notifications & Alerts</h3>
                <p className="text-xs text-slate-500">In-app alerts for direct messages and announcements</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Message & Mention Alerts</h4>
                  <p className="text-[11px] text-slate-500">In-app notifications when you receive chat messages or comments</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
                  Enabled
                </span>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Official Campus Notices</h4>
                  <p className="text-[11px] text-slate-500">Instant priority banners for your specific hostel and block</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
                  Enabled
                </span>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Security & Authentication</h3>
                <p className="text-xs text-slate-500">Password security and active session management</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Session Status</h4>
                  <p className="text-[11px] text-slate-500">Authenticated with secure JWT token</p>
                </div>
                <span className="px-2.5 py-1 bg-slate-200/70 text-slate-700 font-mono text-[10px] rounded-full">
                  Active
                </span>
              </div>

              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Password Recovery</h4>
                  <p className="text-[11px] text-slate-500">Request password reset instructions via university email</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Password reset instructions will be dispatched to ${user?.email}`)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold rounded-xl transition text-[11px]"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone: Log Out */}
          <div className="bg-rose-50/60 rounded-3xl border border-rose-200/70 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-rose-900 text-sm">Danger Zone</h3>
                <p className="text-xs text-rose-600/80">Account sign-out and session termination</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-rose-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Log Out of HostelTalkies</h4>
                <p className="text-[11px] text-slate-500">
                  End your current session on this device. You will need to sign in again to access your account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>

            {/* Supported By Minimal Card */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-0.5">
                <p className="text-[11px] text-slate-400 font-medium leading-tight">
                  © 2026 HostelTalkies. All Rights Reserved.
                </p>
                <p className="text-xs text-slate-700 font-medium leading-tight">
                  Designed &amp; Developed by <strong className="text-slate-900 font-semibold">Siddharth Singh</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreditsModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-brand-200 transition active:scale-95 shadow-2xs shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>Supported By</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────── */}
      {/* SECTION 3: BLOCKED USERS TAB (Own Profile) */}
      {/* ────────────────────────────────────────── */}
      {isOwnProfile && activeTab === 'blocked' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Blocked Users</h3>
                <p className="text-xs text-slate-500">
                  People on this list cannot message you or start conversations.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
              {blockedUsers.length} Blocked
            </span>
          </div>

          {isLoadingBlocked ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading blocked accounts...</div>
          ) : blockedUsers.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {blockedUsers.map((bu) => (
                <div key={bu.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                      {bu.profile?.avatar ? (
                        <img
                          src={getMediaUrl(bu.profile.avatar)}
                          alt={bu.full_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>{bu.first_name?.charAt(0) || 'U'}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-800 truncate">{bu.full_name || bu.username}</h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {bu.profile?.hostel_name || 'Resident'}{bu.profile?.block_name ? ` • ${bu.profile.block_name}` : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUnblockFromList(bu.id)}
                    disabled={unblockingId === bu.id}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl shadow-xs transition active:scale-95 shrink-0 disabled:opacity-50"
                  >
                    {unblockingId === bu.id ? 'Unblocking...' : 'Unblock'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-slate-50/70 rounded-2xl text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="font-bold text-xs text-slate-800">No Blocked Users</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You haven't blocked any campus residents. If someone is bothering you, you can block them from their profile.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────── */}
      {/* MODALS                                     */}
      {/* ────────────────────────────────────────── */}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Log Out of HostelTalkies?</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Are you sure you want to log out? You will need to sign in again with your email and password to access your hostel feed, messages, and saved posts.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal (for external users) */}
      {showBlockConfirmModal && profileUser && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowBlockConfirmModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Ban className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Block {profileUser.full_name || profileUser.username}?</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Blocked users won't be able to message you or start new conversations. You can unblock them at any time from your settings or their profile.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBlockConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBlock}
                disabled={isBlocking}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
              >
                {isBlocking ? 'Blocking...' : 'Block'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && profileUser && (
        <ReportModal
          reportType="user"
          targetId={profileUser.id.toString()}
          targetTitle={profileUser.full_name || profileUser.username}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Supported By Modal */}
      <CreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
      />
    </div>
  );
};

