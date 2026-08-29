import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  PlusCircle,
  Search,
  Filter,
  Upload,
  FileText,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
  Zap,
  Layers,
  X,
  Sparkles,
  Download,
  FolderOpen,
} from 'lucide-react';
import api from '../api/client';
import { StudyResource } from '../types';
import { StudyResourceCard } from '../components/StudyResourceCard';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export const StudyResourcesPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = Boolean(user?.is_staff || user?.is_superuser || user?.is_hostel_admin);

  const [resources, setResources] = useState<StudyResource[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Upload Modal State (Admin Only)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState('notes');
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [semester, setSemester] = useState('');
  const [department, setDepartment] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [externalLink, setExternalLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType) params.append('type', selectedType);
      if (selectedDept) params.append('department', selectedDept);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get<{ results: StudyResource[] } | StudyResource[]>(`/study/?${params.toString()}`);
      setResources(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResources();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedType, selectedDept, searchQuery]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('resource_type', resourceType);
    formData.append('course_name', courseName);
    if (courseCode) formData.append('course_code', courseCode);
    if (semester) formData.append('semester', semester);
    if (department) formData.append('department', department);
    if (file) formData.append('file', file);
    if (externalLink) formData.append('external_link', externalLink);

    try {
      await api.post('/study/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadSuccess(true);
      fetchResources();
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess(false);
        setTitle('');
        setDescription('');
        setCourseName('');
        setCourseCode('');
        setSemester('');
        setDepartment('');
        setFile(null);
        setExternalLink('');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload study resource. Admin privileges required.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resourceTypes = [
    { value: '', label: 'All Resources', icon: Layers },
    { value: 'notes', label: 'Lecture Notes', icon: FileText },
    { value: 'pyq', label: 'PYQ Papers', icon: GraduationCap },
    { value: 'book', label: 'Reference Books', icon: BookOpen },
    { value: 'pdf', label: 'Cheatsheets', icon: Zap },
  ];

  const departments = [
    'Computer Science (CSE)',
    'Electronics & Comm (ECE)',
    'Information Tech (IT)',
    'Mechanical Engg (ME)',
    'Civil Engg (CE)',
    'Applied Sciences & Math',
  ];

  const totalDownloads = resources.reduce((acc, r) => acc + (r.downloads_count || 0), 0);
  const notesCount = resources.filter((r) => r.resource_type === 'notes').length;
  const pyqCount = resources.filter((r) => r.resource_type === 'pyq').length;

  return (
    <div className="space-y-6 text-xs">
      {/* Luxury Academic Vault Hero Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden shadow-xl border border-slate-800 animate-fade-in">
        <div className="absolute -right-12 -top-12 w-52 h-52 bg-brand-500/25 rounded-full blur-3xl pointer-events-none animate-ambient-float" />
        <div className="absolute right-36 bottom-0 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none animate-glow-pulse" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-brand-500/20 text-brand-300 rounded-full border border-brand-400/30 backdrop-blur-xs flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-brand-400" />
                <span>Academic Vault &amp; Study Hub</span>
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Peer-Verified</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Study Resources &amp; PYQ Vault
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Explore high-yield handwritten class notes, solved previous year question papers, formula sheets, and lab manuals organized by subject and semester.
            </p>
          </div>

          {/* Quick Stats Pill Cards */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[85px]">
              <span className="block text-xl font-black text-white">{resources.length}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Materials
              </span>
            </div>
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[85px]">
              <span className="block text-xl font-black text-purple-300">{pyqCount}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                PYQs
              </span>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-3.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>+ Publish Resource</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Type Tabs & Department Filters */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, subject name (e.g. Data Structures, Math 3) or code (CS201)..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-900 focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none transition placeholder:text-slate-400 font-medium"
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

          {/* Department Filter Dropdown */}
          <div className="w-full sm:w-60 shrink-0">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none transition cursor-pointer"
            >
              <option value="">🏛️ All Academic Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resource Type Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-slate-100">
          {resourceTypes.map((t) => {
            const Icon = t.icon;
            const isActive = selectedType === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setSelectedType(t.value)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}

          {(selectedType || selectedDept || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedType('');
                setSelectedDept('');
                setSearchQuery('');
              }}
              className="ml-auto text-[11px] font-bold text-brand-600 hover:text-brand-700 underline shrink-0 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid of Study Resource Cards */}
      {isLoading ? (
        <LoadingSkeleton count={6} />
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((res) => (
            <StudyResourceCard key={res.id} resource={res} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No study materials found"
          message={
            isAdmin
              ? "Publish official lecture notes, solved question banks, or formula sheets for students."
              : "No academic materials match your filter right now. Check back soon for updates from administration."
          }
          actionText={isAdmin ? "Publish Resource" : undefined}
          onAction={isAdmin ? () => setShowUploadModal(true) : undefined}
        />
      )}

      {/* Upload Modal (Admin Only) */}
      {isAdmin && showUploadModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowUploadModal(false)}
          title="Publish Academic Material"
          maxWidth="max-w-lg"
        >
          {uploadSuccess ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <h4 className="font-bold text-slate-900">Study Resource Uploaded!</h4>
              <p className="text-xs text-slate-500">Thank you for contributing to your hostel community.</p>
            </div>
          ) : (
            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unit 3 Trees & Graphs Solved Notes"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Resource Type *</label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium"
                  >
                    <option value="notes">Lecture Notes</option>
                    <option value="pyq">PYQ Papers</option>
                    <option value="book">Reference E-Book</option>
                    <option value="pdf">Cheatsheet / Formulas</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Name *</label>
                  <input
                    type="text"
                    required
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g. Data Structures"
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="CS201"
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="Sem 3"
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="CSE / ECE"
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description &amp; Highlights</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Important topics covered, question bank solutions, lab codes..."
                  className="w-full p-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none resize-none text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">File Attachment (PDF / DOCX / ZIP)</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Or External Link (Google Drive / GitHub)</label>
                <input
                  type="url"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs hover:shadow-badge transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Material'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

