import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Search,
  Building,
  Sparkles,
  Printer,
  Scissors,
  Zap,
  PhoneCall,
  X,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import api from '../api/client';
import { HostelService } from '../types';
import { ServiceCard } from '../components/ServiceCard';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<HostelService[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get<{ results: HostelService[] } | HostelService[]>(`/services/?${params.toString()}`);
      setServices(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const serviceCategories = [
    { value: '', label: 'All Services', icon: Wrench },
    { value: 'laundry', label: 'Laundry & Ironing', icon: Sparkles },
    { value: 'printing', label: 'Printing & Xerox', icon: Printer },
    { value: 'repair', label: 'Repairs & Electrical', icon: Zap },
    { value: 'barber', label: 'Barber & Salon', icon: Scissors },
    { value: 'tailor', label: 'Tailoring', icon: Scissors },
    { value: 'cleaning', label: 'Cleaning & Housekeeping', icon: Layers },
  ];

  return (
    <div className="space-y-6 text-xs">
      {/* Luxury Services Directory Hero Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden shadow-xl border border-slate-800 animate-fade-in">
        <div className="absolute -right-12 -top-12 w-52 h-52 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-ambient-float" />
        <div className="absolute right-36 bottom-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none animate-glow-pulse" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-400/30 backdrop-blur-xs flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hostel Utilities &amp; Vendors</span>
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/10 text-slate-300 rounded-full border border-white/10 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Campus Approved</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Hostel Services Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Official contact numbers and operating timings for campus laundry, xerox printing, electricians, plumbers, barbers, and housekeeping vendors.
            </p>
          </div>

          {/* Quick Stats Pill Cards */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[90px]">
              <span className="block text-xl font-black text-white">{services.length}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Vendors
              </span>
            </div>
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[90px]">
              <span className="block text-xl font-black text-cyan-300">24/7</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Support
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Category Chips */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-subtle space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search laundry, xerox printing, electrician, plumber..."
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

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-slate-100">
          {serviceCategories.map((c) => {
            const Icon = c.icon;
            const isActive = selectedCategory === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setSelectedCategory(c.value)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}

          {(selectedCategory || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('');
                setSearchQuery('');
              }}
              className="ml-auto text-[11px] font-bold text-brand-600 hover:text-brand-700 underline shrink-0 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <LoadingSkeleton count={6} />
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No services found"
          message="No active vendors found matching your search or category filter."
        />
      )}
    </div>
  );
};

