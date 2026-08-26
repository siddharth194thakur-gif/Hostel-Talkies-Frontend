import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Save, Building, User, Phone, CheckCircle, AlertCircle,
  Upload, GraduationCap, Camera, Trash2, X, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { getMediaUrl } from '../api/client';
import { Hostel, Block, Room } from '../types';
import { BackButton } from '../components/BackButton';

export const EditProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [phone, setPhone] = useState(user?.profile?.phone_number || '');
  const [gender, setGender] = useState(user?.profile?.gender || '');
  const [programme, setProgramme] = useState(user?.profile?.programme || '');
  const [branch, setBranch] = useState(user?.profile?.branch || '');

  // Photo Management State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [showPhotoOptionsModal, setShowPhotoOptionsModal] = useState(false);
  const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState(false);

  // Cascading selects
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [selectedHostel, setSelectedHostel] = useState<string>(
    user?.profile?.hostel ? String(user.profile.hostel) : ''
  );
  const [selectedBlock, setSelectedBlock] = useState<string>(
    user?.profile?.block ? String(user.profile.block) : ''
  );
  const [selectedRoom, setSelectedRoom] = useState<string>(
    user?.profile?.room ? String(user.profile.room) : ''
  );

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // 1. Fetch hostels
  const [isLoadingHostels, setIsLoadingHostels] = useState(false);
  const [hostelsError, setHostelsError] = useState('');

  const fetchHostels = async () => {
    setIsLoadingHostels(true);
    setHostelsError('');
    try {
      const res = await api.get<{ results: Hostel[] } | Hostel[]>('/hostels/');
      const data = res.data as any;
      const list: Hostel[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];
      setHostels(list);
    } catch (err: any) {
      console.error('Failed to load hostels in EditProfile', err);
      const msg = err?.response?.data?.detail || err?.message || 'Unable to load hostels';
      setHostelsError(`${msg}. Please click Retry.`);
      setHostels([]);
    } finally {
      setIsLoadingHostels(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  // 2. Fetch blocks when hostel changes
  useEffect(() => {
    if (!selectedHostel) {
      setBlocks([]);
      setSelectedBlock('');
      return;
    }
    const fetchBlocks = async () => {
      try {
        const res = await api.get<{ results: Block[] } | Block[]>(`/hostels/${selectedHostel}/blocks/`);
        const data = res.data as any;
        const list: Block[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];
        setBlocks(list);
      } catch (err) {
        console.error('Failed to load blocks in EditProfile', err);
        setBlocks([]);
      }
    };
    fetchBlocks();
  }, [selectedHostel]);

  // 3. Fetch rooms when block changes
  useEffect(() => {
    if (!selectedBlock) {
      setRooms([]);
      setSelectedRoom('');
      return;
    }
    const fetchRooms = async () => {
      try {
        const res = await api.get<{ results: Room[] } | Room[]>(`/hostels/blocks/${selectedBlock}/rooms/`);
        const data = res.data as any;
        const list: Room[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];
        setRooms(list);
      } catch (err) {
        console.error('Failed to load rooms in EditProfile', err);
        setRooms([]);
      }
    };
    fetchRooms();
  }, [selectedBlock]);

  // Photo handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB.');
        return;
      }
      setAvatarFile(file);
      setRemoveAvatar(false);
      setError('');
      setShowPhotoOptionsModal(false);
    }
  };

  const handleTriggerUpload = () => {
    setShowPhotoOptionsModal(false);
    fileInputRef.current?.click();
  };

  const handleConfirmRemovePhoto = () => {
    setAvatarFile(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowRemoveConfirmModal(false);
    setShowPhotoOptionsModal(false);
  };

  const handleUndoRemovePhoto = () => {
    setRemoveAvatar(false);
    setAvatarFile(null);
  };

  const hasCurrentPhoto = Boolean((avatarFile || user?.profile?.avatar) && !removeAvatar);
  const initialLetter = (firstName?.charAt(0) || user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U').toUpperCase();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('bio', bio);
    formData.append('phone_number', phone);
    formData.append('gender', gender);
    formData.append('programme', programme);
    formData.append('branch', branch);
    if (selectedHostel) formData.append('hostel', selectedHostel);
    if (selectedBlock) formData.append('block', selectedBlock);
    if (selectedRoom) formData.append('room', selectedRoom);

    if (removeAvatar) {
      formData.append('remove_avatar', 'true');
    } else if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      const res = await api.patch('/auth/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(res.data);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-xs pb-16">
      <div>
        <BackButton fallback="/profile" />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Profile</h1>
          <p className="text-xs text-slate-500">Update your photo, student information, and hostel details</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-2 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* ────────────────────────────────────────── */}
        {/* PROFILE PHOTO MANAGEMENT CARD              */}
        {/* ────────────────────────────────────────── */}
        <div className="p-5 bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-sm">Profile Photo</span>
            {avatarFile && (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                New Photo Selected
              </span>
            )}
            {removeAvatar && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                Marked For Removal
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Interactive Avatar Area */}
            <div
              onClick={() => {
                if (hasCurrentPhoto) {
                  setShowPhotoOptionsModal(true);
                } else {
                  handleTriggerUpload();
                }
              }}
              className="relative group cursor-pointer shrink-0"
              title="Click to manage photo"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-3xl flex items-center justify-center shadow-md overflow-hidden border-2 border-white transition group-hover:shadow-lg group-hover:scale-102">
                {avatarFile ? (
                  <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-full h-full object-cover" />
                ) : !removeAvatar && user?.profile?.avatar ? (
                  <img
                    src={getMediaUrl(user.profile.avatar)}
                    alt="Current"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{initialLetter}</span>
                )}
              </div>

              {/* Camera Icon Overlay */}
              <div className="absolute inset-0 bg-black/40 text-white rounded-3xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 backdrop-blur-xs">
                <Camera className="w-6 h-6" />
                <span className="text-[10px] font-bold mt-1">Edit</span>
              </div>
            </div>

            {/* Photo Action Controls */}
            <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {hasCurrentPhoto ? (
                  <>
                    <button
                      type="button"
                      onClick={handleTriggerUpload}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-xl shadow-xs transition active:scale-95 text-xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-brand-600" />
                      <span>Change Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRemoveConfirmModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold rounded-xl transition active:scale-95 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Remove</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleTriggerUpload}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition active:scale-95 text-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>

                    {removeAvatar && (
                      <button
                        type="button"
                        onClick={handleUndoRemovePhoto}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl transition text-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Undo Remove</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                {removeAvatar
                  ? 'Your profile photo will be removed when you save changes. Initials will be displayed.'
                  : 'Supported formats: PNG, JPG, JPEG, or WebP. Max file size: 5MB.'}
              </p>
            </div>
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">First Name</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 outline-none text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 outline-none text-xs"
            />
          </div>
        </div>

        {/* Gender & Academic Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 outline-none text-xs font-medium"
            >
              <option value="">-- Select Gender --</option>
              <option value="male">♂ Male</option>
              <option value="female">♀ Female</option>
              <option value="other">⚧ Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Programme / Degree</label>
            <input
              type="text"
              value={programme}
              onChange={(e) => setProgramme(e.target.value)}
              placeholder="e.g. B.Tech, MCA, MBA"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 outline-none text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Branch / Dept</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g. CSE, ECE, Mechanical"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 outline-none text-xs"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">About You / Bio</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Year, branch, interests..."
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 outline-none resize-none text-xs leading-relaxed"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">Phone Number (Private)</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 9876543210"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 outline-none text-xs"
          />
        </div>

        {/* Hostel Assignment (Cascading Selects) */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
          <span className="font-bold text-slate-800 block text-sm">Hostel Assignment</span>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">Hostel *</label>
              {(hostelsError || (hostels.length === 0 && !isLoadingHostels)) && (
                <button
                  type="button"
                  onClick={() => fetchHostels()}
                  disabled={isLoadingHostels}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 disabled:opacity-50 transition active:scale-95"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingHostels ? 'animate-spin' : ''}`} />
                  <span>{isLoadingHostels ? 'Retrying...' : 'Retry Loading'}</span>
                </button>
              )}
            </div>
            <select
              required
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
              disabled={isLoadingHostels}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:border-brand-500 outline-none text-xs disabled:opacity-60 disabled:bg-slate-50"
            >
              <option value="">
                {isLoadingHostels
                  ? 'Loading available hostels...'
                  : hostels.length === 0 && !isLoadingHostels
                  ? '-- No Hostels Found (Click Retry) --'
                  : '-- Choose Hostel --'}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Block (Optional)</label>
              <select
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                disabled={!selectedHostel || blocks.length === 0}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:border-brand-500 outline-none text-xs disabled:opacity-50"
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
              <label className="block font-semibold text-slate-700 mb-1">Room (Optional)</label>
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                disabled={!selectedBlock || rooms.length === 0}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:border-brand-500 outline-none text-xs disabled:opacity-50"
              >
                <option value="">-- Skip or Select Room --</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    Room {r.room_number}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md shadow-brand-500/20 transition active:scale-95 disabled:opacity-50 text-xs"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
        </button>
      </form>

      {/* ────────────────────────────────────────── */}
      {/* PHOTO ACTION MENU MODAL                    */}
      {/* ────────────────────────────────────────── */}
      {showPhotoOptionsModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowPhotoOptionsModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Profile Photo</h3>
              <button
                type="button"
                onClick={() => setShowPhotoOptionsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleTriggerUpload}
                className="w-full flex items-center gap-3 px-4 py-3 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-2xl transition text-xs"
              >
                <Camera className="w-4 h-4" />
                <span>Change / Upload Photo</span>
              </button>

              {hasCurrentPhoto && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPhotoOptionsModal(false);
                    setShowRemoveConfirmModal(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-2xl transition text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Current Photo</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowPhotoOptionsModal(false)}
              className="w-full py-2.5 text-center text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────── */}
      {/* REMOVE PHOTO CONFIRMATION MODAL            */}
      {/* ────────────────────────────────────────── */}
      {showRemoveConfirmModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowRemoveConfirmModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Remove Profile Photo?</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Your profile picture will be permanently removed. Your profile will display your initials instead until you upload a new photo.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRemoveConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemovePhoto}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                Remove Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
