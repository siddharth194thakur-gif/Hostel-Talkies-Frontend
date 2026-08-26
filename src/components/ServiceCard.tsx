import React from 'react';
import { Phone, Clock, MapPin, Building, Wrench, Scissors, Printer, Sparkles } from 'lucide-react';
import { HostelService } from '../types';

interface ServiceCardProps {
  service: HostelService;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const getServiceIcon = () => {
    switch (service.category) {
      case 'laundry':
        return <Sparkles className="w-5 h-5 text-cyan-600" />;
      case 'printing':
        return <Printer className="w-5 h-5 text-indigo-600" />;
      case 'repair':
        return <Wrench className="w-5 h-5 text-amber-600" />;
      case 'barber':
      case 'tailor':
        return <Scissors className="w-5 h-5 text-rose-600" />;
      default:
        return <Wrench className="w-5 h-5 text-brand-600" />;
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              {getServiceIcon()}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{service.name}</h3>
              <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
                {service.category_display}
              </span>
            </div>
          </div>
        </div>

        {service.description && (
          <p className="text-xs text-slate-600 leading-relaxed">{service.description}</p>
        )}

        <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{service.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{service.timings}</span>
          </div>

          {service.contact_person && (
            <div className="text-slate-600 font-medium">
              Contact: {service.contact_person}
            </div>
          )}
        </div>
      </div>

      {service.phone_number && (
        <a
          href={`tel:${service.phone_number}`}
          className="flex items-center justify-center gap-2 w-full py-2 bg-slate-100 hover:bg-brand-50 text-slate-800 hover:text-brand-600 text-xs font-semibold rounded-xl transition border border-slate-200/60"
        >
          <Phone className="w-3.5 h-3.5 text-brand-600" />
          <span>Call: {service.phone_number}</span>
        </a>
      )}
    </article>
  );
};
