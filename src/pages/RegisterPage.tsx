import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus, Lock, Mail, User, Building, AlertCircle, CheckCircle,
  GraduationCap, BookOpen, ShieldCheck, Sparkles, RotateCw, Eye, EyeOff
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Hostel } from '../types';

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
  const [gender, setGender] = useState('');

  // Academic Information
  const [programme, setProgramme] = useState('');
  const [branch, setBranch] = useState('');

  // Account Information
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  // Hostel Dropdown
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostel, setSelectedHostel] = useState<string>('');
  const [isLoadingHostels, setIsLoadingHostels] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // When programme changes, reset branch so user manually selects
  useEffect(() => {
    setBranch('');
  }, [programme]);

  // Fetch available Hostels dynamically from database on mount
  const [hostelsError, setHostelsError] = useState('');

  const fetchHostels = async () => {
    setIsLoadingHostels(true);
    setHostelsError('');
    try {
      console.info('[RegisterPage] Fetching hostels from:', api.defaults.baseURL + '/hostels/');
      const res = await api.get<{ results: Hostel[] } | Hostel[]>('/hostels/');
      const data = res.data as any;
      const list: Hostel[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];
      setHostels(list);
    } catch (err: any) {
      console.error('[RegisterPage] Hostel fetch failed:', err?.config?.url, err?.message, err?.response?.status);
      const msg = err?.response?.data?.detail || err?.message || 'Unable to load hostels';
      setHostelsError(`${msg}. Please check your connection or click Retry.`);
      setHostels([]);
    } finally {
      setIsLoadingHostels(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setPasswordMismatch(false);

    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      setIsSubmitting(false);
      return;
    }

    if (!gender) {
      setError('Please select your gender.');
      setIsSubmitting(false);
      return;
    }

    if (!programme) {
      setError('Please select your programme/course.');
      setIsSubmitting(false);
      return;
    }

    if (!branch) {
      setError('Please select your branch / specialisation.');
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
                      placeholder="Enter your full name"
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
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-xs"
                  >
                    <option value="">Select Gender</option>
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
                    Course <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={programme}
                    onChange={(e) => setProgramme(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-xs"
                  >
                    <option value="">Select Course</option>
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
                    disabled={!programme}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-xs disabled:opacity-60"
                  >
                    <option value="">{programme ? 'Select Branch' : 'Select Course first'}</option>
                    {programme && (PROGRAMME_BRANCHES[programme] || PROGRAMME_BRANCHES['Other']).map((b) => (
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      Hostel <span className="text-rose-500 font-bold">*</span>
                    </label>
                    {(hostelsError || (hostels.length === 0 && !isLoadingHostels)) && (
                      <button
                        type="button"
                        onClick={() => fetchHostels()}
                        disabled={isLoadingHostels}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 disabled:opacity-50 transition active:scale-95"
                      >
                        <RotateCw className={`w-3 h-3 ${isLoadingHostels ? 'animate-spin' : ''}`} />
                        <span>{isLoadingHostels ? 'Retrying...' : 'Retry Loading'}</span>
                      </button>
                    )}
                  </div>
                  <select
                    required
                    value={selectedHostel}
                    onChange={(e) => setSelectedHostel(e.target.value)}
                    disabled={isLoadingHostels}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-xs disabled:opacity-60 disabled:bg-slate-50"
                  >
                    <option value="">
                      {isLoadingHostels
                        ? 'Loading available hostels...'
                        : hostels.length === 0 && !isLoadingHostels
                        ? 'No Hostels Found (Click Retry)'
                        : 'Select Hostel'}
                    </option>
                    {hostels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} {h.gender ? `(${h.gender})` : ''}
                      </option>
                    ))}
                  </select>
                  {hostelsError && (
                    <div className="flex items-center justify-between mt-1.5 p-2 bg-rose-50 border border-rose-100 rounded-xl">
                      <p className="text-[11px] text-rose-600 font-medium leading-tight">
                        {hostelsError}
                      </p>
                      <button
                        type="button"
                        onClick={() => fetchHostels()}
                        disabled={isLoadingHostels}
                        className="px-2 py-1 bg-white text-rose-700 text-[10px] font-bold rounded-lg border border-rose-200 shadow-2xs hover:bg-rose-100 transition shrink-0 ml-2"
                      >
                        Retry
                      </button>
                    </div>
                  )}
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
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordMismatch && e.target.value === confirmPassword) {
                          setPasswordMismatch(false);
                        }
                      }}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-xs"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
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
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passwordMismatch && e.target.value === password) {
                          setPasswordMismatch(false);
                        }
                      }}
                      placeholder="Re-enter password"
                      className={`w-full pl-9 pr-10 py-2.5 bg-slate-50 border rounded-xl text-slate-900 focus:bg-white focus:ring-2 outline-none text-xs ${
                        passwordMismatch
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100'
                          : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
                      }`}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-0.5"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordMismatch && (
                    <p className="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Password do not match</span>
                    </p>
                  )}
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

