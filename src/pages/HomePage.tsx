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
  MessageSquare,
  ArrowRight,
  Sparkles,
  Flame,
  Clock,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Post, Notice, Event, StudyResource } from '../types';
import api from '../api/client';
import { PostCard } from '../components/PostCard';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [studyResources, setStudyResources] = useState<StudyResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHomeData = async () => {
    setIsLoading(true);
    try {
      const [postsRes, noticesRes, eventsRes, studyRes] = await Promise.all([
        api.get<{ results: Post[] } | Post[]>('/posts/?page_size=6'),
        api.get<{ results: Notice[] } | Notice[]>('/notices/'),
        api.get<{ results: Event[] } | Event[]>('/events/?upcoming=true'),
        api.get<{ results: StudyResource[] } | StudyResource[]>('/study/?page_size=4'),
      ]);

      setPosts(Array.isArray(postsRes.data) ? postsRes.data : postsRes.data.results || []);
      setNotices(Array.isArray(noticesRes.data) ? noticesRes.data : noticesRes.data.results || []);
      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : eventsRes.data.results || []);
      setStudyResources(Array.isArray(studyRes.data) ? studyRes.data : studyRes.data.results || []);
    } catch (err) {
      console.error('Failed to load home data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const urgentNotice = notices.find((n) => n.priority === 'urgent');

  const quickAccessItems = [
    {
      to: '/marketplace',
      title: 'Marketplace',
      desc: 'Buy & sell essentials',
      icon: ShoppingBag,
      bgLight: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      to: '/lost-found',
      title: 'Lost & Found',
      desc: 'Recover missing items',
      icon: Search,
      bgLight: 'bg-rose-50 text-rose-600 border-rose-100',
    },
    {
      to: '/study',
      title: 'Study Resources',
      desc: 'Notes, PYQs & guides',
      icon: GraduationCap,
      bgLight: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      to: '/services',
      title: 'Hostel Services',
      desc: 'Maintenance & repairs',
      icon: Wrench,
      bgLight: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      to: '/events',
      title: 'Campus Events',
      desc: 'Fests, sports & clubs',
      icon: Calendar,
      bgLight: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
      to: '/messages',
      title: 'Messages',
      desc: 'Chat with residents',
      icon: MessageSquare,
      bgLight: 'bg-brand-50 text-brand-600 border-brand-100',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto pb-6">
      {/* 1. Welcome Hero Banner */}
      <section className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-card relative overflow-hidden">
        <div className="relative z-10 space-y-3.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-brand-50 text-[11px] font-semibold border border-white/15">
            <Building className="w-3.5 h-3.5 text-brand-200" />
            <span>
              {user?.profile?.hostel_detail?.name || 'Hostel Community'}
              {user?.profile?.block_detail ? ` • ${user.profile.block_detail.name}` : ''}
              {user?.profile?.room_detail ? ` • Room ${user.profile.room_detail.room_number}` : ''}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to HostelTalkies, {user?.first_name || user?.username}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed font-normal">
            Your centralized campus hub for marketplace listings, hostel updates, study notes, events, and resident chats.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <Link
              to="/create-post"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-brand-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Post</span>
            </Link>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/15 backdrop-blur-sm transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Marketplace</span>
            </Link>
            <Link
              to="/study"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/15 backdrop-blur-sm transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Study Notes</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Urgent Notice Alert Banner (if available) */}
      {urgentNotice && (
        <section className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <BellRing className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-rose-600 text-white rounded-full">
                  Urgent Notice
                </span>
                <span className="text-xs font-bold text-slate-900">{urgentNotice.title}</span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{urgentNotice.content}</p>
            </div>
          </div>
          <Link
            to="/notices"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 shrink-0 group self-end sm:self-auto cursor-pointer"
          >
            <span>Read Notice</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>
      )}

      {/* 3. Quick Access Hub */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">Quick Access</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickAccessItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-brand-300/80 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col items-start gap-2.5 group cursor-pointer active:scale-[0.98]"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-2xs ${item.bgLight} group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 group-hover:text-brand-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Main Two-Column Content: Recent Community Activity & Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Community Posts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-brand-600" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Recent Community Activity
              </h2>
            </div>
            <Link
              to="/marketplace"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>View Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <LoadingSkeleton count={3} />
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No recent posts"
              message="Be the first to share a marketplace item, note, or query with your hostel mates!"
              actionText="Create First Post"
              onAction={() => window.location.href = '/create-post'}
            />
          )}
        </div>

        {/* Right 1 Col: Notices, Upcoming Events & Study Resources */}
        <div className="space-y-6">
          {/* Latest Notices Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-subtle space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">Notice Board</h3>
              </div>
              <Link to="/notices" className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                View All →
              </Link>
            </div>

            {isLoading ? (
              <LoadingSkeleton count={2} />
            ) : notices.length > 0 ? (
              <div className="space-y-3 divide-y divide-slate-50">
                {notices.slice(0, 3).map((notice) => (
                  <div key={notice.id} className="pt-2.5 first:pt-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-1 hover:text-brand-600 transition">
                        {notice.title}
                      </h4>
                      <span
                        className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded-full shrink-0 ${
                          notice.priority === 'urgent'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-brand-50 text-brand-700 border border-brand-100'
                        }`}
                      >
                        {notice.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {notice.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No active notices.</p>
            )}
          </div>

          {/* Upcoming Events Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-subtle space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">Upcoming Events</h3>
              </div>
              <Link to="/events" className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                View All →
              </Link>
            </div>

            {isLoading ? (
              <LoadingSkeleton count={2} />
            ) : events.length > 0 ? (
              <div className="space-y-3 divide-y divide-slate-50">
                {events.slice(0, 3).map((event) => (
                  <div key={event.id} className="pt-2.5 first:pt-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-1 hover:text-brand-600 transition">
                        {event.title}
                      </h4>
                      {event.organizer && (
                        <span className="text-[10px] text-brand-600 font-semibold px-2 py-0.5 bg-brand-50 rounded-md shrink-0">
                          {event.organizer}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                      <span>📅 {new Date(event.event_date).toLocaleDateString()}</span>
                      {event.location && <span>📍 {event.location}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No upcoming events right now.</p>
            )}
          </div>

          {/* Study Resources Highlights */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-subtle space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">Study Materials</h3>
              </div>
              <Link to="/study" className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline">
                View All →
              </Link>
            </div>

            {isLoading ? (
              <LoadingSkeleton count={2} />
            ) : studyResources.length > 0 ? (
              <div className="space-y-2.5">
                {studyResources.slice(0, 3).map((res) => (
                  <Link
                    key={res.id}
                    to="/study"
                    className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-brand-50/60 border border-slate-100 flex items-center justify-between gap-2 transition group block"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-800 group-hover:text-brand-600 transition truncate">
                        {res.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        {res.course_name} {res.semester ? `• Sem ${res.semester}` : ''}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition shrink-0">
                      View →
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No study materials shared yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
