import React, { useState, useEffect } from 'react';
import {
  X, Palette, Sparkles, Image as ImageIcon, Check, RotateCcw,
  Sliders, Sun, Moon, Laptop, UploadCloud, Eye
} from 'lucide-react';
import { UserChatPreference, ChatBgType, ChatBubbleStyle, ChatThemeMode } from '../types';
import api from '../api/client';

interface ChatCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: number;
  conversationName?: string;
  initialPreferences: UserChatPreference;
  onSavePreferences: (prefs: UserChatPreference) => void;
}

export const SOLID_BG_OPTIONS = [
  { id: 'default', name: 'Default Neutral', value: '#F8FAFC', textColor: 'text-slate-800' },
  { id: 'soft-indigo', name: 'Soft Indigo', value: '#EEF2FF', textColor: 'text-slate-800' },
  { id: 'lavender', name: 'Lavender Mist', value: '#F3E8FF', textColor: 'text-slate-800' },
  { id: 'rose', name: 'Warm Rose', value: '#FFE4E6', textColor: 'text-slate-800' },
  { id: 'mint', name: 'Fresh Mint', value: '#ECFDF5', textColor: 'text-slate-800' },
  { id: 'honey', name: 'Warm Honey', value: '#FEF3C7', textColor: 'text-slate-800' },
  { id: 'sky', name: 'Sky Blue', value: '#E0F2FE', textColor: 'text-slate-800' },
  { id: 'dark-slate', name: 'Midnight Slate', value: '#0F172A', textColor: 'text-white' },
  { id: 'dark-indigo', name: 'Royal Indigo', value: '#1E1B4B', textColor: 'text-white' },
  { id: 'dark-plum', name: 'Plum Velvet', value: '#2E1065', textColor: 'text-white' },
];

