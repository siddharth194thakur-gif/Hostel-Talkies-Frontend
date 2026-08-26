import React from 'react';
import { Calendar, Clock, MapPin, Building, Users } from 'lucide-react';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const eventDate = new Date(event.event_date);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString(undefined, { month: 'short' });

  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:shadow-card-hover hover:border-slate-300 transition-shadow duration-200 overflow-hidden flex flex-col justify-between group">
      <div>
        {event.banner_image ? (
          <div className="aspect-video bg-slate-50 relative overflow-hidden">
            <img
              src={event.banner_image}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="h-24 bg-gradient-to-r from-brand-600 to-purple-700 p-4 flex items-end relative overflow-hidden">
            <span className="text-white/10 font-black text-4xl absolute -top-1 right-2 select-none tracking-tight">EVENT</span>
            <span className="text-white font-semibold text-xs line-clamp-1">{event.organizer}</span>
          </div>
        )}

        <div className="p-4 sm:p-5 space-y-3">
          <div className="flex items-start gap-3">
            {/* Calendar Date Block */}
            <div className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-100 flex flex-col items-center justify-center shrink-0 text-center">
              <span className="text-[10px] font-bold text-brand-600 uppercase">{month}</span>
              <span className="text-sm font-extrabold text-brand-900 leading-none">{day}</span>
            </div>

            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug line-clamp-2">
                {event.title}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-0.5">
                <Users className="w-3 h-3 text-slate-400" />
                <span>{event.organizer}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">
            {event.description}
          </p>

          <div className="space-y-1 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>

            {event.event_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{event.event_time}</span>
              </div>
            )}

            {event.hostel_name && (
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{event.hostel_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
