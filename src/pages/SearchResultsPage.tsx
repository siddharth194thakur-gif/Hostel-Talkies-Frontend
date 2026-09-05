import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, BellRing, Calendar, Wrench, GraduationCap, Users, ArrowRight, Building, MessageSquare, Loader2, Gamepad2 } from 'lucide-react';
import api, { getMediaUrl } from '../api/client';
import { LoadingSkeleton, EmptyState } from '../components/LoadingSkeleton';
import { BackButton } from '../components/BackButton';
import { GenderIcon } from '../components/GenderIcon';
import { useAuth } from '../context/AuthContext';

interface SearchResultsResponse {
  query: string;
  count?: number;
  people: any[];
  posts: Array<{ id: number; title: string; post_type: string; price: string | null; created_at: string }>;
  notices: Array<{ id: number; title: string; priority: string; publish_date: string }>;
  events: Array<{ id: number; title: string; event_date: string; location: string }>;
  services: Array<{ id: number; name: string; category: string; location: string }>;
  study_resources: Array<{ id: number; title: string; resource_type: string; course_name: string }>;
  competitions?: Array<{ id: number; title: string; name: string; game: string; competition_type: string; start_datetime: string; status: string }>;
}

export const SearchResultsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState<SearchResultsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [startingChatUserId, setStartingChatUserId] = useState<number | null>(null);

  const handleStartChat = async (recipientId: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (startingChatUserId) return;
    setStartingChatUserId(recipientId);
    try {
      const res = await api.post('/messages/start/', {
        recipient_id: recipientId,
      });
      if (res.data?.id) {
        navigate(`/messages/${res.data.id}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Could not start conversation with this user.');
    } finally {
      setStartingChatUserId(null);
    }
  };

  const executeSearch = async () => {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      setResults(null);
      setApiError(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await api.get(`/search/?q=${encodeURIComponent(cleanQuery)}`);
      setResults(res.data);
    } catch (err: any) {
      console.error('Search request failed:', err);
      setApiError(
        err.response?.data?.detail ||
        err.message ||
        'Failed to connect to search service. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [query]);

  const totalResults =
    results?.count !== undefined
      ? results.count
      : (results?.people?.length || 0) +
        (results?.posts?.length || 0) +
        (results?.notices?.length || 0) +
        (results?.events?.length || 0) +
        (results?.services?.length || 0) +
        (results?.study_resources?.length || 0) +
        (results?.competitions?.length || 0);

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
      ) : apiError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-base font-bold">
            ⚠️
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Unable to load search results</h3>
          <p className="text-xs text-rose-600 max-w-md mx-auto">{apiError}</p>
          <button
            type="button"
            onClick={() => executeSearch()}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs transition cursor-pointer shadow-xs"
          >
            Try Again
          </button>
        </div>
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
                {results.people.map((person: any) => {
                  const isMe = currentUser?.id === person.id;
                  const isStartingThis = startingChatUserId === person.id;

                  return (
                    <div
                      key={`person-${person.id}`}
                      className="p-3.5 bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-brand-200 rounded-2xl flex flex-col justify-between gap-3 transition-all duration-150 shadow-2xs hover:shadow-xs group"
                    >
                      <Link
                        to={`/profile/${person.id}`}
                        className="flex items-start gap-3 min-w-0"
                        title={`View ${person.full_name || person.username}'s profile`}
                      >
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0 overflow-hidden border border-slate-200 shadow-xs">
                          {(person.profile?.avatar || person.profile_picture) ? (
                            <img
                              src={getMediaUrl((person.profile?.avatar || person.profile_picture)!)}
                              alt={person.full_name || person.username}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span>{person.first_name?.charAt(0) || person.full_name?.charAt(0) || person.username?.charAt(0) || 'U'}</span>
                          )}
                        </div>
                        <div className="min-w-0 space-y-1 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition truncate text-xs">
                              {person.full_name || person.username}
                            </h4>
                            {person.profile?.gender && (
                              <GenderIcon gender={person.profile.gender} className="w-3 h-3 text-slate-400" />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-medium text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded font-mono">
                              @{person.username}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              ID: #{person.id}
                            </span>
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
                      </Link>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <Link
                          to={`/profile/${person.id}`}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-lg transition"
                        >
                          Profile
                        </Link>
                        {isMe ? (
                          <span className="text-[11px] font-semibold text-slate-400 px-2.5 py-1 bg-slate-100/60 rounded-lg">
                            You
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleStartChat(person.id, e)}
                            disabled={isStartingThis}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 text-white text-[11px] font-semibold rounded-lg shadow-2xs transition cursor-pointer"
                          >
                            {isStartingThis ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <MessageSquare className="w-3 h-3" />
                            )}
                            <span>Message</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
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

          {/* Gaming Hub Competitions */}
          {results.competitions && results.competitions.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Gamepad2 className="w-4 h-4 text-violet-600" />
                <h3 className="font-bold text-slate-900 text-sm">Gaming Hub Competitions ({results.competitions.length})</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {results.competitions.map((c) => (
                  <Link
                    key={c.id}
                    to="/gaming"
                    className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{c.name || c.title}</div>
                      <div className="text-[11px] text-slate-500 capitalize">{c.game} • {c.competition_type}</div>
                    </div>
                    <span className="text-[10px] font-semibold text-violet-600 uppercase bg-violet-50 px-2 py-0.5 rounded-md">
                      {c.status}
                    </span>
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
