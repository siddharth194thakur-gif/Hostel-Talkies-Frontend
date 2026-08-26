import React, { useState, useEffect } from 'react';
import { GraduationCap, PlusCircle, Search, Filter, Upload, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
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
    fetchResources();
  }, [selectedType]);

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
    { value: '', label: 'All Resources' },
    { value: 'notes', label: 'Lecture Notes' },
    { value: 'pyq', label: 'PYQ Papers' },
    { value: 'book', label: 'Books' },
    { value: 'pdf', label: 'PDF Cheatsheets' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Study Resources & Notes</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Admin Verified
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Official course notes, solved PYQ question papers, and academic materials</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-badge transition-all active:scale-95 self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>+ Publish Resource</span>
          </button>
        )}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {resourceTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setSelectedType(t.value)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold shrink-0 transition-all ${
                selectedType === t.value
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchResources();
          }}
          className="relative w-full sm:w-64"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search DSA, Math, CS201..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none shadow-subtle placeholder:text-slate-400"
          />
        </form>
      </div>

      {/* Grid */}
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
          title="No study resources found"
          message={
            isAdmin
              ? "Publish official lecture notes, question banks, or reference guides for residents."
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
          title="Publish Study Material"
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
                  placeholder="e.g. Unit 3 Trees & Graphs Class Notes"
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Resource Type *</label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs"
                  >
                    <option value="notes">Lecture Notes</option>
                    <option value="pyq">PYQ Papers</option>
                    <option value="book">E-Book</option>
                    <option value="pdf">PDF Cheatsheet</option>
                    <option value="assignment">Assignments</option>
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    placeholder="Sem 3"
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="CSE / ECE"
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key topics covered, formulas included..."
                  className="w-full p-3.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none resize-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">File Attachment (PDF/DOCX/ZIP)</label>
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none text-xs"
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
                  {isSubmitting ? 'Uploading...' : 'Publish Resource'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