export const GRADIENT_BG_OPTIONS = [
  { id: 'grad-aurora', name: 'Indigo Aurora', value: 'linear-gradient(135deg, #EEF2FF 0%, #F3E8FF 50%, #E0E7FF 100%)' },
  { id: 'grad-sunset', name: 'Sunset Velvet', value: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 50%, #FED7AA 100%)' },
  { id: 'grad-ocean', name: 'Ocean Mist', value: 'linear-gradient(135deg, #E0F2FE 0%, #E0E7FF 50%, #ECFDF5 100%)' },
  { id: 'grad-midnight', name: 'Midnight Glow', value: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)' },
  { id: 'grad-cosmic', name: 'Cosmic Violet', value: 'linear-gradient(135deg, #18181B 0%, #2E1065 50%, #4C1D95 100%)' },
  { id: 'grad-emerald', name: 'Emerald Night', value: 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)' },
];

export const WALLPAPER_OPTIONS = [
  {
    id: 'doodle',
    name: 'Hostel Talkies Doodles',
    previewColor: '#6366F1',
    svgDataUrl: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%236366F1' fill-opacity='0.08' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`
  },
  {
    id: 'dots',
    name: 'Constellation Matrix',
    previewColor: '#7C3AED',
    svgDataUrl: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='4' cy='4' r='2' fill='%237C3AED' fill-opacity='0.12'/%3E%3C/svg%3E")`
  },
  {
    id: 'grid',
    name: 'Campus Grid',
    previewColor: '#4F46E5',
    svgDataUrl: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%234F46E5' fill-opacity='0.07' fill-rule='evenodd'/%3E%3C/svg%3E")`
  },
  {
    id: 'waves',
    name: 'Topography Waves',
    previewColor: '#0EA5E9',
    svgDataUrl: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.184 20c.357-.13.72-.264 1.088-.402l1.768-.661C33.64 15.347 39.647 14 50 14c10.271 0 15.362 1.222 24.629 4.928.955.383 1.869.74 2.75 1.072h6.225c-2.51-.737-4.907-1.693-7.14-2.587-8.868-3.547-14.7-4.413-26.464-4.413-11.83 0-17.666.866-26.534 4.413-.997.399-1.996.797-2.996 1.173L17.7 20h3.484z' fill='%230EA5E9' fill-opacity='0.09' fill-rule='evenodd'/%3E%3C/svg%3E")`
  },
  {
    id: 'circuit',
    name: 'Tech Circuit',
    previewColor: '#10B981',
    svgDataUrl: `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 32h20l6-12 12 24 6-12h20' stroke='%2310B981' stroke-opacity='0.12' stroke-width='2' fill='none'/%3E%3C/svg%3E")`
  }
];

export const ChatCustomizationModal: React.FC<ChatCustomizationModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  conversationName,
  initialPreferences,
  onSavePreferences,
}) => {
  const [activeTab, setActiveTab] = useState<'background' | 'bubbles' | 'theme'>('background');
  const [bgCategory, setBgCategory] = useState<'solid' | 'gradient' | 'wallpaper' | 'custom'>('solid');

  const [bgType, setBgType] = useState<ChatBgType>(initialPreferences.bg_type || 'default');
  const [bgValue, setBgValue] = useState<string>(initialPreferences.bg_value || '');
  const [customBgImageFile, setCustomBgImageFile] = useState<File | null>(null);
  const [customBgPreviewUrl, setCustomBgPreviewUrl] = useState<string | null>(
    initialPreferences.custom_bg_image_url || initialPreferences.custom_bg_image || null
  );

  const [bubbleStyle, setBubbleStyle] = useState<ChatBubbleStyle>(initialPreferences.bubble_style || 'classic');
  const [themeMode, setThemeMode] = useState<ChatThemeMode>(initialPreferences.theme_mode || 'system');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setBgType(initialPreferences.bg_type || 'default');
      setBgValue(initialPreferences.bg_value || '');
      setBubbleStyle(initialPreferences.bubble_style || 'classic');
      setThemeMode(initialPreferences.theme_mode || 'system');
      setCustomBgPreviewUrl(initialPreferences.custom_bg_image_url || initialPreferences.custom_bg_image || null);
      setCustomBgImageFile(null);
      setErrorMessage('');

      if (initialPreferences.bg_type === 'gradient') {
        setBgCategory('gradient');
      } else if (initialPreferences.bg_type === 'wallpaper') {
        setBgCategory('wallpaper');
      } else if (initialPreferences.bg_type === 'custom') {
        setBgCategory('custom');
      } else {
        setBgCategory('solid');
      }
    }
  }, [isOpen, initialPreferences]);

  if (!isOpen) return null;

  // Handle custom image file selection
  const handleCustomImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        setErrorMessage('Image size exceeds 15MB limit.');
        return;
      }
      setCustomBgImageFile(file);
      const url = URL.createObjectURL(file);
      setCustomBgPreviewUrl(url);
      setBgType('custom');
      setBgValue('custom_image');
      setErrorMessage('');
    }
  };

  // Reset to default
  const handleResetToDefault = async () => {
    setIsSaving(true);
    try {
      const url = conversationId
        ? `/messages/${conversationId}/preferences/reset/`
        : '/messages/preferences/reset/';
      const res = await api.post<UserChatPreference>(url);

      const defaultPrefs: UserChatPreference = {
        bg_type: 'default',
        bg_value: '',
        custom_bg_image: null,
        custom_bg_image_url: null,
        bubble_style: 'classic',
        theme_mode: 'system',
      };
      onSavePreferences(res.data || defaultPrefs);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to reset settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage('');
    try {
      const formData = new FormData();
      formData.append('bg_type', bgType);
      formData.append('bg_value', bgValue);
      formData.append('bubble_style', bubbleStyle);
      formData.append('theme_mode', themeMode);

      if (customBgImageFile) {
        formData.append('custom_bg_image', customBgImageFile);
      }

      const url = conversationId
        ? `/messages/${conversationId}/preferences/`
        : '/messages/preferences/';

      const res = await api.post<UserChatPreference>(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onSavePreferences(res.data);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to save chat customization.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper for computing live preview background style
  const getPreviewBackgroundStyle = (): React.CSSProperties => {
    if (bgType === 'solid' && bgValue) {
      return { backgroundColor: bgValue };
    }
    if (bgType === 'gradient' && bgValue) {
      return { background: bgValue };
    }
    if (bgType === 'wallpaper' && bgValue) {
      const wallpaper = WALLPAPER_OPTIONS.find(w => w.id === bgValue);
      if (wallpaper) {
        return {
          backgroundImage: wallpaper.svgDataUrl,
          backgroundColor: themeMode === 'dark' ? '#0F172A' : '#F8FAFC',
          backgroundRepeat: 'repeat',
        };
      }
    }
    if (bgType === 'custom' && customBgPreviewUrl) {
      return {
        backgroundImage: `url(${customBgPreviewUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    return { backgroundColor: themeMode === 'dark' ? '#0F172A' : '#F8FAFC' };
  };

  // Helper for computing live preview bubble styles
  const getBubbleStyleClasses = (isMe: boolean) => {
    let classes = '';

    if (bubbleStyle === 'classic') {
      classes += isMe
        ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-2xl rounded-br-xs shadow-xs'
        : 'bg-white text-slate-800 border border-slate-200/90 rounded-2xl rounded-bl-xs shadow-xs';
    } else if (bubbleStyle === 'rounded') {
      classes += isMe
        ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white rounded-3xl shadow-sm'
        : 'bg-white text-slate-800 border border-slate-200/90 rounded-3xl shadow-sm';
    } else if (bubbleStyle === 'minimal') {
      classes += isMe
        ? 'bg-brand-50 border-2 border-brand-600 text-brand-900 rounded-xl font-medium'
        : 'bg-slate-50 border-2 border-slate-300 text-slate-900 rounded-xl font-medium';
    } else if (bubbleStyle === 'compact') {
      classes += isMe
        ? 'bg-brand-600 text-white rounded-lg p-2 text-[11px]'
        : 'bg-white text-slate-800 border border-slate-200 rounded-lg p-2 text-[11px]';
    }

    if (themeMode === 'dark' && !isMe) {
      classes = classes.replace('bg-white', 'bg-slate-800/95').replace('text-slate-800', 'text-slate-100').replace('border-slate-200', 'border-slate-700');
    }

    return classes;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Customize Chat</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-xs">
                {conversationName ? `Appearance for ${conversationName}` : 'Personal chat styling'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* Modal Body: Two Column / Grid on Desktop */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Live Preview Window */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-brand-600" />
                Live Chat Preview
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Real-time appearance</span>
            </div>

            <div
              className={`h-40 sm:h-44 rounded-2xl border border-slate-200/80 p-3.5 flex flex-col justify-end gap-2.5 relative overflow-hidden transition-all duration-300 ${
                themeMode === 'dark' ? 'dark' : ''
              }`}
              style={getPreviewBackgroundStyle()}
            >
              {/* Subtle Readability Layer for Custom Image */}
              {bgType === 'custom' && customBgPreviewUrl && (
                <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px] pointer-events-none" />
              )}

              {/* Sample Received Message */}
              <div className="flex items-start gap-2 max-w-[80%] relative z-10">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs">
                  R
                </div>
                <div className={`p-2.5 ${getBubbleStyleClasses(false)}`}>
                  <p className="text-xs">Hey! Ready for badminton at 6 PM? 🏸</p>
                  <span className="text-[9px] opacity-70 block text-right mt-0.5">5:45 PM</span>
                </div>
              </div>

              {/* Sample Sent Message */}
              <div className="flex items-end justify-end max-w-[80%] ml-auto relative z-10">
                <div className={`p-2.5 ${getBubbleStyleClasses(true)}`}>
                  <p className="text-xs">Yes, grabbing my gear now! Let's go 🔥</p>
                  <span className="text-[9px] opacity-75 block text-right mt-0.5">5:46 PM ✓✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveTab('background')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'background' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-brand-600" />
              <span>Background</span>
            </button>

            <button
              onClick={() => setActiveTab('bubbles')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'bubbles' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>Bubble Style</span>
            </button>

            <button
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'theme' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Theme</span>
            </button>
          </div>

          {/* Tab 1: Background Options */}
          {activeTab === 'background' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              {/* Background Categories Sub-toggle */}
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5 overflow-x-auto text-xs font-semibold">
                <button
                  onClick={() => setBgCategory('solid')}
                  className={`px-3 py-1 rounded-xl transition ${
                    bgCategory === 'solid' ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Solid Colors
                </button>
                <button
                  onClick={() => setBgCategory('gradient')}
                  className={`px-3 py-1 rounded-xl transition ${
                    bgCategory === 'gradient' ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Gradients
                </button>
                <button
                  onClick={() => setBgCategory('wallpaper')}
                  className={`px-3 py-1 rounded-xl transition ${
                    bgCategory === 'wallpaper' ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Wallpapers
                </button>
                <button
                  onClick={() => setBgCategory('custom')}
                  className={`px-3 py-1 rounded-xl transition ${
                    bgCategory === 'custom' ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Custom Photo
                </button>
              </div>

              {/* 1. Solid Colors Grid */}
              {bgCategory === 'solid' && (
                <div className="grid grid-cols-5 gap-2.5">
                  {SOLID_BG_OPTIONS.map((item) => {
                    const isSelected = bgType === 'solid' && bgValue === item.value;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setBgType('solid');
                          setBgValue(item.value);
                        }}
                        className={`h-14 rounded-2xl border flex flex-col items-center justify-center p-1.5 transition active:scale-95 relative ${
                          isSelected ? 'ring-3 ring-brand-500 border-transparent shadow-sm' : 'border-slate-200 hover:border-slate-300'
                        }`}
                        style={{ backgroundColor: item.value }}
                      >
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <span className={`text-[10px] font-bold mt-1 truncate max-w-full ${item.textColor}`}>
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 2. Gradients Grid */}
              {bgCategory === 'gradient' && (
                <div className="grid grid-cols-3 gap-2.5">
                  {GRADIENT_BG_OPTIONS.map((item) => {
                    const isSelected = bgType === 'gradient' && bgValue === item.value;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setBgType('gradient');
                          setBgValue(item.value);
                        }}
                        className={`h-16 rounded-2xl border flex items-center justify-center p-2 transition active:scale-95 relative ${
                          isSelected ? 'ring-3 ring-brand-500 border-transparent shadow-sm' : 'border-slate-200 hover:border-slate-300'
                        }`}
                        style={{ background: item.value }}
                      >
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-black/30 text-white backdrop-blur-xs truncate max-w-full">
                          {item.name}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 3. Wallpapers Grid */}
              {bgCategory === 'wallpaper' && (
                <div className="grid grid-cols-3 gap-2.5">
                  {WALLPAPER_OPTIONS.map((item) => {
                    const isSelected = bgType === 'wallpaper' && bgValue === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setBgType('wallpaper');
                          setBgValue(item.id);
                        }}
                        className={`h-16 rounded-2xl border flex items-center justify-center p-2 transition active:scale-95 relative bg-slate-50 ${
                          isSelected ? 'ring-3 ring-brand-500 border-transparent shadow-sm' : 'border-slate-200 hover:border-slate-300'
                        }`}
                        style={{ backgroundImage: item.svgDataUrl }}
                      >
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-white/90 text-slate-800 shadow-xs truncate max-w-full">
                          {item.name}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* 4. Custom Photo Upload */}
              {bgCategory === 'custom' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition bg-white group">
                      <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-brand-600 transition mb-1.5" />
                      <span className="text-xs font-bold text-slate-700 group-hover:text-brand-600">
                        {customBgPreviewUrl ? 'Choose another image' : 'Upload custom wallpaper'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP up to 15MB</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleCustomImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug">
                    ✨ <strong>Smart Readability:</strong> A gentle protective overlay is automatically applied over your photo so message texts are always 100% crystal clear.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Bubble Style Selection */}
          {activeTab === 'bubbles' && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: 'classic' as ChatBubbleStyle,
                    title: 'Classic',
                    desc: 'Standard WhatsApp-style curved corners with accent tails',
                  },
                  {
                    id: 'rounded' as ChatBubbleStyle,
                    title: 'Rounded Pill',
                    desc: 'Ultra-modern smooth pill-shaped bubble cards',
                  },
                  {
                    id: 'minimal' as ChatBubbleStyle,
                    title: 'Minimal Border',
                    desc: 'Crisp lightweight borders with subtle pastel tints',
                  },
                  {
                    id: 'compact' as ChatBubbleStyle,
                    title: 'Compact Dense',
                    desc: 'Dense padding and line heights for power messaging',
                  },
                ].map((item) => {
                  const isSelected = bubbleStyle === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setBubbleStyle(item.id)}
                      className={`p-3.5 text-left rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-200'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{item.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-brand-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Theme Selection */}
          {activeTab === 'theme' && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    id: 'light' as ChatThemeMode,
                    title: 'Light',
                    icon: Sun,
                    desc: 'Bright, clean aesthetic',
                  },
                  {
                    id: 'dark' as ChatThemeMode,
                    title: 'Dark',
                    icon: Moon,
                    desc: 'OLED-friendly dark palette',
                  },
                  {
                    id: 'system' as ChatThemeMode,
                    title: 'System',
                    icon: Laptop,
                    desc: 'Syncs with device settings',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = themeMode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setThemeMode(item.id)}
                      className={`p-4 text-center rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-200'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{item.title}</span>
                        <span className="text-[10px] text-slate-400">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Apply & Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
