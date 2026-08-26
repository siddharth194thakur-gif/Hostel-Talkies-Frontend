import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  PlusCircle,
  ShoppingBag,
  Search,
  BellRing,
  Calendar,
  Wrench,
  GraduationCap,
  Bookmark,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Post, Notice, Event, HostelService } from '../types';
import api from '../api/client';
import { PostCard } from '../components/PostCard';
import { NoticeCard } from '../components/NoticeCard';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [services, setServices] = useState<HostelService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [postsRes, noticesRes, eventsRes, servicesRes] = await Promise.all([
        api.get<{ results: Post[] } | Post[]>('/posts/?page_size=6'),
        api.get<{ results: Notice[] } | Notice[]>('/notices/'),
        api.get<{ results: Event[] } | Event[]>('/events/?upcoming=true'),
        api.get<{ results: HostelService[] } | HostelService[]>('/services/'),
      ]);

      setPosts(Array.isArray(postsRes.data) ? postsRes.data : postsRes.data.results || []);
      setNotices(Array.isArray(noticesRes.data) ? noticesRes.data : noticesRes.data.results || []);
      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : eventsRes.data.results || []);
      setServices(Array.isArray(servicesRes.data) ? servicesRes.data : servicesRes.data.results || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const urgentNotice = notices.find((n) => n.priority === 'urgent');

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Hero Banner - Subtle Indigo/Purple gradient */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="relative z-10 space-y-3.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-brand-50 text-[11px] font-semibold border border-white/15">
            <Building className="w-3.5 h-3.5 text-brand-200" />
            <span>
              {user?.profile?.hostel_detail?.name || 'Hostel Community Member'}
              {user?.profile?.block_detail ? ` • ${user.profile.block_detail.name}` : ''}
              {user?.profile?.room_detail ? ` • Room ${user.profile.room_detail.room_number}` : ''}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.first_name || user?.username}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed font-normal">
            Discover today's campus marketplace listings, urgent notices, study notes, and events across your hostel.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <Link
              to="/create-post"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-brand-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-xs transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Post</span>
            </Link>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/15 backdrop-blur-sm transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Marketplace</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Urgent Notice Alert Banner if any */}
      {urgentNotice && (
        <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200/80 flex items-start justify-between gap-3 animate-in fade-in shadow-subtle">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 text-red-700 rounded-xl shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-md">Urgent Notice</span>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{urgentNotice.title}</h3>
              </div>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{urgentNotice.content}</p>
            </div>
          </div>
          <Link to="/notices" className="text-xs font-bold text-red-700 hover:underline shrink-0 pt-1">
            View Notice →
          </Link>
        </div>
      )}

      {/* Quick Category Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { to: '/marketplace', title: 'Marketplace', desc: 'Buy, Sell, Free', icon: ShoppingBag, color: 'text-brand-600 bg-brand-50' },
          { to: '/lost-found', title: 'Lost & Found', desc: 'Report & Recover', icon: Search, color: 'text-rose-600 bg-rose-50' },
          { to: '/study', title: 'Study Notes', desc: 'PYQs & Notes', icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50' },
          { to: '/services', title: 'Hostel Services', desc: 'Laundry & Repairs', icon: Wrench, color: 'text-amber-600 bg-amber-50' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <Link
              key={i}
              to={item.to}
              className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card-hover hover:border-slate-300 transition-all duration-200 group"
            >
              <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200`}>
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">{item.title}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{item.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Latest Feed & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Main 2 cols: Latest Posts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-base font-bold text-slate-900">Latest Community Posts</h2>
              <p className="text-xs text-slate-400 font-medium">Fresh items and discussions from fellow hostelers</p>
            </div>
            <Link to="/home" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline">
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSkeleton count={4} />
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onPostUpdated={fetchDashboardData} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No posts yet"
              message="Be the first to post something in your hostel community!"
              actionText="Create Post"
              onAction={() => window.location.href = '/create-post'}
            />
          )}
        </div>

        {/* Right 1 col: Official Notices & Events */}
        <div className="space-y-6">
          {/* Recent Notices */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Hostel Notices</h3>
              </div>
              <Link to="/notices" className="text-xs text-brand-600 hover:underline font-semibold">
                All
              </Link>
            </div>

            <div className="space-y-3 divide-y divide-slate-100/70">
              {notices.slice(0, 3).map((notice) => (
                <div key={notice.id} className="pt-2.5 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      notice.priority === 'urgent'
                        ? 'bg-red-50 text-red-600 border border-red-100'
                        : notice.priority === 'important'
                        ? 'bg-brand-50 text-brand-700 border border-brand-100'
                        : 'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>
                      {notice.priority}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notice.publish_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-xs line-clamp-1">{notice.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{notice.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Upcoming Events</h3>
              </div>
              <Link to="/events" className="text-xs text-brand-600 hover:underline font-semibold">
                All
              </Link>
            </div>

            <div className="space-y-2.5">
              {events.slice(0, 2).map((event) => (
                <div key={event.id} className="p-3.5 bg-slate-50/70 rounded-2xl space-y-1.5 border border-slate-150">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-brand-700">{event.event_date}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px] font-medium">{event.location}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">{event.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
