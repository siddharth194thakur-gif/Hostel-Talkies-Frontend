import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Search,
  Building,
  Sparkles,
  Trophy,
  Music,
  Flame,
  X,
  Users,
  MapPin,
} from 'lucide-react';
import api from '../api/client';
import { Event, Hostel } from '../types';
import { EventCard } from '../components/EventCard';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const res = await api.get<{ results: Hostel[] } | Hostel[]>('/hostels/');
        const data = res.data as any;
        const list: Hostel[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];
        setHostels(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHostels();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedHostel) params.append('hostel', selectedHostel);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get<{ results: Event[] } | Event[]>(`/events/?${params.toString()}`);
      let list = Array.isArray(res.data) ? res.data : res.data.results || [];

      // Filter by category keywords if selected
      if (selectedCategory) {
        list = list.filter((e) => {
          const t = (e.title + ' ' + e.description).toLowerCase();
          if (selectedCategory === 'sports') return t.includes('cricket') || t.includes('football') || t.includes('badminton') || t.includes('tournament') || t.includes('league') || t.includes('sport');
          if (selectedCategory === 'cultural') return t.includes('music') || t.includes('dj') || t.includes('night') || t.includes('fest') || t.includes('dance') || t.includes('cultural') || t.includes('open mic');
          if (selectedCategory === 'tech') return t.includes('hackathon') || t.includes('code') || t.includes('tech') || t.includes('workshop') || t.includes('ai');
          return true;
        });
      }

      setEvents(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedHostel, selectedCategory, searchQuery]);

  const categories = [
    { id: '', label: 'All Gatherings', icon: Sparkles },
    { id: 'sports', label: 'Sports Leagues', icon: Trophy },
    { id: 'cultural', label: 'Cultural & DJ Nights', icon: Music },
    { id: 'tech', label: 'Tech & Hackathons', icon: Flame },
  ];

  return (
    <div className="space-y-6 text-xs">
      {/* Campus Events Festival Hero Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden shadow-xl border border-slate-800 animate-fade-in">
        <div className="absolute -right-12 -top-12 w-52 h-52 bg-rose-500/20 rounded-full blur-3xl pointer-events-none animate-ambient-float" />
        <div className="absolute right-36 bottom-0 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none animate-glow-pulse" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-brand-500/20 text-brand-300 rounded-full border border-brand-400/30 backdrop-blur-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Campus Life &amp; Tournaments</span>
              </span>
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 rounded-full border border-rose-400/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-400" />
                <span>Live Gatherings</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Hostel Events &amp; Gatherings
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Explore upcoming intra-hostel sports leagues, cultural celebrations, acoustic open mics, and student gatherings happening across campus.
            </p>
          </div>

          {/* Quick Stats Pill Cards */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[90px]">
              <span className="block text-xl font-black text-white">{events.length}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Events Live
              </span>
            </div>
            <div className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center min-w-[90px]">
              <span className="block text-xl font-black text-amber-300">{hostels.length}</span>
              <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Hostels
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Hostel + Category Filters */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tournaments, LAN nights, sports fests..."
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

          {/* Hostel Filter Dropdown */}
          <div className="w-full sm:w-60 shrink-0">
            <select
              value={selectedHostel}
              onChange={(e) => setSelectedHostel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none transition cursor-pointer"
            >
              <option value="">🏛️ All Campus Hostels</option>
              {hostels.map((h) => (
                <option key={h.id} value={String(h.id)}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-slate-100">
          {categories.map((c) => {
            const Icon = c.icon;
            const isActive = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
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

          {(selectedCategory || selectedHostel || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('');
                setSelectedHostel('');
                setSearchQuery('');
              }}
              className="ml-auto text-[11px] font-bold text-brand-600 hover:text-brand-700 underline shrink-0 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Events Feed Grid */}
      {isLoading ? (
        <LoadingSkeleton count={6} />
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No upcoming events scheduled"
          message="No tournaments or gatherings match your selected criteria. Check back soon for announcements!"
        />
      )}
    </div>
  );
};

