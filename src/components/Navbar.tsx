import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  MessageSquare,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api, { getMediaUrl } from '../api/client';
import { GenderIcon } from './GenderIcon';

interface NavbarProps {
  onToggleSidebar?: () => void;
  showSearch?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, showSearch }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { notifications, unreadCount, unreadMessagesCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowSearchDropdown(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(target)) {
        // Only close if not interacting with mobile search
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search preview
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/search/?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchResults(res.data);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      setShowMobileSearch(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getBrandHome = () => {
    if (isAuthenticated) return '/dashboard';
    return '/';
  };

  const handleQuickMessage = async (recipientId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowSearchDropdown(false);
    setShowMobileSearch(false);
    try {
      const res = await api.post('/messages/start/', { recipient_id: recipientId });
      if (res.data?.id) {
        navigate(`/messages/${res.data.id}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Could not start conversation with this user.');
    }
  };

  const renderSearchDropdown = () => {
    if (!showSearchDropdown || !searchResults) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-elevated border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
        <div className="p-3 max-h-96 overflow-y-auto divide-y divide-slate-100/80">
          {/* People / User Profiles */}
          {searchResults.people?.length > 0 && (
            <div className="pb-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                People
              </div>
              {searchResults.people.map((person: any) => {
                const isMe = user?.id === person.id;
                return (
                  <div
                    key={`person-${person.id}`}
                    onMouseDown={(e) => {
                      // Prevent input blur before click finishes
                      e.preventDefault();
                    }}
                    onClick={() => {
                      setShowSearchDropdown(false);
                      setShowMobileSearch(false);
                      navigate(`/profile/${person.id}`);
                    }}
                    className="w-full text-left flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl hover:bg-brand-50/60 active:bg-brand-100/70 transition group cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden border border-slate-200 shadow-2xs">
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
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-xs text-slate-800 group-hover:text-brand-600 transition truncate block">
                          {person.full_name || person.username}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate block">
                          @{person.username} • ID: #{person.id}
                          {person.profile?.hostel_name ? ` • ${person.profile.hostel_name}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isMe && (
                        <button
                          type="button"
                          title={`Message @${person.username}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => handleQuickMessage(person.id, e)}
                          className="p-1.5 bg-white hover:bg-brand-600 text-slate-600 hover:text-white rounded-lg border border-slate-200 hover:border-brand-600 shadow-2xs transition cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span className="text-[10px] font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition shrink-0 bg-brand-50 px-2 py-0.5 rounded-md">
                        Profile →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {searchResults.posts?.length > 0 && (
            <div className="py-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                Community & Marketplace
              </div>
              {searchResults.posts.map((p: any) => (
                <button
                  key={`post-${p.id}`}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setShowSearchDropdown(false);
                    setShowMobileSearch(false);
                    navigate(`/posts/${p.id}`);
                  }}
                  onClick={() => {
                    setShowSearchDropdown(false);
                    setShowMobileSearch(false);
                    navigate(`/posts/${p.id}`);
                  }}
                  className="w-full text-left flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-brand-50/50 hover:text-brand-600 transition cursor-pointer active:scale-[0.98]"
                >
                  <span className="font-medium text-slate-800 truncate">{p.title}</span>
                  {p.price && (
                    <span className="text-xs font-bold text-brand-600 shrink-0 ml-2">₹{p.price}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {searchResults.notices?.length > 0 && (
            <div className="py-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                Official Notices
              </div>
              {searchResults.notices.map((n: any) => (
                <button
                  key={`notice-${n.id}`}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setShowSearchDropdown(false);
                    setShowMobileSearch(false);
                    navigate('/notices');
                  }}
                  onClick={() => {
                    setShowSearchDropdown(false);
                    setShowMobileSearch(false);
                    navigate('/notices');
                  }}
                  className="w-full text-left flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-brand-50/50 transition cursor-pointer active:scale-[0.98]"
                >
                  <span className="font-medium text-slate-800 truncate">{n.title}</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      n.priority === 'urgent'
                        ? 'bg-red-50 text-red-600 border border-red-100'
                        : 'bg-brand-50 text-brand-700 border border-brand-100'
                    }`}
                  >
                    {n.priority}
                  </span>
                </button>
              ))}
            </div>
          )}

          {searchResults.study_resources?.length > 0 && (
            <div className="py-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                Study Notes & PYQs
              </div>
              {searchResults.study_resources.map((s: any) => (
                <button
                  key={`study-${s.id}`}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setShowSearchDropdown(false);
                    setShowMobileSearch(false);
                    navigate('/study');
                  }}
                  onClick={() => {
                    setShowSearchDropdown(false);
                    setShowMobileSearch(false);
                    navigate('/study');
                  }}
                  className="w-full text-left flex items-center justify-between px-3 py-2 text-xs rounded-xl hover:bg-brand-50/50 transition cursor-pointer active:scale-[0.98]"
                >
                  <span className="font-medium text-slate-800 truncate">{s.title}</span>
                  <span className="text-[11px] text-slate-400">{s.course_name}</span>
                </button>
              ))}
            </div>
          )}

          {(!searchResults.people || searchResults.people.length === 0) &&
            (!searchResults.posts || searchResults.posts.length === 0) &&
            (!searchResults.notices || searchResults.notices.length === 0) &&
            (!searchResults.study_resources || searchResults.study_resources.length === 0) && (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching records found for "{searchQuery}".
              </div>
            )}


          <div className="pt-2">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowSearchDropdown(false);
                setShowMobileSearch(false);
                navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
              }}
              onClick={() => {
                setShowSearchDropdown(false);
                setShowMobileSearch(false);
                navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
              }}
              className="w-full block text-center text-xs font-semibold text-brand-600 hover:text-brand-700 py-1.5 hover:underline cursor-pointer"
            >
              View all results for "{searchQuery}" →
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <header className={`sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-subtle transition-all ${isAuthenticated ? 'lg:pl-64' : ''}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Left Brand & Mobile Menu Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {isAuthenticated && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Brand Logo & Name (visible on mobile/tablet; on desktop only when not authenticated) */}
            <Link
              to={getBrandHome()}
              className={`flex items-center gap-2 group shrink-0 ${
                isAuthenticated ? 'lg:hidden' : ''
              }`}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-xs group-hover:shadow-badge transition-all duration-200 group-hover:scale-[1.02] shrink-0">
                <span className="text-sm sm:text-base tracking-tighter">HT</span>
              </div>
              <div className="min-w-0">
                <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors whitespace-nowrap">
                  Hostel<span className="text-brand-600">Talkies</span>
                </span>
                {!isAuthenticated && (
                  <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide uppercase whitespace-nowrap">
                    Your Hostel • Your People
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Center Search Bar (Desktop & Tablet) */}
          {isAuthenticated && (showSearch ?? true) && (
            <div ref={searchRef} className="flex-1 max-w-xs md:max-w-md lg:max-w-lg relative hidden md:block mx-2">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchResults) setShowSearchDropdown(true);
                    }}
                    placeholder="Search posts, lost & found, notices, notes..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-medium rounded-full border border-slate-200/80 focus:border-brand-500 focus:ring-3 focus:ring-brand-50 transition-all duration-200 outline-none placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </form>

              {renderSearchDropdown()}
            </div>
          )}

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAuthenticated ? (
              <>
                {/* Mobile Search Toggle Button */}
                {(showSearch ?? true) && (
                  <button
                    type="button"
                    onClick={() => setShowMobileSearch(!showMobileSearch)}
                    className={`md:hidden p-2 rounded-full transition-colors ${
                      showMobileSearch ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    aria-label="Toggle mobile search"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                )}

                {/* Create Post Button - Desktop & Tablet */}
                <Link
                  to="/create-post"
                  className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl btn-3d-brand active:scale-95 whitespace-nowrap shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Post</span>
                </Link>

                {/* Messages Link with Badge */}
                <Link
                  to="/messages"
                  className="relative p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50/70 rounded-2xl transition-all duration-200 hover:scale-110 active:scale-95 group"
                  title="Messages"
                >
                  <MessageSquare className="w-5 h-5 transition-transform group-hover:-rotate-6" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-brand-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-badge border-2 border-white pointer-events-none animate-badge-pop">
                      {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                    </span>
                  )}
                </Link>

                {/* Notification Dropdown */}
                <div ref={notifRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="relative p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50/70 rounded-2xl transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none group cursor-pointer"
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-purple-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-badge border-2 border-white pointer-events-none animate-badge-pop">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifDropdown && (
                    <div className="absolute right-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-elevated border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-900">
                          Notifications ({unreadCount} unread)
                        </span>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllAsRead}
                            className="text-[11px] text-brand-600 hover:underline font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100/70">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 8).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markAsRead(n.id);
                                if (n.link) navigate(n.link);
                                setShowNotifDropdown(false);
                              }}
                              className={`p-3.5 text-xs hover:bg-slate-50 cursor-pointer transition flex gap-3 ${
                                !n.is_read ? 'bg-brand-50/30 font-medium' : ''
                              }`}
                            >
                              <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-slate-900 truncate">{n.title}</div>
                                <div className="text-slate-600 mt-0.5 line-clamp-2 text-[11px]">
                                  {n.message}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">
                                  {new Date(n.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet!
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setShowNotifDropdown(false)}
                          className="text-xs font-semibold text-brand-600 hover:underline"
                        >
                          View all notifications →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-slate-700 hover:text-brand-600 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-full shadow-xs hover:shadow-badge transition active:scale-95 whitespace-nowrap"
                >
                  Join
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Expandable Mobile Search Bar */}
        {isAuthenticated && (showSearch ?? true) && showMobileSearch && (
          <div ref={mobileSearchRef} className="md:hidden pb-3 pt-1 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-150 relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts, lost & found, notes..."
                className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-medium rounded-xl border border-slate-200/80 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-slate-800 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => {
                  setShowMobileSearch(false);
                  setSearchQuery('');
                }}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </form>

            {renderSearchDropdown()}
          </div>
        )}
      </div>
    </header>
  );
};
