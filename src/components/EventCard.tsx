import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  Users,
  Share2,
  Check,
  Sparkles,
  Trophy,
  Music,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { Event } from '../types';
import { getMediaUrl } from '../api/client';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const [copied, setCopied] = useState(false);

  const eventDate = new Date(event.event_date);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
  const weekday = eventDate.toLocaleDateString(undefined, { weekday: 'short' });

  // Check if event is today or tomorrow
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = eventDate.toDateString() === today.toDateString();

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const shareText = `🎉 [Hostel Event] ${event.title}\n📅 Date: ${weekday}, ${month} ${day}${event.event_time ? ` at ${event.event_time}` : ''}\n📍 Location: ${event.location}\nOrganized by: ${event.organizer}\n\nJoin on HostelTalkies!`;
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getEventGradient = () => {
    const titleLower = event.title.toLowerCase();
    if (titleLower.includes('cricket') || titleLower.includes('football') || titleLower.includes('badminton') || titleLower.includes('tournament') || titleLower.includes('league') || titleLower.includes('sport')) {
      return { gradient: 'from-amber-500 via-orange-600 to-red-600', icon: Trophy, tag: 'SPORTS LEAGUE' };
    }
    if (titleLower.includes('music') || titleLower.includes('dj') || titleLower.includes('night') || titleLower.includes('fest') || titleLower.includes('cultural') || titleLower.includes('open mic')) {
      return { gradient: 'from-rose-500 via-pink-600 to-purple-600', icon: Music, tag: 'CULTURAL FEST' };
    }
    return { gradient: 'from-brand-600 via-indigo-600 to-blue-700', icon: Sparkles, tag: 'CAMPUS EVENT' };
  };

  const eventTheme = getEventGradient();
  const EventTypeIcon = eventTheme.icon;

  return (
    <article className="bg-white rounded-3xl border border-slate-200/80 shadow-subtle hover:shadow-card-hover hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col justify-between group animate-fade-in-up">
      <div>
        {/* Banner Section */}
        {event.banner_image ? (
          <div className="aspect-video bg-slate-100 relative overflow-hidden">
            <img
              src={getMediaUrl(event.banner_image)}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Floating Date Badge on Image */}
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-white/40 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-black text-brand-600 uppercase tracking-widest">{month}</span>
              <span className="text-base font-black text-slate-900 leading-none">{day}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">{weekday}</span>
            </div>

            {/* Live / Status Pill */}
            {isToday ? (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md animate-pulse">
                <Flame className="w-3 h-3 fill-white" />
                <span>TODAY</span>
              </div>
            ) : (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/20">
                {eventTheme.tag}
              </div>
            )}
          </div>
        ) : (
          <div className={`h-32 bg-gradient-to-tr ${eventTheme.gradient} p-4 relative overflow-hidden flex items-end justify-between text-white`}>
            <div className="absolute -right-4 -top-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <span className="text-white/15 font-black text-6xl absolute -top-3 right-2 select-none tracking-tighter">
              LIVE
            </span>

            {/* Floating Date Badge on Gradient */}
            <div className="relative z-10 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-md flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-black text-brand-600 uppercase tracking-widest">{month}</span>
              <span className="text-base font-black text-slate-900 leading-none">{day}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">{weekday}</span>
            </div>

            {/* Top Right Tag */}
            <div className="relative z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider border border-white/20">
              <EventTypeIcon className="w-3 h-3" />
              <span>{eventTheme.tag}</span>
            </div>
          </div>
        )}

        {/* Card Content Body */}
        <div className="p-5 sm:p-6 space-y-3.5">
          <div>
            <h3 className="text-base font-black text-slate-900 group-hover:text-brand-600 transition-colors leading-snug line-clamp-2">
              {event.title}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-1">
              <Users className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span className="truncate">Organized by: <strong className="text-slate-700">{event.organizer}</strong></span>
            </div>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed bg-slate-50/70 p-3 rounded-2xl border border-slate-100/90 font-normal">
            {event.description}
          </p>

          {/* Event Details Matrix */}
          <div className="space-y-2 pt-1 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="truncate font-bold">{event.location}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
              {event.event_time && (
                <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{event.event_time}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
                <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{event.hostel_name || 'Campus Wide (All Hostels)'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Share Action */}
      <div className="px-5 sm:px-6 py-3.5 border-t border-slate-150 flex items-center justify-between gap-2 text-xs bg-slate-50/50">
        <span className="text-[11px] text-slate-400 font-medium">
          Free Entry for Students
        </span>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-brand-50 text-slate-700 hover:text-brand-600 border border-slate-200/80 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Share Event</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};
