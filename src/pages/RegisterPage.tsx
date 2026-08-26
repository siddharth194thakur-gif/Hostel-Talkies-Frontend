import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus, Lock, Mail, User, Building, AlertCircle, CheckCircle,
  GraduationCap, BookOpen, ShieldCheck, Sparkles
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Hostel, Block, Room } from '../types';

const PROGRAMME_BRANCHES: Record<string, string[]> = {
  'B.Tech': [
    'Computer Science & Engineering',
    'Electronics & Communication Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology',
    'Chemical Engineering',
    'Biotechnology',
    'Other Engineering'
  ],
  'BCA': [
    'Computer Applications (General)',
    'Data Science & Analytics',
    'Cloud & Security',
    'Web & Mobile Development',
    'Other BCA Specialisation'
  ],
  'MCA': [
    'Software Engineering & Development',
    'Artificial Intelligence & ML',
    'Data Science & Big Data',
    'Cyber Security & Networking',
    'Cloud Computing & DevOps',
    'General MCA'
  ],
  'M.Tech': [
    'Computer Science & Engineering',
    'VLSI & Embedded Systems',
    'Power Systems & Automation',
    'Thermal & Fluid Engineering',
    'Structural & Geo-technical Engineering',
    'Other M.Tech'
  ],
  'MBA': [
    'Finance & Banking',
    'Marketing & Digital Strategy',
    'Human Resource Management',
    'Operations & Supply Chain',
    'Business Analytics & AI',
    'International Business',
    'General Management'
  ],
  'B.Sc': [
    'Computer Science',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biotechnology & Life Sciences',
    'Statistics & Data Analytics',
    'Other B.Sc'
  ],
  'M.Sc': [
    'Computer Science',
    'Physics',
    'Chemistry',
    'Applied Mathematics',
    'Biotechnology',
    'Other M.Sc'
  ],
  'Other': [
    'General Studies',
    'Interdisciplinary Studies',
    'Humanities & Social Sciences',
    'Commerce',
    'Other Specialisation'
  ]
};

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Basic Information
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('prefer_not_to_say');

  // Academic Information
  const [programme, setProgramme] = useState('B.Tech');
  const [branch, setBranch] = useState(PROGRAMME_BRANCHES['B.Tech'][0]);

  // Account Information
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Cascading Hostel Dropdowns
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [selectedHostel, setSelectedHostel] = useState<string>('');
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');

  const [isLoadingHostels, setIsLoadingHostels] = useState(false);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // When programme changes, update available branches and set default branch
  useEffect(() => {
    const branches = PROGRAMME_BRANCHES[programme] || PROGRAMME_BRANCHES['Other'];
    if (branches && branches.length > 0) {
      setBranch(branches[0]);
    }
  }, [programme]);

  // 1. Fetch available Hostels dynamically from database on mount
  useEffect(() => {
    const fetchHostels = async () => {
      setIsLoadingHostels(true);
      try {
        const res = await api.get<{ results: Hostel[] } | Hostel[]>('/hostels/');
        const list = Array.isArray(res.data) ? res.data : res.data.results || [];
        setHostels(list);
      } catch (err) {
        console.error('Failed to load hostels', err);
      } finally {
        setIsLoadingHostels(false);
      }
    };
    fetchHostels();
  }, []);

  // 2. When Hostel changes, fetch its Blocks dynamically
  useEffect(() => {
    setSelectedBlock('');
    setSelectedRoom('');
    setBlocks([]);
    setRooms([]);

    if (!selectedHostel) return;

    const fetchBlocks = async () => {
      setIsLoadingBlocks(true);
      try {
        const res = await api.get<{ results: Block[] } | Block[]>(`/hostels/${selectedHostel}/blocks/`);
        const list = Array.isArray(res.data) ? res.data : res.data.results || [];
        setBlocks(list);
      } catch (err) {
        console.error('Failed to load blocks', err);
      } finally {
        setIsLoadingBlocks(false);
      }
    };
    fetchBlocks();
  }, [selectedHostel]);

  // 3. When Block changes, fetch its Rooms dynamically
  useEffect(() => {
    setSelectedRoom('');
    setRooms([]);

    if (!selectedBlock) return;

    const fetchRooms = async () => {
      setIsLoadingRooms(true);
      try {
        const res = await api.get<{ results: Room[] } | Room[]>(`/hostels/blocks/${selectedBlock}/rooms/`);
        const list = Array.isArray(res.data) ? res.data : res.data.results || [];
        setRooms(list);
      } catch (err) {
        console.error('Failed to load rooms', err);
      } finally {
        setIsLoadingRooms(false);
      }
    };
    fetchRooms();
  }, [selectedBlock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    if (!selectedHostel) {
      setError('Please select your hostel (Required).');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload: any = {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        gender,
        programme,
        branch,
        password,
        confirm_password: confirmPassword,
        hostel: parseInt(selectedHostel),
      };

      if (selectedBlock) payload.block = parseInt(selectedBlock);
      if (selectedRoom) payload.room = parseInt(selectedRoom);

      const res = await api.post('/auth/register/', payload);
      login(res.data.tokens, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      const errData = err.response?.data;
      if (typeof errData === 'object' && errData !== null) {
        const firstKey = Object.keys(errData)[0];
        const msg = Array.isArray(errData[firstKey]) ? errData[firstKey][0] : errData[firstKey];
        setError(`${firstKey}: ${msg}`);
      } else {
        setError('Registration failed. Please check your inputs.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-bold text-xl flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
            HT
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Create Student Account</h2>
          <p className="text-xs sm:text-sm text-slate-500">Join your hostel campus network in just a minute</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="font-medium leading-relaxed">{error}</div>
          </div>
        )}

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">

            {/* SECTION 1: Basic Information */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">1. Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Full Name */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Siddharth Singh"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-xs"
                    />
                  </div>
                </div>

                {/* 2. Email Address */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@campus.edu"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-xs"
                    />
                  </div>
                </div>

                {/* 3. Gender */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-xs"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: Academic Information */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <GraduationCap className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">2. Academic Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 4. Programme / Course */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Programme / Course <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={programme}
                    onChange={(e) => setProgramme(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-xs"
                  >
                    {Object.keys(PROGRAMME_BRANCHES).map((prog) => (
                      <option key={prog} value={prog}>
                        {prog}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Branch / Specialisation */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Branch / Specialisation <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-xs"
                  >
                    {(PROGRAMME_BRANCHES[programme] || PROGRAMME_BRANCHES['Other']).map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 3: Hostel Information (Database-Driven) */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Building className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">3. Hostel Information</h3>
              </div>

              <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/80 space-y-3.5">
                {/* 6. Select Hostel (REQUIRED) */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Hostel <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <select
                    required
                    value={selectedHostel}
                    onChange={(e) => setSelectedHostel(e.target.value)}
                    disabled={isLoadingHostels}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-xs"
                  >
                    <option value="">-- Choose Your Hostel --</option>
                    {hostels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} {h.gender ? `(${h.gender})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 7 & 8. Block & Room Select (OPTIONAL) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      7. Block <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <select
                      value={selectedBlock}
                      onChange={(e) => setSelectedBlock(e.target.value)}
                      disabled={!selectedHostel || isLoadingBlocks || blocks.length === 0}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-xs disabled:opacity-50 disabled:bg-slate-100"
                    >
                      <option value="">-- Skip or Select Block --</option>
                      {blocks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      8. Room Number <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <select
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      disabled={!selectedBlock || isLoadingRooms || rooms.length === 0}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-xs disabled:opacity-50 disabled:bg-slate-100"
                    >
                      <option value="">-- Skip or Select Room --</option>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          Room {r.room_number} (Floor {r.floor})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Privacy Note: Block and Room are optional. You can register without them.</span>
                </div>
              </div>
            </div>

            {/* SECTION 4: Account Security */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Lock className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">4. Account Security</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 9. Password */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-xs"
                    />
                  </div>
                </div>

                {/* 10. Confirm Password */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-md shadow-brand-500/20 transition active:scale-95 disabled:opacity-50 text-xs sm:text-sm mt-4"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Account...' : 'Complete Registration'}</span>
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};

