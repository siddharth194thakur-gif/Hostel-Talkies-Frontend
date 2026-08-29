import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert, Users, Package, Flag, MessageSquare, Building2,
  Gamepad2, RefreshCw, CheckCircle2, XCircle, AlertTriangle,
  ExternalLink, Search, X, Check, Filter, ChevronRight, Eye,
  SlidersHorizontal, Clock, ShieldCheck, Mail, Building, Sparkles,
  Zap, Lock, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/client';
import api, { getMediaUrl } from '../api/client';
import { AdminDashboardData, ReportItem, FeedbackItem, AdminActionLogItem, User } from '../types';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';
import { BackButton } from '../components/BackButton';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active Tab: 'overview' | 'reports' | 'feedback' | 'students' | 'logs'
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'feedback' | 'students' | 'logs'>('overview');

  // Filter & Search state
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Redirect if not staff/hostel admin
  useEffect(() => {
    if (user && !user.is_staff && !user.is_superuser && !user.is_hostel_admin) {
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, reportsRes, feedbackRes, usersRes] = await Promise.allSettled([
        api.get<AdminDashboardData>('/auth/admin/stats/'),
        api.get<ReportItem[]>('/moderation/admin/reports/'),
        api.get<FeedbackItem[]>('/moderation/admin/feedback/'),
        api.get<User[]>('/auth/admin/users/'),
      ]);

      if (statsRes.status === 'fulfilled') {
        setDashboardData(statsRes.value.data);
      }
      if (reportsRes.status === 'fulfilled') {
        const data = reportsRes.value.data as any;
        setReports(Array.isArray(data) ? data : data?.results || []);
      }
      if (feedbackRes.status === 'fulfilled') {
        const data = feedbackRes.value.data as any;
        setFeedbackList(Array.isArray(data) ? data : data?.results || []);
      }
      if (usersRes.status === 'fulfilled') {
        const data = usersRes.value.data as any;
        setStudents(Array.isArray(data) ? data : data?.results || []);
      }
    } catch (err) {
      console.error('Failed to load admin telemetry', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAdminData();
  };

  const handleUpdateReportStatus = async (reportId: number, newStatus: 'resolved' | 'dismissed') => {
    setIsActionLoading(true);
    try {
      await api.patch(`/moderation/admin/reports/${reportId}/`, {
        status: newStatus,
        admin_notes: adminNote || `Marked as ${newStatus} by ${user?.username}`,
      });
      setActionSuccess(`Report #${reportId} updated to ${newStatus}`);
      setSelectedReport(null);
      setAdminNote('');
      fetchAdminData();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to update report', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateFeedbackStatus = async (feedbackId: number, newStatus: 'resolved') => {
    try {
      await api.patch(`/moderation/admin/feedback/${feedbackId}/`, { status: newStatus });
      fetchAdminData();
    } catch (err) {
      console.error('Failed to update feedback', err);
    }
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (reportFilter === 'all') return true;
    return r.status === reportFilter;
  });

  // Filtered students
  const filteredStudents = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    const query = studentSearch.toLowerCase();
    const name = (s.full_name || s.username || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    const hostel = (s.profile?.hostel_detail?.name || '').toLowerCase();
    return name.includes(query) || email.includes(query) || hostel.includes(query);
  });

  const stats = dashboardData?.stats || {
    total_students: students.length || 0,
    total_posts: 0,
    pending_reports: reports.filter((r) => r.status === 'pending').length,
    total_reports: reports.length,
    pending_feedback: feedbackList.filter((f) => f.status === 'pending').length,
    total_hostels: 0,
    total_gamers: 0,
  };

  return (
    <div className="space-y-6 text-xs pb-20 max-w-7xl mx-auto">
      {/* Top Bar with Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <BackButton fallback="/dashboard" />
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full font-black text-[10px] uppercase tracking-wider border border-amber-500/20 flex items-center gap-1.5 shadow-2xs">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Staff Command Authority</span>
          </span>
        </div>
      </div>

      {/* 1. 4K Ultra-Luxury Executive Admin Banner */}
      <div className="relative p-5 sm:p-9 rounded-3xl sm:rounded-[36px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden banner-3d border border-amber-500/30 animate-fade-in">
        {/* Ambient 4K Lighting mesh */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-ambient-float" />
        <div className="absolute right-48 bottom-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none animate-glow-pulse" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transform-3d">
          <div className="space-y-3 max-w-2xl translate-z-20">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 rounded-full border border-amber-400/40 backdrop-blur-md flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>SYSTEM TELEMETRY &amp; MODERATION</span>
              </span>
              <span className="px-2.5 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>All Services Operational</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight translate-z-30 drop-shadow-md">
              Campus Admin Command Hub 🛡️
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed translate-z-20">
              Executive overview for hostel authorities. Review student safety reports, handle community support tickets, verify resident listings, and inspect system audit logs.
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3.5 translate-z-40">
              <a
                href={`${API_BASE_URL}/admin/`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs rounded-2xl btn-3d-orange flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Shield className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Django Master Admin ↗</span>
              </a>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/15 backdrop-blur-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-300 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Syncing...' : 'Refresh Telemetry'}</span>
              </button>
            </div>
          </div>

          {/* Quick HUD Metrics Preview */}
          <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-3 shrink-0 self-stretch sm:self-start lg:self-auto translate-z-30">
            <div className="p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-amber-500/30 text-center min-w-0 sm:min-w-[95px] shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
              <span className="block text-xl sm:text-2xl font-black text-white">{stats.total_students}</span>
              <span className="block text-[9px] sm:text-[10px] font-extrabold text-amber-300 uppercase tracking-wider mt-0.5">
                Students
              </span>
            </div>
            <div className="p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-rose-500/30 text-center min-w-0 sm:min-w-[95px] shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
              <span className="block text-xl sm:text-2xl font-black text-rose-400">{stats.pending_reports}</span>
              <span className="block text-[9px] sm:text-[10px] font-extrabold text-rose-300 uppercase tracking-wider mt-0.5">
                Reports
              </span>
            </div>
            <div className="p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-cyan-500/30 text-center min-w-0 sm:min-w-[95px] shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
              <span className="block text-xl sm:text-2xl font-black text-cyan-300">{stats.pending_feedback}</span>
              <span className="block text-[9px] sm:text-[10px] font-extrabold text-cyan-200 uppercase tracking-wider mt-0.5">
                Tickets
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 6 Real-time 4K Spatial HUD Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setActiveTab('students')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 card-3d-luxury cursor-pointer transition space-y-1.5"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xl font-black text-slate-900">{stats.total_students}</span>
            <span className="text-[11px] text-slate-500 font-semibold">Registered Students</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/marketplace')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 card-3d-luxury cursor-pointer transition space-y-1.5"
        >
          <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xl font-black text-slate-900">{stats.total_posts}</span>
            <span className="text-[11px] text-slate-500 font-semibold">Active Posts</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('reports')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 card-3d-luxury cursor-pointer transition space-y-1.5"
        >
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Flag className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xl font-black text-rose-600">{stats.pending_reports}</span>
            <span className="text-[11px] text-slate-500 font-semibold">Pending Reports</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('feedback')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 card-3d-luxury cursor-pointer transition space-y-1.5"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xl font-black text-slate-900">{stats.pending_feedback}</span>
            <span className="text-[11px] text-slate-500 font-semibold">Support Tickets</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/gaming')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 card-3d-luxury cursor-pointer transition space-y-1.5"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xl font-black text-slate-900">{stats.total_gamers}</span>
            <span className="text-[11px] text-slate-500 font-semibold">Esports Gamers</span>
          </div>
        </div>

        <div
          onClick={() => navigate('/explore')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 card-3d-luxury cursor-pointer transition space-y-1.5"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xl font-black text-slate-900">{stats.total_hostels || '6+'}</span>
            <span className="text-[11px] text-slate-500 font-semibold">Hostel Complexes</span>
          </div>
        </div>
      </div>

      {/* 3. Control Navigation Bar */}
      <div className="p-3.5 sm:p-4 bg-white rounded-3xl border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl font-black text-xs transition-all shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>Overview &amp; Logs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl font-black text-xs transition-all shrink-0 cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-rose-700 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <Flag className="w-3.5 h-3.5 text-rose-400" />
            <span>Moderation Reports ({reports.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl font-black text-xs transition-all shrink-0 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-indigo-700 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-300" />
            <span>Resident Directory ({students.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-2xl font-black text-xs transition-all shrink-0 cursor-pointer ${
              activeTab === 'feedback'
                ? 'bg-cyan-700 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
            <span>User Feedback ({feedbackList.length})</span>
          </button>
        </div>

        {actionSuccess && (
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────── */}
      {/* TAB 1: OVERVIEW & SYSTEM ACTION LOGS       */}
      {/* ────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Recent Registrations Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-black text-slate-900 text-sm">Recent Student Registrations</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('students')}
                  className="text-[11px] font-bold text-brand-600 hover:text-brand-700"
                >
                  View All ({students.length})
                </button>
              </div>

              <div className="space-y-2.5">
                {(dashboardData?.recent_students || students.slice(0, 5)).map((st) => (
                  <div
                    key={st.id}
                    className="p-3 bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {(st.full_name || st.username || 'U')[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <strong className="text-slate-900 font-bold block truncate text-xs">
                          {st.full_name || st.username}
                        </strong>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {st.email} • {st.profile?.hostel_detail?.name || 'Resident'}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-xl border border-slate-200/60 shrink-0">
                      {new Date(st.date_joined).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Action Logs Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <h3 className="font-black text-slate-900 text-sm">Real-time Audit &amp; Moderation Logs</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400">Live Trail</span>
              </div>

              <div className="space-y-2.5">
                {(dashboardData?.recent_logs && dashboardData.recent_logs.length > 0) ? (
                  dashboardData.recent_logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-bold text-slate-800 text-xs block truncate">
                          {log.action} on <strong className="text-brand-600">{log.target_type}</strong>
                        </span>
                        <p className="text-[10px] text-slate-500">{log.notes || 'Routine system check'}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 space-y-1">
                    <ShieldCheck className="w-6 h-6 text-emerald-500 mx-auto" />
                    <p className="text-xs font-semibold">No recent security flags. System running cleanly.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────── */}
      {/* TAB 2: MODERATION & REPORTS                */}
      {/* ────────────────────────────────────────── */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setReportFilter('pending')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  reportFilter === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Pending ({reports.filter((r) => r.status === 'pending').length})
              </button>
              <button
                type="button"
                onClick={() => setReportFilter('resolved')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  reportFilter === 'resolved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Resolved
              </button>
              <button
                type="button"
                onClick={() => setReportFilter('dismissed')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  reportFilter === 'dismissed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Dismissed
              </button>
              <button
                type="button"
                onClick={() => setReportFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  reportFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All ({reports.length})
              </button>
            </div>
          </div>

          {filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-subtle space-y-3.5 card-3d-luxury"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-bold text-[10px] rounded-full border border-rose-200/60 uppercase">
                      Target: {rep.report_type} #{rep.target_id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        rep.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : rep.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-black text-sm text-slate-900 capitalize">
                      Reason: {rep.reason.replace('_', ' ')}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      {rep.details || 'No additional details provided by reporter.'}
                    </p>
                  </div>

                  {rep.admin_notes && (
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/70 text-[11px] text-amber-900">
                      <strong>Admin Notes:</strong> {rep.admin_notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    <span>Filed on {new Date(rep.created_at).toLocaleDateString()}</span>
                    {rep.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => setSelectedReport(rep)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Review &amp; Action
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No reports in this view"
              message="All community safety reports have been reviewed and addressed."
            />
          )}
        </div>
      )}

      {/* ────────────────────────────────────────── */}
      {/* TAB 3: RESIDENT DIRECTORY                  */}
      {/* ────────────────────────────────────────── */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search by name, email, or hostel..."
                className="w-full pl-9 pr-7 py-2 bg-slate-50 focus:bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-900 outline-none"
              />
              {studentSearch && (
                <button
                  type="button"
                  onClick={() => setStudentSearch('')}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <span className="text-xs font-bold text-slate-500">
              Showing {filteredStudents.length} of {students.length} residents
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-100 text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                    <th className="py-3.5 px-4">Resident</th>
                    <th className="py-3.5 px-4">Registered Email</th>
                    <th className="py-3.5 px-4">Hostel &amp; Room</th>
                    <th className="py-3.5 px-4">Role / Standing</th>
                    <th className="py-3.5 px-4">Date Joined</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {(st.full_name || st.username || 'U')[0]?.toUpperCase()}
                          </div>
                          <div>
                            <strong className="text-slate-900 font-bold block">{st.full_name || st.username}</strong>
                            <span className="text-[10px] text-slate-400">@{st.username}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">{st.email}</td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl text-[11px] font-medium">
                          {st.profile?.hostel_detail?.name || 'Unassigned'}
                          {st.profile?.room_detail?.room_number ? ` • Rm ${st.profile.room_detail.room_number}` : ''}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {st.is_staff ? (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-bold text-[10px]">
                            Admin Staff
                          </span>
                        ) : st.is_blocked ? (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md font-bold text-[10px]">
                            Blocked
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-[10px]">
                            Verified Resident
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-normal">
                        {new Date(st.date_joined).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/profile/${st.id}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────── */}
      {/* TAB 4: USER FEEDBACK TICKETS               */}
      {/* ────────────────────────────────────────── */}
      {activeTab === 'feedback' && (
        <div className="space-y-4">
          {feedbackList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbackList.map((fb) => (
                <div
                  key={fb.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-subtle space-y-3 card-3d-luxury"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-slate-900 text-sm truncate">{fb.subject}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                        fb.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-cyan-100 text-cyan-800'
                      }`}
                    >
                      {fb.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    "{fb.message}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    <div>
                      <strong className="text-slate-700 block">{fb.name || 'Anonymous Student'}</strong>
                      <span className="text-[10px]">{fb.email || 'No email provided'}</span>
                    </div>

                    {fb.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateFeedbackStatus(fb.id, 'resolved')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No open feedback tickets"
              message="Students have not submitted any pending feedback tickets recently."
            />
          )}
        </div>
      )}

      {/* Review & Action Modal for Reports */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-black text-slate-900">Resolve Safety Report #{selectedReport.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Reason</span>
                <p className="font-bold text-slate-900 capitalize">{selectedReport.reason.replace('_', ' ')}</p>
                <p className="text-slate-600 text-[11px] pt-1">{selectedReport.details}</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Admin Resolution Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. Warning issued to user, post removed for guideline violation..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:bg-white focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleUpdateReportStatus(selectedReport.id, 'dismissed')}
                  disabled={isActionLoading}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer"
                >
                  Dismiss Report
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateReportStatus(selectedReport.id, 'resolved')}
                  disabled={isActionLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-xs transition cursor-pointer"
                >
                  Resolve &amp; Take Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
