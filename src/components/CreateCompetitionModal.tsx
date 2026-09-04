import React, { useState, useEffect } from 'react';
import {
  X,
  Gamepad2,
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
  AlertCircle,
  Sparkles,
  CheckCircle2,
  FileText,
  Sliders,
} from 'lucide-react';
import api from '../api/client';
import { Competition, GameType, CompetitionType, ScoringType } from '../types';

interface CreateCompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editCompetition?: Competition | null;
}

export const CreateCompetitionModal: React.FC<CreateCompetitionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editCompetition,
}) => {
  const [game, setGame] = useState<GameType>('bgmi');
  const [customGameName, setCustomGameName] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [competitionType, setCompetitionType] = useState<CompetitionType>('squad');
  const [startDatetime, setStartDatetime] = useState('');
  const [endDatetime, setEndDatetime] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number>(50);
  const [scoringType, setScoringType] = useState<ScoringType>('participant_submission');
  const [pointsPerKill, setPointsPerKill] = useState<number>(1);
  const [p1Points, setP1Points] = useState<number>(15);
  const [p2Points, setP2Points] = useState<number>(12);
  const [p3Points, setP3Points] = useState<number>(10);
  const [prizePool, setPrizePool] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [status, setStatus] = useState<any>('registration_open');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editCompetition) {
      setGame(editCompetition.game);
      setCustomGameName(editCompetition.custom_game_name || '');
      setName(editCompetition.name);
      setDescription(editCompetition.description || '');
      setRules(editCompetition.rules || '');
      setCompetitionType(editCompetition.competition_type);
      
      const pad = (n: number) => String(n).padStart(2, '0');
      if (editCompetition.start_datetime) {
        const d = new Date(editCompetition.start_datetime);
        setStartDatetime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
      }
      if (editCompetition.end_datetime) {
        const d = new Date(editCompetition.end_datetime);
        setEndDatetime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
      } else {
        setEndDatetime('');
      }
      if (editCompetition.registration_deadline) {
        const d = new Date(editCompetition.registration_deadline);
        setRegistrationDeadline(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
      } else {
        setRegistrationDeadline('');
      }

      setMaxParticipants(editCompetition.max_participants || 50);
      setScoringType(editCompetition.scoring_type || 'participant_submission');
      setPrizePool(editCompetition.prize_pool || '');
      setContactInfo(editCompetition.contact_info || '');
      setRoomId(editCompetition.room_id || '');
      setRoomPassword(editCompetition.room_password || '');
      setStatus(editCompetition.status || 'registration_open');

      if (editCompetition.scoring_rules) {
        setPointsPerKill(editCompetition.scoring_rules.points_per_kill ?? 1);
        const placement = editCompetition.scoring_rules.placement_points || {};
        setP1Points(placement['1'] ?? 15);
        setP2Points(placement['2'] ?? 12);
        setP3Points(placement['3'] ?? 10);
      }
    } else {
      setGame('bgmi');
      setCustomGameName('');
      setName('');
      setDescription('');
      setRules('1. Only hostel students can participate.\n2. Screenshot proof required for result verification.\n3. Match must be played at scheduled time.');
      setCompetitionType('squad');

      const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const pad = (n: number) => String(n).padStart(2, '0');
      setStartDatetime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
      setEndDatetime('');
      setRegistrationDeadline('');

      setMaxParticipants(50);
      setScoringType('participant_submission');
      setPointsPerKill(1);
      setP1Points(15);
      setP2Points(12);
      setP3Points(10);
      setPrizePool('');
      setContactInfo('');
      setRoomId('');
      setRoomPassword('');
      setStatus('registration_open');
    }
    setError('');
  }, [editCompetition, isOpen]);

  const handleGameSelect = (selectedGame: GameType) => {
    setGame(selectedGame);
    if (selectedGame === 'bgmi') {
      setMaxParticipants(100);
    } else if (selectedGame === 'bgmi_lite') {
      setMaxParticipants(60);
    } else if (selectedGame === 'free_fire_max') {
      setMaxParticipants(48);
    } else {
      setMaxParticipants(30);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a competition name.');
      return;
    }

    if (game === 'other' && !customGameName.trim()) {
      setError('Please specify the game name.');
      return;
    }

    if (!startDatetime) {
      setError('Please set the scheduled start date and time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const scoringRulesPayload: Record<string, any> = {
        points_per_kill: Number(pointsPerKill) || 1,
        placement_points: {
          '1': Number(p1Points) || 15,
          '2': Number(p2Points) || 12,
          '3': Number(p3Points) || 10,
        },
      };

      const payload = {
        game,
        custom_game_name: game === 'other' ? customGameName.trim() : '',
        name: name.trim(),
        description: description.trim(),
        rules: rules.trim(),
        competition_type: competitionType,
        start_datetime: new Date(startDatetime).toISOString(),
        end_datetime: endDatetime ? new Date(endDatetime).toISOString() : null,
        registration_deadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : null,
        max_participants: Number(maxParticipants) || 50,
        scoring_type: scoringType,
        scoring_rules: scoringRulesPayload,
        prize_pool: prizePool.trim(),
        contact_info: contactInfo.trim(),
        room_id: roomId.trim(),
        room_password: roomPassword.trim(),
        status,
      };

      if (editCompetition) {
        await api.put(`/gaming/competitions/${editCompetition.id}/`, payload);
      } else {
        await api.post('/gaming/competitions/', payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to save competition. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 text-xs animate-scale-up">
        {/* Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Gamepad2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{editCompetition ? 'Edit Competition' : 'Create Competition'}</span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-brand-400/20 text-brand-300 border border-brand-400/30 rounded-full">
                  Host Event
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Host BGMI, Free Fire MAX or custom game matches for your hostel community.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-700 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. Game Selection */}
          <div className="space-y-2">
            <label className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-brand-600" />
              <span>Select Game *</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* BGMI */}
              <button
                type="button"
                onClick={() => handleGameSelect('bgmi')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col items-start gap-1 cursor-pointer ${
                  game === 'bgmi'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold shadow-xs ring-2 ring-amber-400/30'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-xs text-amber-600">
                  <Target className="w-4 h-4" />
                  <span>BGMI</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Battlegrounds Mobile</span>
              </button>

              {/* BGMI Lite */}
              <button
                type="button"
                onClick={() => handleGameSelect('bgmi_lite')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col items-start gap-1 cursor-pointer ${
                  game === 'bgmi_lite'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-950 font-bold shadow-xs ring-2 ring-blue-400/30'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-xs text-blue-600">
                  <Zap className="w-4 h-4" />
                  <span>BGMI Lite</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Fast Match</span>
              </button>

              {/* Free Fire MAX */}
              <button
                type="button"
                onClick={() => handleGameSelect('free_fire_max')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col items-start gap-1 cursor-pointer ${
                  game === 'free_fire_max'
                    ? 'border-rose-500 bg-rose-50/70 text-rose-950 font-bold shadow-xs ring-2 ring-rose-400/30'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-xs text-rose-600">
                  <Flame className="w-4 h-4" />
                  <span>Free Fire MAX</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">BR &amp; Clash Squad</span>
              </button>

              {/* Other Game */}
              <button
                type="button"
                onClick={() => handleGameSelect('other')}
                className={`p-3 rounded-2xl border text-left transition flex flex-col items-start gap-1 cursor-pointer ${
                  game === 'other'
                    ? 'border-purple-500 bg-purple-50/70 text-purple-950 font-bold shadow-xs ring-2 ring-purple-400/30'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black text-xs text-purple-600">
                  <Sliders className="w-4 h-4" />
                  <span>Other Game</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Custom Game</span>
              </button>
            </div>

            {/* Custom Game Name Input if 'Other' */}
            {game === 'other' && (
              <div className="pt-2 animate-fade-in">
                <label className="text-[10px] font-bold text-slate-600 mb-1 block">
                  Enter Game Name * (e.g. Valorant, COD Mobile, Chess, FIFA)
                </label>
                <input
                  type="text"
                  value={customGameName}
                  onChange={(e) => setCustomGameName(e.target.value)}
                  placeholder="e.g. Call of Duty Mobile, Clash Royale, FIFA 24"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-200 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-purple-500 outline-none"
                  required
                />
              </div>
            )}
          </div>

          {/* 2. Competition Name */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
              Competition Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HostelTalkies BGMI Championship, Saturday Free Fire MAX Clash"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none transition"
              required
            />
          </div>

          {/* 3. Competition Type & Max Participants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Format Type */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-brand-600" />
                <span>Format / Match Type *</span>
              </label>
              <select
                value={competitionType}
                onChange={(e) => setCompetitionType(e.target.value as CompetitionType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 outline-none transition cursor-pointer"
              >
                <option value="solo">👤 Solo (Single Player)</option>
                <option value="duo">👥 Duo (2 Players/Team)</option>
                <option value="squad">👥 Squad (4 Players/Team)</option>
                <option value="1v1">⚔️ 1v1 Match</option>
                <option value="team">🛡️ Team vs Team</option>
                <option value="custom">⚡ Custom Tournament Format</option>
              </select>
            </div>

            {/* Max Slots */}
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-brand-600" />
                <span>Max Player Capacity</span>
              </label>
              <input
                type="number"
                min="2"
                max="200"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 outline-none transition"
              />
            </div>
          </div>

          {/* 4. Schedule & Deadlines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                <span>Start Date &amp; Time *</span>
              </label>
              <input
                type="datetime-local"
                value={startDatetime}
                onChange={(e) => setStartDatetime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 outline-none transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Registration Deadline (Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 outline-none transition"
              />
            </div>
          </div>

          {/* 5. Scoring System Configuration */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-indigo-950 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-indigo-600" />
                <span>Scoring &amp; Leaderboard System</span>
              </span>
              <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-200/60 px-2 py-0.5 rounded-full">
                No Fake Stats • Verified by Host
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-700">Result Submission Mode</label>
              <select
                value={scoringType}
                onChange={(e) => setScoringType(e.target.value as ScoringType)}
                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-slate-900 focus:border-indigo-500 outline-none"
              >
                <option value="participant_submission">
                  📸 Participant Submission + Organizer Verification (Screenshot Proof)
                </option>
                <option value="points_based">
                  🎯 Points Formula (Calculates Points from Placement + Kills)
                </option>
                <option value="manual">
                  ✍️ Manual Entry Only (Host enters all scores)
                </option>
              </select>
            </div>

            {scoringType === 'points_based' && (
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-indigo-100">
                <div>
                  <label className="text-[9px] font-bold text-slate-600 block">Pts / Kill</label>
                  <input
                    type="number"
                    value={pointsPerKill}
                    onChange={(e) => setPointsPerKill(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-600 block">1st Place Pts</label>
                  <input
                    type="number"
                    value={p1Points}
                    onChange={(e) => setP1Points(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-600 block">2nd Place Pts</label>
                  <input
                    type="number"
                    value={p2Points}
                    onChange={(e) => setP2Points(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-center"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-600 block">3rd Place Pts</label>
                  <input
                    type="number"
                    value={p3Points}
                    onChange={(e) => setP3Points(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-center"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 6. In-Game Room Credentials (Optional/Dynamic) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-950 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>In-Game Room Credentials (Optional)</span>
              </span>
              <span className="text-[10px] text-amber-700 font-semibold bg-amber-200/60 px-2 py-0.5 rounded-full">
                Can add right before match
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 mb-1 block">
                  In-Game Room ID
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="e.g. 8492018"
                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 mb-1 block">
                  Room Password
                </label>
                <input
                  type="text"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  placeholder="e.g. 1234 or hostel"
                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-amber-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* 7. Prize Pool & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Prize / Rewards</span>
              </label>
              <input
                type="text"
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
                placeholder="e.g. ₹500 Voucher, Canteen Samosa Treat, Gold Trophy"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                Host Contact / WhatsApp Group
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="e.g. WhatsApp: +91 9876543210 / Room 204"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-brand-500 outline-none transition"
              />
            </div>
          </div>

          {/* 8. Description & Rules */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
              Description &amp; Overview
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Intra-hostel BGMI championship. 3 Erangel matches. Top squad wins prize pool."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-900 focus:bg-white focus:border-brand-500 outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-brand-600" />
              <span>Competition Rules</span>
            </label>
            <textarea
              rows={3}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="e.g. 1. Only hostel residents. 2. Screenshot required. 3. Be in room 5 mins before start."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-900 focus:bg-white focus:border-brand-500 outline-none transition"
            />
          </div>

          {/* Status (when editing) */}
          {editCompetition && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                Competition Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-brand-500 outline-none transition cursor-pointer"
              >
                <option value="registration_open">🟢 Registration Open</option>
                <option value="upcoming">⏳ Upcoming</option>
                <option value="live">🔴 Live Now / In Progress</option>
                <option value="completed">✅ Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-extrabold shadow-md shadow-brand-500/20 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting
                ? 'Publishing Competition...'
                : editCompetition
                ? 'Save Competition'
                : '🚀 Publish Competition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
