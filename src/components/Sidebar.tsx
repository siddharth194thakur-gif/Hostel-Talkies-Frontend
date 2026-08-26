import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
  ShoppingBag,
  Search,
  Wrench,
  GraduationCap,
  Calendar,
  Compass,
  MessageSquare,
  Bookmark,
  User,
  PlusCircle,
  ShieldAlert,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { unreadMessagesCount } = useNotifications();
  const { user } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/home', label: 'Home', icon: Home },
    { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { to: '/lost-found', label: 'Lost & Found', icon: Search },
    { to: '/services', label: 'Hostel Services', icon: Wrench },
    { to: '/study', label: 'Study Resources', icon: GraduationCap },
    { to: '/events', label: 'Events', icon: Calendar },
    { to: '/explore', label: 'Explore Feed', icon: Compass },
    { to: '/messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
    { to: '/saved', label: 'Saved Posts', icon: Bookmark },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 transition-transform duration-200 ease-in-out lg:translate-x-0 overflow-y-auto flex flex-col justify-between p-4 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-4">
          {/* Top-Left Branding Logo + Name */}
          <Link
            to="/home"
            onClick={onClose}
            className="flex items-center gap-2.5 group px-1 py-1.5 shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-xs group-hover:shadow-badge transition-all duration-200 group-hover:scale-[1.02] shrink-0">
              <span className="text-base tracking-tighter">HT</span>
            </div>
            <div className="min-w-0">
              <span className="text-base font-bold text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors whitespace-nowrap block">
                Hostel<span className="text-brand-600">Talkies</span>
              </span>
              <span className="block text-[9px] text-slate-400 font-bold tracking-wider uppercase whitespace-nowrap">
                Your Hostel • Your People
              </span>
            </div>
          </Link>

          {/* Quick Action on Sidebar */}
          <NavLink
            to="/create-post"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl shadow-xs hover:shadow-badge transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Post</span>
          </NavLink>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-bold shadow-subtle'
                        : 'text-slate-600 hover:bg-brand-50/50 hover:text-slate-900 font-medium'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {typeof item.badge === 'number' && item.badge > 0 ? (
                        <span className="px-1.5 py-0.2 min-w-[18px] text-[10px] font-bold bg-brand-600 text-white rounded-full text-center shadow-xs">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      ) : null}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer / Community Tag */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          {(user?.is_staff || user?.is_hostel_admin) && (
            <a
              href="http://localhost:8000/admin/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3.5 py-2 bg-amber-50 text-amber-900 text-xs font-semibold rounded-xl hover:bg-amber-100 transition border border-amber-100/70"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Django Admin Portal ↗</span>
            </a>
          )}

          <div className="text-[10px] text-slate-400 text-center font-medium">
            HostelTalkies • 2026<br />
            <span className="text-slate-400/80">"Your Hostel. Your People. Your Talkies."</span>
          </div>
        </div>
      </aside>
    </>
  );
};
