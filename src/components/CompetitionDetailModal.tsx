import React, { useState } from 'react';
import {
  X,
  Gamepad2,
  Copy,
  Check,
  Calendar,
  Clock,
  Key,
  Users,
  Trophy,
  Shield,
  MapPin,
  Flame,
  Zap,
  Target,
  User,
  Phone,
  Edit,
  Trash2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Upload,
  Eye,
  FileText,
  Sliders,
  Award,
  Lock,
  Unlock,
} from 'lucide-react';
import api from '../api/client';
import { Competition, CompetitionResult } from '../types';
import { useAuth } from '../context/AuthContext';

interface CompetitionDetailModalProps {
  competition: Competition | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onEdit: (comp: Competition) => void;
}

export const CompetitionDetailModal: React.FC<CompetitionDetailModalProps> = ({
  competition,
  isOpen,
  onClose,
  onRefresh,
  onEdit,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'leaderboard' | 'submit_result' | 'organizer'>('overview');

  // Join form state
  const [inGameName, setInGameName] = useState('');
  const [gameUid, setGameUid] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [agreedRules, setAgreedRules] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Result submission state
  const [position, setPosition] = useState('');
  const [kills, setKills] = useState('');
  const [score, setScore] = useState('');
  const [notes, setNotes] = useState('');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>('');
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);

  // Organizer state
  const [editRoomId, setEditRoomId] = useState('');
  const [editRoomPassword, setEditRoomPassword] = useState('');
  const [editStatus, setEditStatus] = useState<string>('');
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);
  const [isTogglingReg, setIsTogglingReg] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copy feedback
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Alerts
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !competition) return null;

  const isCreator = competition.is_creator || (user && competition.creator === user.id) || user?.is_staff || user?.is_superuser;
  const isJoined = competition.is_joined;

  const copyToClipboard = async (text: string, type: 'id' | 'pass') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'id') {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else {
        setCopiedPass(true);
        setTimeout(() => setCopiedPass(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inGameName.trim()) {
      setError('Please enter your in-game nickname (IGN).');
      return;
    }
    if (!agreedRules) {
      setError('Please agree to the competition rules to join.');
      return;
    }

    setIsJoining(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.post(`/gaming/competitions/${competition.id}/join/`, {
        in_game_name: inGameName.trim(),
        game_uid: gameUid.trim(),
        team_name: teamName.trim(),
        team_members: teamMembers.trim(),
        contact_number: contactNumber.trim(),
      });
      setSuccessMsg(res.data.detail || 'Joined competition successfully!');
      setInGameName('');
      setGameUid('');
      setTeamName('');
      setTeamMembers('');
      setContactNumber('');
      setAgreedRules(false);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to join competition.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration in this competition?')) return;

    setIsLeaving(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.post(`/gaming/competitions/${competition.id}/leave/`);
      setSuccessMsg('You have cancelled your slot.');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to leave competition.');
    } finally {
      setIsLeaving(false);
    }
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofImage(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingResult(true);
    setError('');
    setSuccessMsg('');
    try {
      const formData = new FormData();
      if (position) formData.append('position', position);
      if (kills) formData.append('kills', kills);
      if (score) formData.append('score', score.trim());
      if (notes) formData.append('notes', notes.trim());
      if (proofImage) formData.append('proof_image', proofImage);

      const res = await api.post(`/gaming/competitions/${competition.id}/submit_result/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMsg(res.data.detail || 'Result submitted for organizer review!');
      setPosition('');
      setKills('');
      setScore('');
      setNotes('');
      setProofImage(null);
      setProofPreview('');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to submit result.');
    } finally {
      setIsSubmittingResult(false);
    }
  };

  const handleVerifyResult = async (resultId: number, actionType: 'approve' | 'reject', overridePoints?: number) => {
    setError('');
    setSuccessMsg('');
    try {
      const payload: any = { result_id: resultId, action: actionType };
      if (overridePoints !== undefined) payload.points = overridePoints;

      const res = await api.post(`/gaming/competitions/${competition.id}/verify_result/`, payload);
      setSuccessMsg(res.data.detail || `Result ${actionType}d!`);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to verify result.');
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingCreds(true);
    setError('');
    try {
      await api.patch(`/gaming/competitions/${competition.id}/update_credentials/`, {
        room_id: editRoomId.trim(),
        room_password: editRoomPassword.trim(),
        status: editStatus || competition.status,
      });
      setSuccessMsg('In-game room credentials updated!');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to update credentials.');
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  const handleToggleRegistration = async () => {
    setIsTogglingReg(true);
    try {
      const res = await api.post(`/gaming/competitions/${competition.id}/toggle_registration/`);
      setSuccessMsg(res.data.detail || 'Registration status updated!');
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to toggle registration.');
    } finally {
      setIsTogglingReg(false);
    }
  };

  const handleDeleteCompetition = async () => {
    if (!window.confirm('Are you sure you want to delete this competition? This cannot be undone.')) return;

    setIsDeleting(true);
    try {
      await api.delete(`/gaming/competitions/${competition.id}/`);
      onRefresh();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to delete competition.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Game badge icon & styling
  const getGameBadge = () => {
    if (competition.game === 'bgmi') {
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-xs">
          <Target className="w-3.5 h-3.5" />
          <span>BGMI</span>
        </span>
      );
    }
    if (competition.game === 'bgmi_lite') {
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-blue-500 text-white flex items-center gap-1.5 shadow-xs">
          <Zap className="w-3.5 h-3.5" />
          <span>BGMI Lite</span>
        </span>
      );
    }
    if (competition.game === 'free_fire_max') {
      return (
        <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-rose-500 text-white flex items-center gap-1.5 shadow-xs">
          <Flame className="w-3.5 h-3.5" />
          <span>Free Fire MAX</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-purple-500 text-white flex items-center gap-1.5 shadow-xs">
        <Sliders className="w-3.5 h-3.5" />
        <span>{competition.game_display}</span>
      </span>
    );
  };

  const startDate = new Date(competition.start_datetime);
  const pendingResults = competition.participants?.flatMap(p => p.results || []).filter(r => r.verification_status === 'pending') || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 text-xs animate-scale-up">
        {/* Modal Top Hero Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between border-b border-slate-800">
          <div className="space-y-2 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              {getGameBadge()}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/10 text-white border border-white/15">
                {competition.competition_type.toUpperCase()}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  competition.status === 'live'
                    ? 'bg-rose-500 text-white animate-pulse'
                    : competition.status === 'registration_open'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {competition.status === 'live' ? '🔴 LIVE NOW' : competition.status.replace('_', ' ').toUpperCase()}
              </span>
              {competition.is_registration_open ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  🟢 Open to Join
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">
                  🔒 Registration Closed
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-tight">
              {competition.name}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-slate-300 text-[11px] font-medium">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-brand-300" />
                <span>Hosted by <strong className="text-white">{competition.creator_detail?.full_name || competition.creator_detail?.username}</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-300" />
                <span>{competition.participants_count} / {competition.max_participants} Joined</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 sm:px-6 pt-3 border-b border-slate-100 bg-slate-50/50 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 px-2 font-extrabold text-xs transition border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📋 Overview &amp; Rules
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('participants')}
            className={`pb-2.5 px-2 font-extrabold text-xs transition border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'participants'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            👥 Participants ({competition.participants_count})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`pb-2.5 px-2 font-extrabold text-xs transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'leaderboard'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Leaderboard</span>
          </button>

          {isJoined && (
            <button
              type="button"
              onClick={() => setActiveTab('submit_result')}
              className={`pb-2.5 px-2 font-extrabold text-xs transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'submit_result'
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-brand-600" />
              <span>Submit Result</span>
            </button>
          )}

          {isCreator && (
            <button
              type="button"
              onClick={() => {
                setEditRoomId(competition.room_id || '');
                setEditRoomPassword(competition.room_password || '');
                setEditStatus(competition.status || 'registration_open');
                setActiveTab('organizer');
              }}
              className={`pb-2.5 px-2 font-extrabold text-xs transition border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeTab === 'organizer'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-purple-600 hover:text-purple-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>Organizer Panel</span>
              {pendingResults.length > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] bg-rose-600 text-white rounded-full font-black">
                  {pendingResults.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Message Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Tab Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: OVERVIEW & RULES */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* In-Game Room Credentials (if published) */}
              {competition.room_id && (
                <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/10 to-brand-500/10 border border-amber-300/70 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-950 text-xs flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-amber-600" />
                      <span>In-Game Room Credentials</span>
                    </span>
                    <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full">
                      Match Room
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-2xl border border-amber-200 flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Room ID</span>
                        <span className="text-base font-black font-mono text-slate-900 tracking-wider">
                          {competition.room_id}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(competition.room_id!, 'id')}
                        className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl transition flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                      >
                        {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border border-amber-200 flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Password</span>
                        <span className="text-base font-black font-mono text-slate-900 tracking-wider">
                          {competition.room_password || '(No Password)'}
                        </span>
                      </div>
                      {competition.room_password && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(competition.room_password!, 'pass')}
                          className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl transition flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                        >
                          {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedPass ? 'Copied!' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {competition.description && (
                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-900 text-xs">About This Competition</h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {competition.description}
                  </p>
                </div>
              )}

              {/* Rules */}
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-600" />
                  <span>Competition Rules</span>
                </h3>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 whitespace-pre-line leading-relaxed font-medium">
                  {competition.rules || 'Standard fair play rules apply. Screenshot proof required for all score claims.'}
                </div>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Prizes &amp; Rewards</span>
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>{competition.prize_pool || 'Hostel Bragging Rights & Podium Trophy'}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Host &amp; Contact</span>
                  <span className="font-bold text-slate-900 block">
                    {competition.creator_detail?.full_name || competition.creator_detail?.username} ({competition.hostel_name || 'Campus Resident'})
                  </span>
                  {competition.contact_info && (
                    <span className="text-[11px] text-slate-600 block">
                      <strong>Contact:</strong> {competition.contact_info}
                    </span>
                  )}
                </div>
              </div>

              {/* Join Section */}
              {!isJoined && competition.is_registration_open && (
                <div className="p-5 rounded-3xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-600" />
                    <h3 className="font-black text-slate-900 text-sm">
                      Register to Participate in this Competition
                    </h3>
                  </div>

                  <form onSubmit={handleJoin} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-slate-700 mb-1 block">
                          In-Game Nickname (IGN) *
                        </label>
                        <input
                          type="text"
                          value={inGameName}
                          onChange={(e) => setInGameName(e.target.value)}
                          placeholder="e.g. THAKUR_OP, JonathanGaming"
                          className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl text-xs font-bold text-slate-900 focus:border-brand-500 outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-slate-700 mb-1 block">
                          Player UID / ID (Optional info)
                        </label>
                        <input
                          type="text"
                          value={gameUid}
                          onChange={(e) => setGameUid(e.target.value)}
                          placeholder="e.g. 518392019"
                          className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-brand-500 outline-none"
                        />
                      </div>
                    </div>

                    {(competition.competition_type === 'squad' || competition.competition_type === 'duo' || competition.competition_type === 'team') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[10px] font-extrabold uppercase text-slate-700 mb-1 block">
                            Team / Squad Name (Optional)
                          </label>
                          <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="e.g. Hostel 3 Warriors"
                            className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl text-xs font-bold text-slate-900 focus:border-brand-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-extrabold uppercase text-slate-700 mb-1 block">
                            Teammates / Roster (Optional)
                          </label>
                          <input
                            type="text"
                            value={teamMembers}
                            onChange={(e) => setTeamMembers(e.target.value)}
                            placeholder="e.g. Aman, Rohan, Rohit"
                            className="w-full px-3 py-2 bg-white border border-brand-200 rounded-xl text-xs font-bold text-slate-900 focus:border-brand-500 outline-none"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="agree-rules"
                        checked={agreedRules}
                        onChange={(e) => setAgreedRules(e.target.checked)}
                        className="w-4 h-4 text-brand-600 rounded cursor-pointer"
                        required
                      />
                      <label htmlFor="agree-rules" className="text-xs font-semibold text-slate-700 cursor-pointer">
                        I have read and agree to the competition rules &amp; screenshot verification requirement.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isJoining || !agreedRules}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-md transition active:scale-98 cursor-pointer disabled:opacity-50"
                    >
                      {isJoining ? 'Joining...' : '🎮 Register Slot in Competition'}
                    </button>
                  </form>
                </div>
              )}

              {isJoined && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      You are registered as <strong>{competition.my_participant_info?.in_game_name}</strong>
                      {competition.my_participant_info?.slot_number ? ` (Slot #${competition.my_participant_info.slot_number})` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLeave}
                    disabled={isLeaving}
                    className="text-xs font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                  >
                    {isLeaving ? 'Cancelling...' : 'Cancel Slot'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PARTICIPANTS ROSTER */}
          {activeTab === 'participants' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900 text-xs">
                  Registered Participants ({competition.participants_count} / {competition.max_participants})
                </span>
              </div>

              {competition.participants && competition.participants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {competition.participants.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-black text-[10px] flex items-center justify-center shrink-0">
                          #{p.slot_number || idx + 1}
                        </span>
                        <div className="min-w-0">
                          <span className="font-black text-slate-900 text-xs block truncate">
                            {p.in_game_name}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {p.team_name ? `Team: ${p.team_name} • ` : ''}User: {p.user_detail?.full_name || p.user_detail?.username}
                          </span>
                        </div>
                      </div>

                      {p.game_uid && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 shrink-0">
                          UID: {p.game_uid}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No participants registered yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Official Competition Leaderboard</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Official rankings based exclusively on organizer-verified match results.
                  </p>
                </div>
              </div>

              {competition.leaderboard && competition.leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {competition.leaderboard.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                        idx === 0
                          ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                          : idx === 1
                          ? 'bg-slate-100 border-slate-300'
                          : idx === 2
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-950 shadow-xs'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-800'
                              : idx === 2
                              ? 'bg-orange-300 text-slate-900'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                        </div>

                        <div className="min-w-0">
                          <span className="font-black text-slate-900 text-xs block truncate">
                            {entry.participant_name}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {entry.position ? `Placement #${entry.position} • ` : ''}
                            {entry.kills} Kills {entry.score ? `• ${entry.score}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-slate-900 block">
                          {entry.points} pts
                        </span>
                        <span className="text-[9px] uppercase font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                          Verified ✓
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-1.5">
                  <Award className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="font-bold text-slate-700 text-xs">No Official Results Yet</h4>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Rankings will appear here as soon as match results are submitted and verified by the competition organizer.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SUBMIT RESULT (For Participants) */}
          {activeTab === 'submit_result' && isJoined && (
            <div className="p-5 rounded-3xl bg-white border border-brand-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-brand-600" />
                  <span>Submit Your Match Result</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Upload your in-game scorecard/screenshot proof for organizer verification.
                </p>
              </div>

              <form onSubmit={handleSubmitResult} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-700 mb-1 block">
                      Placement / Position (e.g. 1, 2, 3)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-700 mb-1 block">
                      Kills
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={kills}
                      onChange={(e) => setKills(e.target.value)}
                      placeholder="e.g. 7"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-brand-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-700 mb-1 block">
                      Match Score / Outcome
                    </label>
                    <input
                      type="text"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="e.g. Booyah / Won 16-10"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>

                {/* Screenshot Proof Upload */}
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-700 mb-1 block">
                    Upload Screenshot Proof (Optional / Recommended)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProofChange}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                  />
                  {proofPreview && (
                    <div className="mt-2 relative w-32 h-20 rounded-xl overflow-hidden border border-slate-200">
                      <img src={proofPreview} alt="Proof" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-700 mb-1 block">
                    Notes / Comments (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. 8 kills in Erangel match #2"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-brand-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingResult}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs rounded-xl shadow-md transition active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingResult ? 'Submitting Result...' : '📤 Submit Result for Verification'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: ORGANIZER DASHBOARD (Host/Admin Only) */}
          {activeTab === 'organizer' && isCreator && (
            <div className="space-y-6">
              {/* Quick Actions Bar */}
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-3xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-purple-950 text-xs">Organizer Management Hub</h3>
                  <p className="text-[10px] text-purple-700">Manage registrations, in-game credentials &amp; verify results</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleRegistration}
                    disabled={isTogglingReg}
                    className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-900 font-bold text-xs hover:bg-purple-100 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {competition.is_registration_closed_by_organizer ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{competition.is_registration_closed_by_organizer ? 'Re-open Registration' : 'Close Registration'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEdit(competition);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-900 font-bold text-xs hover:bg-purple-100 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>
                </div>
              </div>

              {/* In-Game Room ID & Pass Update Form */}
              <form onSubmit={handleUpdateCredentials} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  <span>Update In-Game Room Credentials &amp; Status</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 mb-0.5 block">Room ID</label>
                    <input
                      type="text"
                      value={editRoomId}
                      onChange={(e) => setEditRoomId(e.target.value)}
                      placeholder="e.g. 784920"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 mb-0.5 block">Room Password</label>
                    <input
                      type="text"
                      value={editRoomPassword}
                      onChange={(e) => setEditRoomPassword(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 mb-0.5 block">Match Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    >
                      <option value="registration_open">Registration Open</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="live">🔴 Live Now</option>
                      <option value="completed">✅ Completed</option>
                      <option value="cancelled">❌ Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isUpdatingCreds}
                    className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs"
                  >
                    {isUpdatingCreds ? 'Saving...' : 'Save & Publish Credentials'}
                  </button>
                </div>
              </form>

              {/* Pending Result Submissions Review */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>Pending Result Submissions ({pendingResults.length})</span>
                </h4>

                {pendingResults.length > 0 ? (
                  <div className="space-y-3">
                    {pendingResults.map((res) => (
                      <div
                        key={res.id}
                        className="p-4 bg-white rounded-2xl border border-amber-200 shadow-2xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-black text-slate-900 text-xs">
                              {res.participant_name}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              Claimed: {res.position ? `Placement #${res.position}` : ''} • {res.kills} Kills {res.score ? `• ${res.score}` : ''}
                            </span>
                          </div>

                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 self-start sm:self-auto">
                            Pending Review
                          </span>
                        </div>

                        {res.proof_image && (
                          <div className="pt-1">
                            <span className="text-[10px] font-bold text-slate-500 block mb-1">Screenshot Proof:</span>
                            <a
                              href={res.proof_image}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block relative w-44 h-24 rounded-xl overflow-hidden border border-slate-200 group"
                            >
                              <img src={res.proof_image} alt="Proof" className="w-full h-full object-cover group-hover:scale-105 transition" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-[10px] font-bold">
                                View Full Image ↗
                              </div>
                            </a>
                          </div>
                        )}

                        {res.notes && (
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                            <strong>Note:</strong> {res.notes}
                          </p>
                        )}

                        {/* Verification Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleVerifyResult(res.id, 'reject')}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVerifyResult(res.id, 'approve')}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer shadow-xs"
                          >
                            ✓ Approve Result
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No pending results to review.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div>
            {isCreator && (
              <button
                type="button"
                onClick={handleDeleteCompetition}
                disabled={isDeleting}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Competition'}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
