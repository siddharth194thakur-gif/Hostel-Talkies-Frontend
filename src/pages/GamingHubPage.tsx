import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  PlusCircle,
  Search,
  Calendar,
  Clock,
  Key,
  Users,
  Trophy,
  Flame,
  Zap,
  Target,
  Sparkles,
  MapPin,
  CheckCircle2,
  X,
  Sliders,
  Shield,
  Award,
} from 'lucide-react';
import api from '../api/client';
import { Competition, GameType } from '../types';
import { CreateCompetitionModal } from '../components/CreateCompetitionModal';
import { CompetitionDetailModal } from '../components/CompetitionDetailModal';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

export const GamingHubPage: React.FC = () => {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [mainTab, setMainTab] = useState<'browse' | 'my_competitions'>('browse');
  const [mySubTab, setMySubTab] = useState<'created' | 'joined'>('created');
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchCompetitions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedGame && selectedGame !== 'all') {
        params.append('game', selectedGame);
      }

      if (mainTab === 'my_competitions') {
        if (mySubTab === 'created' && user?.id) {
          params.append('creator', String(user.id));
        } else if (mySubTab === 'joined') {
          params.append('joined', 'true');
        }
      } else {
        if (selectedStatus === 'registration_open' || selectedStatus === 'live' || selectedStatus === 'upcoming' || selectedStatus === 'completed') {
          params.append('status', selectedStatus);
        }
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await api.get<{ results: Competition[] } | Competition[]>(`/gaming/competitions/?${params.toString()}`);
      const list = Array.isArray(res.data) ? res.data : (res.data as any)?.results || [];
      setCompetitions(list);

      // If detail modal is open, refresh selected competition data
      if (selectedCompetition) {
        const updated = list.find((c: Competition) => c.id === selectedCompetition.id);
        if (updated) setSelectedCompetition(updated);
      }
    } catch (err) {
      console.error('Failed to load competitions', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompetitions();
    }, 250);
    return () => clearTimeout(timer);
  }, [mainTab, mySubTab, selectedGame, selectedStatus, searchQuery, user?.id]);

  const handleOpenDetail = (comp: Competition) => {
    setSelectedCompetition(comp);
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (comp: Competition) => {
    setEditingCompetition(comp);
    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    setEditingCompetition(null);
  };

  const gameTabs = [
    { id: 'all', label: 'All Games', icon: Gamepad2, color: 'text-slate-600' },
    { id: 'bgmi', label: 'BGMI', icon: Target, color: 'text-amber-500' },
    { id: 'bgmi_lite', label: 'BGMI Lite', icon: Zap, color: 'text-blue-500' },
    { id: 'free_fire_max', label: 'Free Fire MAX', icon: Flame, color: 'text-rose-500' },
    { id: 'other', label: 'Other Games', icon: Sliders, color: 'text-purple-500' },
  ];

  const liveCount = competitions.filter((c) => c.status === 'live').length;
  const regOpenCount = competitions.filter((c) => c.is_registration_open).length;

  return (
    <div className="space-y-6 text-xs max-w-7xl mx-auto pb-8">
      {/* 1. Gaming Hub Hero Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden shadow-xl border border-slate-800 animate-fade-in">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none animate-ambient-float" />
        <div className="absolute right-36 bottom-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none animate-glow-pulse" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-brand-500/20 text-brand-300 rounded-full border border-brand-400/30 backdrop-blur-xs flex items-center gap-1.5 shadow-xs">
                <Gamepad2 className="w-3.5 h-3.5 text-brand-400" />
                <span>HostelTalkies Gaming Hub</span>
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 rounded-full border border-purple-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span>Create. Compete. Win.</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Your Games. Your Competition.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Create, join, and organize custom gaming tournaments for BGMI, BGMI Lite, Free Fire MAX, and any campus game. Community-driven with real student-verified results.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingCompetition(null);
                  setIsCreateOpen(true);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-brand-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-brand-500/20 flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>+ Create Competition</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMainTab('my_competitions');
                  setMySubTab('created');
                }}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/15 backdrop-blur-sm transition cursor-pointer"
              >
                My Competitions
              </button>
            </div>
          </div>

          {/* Realtime Stats Cards */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[85px]">
              <span className="block text-xl font-black text-white">{competitions.length}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Competitions
              </span>
            </div>
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[85px]">
              <span className="block text-xl font-black text-emerald-400">{regOpenCount}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Open to Join
              </span>
            </div>
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[85px]">
              <span className="block text-xl font-black text-rose-400 animate-pulse">{liveCount}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Live Now
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Navigation: Browse vs My Competitions */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMainTab('browse')}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition cursor-pointer ${
              mainTab === 'browse'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            🌟 Browse Competitions
          </button>

          <button
            type="button"
            onClick={() => setMainTab('my_competitions')}
            className={`px-4 py-2 rounded-2xl font-black text-xs transition cursor-pointer flex items-center gap-1.5 ${
              mainTab === 'my_competitions'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-brand-500" />
            <span>My Competitions</span>
          </button>
        </div>

        {/* My Competitions Sub-Tabs */}
        {mainTab === 'my_competitions' && (
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMySubTab('created')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                mySubTab === 'created' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Created by Me
            </button>
            <button
              type="button"
              onClick={() => setMySubTab('joined')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                mySubTab === 'joined' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Joined by Me
            </button>
          </div>
        )}
      </div>

      {/* 3. Control Bar: Game Chips & Search */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-subtle space-y-3">
        {/* Game Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {gameTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedGame === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedGame(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl font-extrabold text-xs transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by competition name, game, host..."
              className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-900 focus:border-brand-500 outline-none transition placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {mainTab === 'browse' && (
            <div className="w-full sm:w-56 shrink-0">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-800 focus:bg-white focus:border-brand-500 outline-none transition cursor-pointer"
              >
                <option value="all">⚡ All Statuses</option>
                <option value="registration_open">🟢 Registration Open</option>
                <option value="live">🔴 Live Now</option>
                <option value="upcoming">⏳ Upcoming</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 4. Competitions Grid Feed */}
      {isLoading ? (
        <LoadingSkeleton count={6} />
      ) : competitions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {competitions.map((comp) => {
            const startDate = new Date(comp.start_datetime);
            const isFull = comp.participants_count >= comp.max_participants;

            return (
              <div
                key={comp.id}
                onClick={() => handleOpenDetail(comp)}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer group animate-fade-in-up"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {comp.game === 'bgmi' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Target className="w-3 h-3 text-amber-600" />
                          <span>BGMI</span>
                        </span>
                      )}
                      {comp.game === 'bgmi_lite' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-blue-600" />
                          <span>BGMI Lite</span>
                        </span>
                      )}
                      {comp.game === 'free_fire_max' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-rose-600" />
                          <span>Free Fire MAX</span>
                        </span>
                      )}
                      {comp.game === 'other' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <Sliders className="w-3 h-3 text-purple-600" />
                          <span>{comp.game_display}</span>
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-slate-100 text-slate-700">
                        {comp.competition_type}
                      </span>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                        comp.status === 'live'
                          ? 'bg-rose-500 text-white animate-pulse'
                          : comp.status === 'registration_open'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : comp.status === 'completed'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {comp.status === 'live' ? '🔴 Live' : comp.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title & Schedule */}
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                      {comp.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-600" />
                      <span>
                        {startDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                        {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Slot Progress */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Registered</span>
                      </span>
                      <span className={isFull ? 'text-rose-600 font-black' : 'text-slate-700'}>
                        {comp.participants_count} / {comp.max_participants}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          isFull ? 'bg-rose-500' : 'bg-gradient-to-r from-brand-500 to-indigo-600'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.round((comp.participants_count / comp.max_participants) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer of Card */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {comp.creator_detail?.first_name?.[0] || 'O'}
                    </div>
                    <span className="text-[11px] text-slate-600 font-semibold truncate">
                      {comp.creator_detail?.first_name || comp.creator_detail?.username || 'Host'}
                    </span>
                  </div>

                  <div className="shrink-0">
                    {comp.is_joined ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-xl border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Registered</span>
                      </span>
                    ) : comp.is_creator ? (
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-bold text-[10px] rounded-xl border border-purple-200 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-purple-600" />
                        <span>Organizer</span>
                      </span>
                    ) : comp.is_registration_open ? (
                      <button
                        type="button"
                        className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-[11px] rounded-xl transition cursor-pointer"
                      >
                        Join Competition →
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl transition cursor-pointer"
                      >
                        View Details →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={mainTab === 'my_competitions' ? 'No competitions found in your list' : 'Be the first to create a competition.'}
          message={mainTab === 'my_competitions' ? 'You haven\'t created or joined any competitions yet.' : 'No active gaming competitions match your selected filters. Create a competition to kick off the campus battle!'}
          actionText="+ Create Competition"
          onAction={() => {
            setEditingCompetition(null);
            setIsCreateOpen(true);
          }}
        />
      )}

      {/* Modals */}
      <CreateCompetitionModal
        isOpen={isCreateOpen}
        onClose={handleCloseCreate}
        onSuccess={fetchCompetitions}
        editCompetition={editingCompetition}
      />

      <CompetitionDetailModal
        competition={selectedCompetition}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onRefresh={fetchCompetitions}
        onEdit={handleOpenEdit}
      />
    </div>
  );
};

export default GamingHubPage;
