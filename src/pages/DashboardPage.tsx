import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ShieldCheck,
  User,
  Phone,
  Clock,
  Utensils,
  Zap,
  CheckCircle2,
  FileText,
  Heart,
  MessageSquare,
  Activity,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Post, Notice, Event, HostelService } from '../types';
import api, { getMediaUrl } from '../api/client';
import { PostCard } from '../components/PostCard';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [services, setServices] = useState<HostelService[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'my_posts' | 'services'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [allPostsRes, myPostsRes, noticesRes, eventsRes, servicesRes] = await Promise.all([
        api.get<{ results: Post[] } | Post[]>('/posts/?page_size=4'),
        user?.id ? api.get<{ results: Post[] } | Post[]>(`/posts/?author=${user.id}`) : Promise.resolve({ data: [] }),
        api.get<{ results: Notice[] } | Notice[]>('/notices/'),
        api.get<{ results: Event[] } | Event[]>('/events/?upcoming=true'),
        api.get<{ results: HostelService[] } | HostelService[]>('/services/'),
      ]);

      setAllPosts(Array.isArray(allPostsRes.data) ? allPostsRes.data : (allPostsRes.data as any)?.results || []);
      setMyPosts(Array.isArray(myPostsRes.data) ? myPostsRes.data : (myPostsRes.data as any)?.results || []);
      setNotices(Array.isArray(noticesRes.data) ? noticesRes.data : (noticesRes.data as any)?.results || []);
      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : (eventsRes.data as any)?.results || []);
      setServices(Array.isArray(servicesRes.data) ? servicesRes.data : (servicesRes.data as any)?.results || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id]);

  const urgentNotice = notices.find((n) => n.priority === 'urgent');

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-xs pb-8">
      {/* Distinct Digital Resident ID & Command Center Hero */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden shadow-2xl border border-slate-800 animate-fade-in">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-ambient-float" />
        <div className="absolute right-40 bottom-0 w-48 h-48 bg-brand-500/20 rounded-full blur-2xl pointer-events-none animate-glow-pulse" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Resident Profile Card Meta */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-purple-600 p-1 shadow-lg shadow-brand-500/25 border-2 border-white/20">
                <div className="w-full h-full rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center text-xl sm:text-2xl font-black text-white">
                  {user?.profile?.avatar ? (
                    <img
                      src={getMediaUrl(user.profile.avatar)}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{user?.first_name?.[0] || user?.username?.[0] || 'S'}</span>
                  )}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                ✓
              </span>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified Resident</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  ID: #{user?.id ? String(user.id).padStart(4, '0') : '0022'}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                {getGreeting()}, {user?.first_name || user?.username}! ✨
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-medium">
                <span className="inline-flex items-center gap-1.5 text-slate-200">
                  <Building className="w-3.5 h-3.5 text-brand-400" />
                  <strong>{user?.profile?.hostel_detail?.name || 'Campus Hostel'}</strong>
                </span>
                {user?.profile?.block_detail && <span>• Block {user.profile.block_detail.name}</span>}
                {user?.profile?.room_detail && <span>• Rm {user.profile.room_detail.room_number}</span>}
              </div>
            </div>
          </div>

          {/* Right: Quick Command Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
            <Link
              to="/create-post"
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/25 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Post Listing</span>
            </Link>
            <Link
              to="/profile/edit"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-2xl border border-white/15 backdrop-blur-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-300" />
              <span>My Profile</span>
            </Link>
            <Link
              to="/saved"
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-2xl border border-white/15 backdrop-blur-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              title="Saved Items"
            >
              <Bookmark className="w-4 h-4 text-brand-300" />
            </Link>
          </div>
        </div>
      </div>

      {/* Personal Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-subtle hover:shadow-card-hover hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 group animate-fade-in-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">My Active Posts</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{myPosts.length}</span>
          <span className="block text-[10px] text-brand-600 font-bold mt-1">Live in marketplace</span>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-subtle hover:shadow-card-hover hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 group animate-fade-in-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hostel Circulars</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{notices.length}</span>
          <span className="block text-[10px] text-amber-600 font-bold mt-1">Authority broadcasts</span>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-subtle hover:shadow-card-hover hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 group animate-fade-in-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campus Events</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{events.length}</span>
          <span className="block text-[10px] text-purple-600 font-bold mt-1">Tournaments &amp; fests</span>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200/80 shadow-subtle hover:shadow-card-hover hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 group animate-fade-in-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hostel Services</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900">{services.length || 6}</span>
          <span className="block text-[10px] text-emerald-600 font-bold mt-1">Repairs &amp; laundry active</span>
        </div>
      </div>

      {/* Urgent Broadcast Alert Banner if any */}
      {urgentNotice && (
        <div className="p-4 sm:p-5 rounded-3xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-subtle animate-fade-in-up">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-rose-600 text-white rounded-2xl shrink-0 animate-pulse">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-widest font-black bg-rose-600 text-white px-2 py-0.5 rounded-full">
                  URGENT CIRCULAR
                </span>
                <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">{urgentNotice.title}</h3>
              </div>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{urgentNotice.content}</p>
            </div>
          </div>
          <Link
            to="/notices"
            className="text-xs font-black text-rose-600 hover:text-rose-700 underline shrink-0 cursor-pointer"
          >
            Read Full Notice →
          </Link>
        </div>
      )}

      {/* Main Dashboard Layout: Left Command Center + Right Campus Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: My Activity & Manage Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Dashboard Mode Selector Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                Community Deals
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('my_posts')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'my_posts'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                My Listings ({myPosts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                Hostel Helpdesk
              </button>
            </div>

            <Link to="/marketplace" className="text-[11px] font-bold text-brand-600 hover:underline">
              View All →
            </Link>
          </div>

          {/* Tab 1: Overview Community Deals */}
          {activeTab === 'overview' && (
            isLoading ? (
              <LoadingSkeleton count={4} />
            ) : allPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allPosts.map((post) => (
                  <PostCard key={post.id} post={post} onPostUpdated={fetchDashboardData} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No marketplace listings"
                message="Be the first to share an item with your hostel mates!"
                actionText="Create Post"
                onAction={() => navigate('/create-post')}
              />
            )
          )}

          {/* Tab 2: My Personal Listings */}
          {activeTab === 'my_posts' && (
            myPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myPosts.map((post) => (
                  <PostCard key={post.id} post={post} onPostUpdated={fetchDashboardData} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="You haven't posted any items yet"
                message="Sell your unused electronics, coolers, or cycle easily to students in your hostel."
                actionText="+ Post Your First Item"
                onAction={() => navigate('/create-post?type=buy_sell')}
              />
            )
          )}

          {/* Tab 3: Hostel Helpdesk & Services Quick Request */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { name: 'Hostel Electrician', desc: 'Fan, tube light, power socket repairs', icon: Zap, status: 'Available' },
                { name: 'Plumber & Water Supply', desc: 'Tap leakage, washroom pipeline repair', icon: Wrench, status: 'Available' },
                { name: 'Hostel Wi-Fi & LAN Desk', desc: 'Room network connection issues', icon: Activity, status: 'Active 24/7' },
                { name: 'Hostel Laundry Service', desc: 'Daily pickup and washing', icon: Layers, status: 'Open 8 AM - 8 PM' },
              ].map((serv, idx) => {
                const Icon = serv.icon;
                return (
                  <div key={idx} className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-subtle space-y-2 hover:border-slate-300 transition animate-fade-in-up">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        {serv.status}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{serv.name}</h4>
                    <p className="text-[11px] text-slate-500">{serv.desc}</p>
                    <Link
                      to="/services"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 pt-1"
                    >
                      <span>Request Assistance →</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Hostel Admin Desk & Meal Timings Widget */}
        <div className="space-y-6">
          {/* Hostel Authority & Caretaker Desk Card */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-subtle space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">Hostel Desk Info</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Chief Warden Desk</span>
                <p className="font-extrabold text-slate-900">Dr. Rajesh Verma</p>
                <p className="text-[11px] text-slate-500">Admin Block • 10:00 AM - 5:00 PM</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Hostel Caretaker</span>
                <p className="font-extrabold text-slate-900">Mr. Ramesh Kumar</p>
                <p className="text-[11px] text-slate-500">Ground Floor Caretaker Room</p>
              </div>
            </div>
          </div>

          {/* Daily Mess Timings Widget */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-subtle space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-600" />
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">Mess Schedule</h3>
              </div>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Daily
              </span>
            </div>

            <div className="space-y-2 text-[11px] font-medium text-slate-600">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                <span>🥞 Breakfast</span>
                <strong className="text-slate-800">07:30 AM - 09:30 AM</strong>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                <span>🍛 Lunch</span>
                <strong className="text-slate-800">12:30 PM - 02:30 PM</strong>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                <span>☕ Evening Snacks</span>
                <strong className="text-slate-800">05:00 PM - 06:00 PM</strong>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                <span>🍲 Dinner</span>
                <strong className="text-slate-800">08:00 PM - 10:00 PM</strong>
              </div>
            </div>
          </div>

          {/* Recent Notices Feed */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-subtle space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-brand-600" />
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">Notice Bulletin</h3>
              </div>
              <Link to="/notices" className="text-[11px] font-bold text-brand-600 hover:underline">
                All →
              </Link>
            </div>

            <div className="space-y-2.5">
              {notices.slice(0, 3).map((n) => (
                <div key={n.id} className="p-2.5 rounded-2xl bg-slate-50 hover:bg-brand-50/50 transition">
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{n.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

