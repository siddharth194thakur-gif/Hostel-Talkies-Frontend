import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PlusCircle,
  Image as ImageIcon,
  X,
  AlertCircle,
  ShoppingBag,
  Gift,
  RefreshCw,
  Handshake,
  Search,
  CheckCircle2,
  Users,
  Sparkles,
} from 'lucide-react';
import api from '../api/client';
import { Category, PostType } from '../types';
import { BackButton } from '../components/BackButton';

export const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialType = (queryParams.get('type') as PostType) || 'buy_sell';

  const [postType, setPostType] = useState<PostType>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('good');
  const [locationField, setLocationField] = useState('');
  const [eventDate, setEventDate] = useState('');

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get<{ results: Category[] } | Category[]>('/posts/categories/');
        setCategories(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setImages((prev) => [...prev, ...filesArr]);

      const newPreviews = filesArr.map((f) => URL.createObjectURL(f));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('post_type', postType);
    formData.append('title', title);
    formData.append('description', description);
    if (categoryId) formData.append('category', categoryId);
    
    if (postType === 'buy_sell' && price) {
      formData.append('price', price);
    } else if (postType === 'giveaway') {
      formData.append('price', '0.00');
    }

    if (condition) formData.append('condition', condition);
    if (locationField) formData.append('location', locationField);
    if (eventDate) formData.append('event_date', eventDate);

    images.forEach((img) => {
      formData.append('uploaded_images', img);
    });

    try {
      const res = await api.post('/posts/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/posts/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create post. Please check all required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const postTypesList: { type: PostType; label: string; icon: any }[] = [
    { type: 'buy_sell', label: 'Buy & Sell', icon: ShoppingBag },
    { type: 'giveaway', label: 'Free Giveaway', icon: Gift },
    { type: 'exchange', label: 'Exchange', icon: RefreshCw },
    { type: 'borrow', label: 'Borrow Request', icon: Handshake },
    { type: 'lost', label: 'Lost Item', icon: Search },
    { type: 'found', label: 'Found Item', icon: CheckCircle2 },
    { type: 'roommate', label: 'Roommate Requirement', icon: Users },
    { type: 'general', label: 'General Talkies', icon: Sparkles },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-xs">
      <div>
        <BackButton fallback="/marketplace" />
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Create Community Post</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Share, sell, give away, or ask for help in your hostel community</p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Select Post Type - Elegant Selectable Cards */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-3">
        <label className="block font-bold text-slate-900 text-xs sm:text-sm">What would you like to post?</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {postTypesList.map((pt) => {
            const Icon = pt.icon;
            const isSelected = postType === pt.type;
            return (
              <button
                key={pt.type}
                type="button"
                onClick={() => setPostType(pt.type)}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2.5 transition-all duration-200 ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/70 text-brand-900 shadow-subtle font-bold'
                    : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50/70 hover:border-slate-300 font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                <span className="text-[11px] leading-tight">{pt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Details */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-subtle space-y-5">
        {/* Title */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">Post Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              postType === 'buy_sell'
                ? 'e.g. Hero Sprint 21-Speed Bicycle with Helmet'
                : postType === 'lost'
                ? 'e.g. Lost Blue Boat Rockerz 450 in Central Library'
                : postType === 'giveaway'
                ? 'e.g. Wooden Study Desk available for free pick-up'
                : 'e.g. Roommate needed for Aryabhata Block A1'
            }
            className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs font-medium placeholder:text-slate-400"
          />
        </div>

        {/* Category & Price / Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs"
            >
              <option value="">-- Choose Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {postType === 'buy_sell' ? (
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="₹ e.g. 1500"
                className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs font-bold"
              />
            </div>
          ) : postType === 'giveaway' ? (
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Price</label>
              <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-extrabold text-xs">
                FREE GIVEAWAY
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Location / Hostel Landmark</label>
              <input
                type="text"
                value={locationField}
                onChange={(e) => setLocationField(e.target.value)}
                placeholder="e.g. Mess 2, Block A Ground Floor"
                className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs"
              />
            </div>
          )}
        </div>

        {/* Condition (For marketplace & physical items) */}
        {['buy_sell', 'giveaway', 'exchange', 'borrow'].includes(postType) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Item Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs"
              >
                <option value="new">Brand New (Unused)</option>
                <option value="like_new">Like New (Barely used, mint condition)</option>
                <option value="good">Good (Fully functional, minor wear)</option>
                <option value="used">Used / Fair</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Pick-up / Handover Spot</label>
              <input
                type="text"
                value={locationField}
                onChange={(e) => setLocationField(e.target.value)}
                placeholder="e.g. Near Hostel Common Room"
                className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs"
              />
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">Description *</label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide clear details regarding dimensions, model, reason for selling/giving away, or contact preferences..."
            className="w-full p-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-2xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none resize-none text-xs leading-relaxed"
          />
        </div>

        {/* Images Upload */}
        <div className="space-y-3">
          <label className="block font-semibold text-slate-700">Upload Photos (Optional)</label>
          
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group">
                <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-slate-900/80 text-white rounded-full hover:bg-red-600 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {images.length < 5 && (
              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-400 bg-slate-50 hover:bg-brand-50/40 flex flex-col items-center justify-center cursor-pointer transition text-slate-400 hover:text-brand-600">
                <ImageIcon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-semibold">Add Photo</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs hover:shadow-badge transition-all active:scale-95 disabled:opacity-50 text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isSubmitting ? 'Publishing...' : 'Publish Post'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
