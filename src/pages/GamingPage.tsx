import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Gamepad2,
  Trophy,
  Flame,
  Crown,
  Medal,
  Swords,
  Search,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Building,
  ShieldCheck,
  Zap,
  TrendingUp,
  X,
  PlusCircle,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Target,
  Crosshair,
  Shield,
  Layers,
  Box,
} from 'lucide-react';
import api, { getMediaUrl } from '../api/client';
import { GamingProfile, Tournament, Hostel } from '../types';
import { useAuth } from '../context/AuthContext';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';
import { Card3D } from '../components/Card3D';

export const GamingPage: React.FC = () => {
  const { user } = useAuth();

  const [leaderboard, setLeaderboard] = useState<GamingProfile[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [myProfile, setMyProfile] = useState<GamingProfile | null>(null);

  const [activeTab, setActiveTab] = useState<'leaderboard' | 'tournaments'>('leaderboard');
  const [selectedHostel, setSelectedHostel] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    uid: '',
    in_game_name: '',
    level: 50,
    likes: 1000,
    br_rank: 'Heroic 💎',
    br_rank_points: 2400,
    cs_rank: 'Master 🎖️',
    kd_ratio: 2.5,
    total_booyahs: 45,
    region: 'IND',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('game_type', 'free_fire');
      if (selectedHostel) params.append('hostel', selectedHostel);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const [leaderboardRes, tournamentsRes, hostelsRes, myProfileRes] = await Promise.all([
        api.get<{ results: GamingProfile[] } | GamingProfile[]>(`/gaming/leaderboard/?${params.toString()}`),
        api.get<{ results: Tournament[] } | Tournament[]>('/gaming/tournaments/'),
        api.get<{ results: Hostel[] } | Hostel[]>('/hostels/'),
        user ? api.get<{ profile: GamingProfile | null }>('/gaming/my-profile/?game_type=free_fire') : Promise.resolve({ data: { profile: null } }),
      ]);

      const leadData = leaderboardRes.data as any;
      setLeaderboard(Array.isArray(leadData) ? leadData : leadData.results || []);

      const tourData = tournamentsRes.data as any;
      setTournaments(Array.isArray(tourData) ? tourData : tourData.results || []);

      const hostData = hostelsRes.data as any;
      setHostels(Array.isArray(hostData) ? hostData : hostData.results || []);

      if (myProfileRes.data?.profile) {
        setMyProfile(myProfileRes.data.profile);
        setFormData({
          uid: myProfileRes.data.profile.uid || '',
          in_game_name: myProfileRes.data.profile.in_game_name || '',
          level: myProfileRes.data.profile.level || 50,
          likes: myProfileRes.data.profile.likes || 1000,
          br_rank: myProfileRes.data.profile.br_rank || 'Heroic 💎',
          br_rank_points: myProfileRes.data.profile.br_rank_points || 2400,
          cs_rank: myProfileRes.data.profile.cs_rank || 'Master 🎖️',
          kd_ratio: myProfileRes.data.profile.kd_ratio || 2.5,
          total_booyahs: myProfileRes.data.profile.total_booyahs || 45,
          region: myProfileRes.data.profile.region || 'IND',
        });
      }
    } catch (err) {
      console.error('Failed to load gaming arena data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedHostel, searchQuery]);

  // Auto-Fetch or Submit Gaming Profile
  const handleAutoLookup = async () => {
    if (!formData.uid.trim()) {
      setModalError('Please enter your Free Fire UID first.');
      return;
    }

    setIsLookingUp(true);
    setModalError(null);
    setModalSuccess(null);

    try {
      const res = await api.post('/gaming/lookup/', {
        uid: formData.uid.trim(),
        region: formData.region || 'IND',
      });

      if (res.data?.success && res.data?.in_game_name) {
        setFormData((prev) => ({
          ...prev,
          in_game_name: res.data.in_game_name,
          level: res.data.level || prev.level,
          likes: res.data.likes || prev.likes,
          br_rank: res.data.br_rank || prev.br_rank,
          br_rank_points: res.data.br_rank_points || prev.br_rank_points,
          cs_rank: res.data.cs_rank || prev.cs_rank,
          kd_ratio: res.data.kd_ratio || prev.kd_ratio,
          total_booyahs: res.data.total_booyahs || prev.total_booyahs,
        }));
        setModalSuccess(`Fetched real profile for ${res.data.in_game_name}! 🔥`);
      } else {
        setModalError('ℹ️ Free Fire (Garena) server is encrypted. Please enter your real in-game nickname and stats below to create your verified gamer card.');
      }
    } catch (err: any) {
      setModalError('ℹ️ Free Fire (Garena) server is encrypted. Please enter your real in-game nickname and stats below to create your verified gamer card.');
    } finally {
      setIsLookingUp(false);
    }
  };

  // Submit Gaming Profile
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setModalError('Student Login Required: Please log in to save your Free Fire Gaming Passport.');
      return;
    }

    if (!formData.uid.trim()) {
      setModalError('Free Fire UID is required.');
      return;
    }

    if (!formData.in_game_name.trim()) {
      setModalError('Please enter your authentic Free Fire In-Game Nickname (IGN).');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);
    setModalSuccess(null);

    try {
      const res = await api.post('/gaming/my-profile/', {
        game_type: 'free_fire',
        ...formData,
      });

      if (res.data?.profile) {
        setMyProfile(res.data.profile);
        setModalSuccess('Gamer Passport saved successfully! 🏆');
        setTimeout(() => {
          setIsModalOpen(false);
          fetchData();
        }, 1000);
      }
    } catch (err: any) {
      setModalError(err.response?.data?.error || err.response?.data?.detail || 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Click Sync Stats
  const handleSyncStats = async () => {
    setIsSyncing(true);
    try {
      const res = await api.post('/gaming/sync/', { game_type: 'free_fire' });
      if (res.data?.profile) {
        setMyProfile(res.data.profile);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to sync stats', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyUid = (uid: string) => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  const topThree = leaderboard.slice(0, 3);
  const remainingPlayers = leaderboard.slice(3);

  return (
    <div className="space-y-8 text-xs pb-16 perspective-1000 relative">
      {/* 3D Floating Ambient Spatial Orbs in Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-float-3d" />
        <div className="absolute top-80 -left-20 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] animate-ambient-float" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-[80px] animate-glow-pulse" />
      </div>

      {/* 1. 3D Neo-Esports Arena Hero Showcase Banner */}
      <div className="relative p-5 sm:p-10 rounded-3xl sm:rounded-[36px] bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),0_0_25px_rgba(168,85,247,0.3)] border border-purple-500/30 transform-3d animate-fade-in z-10">
        {/* 3D Cyber-Grid Horizon Floor */}
        <div className="absolute inset-x-0 bottom-0 h-40 cyber-grid-3d opacity-25 pointer-events-none" />

        {/* 3D Floating Polygonal Prism Badge */}
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-gradient-to-br from-orange-500/30 via-purple-500/20 to-cyan-500/30 rounded-3xl blur-xl animate-spin-3d pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-3.5 sm:space-y-4 max-w-2xl transform-3d">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-orange-500/30 to-amber-500/30 text-orange-300 rounded-full border border-orange-400/40 backdrop-blur-md flex items-center gap-1.5 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                <span>FREE FIRE MAX ARENA</span>
              </span>
              <span className="px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/10 text-purple-200 rounded-full border border-white/15 backdrop-blur-md flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Hostel Esports Season 1</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight translate-z-30 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              Hostel Esports &amp; Gaming Arena 🎮
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed max-w-xl translate-z-20">
              Live rankings for campus Free Fire gamers. Sync your live BR rank, KD ratio &amp; Booyahs by UID to claim the #1 Gold Trophy on the champions podium!
            </p>

            {/* Tactile Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3.5 translate-z-40">
              <button
                type="button"
                onClick={() => {
                  setModalError(null);
                  setModalSuccess(null);
                  setIsModalOpen(true);
                }}
                className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-2xl btn-3d-orange flex items-center justify-center gap-2 cursor-pointer border border-yellow-300/40 shadow-lg"
              >
                <Gamepad2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>{myProfile ? '⚡ Edit My Gamer Profile' : '🎮 Claim Free Fire Passport'}</span>
              </button>

              {myProfile && (
                <button
                  type="button"
                  onClick={handleSyncStats}
                  disabled={isSyncing}
                  className="w-full sm:w-auto px-4 py-3 bg-purple-900/70 hover:bg-purple-800 text-white font-bold text-xs rounded-2xl btn-3d-purple border border-purple-400/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-cyan-300 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Live Stats'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('tournaments')}
                className="w-full sm:w-auto px-4 py-3 bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl border border-slate-700/80 backdrop-blur-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Swords className="w-4 h-4 text-purple-400" />
                <span>Custom Room Matches ({tournaments.length})</span>
              </button>
            </div>
          </div>

          {/* Real-time Holographic Counters */}
          <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-3 shrink-0 self-stretch sm:self-start lg:self-auto translate-z-30">
            <div className="px-3 sm:px-5 py-3 sm:py-4 bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-purple-500/30 text-center min-w-0 sm:min-w-[95px] shadow-[0_10px_25px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <span className="block text-xl sm:text-2xl font-black text-white">{leaderboard.length}</span>
              <span className="block text-[9px] sm:text-[10px] font-extrabold text-purple-300 uppercase tracking-wider mt-0.5">
                Gamers
              </span>
            </div>
            <div className="px-3 sm:px-5 py-3 sm:py-4 bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-amber-500/30 text-center min-w-0 sm:min-w-[95px] shadow-[0_10px_25px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <span className="block text-xl sm:text-2xl font-black text-amber-400">{leaderboard[0]?.score || '5400'}</span>
              <span className="block text-[9px] sm:text-[10px] font-extrabold text-amber-300/90 uppercase tracking-wider mt-0.5">
                Top Pts
              </span>
            </div>
            <div className="px-3 sm:px-5 py-3 sm:py-4 bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-orange-500/30 text-center min-w-0 sm:min-w-[95px] shadow-[0_10px_25px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <span className="block text-xl sm:text-2xl font-black text-orange-400">🔥 BR</span>
              <span className="block text-[9px] sm:text-[10px] font-extrabold text-orange-300/90 uppercase tracking-wider mt-0.5">
                Ranked
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED "MY GAMER COMBAT PASSPORT" COMMAND HUB */}
      {myProfile ? (
        <div className="z-10 relative">
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 text-white shadow-2xl space-y-5 card-3d-luxury">
            {/* Top Bar: Header & Live Rank Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-orange-500/30 border border-yellow-300 shrink-0">
                  {myProfile.in_game_name?.[0]?.toUpperCase() || 'FF'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                      {myProfile.in_game_name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Verified Gamer</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                      Region: {myProfile.region || 'IND'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span>Hostel: <strong className="text-slate-200">{myProfile.user_details?.hostel_name || 'Resident'}</strong></span>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleCopyUid(myProfile.uid)}
                      className="text-amber-300 font-mono font-bold hover:text-amber-200 inline-flex items-center gap-1 transition cursor-pointer"
                      title="Click to copy UID"
                    >
                      <span>UID: {myProfile.uid}</span>
                      {copiedUid === myProfile.uid ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Score & Actions */}
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center">
                  <span className="block text-xs font-bold text-amber-300 uppercase tracking-wider">Combat Score</span>
                  <span className="block text-xl font-black text-white">{myProfile.score} pts</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setModalError(null);
                    setModalSuccess(null);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer shrink-0"
                >
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Telemetry HUD Grid: BR Rank, CS Rank, K/D, Booyahs, Level, Likes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block mb-1">BR Rank Tier</span>
                <span className="text-sm font-black text-white truncate block">{myProfile.br_rank || 'Heroic 💎'}</span>
                <span className="text-[9px] text-slate-400">{myProfile.br_rank_points || 2400} pts</span>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block mb-1">K/D Ratio</span>
                <span className="text-base font-black text-emerald-400 block">{myProfile.kd_ratio}</span>
                <span className="text-[9px] text-slate-400">Elimination rate</span>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block mb-1">Total Booyahs</span>
                <span className="text-base font-black text-amber-400 block">{myProfile.total_booyahs} 🏆</span>
                <span className="text-[9px] text-slate-400">Match victories</span>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block mb-1">Player Level</span>
                <span className="text-base font-black text-cyan-300 block">Lv. {myProfile.level || 50}</span>
                <span className="text-[9px] text-slate-400">Veteran status</span>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block mb-1">Profile Likes</span>
                <span className="text-base font-black text-rose-400 block">❤️ {myProfile.likes || 1000}</span>
                <span className="text-[9px] text-slate-400">Reputation</span>
              </div>

              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block mb-1">CS Rank Tier</span>
                <span className="text-sm font-black text-indigo-300 truncate block">{myProfile.cs_rank || 'Master 🎖️'}</span>
                <span className="text-[9px] text-slate-400">Clash Squad</span>
              </div>
            </div>
          </div>
        </div>
      ) : user ? (
        <div className="z-10 relative">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-500/15 via-purple-500/10 to-amber-500/15 border border-orange-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 card-3d-luxury">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-xl shrink-0 shadow-md">
                🎮
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">You haven't set up your Free Fire Gamer Passport yet!</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Register your UID to showcase your BR Rank, Booyahs &amp; compete for the #1 Gold Trophy on the campus leaderboard.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setModalError(null);
                setModalSuccess(null);
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer shrink-0"
            >
              + Create Gamer Passport 🚀
            </button>
          </div>
        </div>
      ) : null}

      {/* 3. 3D PODIUM STAGE SHOWCASE (TOP 3 CHAMPIONS) */}
      {leaderboard.length > 0 && activeTab === 'leaderboard' && (
        <div className="space-y-3 z-10 relative">
          <div className="flex items-center gap-2 px-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Champions Podium • Top 3 Pro Players
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2 items-end">
            {/* Rank #2 Silver Card (Left Pillar) */}
            {topThree[1] && (
              <Card3D
                glowColor="rgba(148, 163, 184, 0.4)"
                className="order-2 md:order-1 p-5 sm:p-6 rounded-3xl sm:rounded-[32px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 text-white space-y-3.5 sm:space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between translate-z-20">
                  <span className="px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-200 border border-slate-600/60 flex items-center gap-1.5 shadow-md">
                    <Medal className="w-3.5 h-3.5 text-slate-300" />
                    <span>#2 SILVER RANK</span>
                  </span>
                  <span className="text-lg sm:text-xl font-black text-slate-200">{topThree[1].score} pts</span>
                </div>

                <div className="translate-z-30">
                  <h3 className="text-lg sm:text-xl font-black text-white truncate drop-shadow-md">
                    {topThree[1].in_game_name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    {topThree[1].user_details?.first_name || topThree[1].user_details?.username} • {topThree[1].user_details?.hostel_name}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-white/5 rounded-2xl border border-white/5 text-center text-[10px] translate-z-20 backdrop-blur-md">
                  <div>
                    <span className="block text-slate-400 font-medium">UID</span>
                    <button
                      type="button"
                      onClick={() => handleCopyUid(topThree[1].uid)}
                      className="text-slate-200 font-bold font-mono hover:text-cyan-300 transition inline-flex items-center gap-0.5"
                    >
                      <span>{topThree[1].uid}</span>
                      {copiedUid === topThree[1].uid && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                    </button>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-medium">K/D</span>
                    <strong className="text-emerald-400 font-bold">{topThree[1].kd_ratio}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-medium">Booyahs</span>
                    <strong className="text-amber-400 font-bold">{topThree[1].total_booyahs}</strong>
                  </div>
                </div>
              </Card3D>
            )}

            {/* Rank #1 GOLD CHAMPION Elevated Pedestal (Center Pillar) */}
            {topThree[0] && (
              <Card3D
                isChampion={true}
                glowColor="rgba(245, 158, 11, 0.55)"
                className="order-1 md:order-2 p-5 sm:p-7 rounded-3xl sm:rounded-[36px] bg-gradient-to-b from-amber-950/90 via-slate-900 to-slate-950 border-2 border-amber-400/80 text-white space-y-3.5 sm:space-y-4.5 shadow-2xl md:-translate-y-4"
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between translate-z-30">
                  <span className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border border-amber-300 flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                    <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 animate-bounce" />
                    <span>#1 GOLD CHAMPION 👑</span>
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-amber-300">{topThree[0].score} pts</span>
                </div>

                <div className="translate-z-40">
                  <h3 className="text-xl sm:text-2xl font-black text-amber-200 truncate drop-shadow-[0_2px_10px_rgba(245,158,11,0.4)]">
                    {topThree[0].in_game_name}
                  </h3>
                  <p className="text-xs text-amber-100/80 font-medium truncate mt-0.5">
                    {topThree[0].user_details?.first_name || topThree[0].user_details?.username} • {topThree[0].user_details?.hostel_name}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 p-2.5 sm:p-3.5 bg-amber-500/15 rounded-2xl border border-amber-400/30 text-center text-[10px] translate-z-30 backdrop-blur-md">
                  <div>
                    <span className="block text-amber-200/70 font-medium">UID</span>
                    <button
                      type="button"
                      onClick={() => handleCopyUid(topThree[0].uid)}
                      className="text-amber-100 font-bold font-mono hover:text-amber-300 transition inline-flex items-center gap-0.5"
                    >
                      <span>{topThree[0].uid}</span>
                      {copiedUid === topThree[0].uid && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                    </button>
                  </div>
                  <div>
                    <span className="block text-amber-200/70 font-medium">K/D</span>
                    <strong className="text-emerald-300 font-bold">{topThree[0].kd_ratio}</strong>
                  </div>
                  <div>
                    <span className="block text-amber-200/70 font-medium">Booyahs</span>
                    <strong className="text-amber-300 font-bold">{topThree[0].total_booyahs} 🏆</strong>
                  </div>
                </div>
              </Card3D>
            )}

            {/* Rank #3 Bronze Card (Right Pillar) */}
            {topThree[2] && (
              <Card3D
                glowColor="rgba(217, 119, 6, 0.4)"
                className="order-3 p-5 sm:p-6 rounded-3xl sm:rounded-[32px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-900/70 text-white space-y-3.5 sm:space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between translate-z-20">
                  <span className="px-2.5 sm:px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-700/60 flex items-center gap-1.5 shadow-md">
                    <Medal className="w-3.5 h-3.5 text-amber-500" />
                    <span>#3 BRONZE RANK</span>
                  </span>
                  <span className="text-lg sm:text-xl font-black text-amber-400">{topThree[2].score} pts</span>
                </div>

                <div className="translate-z-30">
                  <h3 className="text-lg sm:text-xl font-black text-white truncate drop-shadow-md">
                    {topThree[2].in_game_name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    {topThree[2].user_details?.first_name || topThree[2].user_details?.username} • {topThree[2].user_details?.hostel_name}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-white/5 rounded-2xl border border-white/5 text-center text-[10px] translate-z-20 backdrop-blur-md">
                  <div>
                    <span className="block text-slate-400 font-medium">UID</span>
                    <button
                      type="button"
                      onClick={() => handleCopyUid(topThree[2].uid)}
                      className="text-slate-200 font-bold font-mono hover:text-amber-300 transition inline-flex items-center gap-0.5"
                    >
                      <span>{topThree[2].uid}</span>
                      {copiedUid === topThree[2].uid && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                    </button>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-medium">K/D</span>
                    <strong className="text-emerald-400 font-bold">{topThree[2].kd_ratio}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-medium">Booyahs</span>
                    <strong className="text-amber-400 font-bold">{topThree[2].total_booyahs}</strong>
                  </div>
                </div>
              </Card3D>
            )}
          </div>
        </div>
      )}

      {/* 3. Control Navigation Bar & Filters */}
      <div className="p-3.5 sm:p-4 bg-white rounded-3xl border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 z-10 relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl font-black text-xs transition-all shrink-0 cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Leaderboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tournaments')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl font-black text-xs transition-all shrink-0 cursor-pointer ${
              activeTab === 'tournaments'
                ? 'bg-purple-700 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-purple-400" />
            <span>Custom Room Matches ({tournaments.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Hostel Filter */}
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-700 font-semibold outline-none transition cursor-pointer"
          >
            <option value="">All Hostels</option>
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search IGN or UID..."
              className="w-full pl-9 pr-7 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-900 focus:border-brand-500 outline-none transition placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Tab 1: Leaderboard View (Mobile Cards + Desktop Table) */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4 z-10 relative">
          {isLoading ? (
            <LoadingSkeleton count={6} />
          ) : leaderboard.length > 0 ? (
            <>
              {/* A. Mobile Player Cards Feed (Screens < 640px) */}
              <div className="block sm:hidden space-y-3">
                {leaderboard.map((player, index) => {
                  const rankNum = index + 1;
                  const isMe = user?.id === player.user;

                  return (
                    <div
                      key={player.id}
                      className={`p-4 rounded-2xl border ${
                        isMe
                          ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                          : 'bg-white border-slate-200/80 shadow-xs'
                      } space-y-3`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Rank Badge */}
                          <div className="shrink-0">
                            {rankNum === 1 ? (
                              <span className="w-7 h-7 rounded-xl bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                👑 1
                              </span>
                            ) : rankNum === 2 ? (
                              <span className="w-7 h-7 rounded-xl bg-slate-400 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                2
                              </span>
                            ) : rankNum === 3 ? (
                              <span className="w-7 h-7 rounded-xl bg-amber-800 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                3
                              </span>
                            ) : (
                              <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                                #{rankNum}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <strong className="text-slate-900 font-black text-sm truncate">
                                {player.in_game_name}
                              </strong>
                              {isMe && (
                                <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] rounded-md">
                                  YOU
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium truncate">
                              {player.user_details?.first_name || player.user_details?.username} • {player.user_details?.hostel_name || 'Hostel'}
                            </p>
                          </div>
                        </div>

                        {/* Total Score */}
                        <div className="text-right shrink-0">
                          <span className="font-black text-base text-slate-900">{player.score}</span>
                          <span className="block text-[9px] text-slate-400 font-bold uppercase">Points</span>
                        </div>
                      </div>

                      {/* Stats Pills & UID */}
                      <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded-xl text-center text-[10px]">
                        <div>
                          <span className="text-slate-400 block font-medium">Rank</span>
                          <span className="font-bold text-purple-700 truncate block">
                            {player.br_rank?.split(' ')[0] || 'Heroic'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">K/D</span>
                          <span className="font-bold text-emerald-600 block">{player.kd_ratio}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Booyahs</span>
                          <span className="font-bold text-amber-600 block">{player.total_booyahs} 🏆</span>
                        </div>
                      </div>

                      {/* UID Copy Bar */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-400 font-medium">UID: <span className="font-mono text-slate-700 font-bold">{player.uid}</span></span>
                        <button
                          type="button"
                          onClick={() => handleCopyUid(player.uid)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                        >
                          {copiedUid === player.uid ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span>Copy UID</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* B. Desktop Full Table View (Screens >= 640px) */}
              <div className="hidden sm:block bg-white rounded-3xl border border-slate-200/80 shadow-subtle overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/90 border-b border-slate-100 text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                        <th className="py-3.5 px-4">Rank</th>
                        <th className="py-3.5 px-4">In-Game Name (IGN)</th>
                        <th className="py-3.5 px-4">Free Fire UID</th>
                        <th className="py-3.5 px-4">Rank Tier</th>
                        <th className="py-3.5 px-4">K/D Ratio</th>
                        <th className="py-3.5 px-4">Booyahs</th>
                        <th className="py-3.5 px-4 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {leaderboard.map((player, index) => {
                        const rankNum = index + 1;
                        const isMe = user?.id === player.user;

                        return (
                          <tr
                            key={player.id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              isMe ? 'bg-amber-50/70 font-bold' : ''
                            }`}
                          >
                            {/* Rank Column */}
                            <td className="py-3.5 px-4 font-black">
                              {rankNum === 1 ? (
                                <span className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                                  👑 1
                                </span>
                              ) : rankNum === 2 ? (
                                <span className="w-7 h-7 rounded-xl bg-slate-400 text-white flex items-center justify-center shadow-xs">
                                  2
                                </span>
                              ) : rankNum === 3 ? (
                                <span className="w-7 h-7 rounded-xl bg-amber-800 text-white flex items-center justify-center shadow-xs">
                                  3
                                </span>
                              ) : (
                                <span className="text-slate-500 font-bold px-2">#{rankNum}</span>
                              )}
                            </td>

                            {/* IGN & Student Meta */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                                  {player.in_game_name[0]?.toUpperCase() || 'P'}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <strong className="text-slate-900 font-black">{player.in_game_name}</strong>
                                    {isMe && (
                                      <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[9px] rounded-md">
                                        YOU
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    {player.user_details?.first_name || player.user_details?.username} • {player.user_details?.hostel_name || 'Hostel'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Free Fire UID */}
                            <td className="py-3.5 px-4">
                              <button
                                type="button"
                                onClick={() => handleCopyUid(player.uid)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-mono text-[11px] transition cursor-pointer"
                                title="Copy UID"
                              >
                                <span>{player.uid}</span>
                                {copiedUid === player.uid ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3 text-slate-400" />
                                )}
                              </button>
                            </td>

                            {/* Rank Tier */}
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200/80 rounded-full text-[10px] font-bold">
                                {player.br_rank || 'Heroic 💎'}
                              </span>
                            </td>

                            {/* K/D Ratio */}
                            <td className="py-3.5 px-4 font-bold text-emerald-600">
                              {player.kd_ratio} KD
                            </td>

                            {/* Booyahs */}
                            <td className="py-3.5 px-4 font-bold text-amber-600">
                              {player.total_booyahs} 🏆
                            </td>

                            {/* Total Score */}
                            <td className="py-3.5 px-4 text-right">
                              <span className="font-black text-sm text-slate-900">{player.score}</span>
                              <span className="block text-[9px] text-slate-400">pts</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              title="No gaming profiles registered yet"
              message="Be the first to register your Free Fire UID and claim Rank #1 in your hostel!"
              actionText="Register Free Fire UID"
              onAction={() => setIsModalOpen(true)}
            />
          )}
        </div>
      )}

      {/* 5. Tab 2: Custom Room Tournaments Section */}
      {activeTab === 'tournaments' && (
        <div className="space-y-4 z-10 relative">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hostel Custom Room Tournaments</h2>
              <p className="text-xs text-slate-400">Join weekend custom room battle royale &amp; clash squad matches</p>
            </div>
          </div>

          {tournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {tournaments.map((t) => (
                <Card3D
                  key={t.id}
                  glowColor="rgba(168, 85, 247, 0.3)"
                  className="p-6 rounded-[32px] bg-white border border-slate-200/80 shadow-lg space-y-4"
                >
                  <div className="flex items-start justify-between gap-2 translate-z-20">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                      {t.match_type === 'clash_squad' ? 'Clash Squad (4v4 CS)' : 'Battle Royale (Full Map)'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      t.status === 'live' ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {t.status === 'live' ? 'LIVE NOW 🔥' : 'UPCOMING'}
                    </span>
                  </div>

                  <div className="translate-z-30">
                    <h3 className="text-base font-black text-slate-900">{t.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{t.description || 'Hostel custom room match. All hostel residents are invited!'}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs translate-z-20">
                    <div>
                      <span className="block text-[10px] text-slate-400">Prize Pool</span>
                      <strong className="text-amber-600 font-bold">{t.prize_pool}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Entry Fee</span>
                      <strong className="text-emerald-600 font-bold">{t.entry_fee}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400">Schedule</span>
                      <strong className="text-slate-800 font-bold">{new Date(t.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                    </div>
                  </div>

                  {t.room_id ? (
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs font-bold text-amber-900 translate-z-30">
                      <span>Room ID: <strong className="font-mono">{t.room_id}</strong></span>
                      <span>Pass: <strong className="font-mono">{t.room_password || 'None'}</strong></span>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-[11px] text-slate-400 font-medium">
                      Room ID &amp; Password will be revealed 15 minutes before match start.
                    </div>
                  )}
                </Card3D>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No active tournament rooms"
              message="Check back soon for the weekend Free Fire hostel tournament schedule!"
            />
          )}
        </div>
      )}

      {/* 6. Register / Update Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-black text-slate-900">Free Fire Profile Setup</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!user && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between gap-2">
                <span>Login required to claim &amp; save your Free Fire Passport.</span>
                <Link
                  to="/login?next=/gaming"
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs shrink-0"
                >
                  Log In →
                </Link>
              </div>
            )}

            {modalError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitProfile} className="space-y-4 text-xs">
              {/* Free Fire UID Input + Auto-Fetch */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>Free Fire UID <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400">Your in-game numeric ID</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.uid}
                    onChange={(e) => setFormData({ ...formData, uid: e.target.value.trim() })}
                    placeholder="e.g. 1027766003"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-orange-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAutoLookup}
                    disabled={isLookingUp || !formData.uid}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl border border-slate-200 transition active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <Zap className={`w-3.5 h-3.5 text-orange-500 ${isLookingUp ? 'animate-spin' : ''}`} />
                    <span>{isLookingUp ? 'Fetching...' : 'Auto-Fetch'}</span>
                  </button>
                </div>
              </div>

              {/* In-Game Name (IGN) & Region */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    In-Game Nickname (IGN) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.in_game_name}
                    onChange={(e) => setFormData({ ...formData, in_game_name: e.target.value })}
                    placeholder="e.g. ⚡THAKUR_OP⚡ or Real IGN"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Region / Server
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="IND">IND 🇮🇳</option>
                    <option value="SG">SG 🇸🇬</option>
                    <option value="BD">BD 🇧🇩</option>
                    <option value="PK">PK 🇵🇰</option>
                    <option value="BR">BR 🇧🇷</option>
                    <option value="GLOBAL">GLOBAL 🌐</option>
                  </select>
                </div>
              </div>

              {/* Stats Grid: BR Rank, Level, Likes, KD, Booyahs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    BR Rank Tier
                  </label>
                  <select
                    value={formData.br_rank}
                    onChange={(e) => setFormData({ ...formData, br_rank: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="Grandmaster 👑">Grandmaster 👑</option>
                    <option value="Master 🎖️">Master 🎖️</option>
                    <option value="Heroic 💎">Heroic 💎</option>
                    <option value="Diamond 💠">Diamond 💠</option>
                    <option value="Platinum 🥈">Platinum 🥈</option>
                    <option value="Gold 🥉">Gold 🥉</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Player Level
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Profile Likes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.likes}
                    onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    K/D Ratio
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="30"
                    value={formData.kd_ratio}
                    onChange={(e) => setFormData({ ...formData, kd_ratio: parseFloat(e.target.value) || 1.0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Total Booyahs 🏆
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.total_booyahs}
                    onChange={(e) => setFormData({ ...formData, total_booyahs: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Rank Points
                  </label>
                  <input
                    type="number"
                    min="100"
                    value={formData.br_rank_points}
                    onChange={(e) => setFormData({ ...formData, br_rank_points: parseInt(e.target.value) || 1000 })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl border border-indigo-500/30 text-white space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  <span>Live Gamer Card Preview</span>
                  <span>{formData.region} • Lv. {formData.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-white">{formData.in_game_name || 'Enter In-Game Nickname'}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">UID: {formData.uid || 'XXXXXXXXXX'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-purple-300 block">{formData.br_rank}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">{formData.kd_ratio} KD • {formData.total_booyahs} 🏆</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-orange-500/20 transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Gamepad2 className="w-4 h-4 text-slate-950" />
                  <span>{isSubmitting ? 'Saving Profile...' : 'Save & Claim Leaderboard Rank 🏆'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
