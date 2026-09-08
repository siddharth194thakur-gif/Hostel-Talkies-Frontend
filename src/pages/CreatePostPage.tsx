import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PlusCircle,
  AlertCircle,
  ShoppingBag,
  Gift,
  RefreshCw,
  Handshake,
  Search,
  CheckCircle2,
  Users,
  Sparkles,
  MapPin,
  Calendar,
  Building,
  Check,
} from 'lucide-react';
import api from '../api/client';
import { Category, PostType } from '../types';
import { BackButton } from '../components/BackButton';

const LIFESTYLE_OPTIONS = [
  'Vegetarian',
  'Quiet Study Focus',
  'Non-Smoker',
  'Early Bird',
  'Night Owl',
  'Clean & Organized',
  'Sports / Fitness',
];

export const CAMPUS_LOCATIONS = [
  'Central Library',
  'Academic Block / Lecture Hall',
  'Hostel Mess 1',
  'Hostel Mess 2',
  'Sports Complex / Ground',
  'Hostel Common Room',
  'Campus Canteen / Cafeteria',
  'Main Security Gate',
  'Hostel Corridor / Floor',
  'Other Campus Area',
];

export const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialTypeParam = queryParams.get('type') as PostType;
  const initialType = (initialTypeParam && initialTypeParam !== 'others') ? initialTypeParam : 'buy_sell';

  const [postType, setPostType] = useState<PostType>(initialType);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 1. Marketplace State
  const [marketplaceCatId, setMarketplaceCatId] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('good');
  const [marketplaceStatus, setMarketplaceStatus] = useState('available');

  // 2. Roommate State
  const [roommateLookingFor, setRoommateLookingFor] = useState<'roommate_needed' | 'seeking_room'>('roommate_needed');
  const [roommateAccommodation, setRoommateAccommodation] = useState<'double' | 'single' | 'triple' | 'any'>('double');
  const [roommateLocationPref, setRoommateLocationPref] = useState('Same Hostel as me');
  const [roommateLifestyles, setRoommateLifestyles] = useState<string[]>([]);

  // 3. Lost Item State
  const [lostCategory, setLostCategory] = useState('');
  const [lostItemName, setLostItemName] = useState('');
  const [lostLocation, setLostLocation] = useState('');
  const [lostDate, setLostDate] = useState(new Date().toISOString().split('T')[0]);
  const [lostStatus, setLostStatus] = useState<'available' | 'closed'>('available');

  // 4. Found Item State
  const [foundCategory, setFoundCategory] = useState('');
  const [foundItemName, setFoundItemName] = useState('');
  const [foundLocation, setFoundLocation] = useState('');
  const [foundDate, setFoundDate] = useState(new Date().toISOString().split('T')[0]);
  const [foundHandover, setFoundHandover] = useState('Deposited with Hostel Caretaker / Warden Office');
  const [foundStatus, setFoundStatus] = useState<'available' | 'closed'>('available');

  // 5. General Talkies State
  const [generalCatId, setGeneralCatId] = useState('');
  const [generalTitle, setGeneralTitle] = useState('');
  const [generalContent, setGeneralContent] = useState('');

  const isMarketplacePost = ['buy_sell', 'giveaway', 'exchange', 'borrow'].includes(postType);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get<{ results: Category[] } | Category[]>('/posts/categories/');
        setCategories(Array.isArray(res.data) ? res.data : res.data.results || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Category switching with clean state purge
  const handlePostTypeChange = (newType: PostType) => {
    setPostType(newType);
    setError('');

    // Purge states on change to ensure clean separation
    setMarketplaceCatId('');
    setPrice('');
    setCondition('good');
    setMarketplaceStatus('available');

    setRoommateLookingFor('roommate_needed');
    setRoommateAccommodation('double');
    setRoommateLocationPref('Same Hostel as me');
    setRoommateLifestyles([]);

    setLostCategory('');
    setLostItemName('');
    setLostLocation('');
    setLostDate(new Date().toISOString().split('T')[0]);
    setLostStatus('available');

    setFoundCategory('');
    setFoundItemName('');
    setFoundLocation('');
    setFoundDate(new Date().toISOString().split('T')[0]);
    setFoundHandover('Deposited with Hostel Caretaker / Warden Office');
    setFoundStatus('available');

    setGeneralCatId('');
    setGeneralTitle('');
    setGeneralContent('');
  };

  const toggleLifestyle = (tag: string) => {
    setRoommateLifestyles((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const relevantCategories = categories.filter((c) => {
    if (isMarketplacePost) {
      return c.post_type === 'marketplace';
    }
    if (postType === 'lost' || postType === 'found') {
      return c.post_type === 'lost_found';
    }
    if (postType === 'roommate') {
      return c.post_type === 'roommate';
    }
    if (postType === 'general') {
      return c.post_type === 'general';
    }
    return false;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const payload: Record<string, any> = { post_type: postType };

      // ── Marketplace Submission ────────────────────────────────────────────
      if (isMarketplacePost) {
        if (!marketplaceCatId) {
          setError('Please select an item category.');
          setIsSubmitting(false);
          return;
        }
        if (postType === 'buy_sell' && (!price || parseFloat(price) <= 0)) {
          setError('Please enter a valid price for Buy & Sell.');
          setIsSubmitting(false);
          return;
        }
        const selectedCat = categories.find((c) => String(c.id) === String(marketplaceCatId));
        payload.category = parseInt(marketplaceCatId);
        payload.title = selectedCat?.name || 'Marketplace Item';
        payload.price = postType === 'buy_sell' ? price : '0.00';
        payload.condition = condition;
        payload.status = marketplaceStatus;
        payload.location = '';
        payload.description = `Category: ${selectedCat?.name || 'Marketplace Item'} | Condition: ${condition.replace('_', ' ')} | Availability: ${marketplaceStatus}`;
      }

      // ── Roommate Submission ───────────────────────────────────────────────
      else if (postType === 'roommate') {
        const lookingLabel = roommateLookingFor === 'roommate_needed' ? 'Roommate Needed' : 'Seeking Accommodation';
        const accomLabel =
          roommateAccommodation === 'single' ? 'Single Room' :
          roommateAccommodation === 'double' ? 'Double Sharing' :
          roommateAccommodation === 'triple' ? 'Triple Sharing' : 'Any Sharing';

        const roommateCat = categories.find((c) => c.post_type === 'roommate' || c.slug.includes('roommate'));
        if (roommateCat) {
          payload.category = roommateCat.id;
        }

        payload.title = `${lookingLabel} - ${accomLabel}`;
        payload.condition = 'na';
        payload.status = 'available';
        payload.location = '';

        const descLines = [
          `Looking For: ${lookingLabel}`,
          `Accommodation Type: ${accomLabel}`,
          `Location Preference: ${roommateLocationPref}`,
        ];
        if (roommateLifestyles.length > 0) {
          descLines.push(`Lifestyle Preferences: ${roommateLifestyles.join(', ')}`);
        }
        payload.description = descLines.join('\n');
      }

      // ── Lost Item Submission ──────────────────────────────────────────────
      else if (postType === 'lost') {
        if (!lostLocation) {
          setError('Please select the campus location where the item was lost.');
          setIsSubmitting(false);
          return;
        }

        const selectedCat = categories.find((c) => String(c.id) === String(lostCategory));
        const itemTitle = lostItemName.trim() || (selectedCat ? selectedCat.name : 'Lost Item');

        payload.title = `Lost: ${itemTitle}`;
        if (lostCategory) payload.category = parseInt(lostCategory);
        payload.location = lostLocation;
        payload.event_date = lostDate;
        payload.status = lostStatus;
        payload.condition = 'na';
        payload.description = `Lost ${itemTitle} near ${lostLocation}. Connect via private chat to verify ownership.`;
      }

      // ── Found Item Submission ─────────────────────────────────────────────
      else if (postType === 'found') {
        if (!foundLocation) {
          setError('Please select the campus location where the item was found.');
          setIsSubmitting(false);
          return;
        }

        const selectedCat = categories.find((c) => String(c.id) === String(foundCategory));
        const itemTitle = foundItemName.trim() || (selectedCat ? selectedCat.name : 'Found Item');

        payload.title = `Found: ${itemTitle}`;
        if (foundCategory) payload.category = parseInt(foundCategory);
        payload.location = foundLocation;
        payload.event_date = foundDate;
        payload.status = foundStatus;
        payload.condition = 'na';
        payload.description = `Found ${itemTitle} at ${foundLocation}.\nSafe Handover Location: ${foundHandover}.\nConnect via private chat to claim and verify ownership.`;
      }

      // ── General Talkies Submission ────────────────────────────────────────
      else if (postType === 'general') {
        if (!generalTitle.trim()) {
          setError('Please enter a subject or title.');
          setIsSubmitting(false);
          return;
        }
        if (!generalContent.trim()) {
          setError('Please enter your discussion message.');
          setIsSubmitting(false);
          return;
        }
        if (generalCatId) payload.category = parseInt(generalCatId);
        payload.title = generalTitle.trim();
        payload.description = generalContent.trim();
        payload.condition = 'na';
        payload.status = 'available';
      }

      const res = await api.post('/posts/', payload);
      navigate(`/posts/${res.data.id}`);
    } catch (err: any) {
      const respData = err.response?.data;
      if (respData) {
        const errorMsg = typeof respData === 'string'
          ? respData
          : respData.detail || Object.values(respData).flat().join(' ') || 'Failed to create post.';
        setError(errorMsg);
      } else {
        setError('Failed to create post. Please check all fields and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const postTypesList: { type: PostType; label: string; icon: any; desc: string }[] = [
    { type: 'buy_sell', label: 'Buy & Sell', icon: ShoppingBag, desc: 'Sell campus gear' },
    { type: 'giveaway', label: 'Free Giveaway', icon: Gift, desc: 'Free items for peers' },
    { type: 'exchange', label: 'Exchange', icon: RefreshCw, desc: 'Trade & barter items' },
    { type: 'borrow', label: 'Borrow Request', icon: Handshake, desc: 'Request books & tools' },
    { type: 'roommate', label: 'Roommate Requirement', icon: Users, desc: 'Find roommates & rooms' },
    { type: 'lost', label: 'Lost Item', icon: Search, desc: 'Report misplaced item' },
    { type: 'found', label: 'Found Item', icon: CheckCircle2, desc: 'Report found item' },
    { type: 'general', label: 'General Talkies', icon: Sparkles, desc: 'Campus community talk' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-xs">
      <div>
        <BackButton fallback="/marketplace" />
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Create Community Post</h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Share, buy, sell, report, or discuss with your campus community</p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Select Category / Post Type */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-subtle space-y-3">
        <label className="block font-bold text-slate-900 text-xs sm:text-sm">Select Post Category</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {postTypesList.map((pt) => {
            const Icon = pt.icon;
            const isSelected = postType === pt.type;
            return (
              <button
                key={pt.type}
                type="button"
                onClick={() => handlePostTypeChange(pt.type)}
                className={`flex flex-col items-start p-3 sm:p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/40 text-brand-900 shadow-sm ring-2 ring-brand-500/20'
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                <div>
                  <span className="text-[11px] block leading-tight font-bold">{pt.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal hidden sm:block mt-0.5">{pt.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category-Driven Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-subtle space-y-5">

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* 1. MARKETPLACE VIEW (Buy & Sell, Giveaway, Exchange, Borrow)        */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {isMarketplacePost && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Category *</label>
                <select
                  value={marketplaceCatId}
                  required
                  onChange={(e) => setMarketplaceCatId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs cursor-pointer font-medium"
                >
                  <option value="">-- Select Category --</option>
                  {relevantCategories.map((c) => (
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
                    min="1"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="₹ e.g. 2500"
                    className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs font-bold"
                  />
                </div>
              ) : postType === 'giveaway' ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Price</label>
                  <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-extrabold text-xs">
                    🎁 FREE GIVEAWAY
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Deal Type</label>
                  <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-semibold text-xs">
                    {postType === 'borrow' ? 'Borrow Request' : 'Exchange / Barter'}
                  </div>
                </div>
              )}
            </div>

            {/* Condition & Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Condition *</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs cursor-pointer"
                >
                  <option value="new">Brand New</option>
                  <option value="like_new">Like New</option>
                  <option value="good">Good Condition</option>
                  <option value="used">Used / Fair</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Availability *</label>
                <select
                  value={marketplaceStatus}
                  onChange={(e) => setMarketplaceStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs cursor-pointer font-medium"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold / Taken</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* 2. ROOMMATE & ACCOMMODATION VIEW                                    */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {postType === 'roommate' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Looking For */}
            <div>
              <label className="block font-semibold text-slate-700 mb-2">Looking For *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRoommateLookingFor('roommate_needed')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    roommateLookingFor === 'roommate_needed'
                      ? 'border-brand-500 bg-brand-50/50 text-brand-900 ring-2 ring-brand-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-brand-600" />
                    <span>Roommate Needed</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">I have a room and need a roommate</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRoommateLookingFor('seeking_room')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    roommateLookingFor === 'seeking_room'
                      ? 'border-brand-500 bg-brand-50/50 text-brand-900 ring-2 ring-brand-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-brand-600" />
                    <span>Seeking Room / Accommodation</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">I am looking to join or find a room</div>
                </button>
              </div>
            </div>

            {/* Accommodation Type & Location Preference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Accommodation Type *</label>
                <select
                  value={roommateAccommodation}
                  onChange={(e: any) => setRoommateAccommodation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs cursor-pointer font-medium"
                >
                  <option value="double">Double Sharing Room</option>
                  <option value="single">Single Room</option>
                  <option value="triple">Triple Sharing Room</option>
                  <option value="any">Any / Flexible Sharing</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Location Preference *</label>
                <select
                  value={roommateLocationPref}
                  onChange={(e) => setRoommateLocationPref(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs cursor-pointer font-medium"
                >
                  <option value="Same Hostel as me">Same Hostel as my registered profile</option>
                  <option value="Any Campus Hostel">Open to any Campus Hostel</option>
                  <option value="Nearby Off-Campus PG">Nearby Off-Campus / PG</option>
                </select>
              </div>
            </div>

            {/* Lifestyle Preference Chips */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Lifestyle / Habit Preferences</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {LIFESTYLE_OPTIONS.map((opt) => {
                  const isChecked = roommateLifestyles.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleLifestyle(opt)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        isChecked
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* 3. LOST ITEM VIEW                                                   */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {postType === 'lost' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Item Name *</label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={lostItemName}
                  onChange={(e) => setLostItemName(e.target.value)}
                  placeholder="e.g. Boat Rockerz 450 Black Headphones"
                  className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Item Category</label>
                <select
                  value={lostCategory}
                  onChange={(e) => setLostCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs cursor-pointer"
                >
                  <option value="">-- Select Category --</option>
                  {relevantCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1.5">Location Lost / Last Seen *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    required
                    value={lostLocation}
                    onChange={(e) => setLostLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs font-medium cursor-pointer"
                  >
                    <option value="">-- Select Campus Location --</option>
                    {CAMPUS_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Date Lost *</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={lostDate}
                    onChange={(e) => setLostDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Current Status</label>
              <select
                value={lostStatus}
                onChange={(e: any) => setLostStatus(e.target.value)}
                className="w-full sm:w-1/2 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs cursor-pointer"
              >
                <option value="available">Still Missing / Searching</option>
                <option value="closed">Found / Resolved</option>
              </select>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* 4. FOUND ITEM VIEW                                                  */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {postType === 'found' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Found Item Name *</label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={foundItemName}
                  onChange={(e) => setFoundItemName(e.target.value)}
                  placeholder="e.g. Set of Keys with Blue Tag"
                  className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Item Category</label>
                <select
                  value={foundCategory}
                  onChange={(e) => setFoundCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs cursor-pointer"
                >
                  <option value="">-- Select Category --</option>
                  {relevantCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Location Found *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    required
                    value={foundLocation}
                    onChange={(e) => setFoundLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs font-medium cursor-pointer"
                  >
                    <option value="">-- Select Campus Location --</option>
                    {CAMPUS_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Date Found *</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={foundDate}
                    onChange={(e) => setFoundDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Safe Handover / Claim Location */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Safe Handover / Where to Claim *</label>
              <select
                value={foundHandover}
                onChange={(e) => setFoundHandover(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs cursor-pointer font-medium"
              >
                <option value="Deposited with Hostel Caretaker / Warden Office">Deposited with Hostel Caretaker / Warden Office</option>
                <option value="Deposited at Main Security Gate">Deposited at Main Security Gate</option>
                <option value="Kept with Me (Connect via private chat to verify ownership)">Kept with Me (Connect via private chat to verify ownership)</option>
              </select>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* 5. GENERAL TALKIES VIEW                                             */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {postType === 'general' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1.5">Subject / Title *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={generalTitle}
                  onChange={(e) => setGeneralTitle(e.target.value)}
                  placeholder="e.g. Volleyball court evening schedule update"
                  className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Topic / Category</label>
                <select
                  value={generalCatId}
                  onChange={(e) => setGeneralCatId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none text-xs cursor-pointer"
                >
                  <option value="">-- Select Topic --</option>
                  {relevantCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-semibold text-slate-700">Discussion Message *</label>
                <span className={`text-[11px] ${generalContent.length > 500 ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
                  {generalContent.length} / 500
                </span>
              </div>
              <textarea
                rows={4}
                required
                maxLength={500}
                value={generalContent}
                onChange={(e) => setGeneralContent(e.target.value)}
                placeholder="Write your community query, discussion, or announcement..."
                className="w-full p-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-2xl text-slate-900 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all outline-none resize-none text-xs leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Submit button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs hover:shadow-badge transition-all active:scale-95 disabled:opacity-50 text-xs btn-3d-brand cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isSubmitting ? 'Publishing...' : 'Publish Post'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
