import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Search,
  Upload,
  FileText,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  Layers,
  X,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  FolderOpen,
  Calendar,
  Filter,
} from 'lucide-react';
import api from '../api/client';
import { StudyResource } from '../types';
import { StudyResourceCard } from '../components/StudyResourceCard';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubjectNode {
  types: string[];
  units: string[];
  years?: string[];
}

interface PyqSubjectNode {
  years: string[];
  sessions: string[];
}

interface HierarchyTree {
  [semester: string]: {
    [department: string]: {
      [subject: string]: SubjectNode;
    };
  };
}

interface PyqsHierarchyTree {
  [semester: string]: {
    [department: string]: {
      [subject: string]: PyqSubjectNode;
    };
  };
}

interface MetaResponse {
  semesters: string[];
  departments: string[];
  resource_types: { value: string; label: string }[];
  units: string[];
  years?: string[];
  hierarchy: HierarchyTree;
  pyqs_hierarchy?: PyqsHierarchyTree;
}

type TabMode = 'all' | 'pyq';
type Level = 'semester' | 'branch' | 'subject' | 'type' | 'resources';

// ─── Resource type display helpers ───────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  notes:               'Notes',
  pyq:                 'PYQ Papers',
  reference_material:  'Reference Material',
  lab_file:            'Lab Files',
  syllabus:            'Syllabus',
  important_questions: 'Important Questions',
  study_material:      'Study Material',
  assignment:          'Assignments',
  pdf:                 'Cheatsheets',
  other:               'Other',
};

