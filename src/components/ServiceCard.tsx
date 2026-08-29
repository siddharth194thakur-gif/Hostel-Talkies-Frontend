import React, { useState } from 'react';
import {
  Phone,
  Clock,
  MapPin,
  Building,
  Wrench,
  Scissors,
  Printer,
  Sparkles,
  Zap,
  Check,
  Share2,
  PhoneCall,
  User,
} from 'lucide-react';
import { HostelService } from '../types';

interface ServiceCardProps {
  service: HostelService;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const [copied, setCopied] = useState(false);

  const getServiceTheme = () => {
    switch (service.category) {
      case 'laundry':
        return {
          icon: Sparkles,
          iconBg: 'from-cyan-500 to-blue-600',
          badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
          label: 'LAUNDRY & IRONING',
        };
      case 'printing':
        return {
          icon: Printer,
          iconBg: 'from-indigo-500 to-purple-600',
          badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
          label: 'PRINTING & XEROX',
        };
      case 'repair':
        return {
          icon: Zap,
          iconBg: 'from-amber-500 to-orange-600',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/80',
          label: 'REPAIRS & ELECTRICAL',
        };
      case 'barber':
      case 'tailor':
        return {
          icon: Scissors,
          iconBg: 'from-rose-500 to-pink-600',
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200/80',
          label: service.category_display ? service.category_display.toUpperCase() : 'SALON & TAILOR',
        };
      default:
        return {
          icon: Wrench,
          iconBg: 'from-brand-600 to-indigo-700',
          badgeBg: 'bg-brand-50 text-brand-700 border-brand-200/80',
          label: service.category_display ? service.category_display.toUpperCase() : 'HOSTEL SERVICE',
        };
    }
  };

  const theme = getServiceTheme();
  const Icon = theme.icon;

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const shareText = `🛠️ [Hostel Service] ${service.name}\n📍 Location: ${service.location}\n⏰ Timings: ${service.timings}\n📞 Phone: ${service.phone_number || 'N/A'}\n\nAvailable on HostelTalkies!`;
    if (navigator.share) {
      navigator.share({
        title: service.name,
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="bg-white rounded-3xl border border-slate-200/80 card-3d-luxury p-5 sm:p-6 flex flex-col justify-between space-y-4 group animate-fade-in-up">
      <div className="space-y-3.5">
        {/* Header: Icon + Category Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${theme.iconBg} text-white flex items-center justify-center shadow-md shadow-slate-200 shrink-0 group-hover:scale-105 transition-transform duration-300`}
            >
              <Icon className="w-5 h-5" />
            </div>

            <div>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider border uppercase ${theme.badgeBg}`}
              >
                {theme.label}
              </span>
              <h3 className="text-base font-black text-slate-900 group-hover:text-brand-600 transition-colors leading-snug mt-0.5">
                {service.name}
              </h3>
            </div>
          </div>
        </div>

        {service.description && (
          <p className="text-xs text-slate-500 leading-relaxed bg-slate-50/70 p-3 rounded-2xl border border-slate-100/90 font-normal">
            {service.description}
          </p>
        )}

        {/* Details Matrix */}
        <div className="space-y-2 pt-1 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="truncate font-bold">{service.location}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{service.timings}</span>
          </div>

          {service.contact_person && (
            <div className="flex items-center gap-2 text-slate-500">
              <User className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Contact: <strong className="text-slate-700">{service.contact_person}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
        {service.phone_number ? (
          <a
            href={`tel:${service.phone_number}`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-black rounded-2xl transition shadow-xs hover:shadow-badge active:scale-95 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call: {service.phone_number}</span>
          </a>
        ) : (
          <div className="flex-1 py-2.5 bg-slate-100 text-slate-400 text-center text-xs font-bold rounded-2xl">
            In-Person Only
          </div>
        )}

        <button
          type="button"
          onClick={handleShare}
          className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80 rounded-2xl transition active:scale-95 cursor-pointer shadow-2xs"
          title="Share Contact"
          aria-label="Share Contact"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Share2 className="w-4 h-4 text-slate-500" />
          )}
        </button>
      </div>
    </article>
  );
};

