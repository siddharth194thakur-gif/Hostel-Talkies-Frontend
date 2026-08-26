import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Search, Building } from 'lucide-react';
import api from '../api/client';
import { Event, Hostel } from '../types';
import { EventCard } from '../components/EventCard';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostel, setSelectedHostel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const res = await api.get<{ results: Hostel[] } | Hostel[]>('/hostels/');
        setHostels(Array.isArray(res.data) ? res.data : res.data.results || []);
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
      setEvents(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedHostel]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Hostel Events & Gatherings</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Esports LAN nights, cultural evenings, open mics, and sports leagues</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchEvents();
          }}
          className="relative w-full sm:w-64"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-900 focus:border-brand-500 focus:ring-3 focus:ring-brand-50 outline-none shadow-subtle placeholder:text-slate-400"
          />
        </form>
      </div>

      {/* Hostel Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setSelectedHostel('')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold shrink-0 transition-all ${
            selectedHostel === ''
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300'
          }`}
        >
          All Hostels
        </button>
        {hostels.map((h) => (
          <button
            key={h.id}
            onClick={() => setSelectedHostel(String(h.id))}
            className={`px-3.5 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
              selectedHostel === String(h.id)
                ? 'bg-brand-600 text-white shadow-xs font-semibold'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300'
            }`}
          >
            {h.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <LoadingSkeleton count={4} />
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No upcoming events scheduled"
          message="Check back soon or ask your hostel cultural committee about upcoming tournaments!"
        />
      )}
    </div>
  );
};
