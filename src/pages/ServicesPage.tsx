import React, { useState, useEffect } from 'react';
import { Wrench, Search, Building } from 'lucide-react';
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
    fetchServices();
  }, [selectedCategory]);

  const serviceCategories = [
    { value: '', label: 'All Services' },
    { value: 'laundry', label: 'Laundry & Ironing' },
    { value: 'printing', label: 'Printing & Xerox' },
    { value: 'repair', label: 'Repairs & Electrical' },
    { value: 'barber', label: 'Barber & Salon' },
    { value: 'tailor', label: 'Tailoring' },
    { value: 'cleaning', label: 'Cleaning' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hostel Services Directory</h1>
          <p className="text-xs text-slate-500">Official contact directory for campus and hostel utility vendors</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchServices();
          }}
          className="relative w-full sm:w-64"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search laundry, xerox..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-brand-500 outline-none shadow-2xs"
          />
        </form>
      </div>

      {/* Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {serviceCategories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3.5 py-2 rounded-xl font-semibold shrink-0 transition ${
              selectedCategory === cat.value
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
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
          message="No active vendors found matching your filter criteria."
        />
      )}
    </div>
  );
};
