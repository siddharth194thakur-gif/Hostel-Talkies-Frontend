import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, ShoppingBag, BellRing, Calendar, Wrench, GraduationCap, Users, ArrowRight, Building } from 'lucide-react';
import api, { getMediaUrl } from '../api/client';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';
import { BackButton } from '../components/BackButton';
import { GenderIcon } from '../components/GenderIcon';

interface SearchResultsResponse {
  query: string;
  people: any[];
  posts: Array<{ id: number; title: string; post_type: string; price: string | null; created_at: string }>;
  notices: Array<{ id: number; title: string; priority: string; publish_date: string }>;
  events: Array<{ id: number; title: string; event_date: string; location: string }>;
  services: Array<{ id: number; name: string; category: string; location: string }>;
  study_resources: Array<{ id: number; title: string; resource_type: string; course_name: string }>;
}

export const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<SearchResultsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const executeSearch = async () => {
      if (!query.trim()) {
        setResults(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await api.get(`/search/?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    executeSearch();
  }, [query]);

  const totalResults =
    (results?.people?.length || 0) +
    (results?.posts?.length || 0) +
    (results?.notices?.length || 0) +
    (results?.events?.length || 0) +
    (results?.services?.length || 0) +
    (results?.study_resources?.length || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-xs">
      <div>
        <BackButton fallback="/home" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Search Results for "{query}"
        </h1>
        <p className="text-xs text-slate-500">
          Found {totalResults} matching results across all categories
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : results && totalResults > 0 ? (
        <div className="space-y-6">
          {/* People & Student Profiles */}
          {results.people && results.people.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Users className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">People ({results.people.length})</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {results.people.map((person: any) => (
                  <Link
                    key={`person-${person.id}`}
                    to={`/profile/${person.id}`}
                    className="p-3.5 bg-slate-50/70 hover:bg-brand-50/50 active:bg-brand-100/60 border border-slate-100 hover:border-brand-200/60 rounded-2xl flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer active:scale-[0.98] group select-none hover:shadow-xs"
                    title={`View ${person.full_name || person.username}'s profile`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0 overflow-hidden border border-slate-200 shadow-xs">
                        {(person.profile?.avatar || person.profile_picture) ? (
                          <img
                            src={getMediaUrl((person.profile?.avatar || person.profile_picture)!)}
                            alt={person.full_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span>{person.first_name?.charAt(0) || person.full_name?.charAt(0) || 'U'}</span>
                        )}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition truncate text-xs">
                            {person.full_name || person.username}
                          </h4>
                          {person.profile?.gender && (
                            <GenderIcon gender={person.profile.gender} className="w-3 h-3 text-slate-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {person.profile?.hostel_name || 'Hostel Resident'} {person.profile?.block_name ? `• ${person.profile.block_name}` : ''}
                        </p>
                        {person.profile?.programme && (
                          <p className="text-[10px] text-brand-600 font-semibold truncate">
                            {person.profile.programme} {person.profile.branch ? `- ${person.profile.branch}` : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition shrink-0 bg-brand-50 px-2 py-0.5 rounded-lg">
                      Profile →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Posts & Marketplace */}
          {results.posts && results.posts.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <ShoppingBag className="w-4 h-4 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-sm">Posts & Marketplace ({results.posts.length})</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {results.posts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/posts/${p.id}`}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{p.title}</div>
                      <div className="text-[11px] text-slate-500 capitalize">{p.post_type.replace('_', ' ')}</div>
                    </div>
                    {p.price && <span className="font-bold text-brand-600">₹{p.price}</span>}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Notices */}
          {results.notices && results.notices.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <BellRing className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">Official Notices ({results.notices.length})</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {results.notices.map((n) => (
                  <Link
                    key={n.id}
                    to="/notices"
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition"
                  >
                    <span className="font-semibold text-slate-900">{n.title}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {n.priority}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Study Resources */}
          {results.study_resources && results.study_resources.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Study Resources ({results.study_resources.length})</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {results.study_resources.map((s) => (
                  <Link
                    key={s.id}
                    to="/study"
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{s.title}</div>
                      <div className="text-[11px] text-slate-500">{s.course_name}</div>
                    </div>
                    <span className="text-[10px] font-medium text-brand-600 uppercase">{s.resource_type}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Events */}
          {results.events && results.events.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">Events ({results.events.length})</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {results.events.map((e) => (
                  <Link
                    key={e.id}
                    to="/events"
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition"
                  >
                    <span className="font-semibold text-slate-900">{e.title}</span>
                    <span className="text-slate-500">{e.event_date}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {results.services && results.services.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Wrench className="w-4 h-4 text-cyan-600" />
                <h3 className="font-bold text-slate-900 text-sm">Services ({results.services.length})</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {results.services.map((srv) => (
                  <Link
                    key={srv.id}
                    to="/services"
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{srv.name}</div>
                      <div className="text-[11px] text-slate-500">{srv.location}</div>
                    </div>
                    <span className="text-[10px] font-semibold text-brand-600 uppercase">{srv.category}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (

        <EmptyState
          title="No results found"
          message={`We couldn't find any matches for "${query}". Try searching for keywords like cycle, calculator, notes, or laundry.`}
        />
      )}
    </div>
  );
};