const TYPE_COLORS: Record<string, { card: string; icon: string }> = {
  notes:               { card: 'bg-blue-50 border-blue-200 hover:border-blue-400',       icon: 'from-blue-500 to-indigo-600' },
  pyq:                 { card: 'bg-purple-50 border-purple-200 hover:border-purple-400', icon: 'from-purple-500 to-violet-600' },
  reference_material:  { card: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400', icon: 'from-emerald-500 to-teal-600' },
  lab_file:            { card: 'bg-orange-50 border-orange-200 hover:border-orange-400', icon: 'from-orange-500 to-red-500' },
  syllabus:            { card: 'bg-green-50 border-green-200 hover:border-green-400',    icon: 'from-green-500 to-emerald-600' },
  important_questions: { card: 'bg-rose-50 border-rose-200 hover:border-rose-400',       icon: 'from-rose-500 to-pink-600' },
  study_material:      { card: 'bg-sky-50 border-sky-200 hover:border-sky-400',          icon: 'from-sky-500 to-blue-600' },
  assignment:          { card: 'bg-violet-50 border-violet-200 hover:border-violet-400', icon: 'from-violet-500 to-purple-600' },
  pdf:                 { card: 'bg-amber-50 border-amber-200 hover:border-amber-400',    icon: 'from-amber-500 to-orange-600' },
  other:               { card: 'bg-slate-50 border-slate-200 hover:border-slate-400',    icon: 'from-slate-600 to-slate-800' },
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  notes:               FileText,
  pyq:                 GraduationCap,
  reference_material:  BookOpen,
  lab_file:            Layers,
  syllabus:            BookOpen,
  important_questions: Sparkles,
  study_material:      FileText,
  assignment:          FileText,
  pdf:                 Sparkles,
  other:               FolderOpen,
};

const typeLabel = (t: string) => TYPE_LABELS[t] ?? t;
const typeColor = (t: string) => TYPE_COLORS[t] ?? { card: 'bg-slate-50 border-slate-200 hover:border-slate-400', icon: 'from-slate-600 to-slate-800' };
const typeIcon  = (t: string): React.ElementType => TYPE_ICONS[t] ?? FileText;

const SEMESTER_ORDER = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8', 'Sem 1 & 2', 'All Semesters'];
const sortSemesters = (sems: string[]) => {
  return [...sems].sort((a, b) => {
    const ia = SEMESTER_ORDER.indexOf(a);
    const ib = SEMESTER_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
};

// ─── Tile ─────────────────────────────────────────────────────────────────────

interface SelectTileProps {
  label: string;
  sub?: string;
  badge?: string;
  icon?: React.ElementType;
  iconBg?: string;
  cardCls?: string;
  onClick: () => void;
}

const SelectTile: React.FC<SelectTileProps> = ({ label, sub, badge, icon: Icon, iconBg, cardCls, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] cursor-pointer relative overflow-hidden ${cardCls ?? 'bg-white border-slate-200 hover:border-brand-400 hover:bg-brand-50/40 shadow-xs'}`}
  >
    <div className="flex items-center gap-3">
      {Icon ? (
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${iconBg ?? 'from-slate-600 to-slate-800'} text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform text-sm font-black">
          {label.charAt(0)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-bold text-slate-900 text-sm truncate group-hover:text-brand-700 transition-colors">{label}</div>
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-100 text-purple-700 border border-purple-200 shrink-0">
              {badge}
            </span>
          )}
        </div>
        {sub && <div className="text-xs text-slate-500 truncate mt-0.5 font-medium">{sub}</div>}
      </div>
      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors shrink-0" />
    </div>
  </button>
);

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

interface BreadcrumbProps {
  parts: { label: string; onClick: () => void }[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ parts }) => (
  <nav className="flex items-center flex-wrap gap-1 text-[11px] font-semibold text-slate-500">
    {parts.map((p, i) => (
      <React.Fragment key={i}>
        {i > 0 && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
        <button
          type="button"
          onClick={p.onClick}
          className={`hover:text-brand-600 transition-colors cursor-pointer ${
            i === parts.length - 1
              ? 'text-slate-900 font-extrabold pointer-events-none'
              : 'hover:underline'
          }`}
        >
          {p.label}
        </button>
      </React.Fragment>
    ))}
  </nav>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export const StudyResourcesPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = Boolean(user?.is_staff || user?.is_superuser || user?.is_hostel_admin);

  // Meta / hierarchy
  const [meta, setMeta]           = useState<MetaResponse | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);

  // Tab mode: 'all' (Academic Vault) vs 'pyq' (Previous Year Questions)
  const [tabMode, setTabMode]     = useState<TabMode>('pyq');

  // Navigation state
  const [level, setLevel]           = useState<Level>('semester');
  const [selSemester, setSelSemester] = useState('');
  const [selBranch, setSelBranch]     = useState('');
  const [selSubject, setSelSubject]   = useState('');
  const [selType, setSelType]         = useState('');
  const [yearFilter, setYearFilter]   = useState<string>('all');

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode]   = useState(false);

  // Leaf-level resources
  const [resources, setResources]     = useState<StudyResource[]>([]);
  const [resLoading, setResLoading]   = useState(false);

  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle]         = useState('');
  const [uploadDesc, setUploadDesc]           = useState('');
  const [uploadType, setUploadType]           = useState('pyq');
  const [uploadCourse, setUploadCourse]       = useState('');
  const [uploadCode, setUploadCode]           = useState('');
  const [uploadSem, setUploadSem]             = useState('');
  const [uploadDept, setUploadDept]           = useState('');
  const [uploadUnit, setUploadUnit]           = useState('');
  const [uploadYear, setUploadYear]           = useState('');
  const [uploadSession, setUploadSession]     = useState('');
  const [uploadFile, setUploadFile]           = useState<File | null>(null);
  const [uploadLink, setUploadLink]           = useState('');
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [uploadSuccess, setUploadSuccess]     = useState(false);
  const [uploadError, setUploadError]         = useState('');

  // ── Load meta on mount ───────────────────────────────────────────────────
  useEffect(() => {
    setMetaLoading(true);
    api.get<MetaResponse>('/study/meta/')
      .then(r => setMeta(r.data))
      .catch(console.error)
      .finally(() => setMetaLoading(false));
  }, []);

  // ── Fetch resources ──────────────────────────────────────────────────────
  const fetchResources = useCallback(async () => {
    setResLoading(true);
    try {
      const params = new URLSearchParams();
      if (selSemester)          params.append('semester',   selSemester);
      if (selBranch)            params.append('department', selBranch);
      if (selSubject)           params.append('course',     selSubject);
      
      const effectiveType = tabMode === 'pyq' ? 'pyq' : selType;
      if (effectiveType)        params.append('type',       effectiveType);
      if (yearFilter && yearFilter !== 'all') params.append('year', yearFilter);
      if (searchQuery.trim())   params.append('search',     searchQuery.trim());

      const res = await api.get<{ results: StudyResource[] } | StudyResource[]>(
        `/study/?${params.toString()}`
      );
      setResources(Array.isArray(res.data) ? res.data : res.data.results ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setResLoading(false);
    }
  }, [selSemester, selBranch, selSubject, selType, tabMode, yearFilter, searchQuery]);

  useEffect(() => {
    if (level === 'resources' || searchMode) {
      const t = setTimeout(fetchResources, 250);
      return () => clearTimeout(t);
    }
  }, [level, searchMode, yearFilter, fetchResources]);

  // Search mode triggers on any query input
  useEffect(() => {
    setSearchMode(searchQuery.trim().length > 0);
  }, [searchQuery]);

  // ── Navigation helpers ───────────────────────────────────────────────────
  const resetTo = (target: Level) => {
    if (target === 'semester') { setSelSemester(''); setSelBranch(''); setSelSubject(''); setSelType(''); }
    if (target === 'branch')   { setSelBranch(''); setSelSubject(''); setSelType(''); }
    if (target === 'subject')  { setSelSubject(''); setSelType(''); }
    if (target === 'type')     { setSelType(''); }
    setLevel(target);
    setSearchQuery('');
    setSearchMode(false);
    setYearFilter('all');
    setResources([]);
  };

  const goBack = () => {
    if (level === 'resources') {
      if (tabMode === 'pyq') {
        resetTo('subject');
      } else {
        resetTo('type');
      }
    }
    else if (level === 'type')    resetTo('subject');
    else if (level === 'subject') resetTo('branch');
    else if (level === 'branch')  resetTo('semester');
  };

  const handleTabSwitch = (newTab: TabMode) => {
    if (newTab === tabMode) return;
    setTabMode(newTab);
    resetTo('semester');
  };

  // ── Derived hierarchy data ───────────────────────────────────────────────
  const activeTree = (tabMode === 'pyq' && meta?.pyqs_hierarchy)
    ? meta.pyqs_hierarchy
    : (meta?.hierarchy ?? {});

  const hierSemesters = sortSemesters(
    Object.keys(activeTree).filter(s => s && Object.keys(activeTree[s] ?? {}).length > 0)
  );

  const hierBranches = meta && selSemester
    ? Object.keys(activeTree[selSemester] ?? {}).sort()
    : [];

  const hierSubjects = meta && selSemester && selBranch
    ? Object.keys(activeTree[selSemester]?.[selBranch] ?? {}).sort()
    : [];

  const hierTypes = meta && selSemester && selBranch && selSubject
    ? (meta.hierarchy[selSemester]?.[selBranch]?.[selSubject]?.types ?? [])
    : [];

  const hierUnits = meta && selSemester && selBranch && selSubject
    ? (meta.hierarchy[selSemester]?.[selBranch]?.[selSubject]?.units ?? [])
    : [];

  const totalSubjects = meta
    ? Object.values(meta.hierarchy).reduce((a, sem) =>
        a + Object.values(sem).reduce((b, dept) => b + Object.keys(dept).length, 0), 0)
    : 0;

  const totalPyqSubjects = meta?.pyqs_hierarchy
    ? Object.values(meta.pyqs_hierarchy).reduce((a, sem) =>
        a + Object.values(sem).reduce((b, dept) => b + Object.keys(dept).length, 0), 0)
    : 0;

  // ── Breadcrumb ───────────────────────────────────────────────────────────
  const crumbs: { label: string; onClick: () => void }[] = [
    {
      label: tabMode === 'pyq' ? 'Previous Year Questions' : 'Study Resources',
      onClick: () => resetTo('semester'),
    },
  ];
  if (selSemester) crumbs.push({ label: selSemester, onClick: () => resetTo('branch') });
  if (selBranch)   crumbs.push({ label: selBranch,   onClick: () => resetTo('subject') });
  if (selSubject)  crumbs.push({
    label: selSubject,
    onClick: () => tabMode === 'pyq' ? resetTo('subject') : resetTo('type')
  });
  if (tabMode !== 'pyq' && selType) crumbs.push({ label: typeLabel(selType), onClick: () => {} });

  // ── Resource grouping (Unit vs Year) ──────────────────────────────────────
  const isPyqGrouping = tabMode === 'pyq' || selType === 'pyq';

  const byYear: Record<string, StudyResource[]> = {};
  const noYear: StudyResource[] = [];
  const availableYearsSet = new Set<string>();

  const withUnit: Record<string, StudyResource[]> = {};
  const noUnit: StudyResource[] = [];

  for (const r of resources) {
    if (r.year) availableYearsSet.add(r.year);
    if (isPyqGrouping) {
      if (r.year) {
        if (!byYear[r.year]) byYear[r.year] = [];
        byYear[r.year].push(r);
      } else {
        noYear.push(r);
      }
    } else {
      if (r.unit) {
        if (!withUnit[r.unit]) withUnit[r.unit] = [];
        withUnit[r.unit].push(r);
      } else {
        noUnit.push(r);
      }
    }
  }

  const sortedYears = Object.keys(byYear).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return numB - numA;
  });

  const yearPillOptions = ['all', ...Array.from(availableYearsSet).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return numB - numA;
  })];

  // ── Upload submit ────────────────────────────────────────────────────────
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadError('');
    const fd = new FormData();
    fd.append('title', uploadTitle);
    fd.append('description', uploadDesc);
    fd.append('resource_type', uploadType);
    fd.append('course_name', uploadCourse);
    if (uploadCode)    fd.append('course_code', uploadCode);
    if (uploadSem)     fd.append('semester', uploadSem);
    if (uploadDept)    fd.append('department', uploadDept);
    if (uploadUnit)    fd.append('unit', uploadUnit);
    if (uploadYear)    fd.append('year', uploadYear);
    if (uploadSession) fd.append('exam_session', uploadSession);
    if (uploadFile)    fd.append('file', uploadFile);
    if (uploadLink)    fd.append('external_link', uploadLink);
    try {
      await api.post('/study/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadSuccess(true);
      api.get<MetaResponse>('/study/meta/').then(r => setMeta(r.data)).catch(() => {});
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess(false);
        setUploadTitle(''); setUploadDesc(''); setUploadCourse(''); setUploadCode('');
        setUploadSem(''); setUploadDept(''); setUploadUnit(''); setUploadYear(''); setUploadSession('');
        setUploadFile(null); setUploadLink('');
      }, 1500);
    } catch (err: any) {
      setUploadError(err.response?.data?.detail ?? 'Failed to upload. Admin privileges required.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  if (metaLoading) {
    return (
      <div className="space-y-6">
        <div className="h-44 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 animate-pulse" />
        <LoadingSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-5 text-xs">

      {/* ── Hero Banner ───────────────────────────────────────────────────── */}
      <div className="relative p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden shadow-xl border border-slate-800 animate-fade-in">
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-brand-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-36 bottom-0 w-44 h-44 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-brand-500/20 text-brand-300 rounded-full border border-brand-400/30 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-brand-400" />
                VBSPU Academic Vault
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Peer-Verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {tabMode === 'pyq' ? 'Previous Year Questions (PYQs)' : 'Study Resources & Notes Hub'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {tabMode === 'pyq'
                ? 'Structured semester-wise and subject-wise PYQ papers with solved solutions, ordered newest to oldest.'
                : 'Navigate semester-wise — lecture notes, reference material, lab manuals and syllabus organised by branch.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[72px]">
              <span className="block text-xl font-black text-white">{meta?.semesters?.length ?? 0}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Semesters</span>
            </div>
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[72px]">
              <span className="block text-xl font-black text-purple-300">
                {tabMode === 'pyq' ? totalPyqSubjects : totalSubjects}
              </span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Subjects</span>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setUploadType(tabMode === 'pyq' ? 'pyq' : 'notes');
                  setShowUploadModal(true);
                }}
                className="px-4 py-3.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>+ Publish</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Mode Toggle Bar ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleTabSwitch('pyq')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              tabMode === 'pyq'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>PYQ Question Papers</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              tabMode === 'pyq' ? 'bg-purple-700/60 text-purple-100' : 'bg-slate-200 text-slate-700'
            }`}>
              128
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('all')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
              tabMode === 'all'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Academic Vault (All Materials)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              tabMode === 'all' ? 'bg-brand-700/60 text-brand-100' : 'bg-slate-200 text-slate-700'
            }`}>
              189
            </span>
          </button>
        </div>
      </div>

      {/* ── Search Bar ────────────────────────────────────────────────────── */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-subtle flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              selSubject  ? `Search within ${selSubject}…` :
              selBranch   ? `Search within ${selBranch}…` :
              selSemester ? `Search within ${selSemester}…` :
              tabMode === 'pyq'
                ? 'Search question papers by subject, year or exam code (e.g. Data Structures 2024)…'
                : 'Search by subject, topic or course code (e.g. Physics, CS201)…'
            }
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none transition placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Breadcrumb + Back Button ───────────────────────────────────────── */}
      {(level !== 'semester' || searchMode) && (
        <div className="flex items-center gap-3">
          {level !== 'semester' && !searchMode && (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          )}
          <Breadcrumb parts={crumbs} />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* SEARCH MODE                                                         */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {searchMode && (
        <div className="space-y-4">
          {(selSemester || selBranch || selSubject || tabMode === 'pyq') && (
            <div className="flex flex-wrap gap-2 text-[11px] items-center">
              {tabMode === 'pyq' && (
                <span className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-full font-semibold">
                  📋 PYQ Filter Active
                </span>
              )}
              {selSemester && <span className="px-3 py-1 bg-brand-50 border border-brand-200 text-brand-700 rounded-full font-semibold">📅 {selSemester}</span>}
              {selBranch   && <span className="px-3 py-1 bg-brand-50 border border-brand-200 text-brand-700 rounded-full font-semibold">🏛️ {selBranch}</span>}
              {selSubject  && <span className="px-3 py-1 bg-brand-50 border border-brand-200 text-brand-700 rounded-full font-semibold">📚 {selSubject}</span>}
              <span className="text-slate-400">— searching matching resources</span>
            </div>
          )}
          {resLoading ? <LoadingSkeleton count={6} /> : resources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {resources.map(r => <StudyResourceCard key={r.id} resource={r} />)}
            </div>
          ) : (
            <EmptyState title="No results found"
              message={`No resources match "${searchQuery}"${selSemester ? ` in ${selSemester}` : ''}. Try a broader search.`} />
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* LEVEL: SEMESTER                                                     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {!searchMode && level === 'semester' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-1 h-5 rounded-full ${tabMode === 'pyq' ? 'bg-purple-600' : 'bg-brand-500'}`} />
              <h2 className="text-sm font-extrabold text-slate-900">
                {tabMode === 'pyq' ? 'Select Semester for Question Papers' : 'Select Semester'}
              </h2>
            </div>
            {tabMode === 'pyq' && (
              <span className="text-[11px] text-slate-500 font-medium">
                Organized from Sem 1 to Sem 8
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {hierSemesters.map(sem => {
              const branchCount = Object.keys(activeTree[sem] ?? {}).length;
              const subText = tabMode === 'pyq'
                ? `${branchCount} branch${branchCount !== 1 ? 'es' : ''} available`
                : `${branchCount} department${branchCount !== 1 ? 's' : ''}`;
              return (
                <SelectTile
                  key={sem}
                  label={sem}
                  sub={subText}
                  badge={tabMode === 'pyq' ? 'PYQ' : undefined}
                  icon={Calendar}
                  iconBg={tabMode === 'pyq' ? 'from-purple-600 to-indigo-700' : 'from-brand-500 to-indigo-600'}
                  onClick={() => { setSelSemester(sem); setLevel('branch'); }}
                />
              );
            })}
          </div>

          {hierSemesters.length === 0 && (
            <EmptyState
              title="No semester data"
              message={tabMode === 'pyq' ? 'No question papers found for this selection.' : 'No study resources found in the database.'}
            />
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* LEVEL: BRANCH / DEPARTMENT                                          */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {!searchMode && level === 'branch' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={`w-1 h-5 rounded-full ${tabMode === 'pyq' ? 'bg-purple-600' : 'bg-brand-500'}`} />
            <h2 className="text-sm font-extrabold text-slate-900">
              Select Branch / Department — {selSemester}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hierBranches.map(br => {
              const count = Object.keys(activeTree[selSemester]?.[br] ?? {}).length;
              return (
                <SelectTile
                  key={br}
                  label={br}
                  sub={`${count} subject${count !== 1 ? 's' : ''}`}
                  badge={tabMode === 'pyq' ? `${count} Subjects` : undefined}
                  iconBg={tabMode === 'pyq' ? 'from-purple-600 to-indigo-700' : 'from-brand-500 to-indigo-600'}
                  onClick={() => { setSelBranch(br); setLevel('subject'); }}
                />
              );
            })}
          </div>

          {hierBranches.length === 0 && (
            <EmptyState title="No branches" message={`No branches found for ${selSemester}.`} />
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* LEVEL: SUBJECT                                                      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {!searchMode && level === 'subject' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-1 h-5 rounded-full ${tabMode === 'pyq' ? 'bg-purple-600' : 'bg-brand-500'}`} />
              <h2 className="text-sm font-extrabold text-slate-900">
                {tabMode === 'pyq' ? 'Select Subject for PYQs' : 'Select Subject'} — {selBranch}
              </h2>
            </div>
            {tabMode === 'pyq' && (
              <span className="text-[11px] text-purple-600 font-semibold">
                Click a subject to view all years
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hierSubjects.map(subj => {
              if (tabMode === 'pyq' && meta?.pyqs_hierarchy) {
                const pyqNode = meta.pyqs_hierarchy[selSemester]?.[selBranch]?.[subj];
                const yrList = pyqNode?.years ?? [];
                const yrRange = yrList.length > 0
                  ? `${yrList.length} Exam Year${yrList.length !== 1 ? 's' : ''} (${yrList[0]}${yrList.length > 1 ? ` – ${yrList[yrList.length - 1]}` : ''})`
                  : 'PYQ Available';
                return (
                  <SelectTile
                    key={subj}
                    label={subj}
                    sub={yrRange}
                    badge={yrList.length > 0 ? `${yrList.length} Years` : undefined}
                    icon={GraduationCap}
                    iconBg="from-purple-600 to-violet-700"
                    onClick={() => {
                      setSelSubject(subj);
                      setSelType('pyq');
                      setLevel('resources');
                    }}
                  />
                );
              }

              const node = meta?.hierarchy?.[selSemester]?.[selBranch]?.[subj];
              return (
                <SelectTile
                  key={subj}
                  label={subj}
                  sub={(node?.types ?? []).map(typeLabel).join(' · ')}
                  onClick={() => {
                    setSelSubject(subj);
                    setLevel('type');
                  }}
                />
              );
            })}
          </div>

          {hierSubjects.length === 0 && (
            <EmptyState title="No subjects" message={`No subjects found for ${selBranch} in ${selSemester}.`} />
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* LEVEL: RESOURCE TYPE (General Mode Only)                            */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {!searchMode && level === 'type' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-brand-500 rounded-full" />
            <h2 className="text-sm font-extrabold text-slate-900">
              Select Resource Type — {selSubject}
            </h2>
          </div>

          {hierUnits.length > 0 && (
            <div className="p-3 bg-brand-50 border border-brand-200/60 rounded-2xl flex flex-wrap gap-2 text-[11px] items-center">
              <span className="font-bold text-brand-700">Units available:</span>
              {hierUnits.map(u => (
                <span key={u} className="px-2.5 py-1 bg-white border border-brand-200 text-brand-700 rounded-full font-semibold">{u}</span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hierTypes.map(type => {
              const Icon = typeIcon(type);
              const col  = typeColor(type);
              return (
                <SelectTile
                  key={type}
                  label={typeLabel(type)}
                  icon={Icon}
                  iconBg={col.icon}
                  cardCls={`border-2 transition-all ${col.card}`}
                  onClick={() => { setSelType(type); setLevel('resources'); }}
                />
              );
            })}
          </div>

          {hierTypes.length === 0 && (
            <EmptyState title="No resource types" message="No resources found for this subject." />
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* LEVEL: RESOURCES (Leaf View)                                        */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {!searchMode && level === 'resources' && (
        <div className="space-y-5">
          {/* Header Summary for Selected Subject */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mb-1">
                <span>{selSemester}</span>
                <span>•</span>
                <span>{selBranch}</span>
                {isPyqGrouping && (
                  <>
                    <span>•</span>
                    <span className="text-purple-600 font-bold">Solved PYQ Collection</span>
                  </>
                )}
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                {selSubject}
              </h2>
            </div>

            {/* Year filter chips for PYQs */}
            {isPyqGrouping && yearPillOptions.length > 2 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5" /> Year:
                </span>
                {yearPillOptions.map(yr => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setYearFilter(yr)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      yearFilter === yr
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {yr === 'all' ? `All Years (${resources.length})` : `${yr} (${resources.filter(r => r.year === yr).length})`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {resLoading ? (
            <LoadingSkeleton count={6} />
          ) : resources.length === 0 ? (
            <EmptyState
              title="No resources found"
              message={isAdmin
                ? 'No resources match this selection. Publish one using the + Publish button.'
                : 'No academic materials match this filter right now.'}
              actionText={isAdmin ? 'Publish Resource' : undefined}
              onAction={isAdmin ? () => setShowUploadModal(true) : undefined}
            />
          ) : isPyqGrouping ? (
            /* ── PYQ Layout: Grouped by Year (Newest → Oldest) ────────── */
            <div className="space-y-6">
              {sortedYears.map(yr => {
                const yearPapers = byYear[yr] ?? [];
                if (yearFilter !== 'all' && yearFilter !== yr) return null;
                return (
                  <div key={yr} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-5 bg-purple-600 rounded-full" />
                        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                          <span>Examination Year {yr}</span>
                        </h3>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                          {yearPapers.length} Paper{yearPapers.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {yr} Academic Session
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {yearPapers.map(r => (
                        <StudyResourceCard key={r.id} resource={r} />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Papers without an extracted year */}
              {noYear.length > 0 && (yearFilter === 'all' || yearFilter === 'other') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <div className="w-1.5 h-5 bg-slate-400 rounded-full" />
                    <h3 className="text-sm font-extrabold text-slate-700">
                      Additional / General Question Papers
                    </h3>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {noYear.length} Paper{noYear.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {noYear.map(r => (
                      <StudyResourceCard key={r.id} resource={r} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── General Academic Material Layout: Grouped by Unit ───── */
            <div className="space-y-6">
              {Object.keys(withUnit).sort().map(unit => (
                <div key={unit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-brand-400 rounded-full" />
                    <h3 className="text-sm font-extrabold text-slate-900">{unit}</h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {withUnit[unit].length} resource{withUnit[unit].length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {withUnit[unit].map(r => <StudyResourceCard key={r.id} resource={r} />)}
                  </div>
                </div>
              ))}

              {noUnit.length > 0 && (
                <div className="space-y-3">
                  {Object.keys(withUnit).length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-slate-300 rounded-full" />
                      <h3 className="text-sm font-extrabold text-slate-700">General Material</h3>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {noUnit.length} resource{noUnit.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {noUnit.map(r => <StudyResourceCard key={r.id} resource={r} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Admin Upload Modal ─────────────────────────────────────────────── */}
      {isAdmin && showUploadModal && (
        <Modal isOpen onClose={() => setShowUploadModal(false)} title="Publish Academic Material" maxWidth="max-w-lg">
          {uploadSuccess ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <h4 className="font-bold text-slate-900">Resource Published!</h4>
              <p className="text-xs text-slate-500">It will appear in the hierarchy immediately.</p>
            </div>
          ) : (
            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {uploadError && <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl">{uploadError}</div>}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input type="text" required value={uploadTitle} onChange={e => setUploadTitle(e.target.value)}
                  placeholder="e.g. Data Structures End Sem 2025 Solved Paper"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Resource Type *</label>
                  <select value={uploadType} onChange={e => setUploadType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium">
                    <option value="pyq">PYQ Papers</option>
                    <option value="notes">Lecture Notes</option>
                    <option value="reference_material">Reference Material / E-Book</option>
                    <option value="lab_file">Lab Manual / Practical File</option>
                    <option value="syllabus">Syllabus &amp; Curriculum</option>
                    <option value="important_questions">Important Questions</option>
                    <option value="study_material">Study Material</option>
                    <option value="assignment">Assignment &amp; Solutions</option>
                    <option value="pdf">Cheatsheet / Formula PDF</option>
                    <option value="other">Other Academic Resource</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course / Subject *</label>
                  <input type="text" required value={uploadCourse} onChange={e => setUploadCourse(e.target.value)}
                    placeholder="e.g. Data Structures & Algorithms"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <input type="text" value={uploadSem} onChange={e => setUploadSem(e.target.value)} placeholder="Sem 3"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branch / Dept</label>
                  <input type="text" value={uploadDept} onChange={e => setUploadDept(e.target.value)} placeholder="Computer Science (CSE)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
                  <input type="text" value={uploadCode} onChange={e => setUploadCode(e.target.value)} placeholder="CS201"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium" />
                </div>
              </div>

              {/* PYQ Year & Session fields */}
              {uploadType === 'pyq' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-purple-50/60 rounded-xl border border-purple-200/60">
                  <div>
                    <label className="block font-semibold text-purple-900 mb-1">Academic / Paper Year</label>
                    <input type="text" value={uploadYear} onChange={e => setUploadYear(e.target.value)}
                      placeholder="e.g. 2025"
                      className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-slate-800 focus:border-purple-500 focus:ring-3 focus:ring-purple-50 outline-none text-xs font-medium" />
                  </div>
                  <div>
                    <label className="block font-semibold text-purple-900 mb-1">Exam / Session</label>
                    <input type="text" value={uploadSession} onChange={e => setUploadSession(e.target.value)}
                      placeholder="e.g. Even Semester (S2) or Regular"
                      className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-slate-800 focus:border-purple-500 focus:ring-3 focus:ring-purple-50 outline-none text-xs font-medium" />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit <span className="font-normal text-slate-400">(optional)</span></label>
                  <input type="text" value={uploadUnit} onChange={e => setUploadUnit(e.target.value)}
                    placeholder="e.g. Unit 1, Unit 2, All Units"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium" />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description &amp; Highlights</label>
                <textarea rows={2} value={uploadDesc} onChange={e => setUploadDesc(e.target.value)}
                  placeholder="Topics covered, paper highlights, solutions included..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none resize-none text-xs font-medium" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">File (PDF / DOCX / ZIP)</label>
                <input type="file" onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Or External Link (Google Drive / Direct PDF)</label>
                <input type="url" value={uploadLink} onChange={e => setUploadLink(e.target.value)}
                  placeholder="https://…"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium" />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50">
                  {isSubmitting ? 'Publishing…' : 'Publish Material'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
