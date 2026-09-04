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
}

interface HierarchyTree {
  [semester: string]: {
    [department: string]: {
      [subject: string]: SubjectNode;
    };
  };
}

interface MetaResponse {
  semesters: string[];
  departments: string[];
  resource_types: { value: string; label: string }[];
  units: string[];
  hierarchy: HierarchyTree;
}

type Level = 'semester' | 'branch' | 'subject' | 'type' | 'resources';

// ─── Resource type display helpers ───────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  notes:               'Notes',
  pyq:                 'PYQs',
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

// ─── Tile ─────────────────────────────────────────────────────────────────────

interface SelectTileProps {
  label: string;
  sub?: string;
  icon?: React.ElementType;
  iconBg?: string;
  cardCls?: string;
  onClick: () => void;
}

const SelectTile: React.FC<SelectTileProps> = ({ label, sub, icon: Icon, iconBg, cardCls, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] cursor-pointer ${cardCls ?? 'bg-white border-slate-200 hover:border-brand-400 hover:bg-brand-50/40'}`}
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
        <div className="font-bold text-slate-900 text-sm truncate group-hover:text-brand-700 transition-colors">{label}</div>
        {sub && <div className="text-xs text-slate-500 truncate mt-0.5">{sub}</div>}
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

  // Navigation
  const [level, setLevel]           = useState<Level>('semester');
  const [selSemester, setSelSemester] = useState('');
  const [selBranch, setSelBranch]     = useState('');
  const [selSubject, setSelSubject]   = useState('');
  const [selType, setSelType]         = useState('');

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
  const [uploadType, setUploadType]           = useState('notes');
  const [uploadCourse, setUploadCourse]       = useState('');
  const [uploadCode, setUploadCode]           = useState('');
  const [uploadSem, setUploadSem]             = useState('');
  const [uploadDept, setUploadDept]           = useState('');
  const [uploadUnit, setUploadUnit]           = useState('');
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
      if (selType)              params.append('type',       selType);
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
  }, [selSemester, selBranch, selSubject, selType, searchQuery]);

  useEffect(() => {
    if (level === 'resources' || searchMode) {
      const t = setTimeout(fetchResources, 250);
      return () => clearTimeout(t);
    }
  }, [level, searchMode, fetchResources]);

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
    setResources([]);
  };

  const goBack = () => {
    if (level === 'resources') resetTo('type');
    else if (level === 'type')    resetTo('subject');
    else if (level === 'subject') resetTo('branch');
    else if (level === 'branch')  resetTo('semester');
  };

  // ── Derived hierarchy data ───────────────────────────────────────────────
  const hierBranches = meta && selSemester
    ? Object.keys(meta.hierarchy[selSemester] ?? {}).sort()
    : [];

  const hierSubjects = meta && selSemester && selBranch
    ? Object.keys(meta.hierarchy[selSemester]?.[selBranch] ?? {}).sort()
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

  // ── Breadcrumb ───────────────────────────────────────────────────────────
  const crumbs: { label: string; onClick: () => void }[] = [
    { label: 'Study Resources', onClick: () => resetTo('semester') },
  ];
  if (selSemester) crumbs.push({ label: selSemester, onClick: () => resetTo('branch') });
  if (selBranch)   crumbs.push({ label: selBranch,   onClick: () => resetTo('subject') });
  if (selSubject)  crumbs.push({ label: selSubject,  onClick: () => resetTo('type') });
  if (selType)     crumbs.push({ label: typeLabel(selType), onClick: () => {} });

  // ── Unit grouping ────────────────────────────────────────────────────────
  const withUnit: Record<string, StudyResource[]> = {};
  const noUnit: StudyResource[] = [];
  for (const r of resources) {
    if (r.unit) {
      if (!withUnit[r.unit]) withUnit[r.unit] = [];
      withUnit[r.unit].push(r);
    } else {
      noUnit.push(r);
    }
  }

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
    if (uploadCode) fd.append('course_code', uploadCode);
    if (uploadSem)  fd.append('semester', uploadSem);
    if (uploadDept) fd.append('department', uploadDept);
    if (uploadUnit) fd.append('unit', uploadUnit);
    if (uploadFile) fd.append('file', uploadFile);
    if (uploadLink) fd.append('external_link', uploadLink);
    try {
      await api.post('/study/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadSuccess(true);
      api.get<MetaResponse>('/study/meta/').then(r => setMeta(r.data)).catch(() => {});
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess(false);
        setUploadTitle(''); setUploadDesc(''); setUploadCourse(''); setUploadCode('');
        setUploadSem(''); setUploadDept(''); setUploadUnit(''); setUploadFile(null); setUploadLink('');
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
        <div className="h-36 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 animate-pulse" />
        <LoadingSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-5 text-xs">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden shadow-xl border border-slate-800 animate-fade-in">
        <div className="absolute -right-12 -top-12 w-52 h-52 bg-brand-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-36 bottom-0 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-brand-500/20 text-brand-300 rounded-full border border-brand-400/30 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-brand-400" />
                Academic Vault &amp; Study Hub
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Peer-Verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Study Resources &amp; PYQ Vault
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Navigate semester-wise — notes, solved PYQs, lab files and more organised by branch and subject.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[72px]">
              <span className="block text-xl font-black text-white">{meta?.semesters?.length ?? 0}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Semesters</span>
            </div>
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[72px]">
              <span className="block text-xl font-black text-purple-300">{totalSubjects}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Subjects</span>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-3.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>+ Publish</span>
              </button>
            )}
          </div>
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
              'Search by subject, topic or code (e.g. Data Structures, CS201)…'
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

      {/* ── Breadcrumb + Back ──────────────────────────────────────────────── */}
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
          {(selSemester || selBranch || selSubject) && (
            <div className="flex flex-wrap gap-2 text-[11px] items-center">
              {selSemester && <span className="px-3 py-1 bg-brand-50 border border-brand-200 text-brand-700 rounded-full font-semibold">📅 {selSemester}</span>}
              {selBranch   && <span className="px-3 py-1 bg-brand-50 border border-brand-200 text-brand-700 rounded-full font-semibold">🏛️ {selBranch}</span>}
              {selSubject  && <span className="px-3 py-1 bg-brand-50 border border-brand-200 text-brand-700 rounded-full font-semibold">📚 {selSubject}</span>}
              <span className="text-slate-400">— searching within context</span>
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
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-brand-500 rounded-full" />
            <h2 className="text-sm font-extrabold text-slate-900">Select Semester</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(meta?.semesters ?? []).map(sem => (
              <SelectTile
                key={sem}
                label={sem}
                sub={`${Object.keys(meta?.hierarchy?.[sem] ?? {}).length} branch${Object.keys(meta?.hierarchy?.[sem] ?? {}).length !== 1 ? 'es' : ''}`}
                onClick={() => { setSelSemester(sem); setLevel('branch'); }}
              />
            ))}
          </div>
          {(meta?.semesters ?? []).length === 0 && (
            <EmptyState title="No semester data" message="No study resources found in the database." />
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* LEVEL: BRANCH                                                       */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {!searchMode && level === 'branch' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-brand-500 rounded-full" />
            <h2 className="text-sm font-extrabold text-slate-900">Select Branch / Department</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hierBranches.map(br => {
              const count = Object.keys(meta?.hierarchy?.[selSemester]?.[br] ?? {}).length;
              return (
                <SelectTile
                  key={br}
                  label={br}
                  sub={`${count} subject${count !== 1 ? 's' : ''}`}
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
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-brand-500 rounded-full" />
            <h2 className="text-sm font-extrabold text-slate-900">Select Subject</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {hierSubjects.map(subj => {
              const node = meta?.hierarchy?.[selSemester]?.[selBranch]?.[subj];
              return (
                <SelectTile
                  key={subj}
                  label={subj}
                  sub={(node?.types ?? []).map(typeLabel).join(' · ')}
                  onClick={() => { setSelSubject(subj); setLevel('type'); }}
                />
              );
            })}
          </div>
          {hierSubjects.length === 0 && (
            <EmptyState title="No subjects" message={`No subjects for ${selBranch} in ${selSemester}.`} />
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* LEVEL: RESOURCE TYPE                                                */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {!searchMode && level === 'type' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-brand-500 rounded-full" />
            <h2 className="text-sm font-extrabold text-slate-900">Select Resource Type</h2>
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
      {/* LEVEL: RESOURCES (leaf)                                             */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {!searchMode && level === 'resources' && (
        <div className="space-y-5">
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
          ) : (
            <>
              {/* Grouped by unit */}
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

              {/* Resources without unit */}
              {noUnit.length > 0 && (
                <div className="space-y-3">
                  {Object.keys(withUnit).length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 bg-slate-300 rounded-full" />
                      <h3 className="text-sm font-extrabold text-slate-700">General</h3>
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
            </>
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
                  placeholder="e.g. Unit 3 Trees & Graphs Solved Notes"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Resource Type *</label>
                  <select value={uploadType} onChange={e => setUploadType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium">
                    <option value="notes">Lecture Notes</option>
                    <option value="pyq">PYQ Papers</option>
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
                    placeholder="e.g. Data Structures"
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
                  <input type="text" value={uploadDept} onChange={e => setUploadDept(e.target.value)} placeholder="CSE / ECE"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
                  <input type="text" value={uploadCode} onChange={e => setUploadCode(e.target.value)} placeholder="CS201"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit <span className="font-normal text-slate-400">(optional)</span></label>
                <input type="text" value={uploadUnit} onChange={e => setUploadUnit(e.target.value)}
                  placeholder="e.g. Unit 1, Unit 2, All Units"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description &amp; Highlights</label>
                <textarea rows={2} value={uploadDesc} onChange={e => setUploadDesc(e.target.value)}
                  placeholder="Important topics, question bank solutions, lab codes..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none resize-none text-xs font-medium" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">File (PDF / DOCX / ZIP)</label>
                <input type="file" onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Or External Link (Google Drive / GitHub)</label>
                <input type="url" value={uploadLink} onChange={e => setUploadLink(e.target.value)}
                  placeholder="https://drive.google.com/…"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium" />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50">
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
