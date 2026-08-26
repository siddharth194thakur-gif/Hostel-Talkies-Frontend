import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  GraduationCap,
  Plus,
  Compass,
  User,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-card lg:hidden pb-[env(safe-area-inset-bottom)] transition-all"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {/* 1. Home */}
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-colors duration-150 relative ${
              isActive || pathname === '/home'
                ? 'text-brand-600 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Home className={`w-5 h-5 transition-transform ${isActive || pathname === '/home' ? 'scale-110 text-brand-600' : 'text-slate-500'}`} />
              <span className="text-[10px] tracking-tight mt-1">Home</span>
              {(isActive || pathname === '/home') && (
                <span className="w-1 h-1 rounded-full bg-brand-600 absolute top-0.5" />
              )}
            </>
          )}
        </NavLink>

        {/* 2. Study Resources */}
        <NavLink
          to="/study"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-colors duration-150 relative ${
              isActive || pathname.startsWith('/study')
                ? 'text-brand-600 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <GraduationCap className={`w-5 h-5 transition-transform ${isActive || pathname.startsWith('/study') ? 'scale-110 text-brand-600' : 'text-slate-500'}`} />
              <span className="text-[10px] tracking-tight mt-1">Study</span>
              {(isActive || pathname.startsWith('/study')) && (
                <span className="w-1 h-1 rounded-full bg-brand-600 absolute top-0.5" />
              )}
            </>
          )}
        </NavLink>

        {/* 3. Center Create Post Button */}
        <NavLink
          to="/create-post"
          className="flex flex-col items-center justify-center -mt-5 flex-1 group"
          aria-label="Create New Post"
        >
          {({ isActive }) => (
            <>
              <div
                className={`w-11 h-11 rounded-full bg-gradient-to-tr from-brand-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-brand-500/30 border-2 border-white transition-all duration-200 group-active:scale-95 ${
                  isActive ? 'ring-2 ring-brand-500 ring-offset-2' : 'group-hover:scale-105'
                }`}
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-brand-600 font-bold' : 'text-slate-600 font-semibold'
                }`}
              >
                Post
              </span>
            </>
          )}
        </NavLink>

        {/* 4. Explore Feed */}
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-colors duration-150 relative ${
              isActive || pathname.startsWith('/explore')
                ? 'text-brand-600 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Compass className={`w-5 h-5 transition-transform ${isActive || pathname.startsWith('/explore') ? 'scale-110 text-brand-600' : 'text-slate-500'}`} />
              <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Explore Feed</span>
              {(isActive || pathname.startsWith('/explore')) && (
                <span className="w-1 h-1 rounded-full bg-brand-600 absolute top-0.5" />
              )}
            </>
          )}
        </NavLink>

        {/* 5. Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-colors duration-150 relative ${
              isActive || pathname.startsWith('/profile')
                ? 'text-brand-600 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <User className={`w-5 h-5 transition-transform ${isActive || pathname.startsWith('/profile') ? 'scale-110 text-brand-600' : 'text-slate-500'}`} />
              <span className="text-[10px] tracking-tight mt-1">Profile</span>
              {(isActive || pathname.startsWith('/profile')) && (
                <span className="w-1 h-1 rounded-full bg-brand-600 absolute top-0.5" />
              )}
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
};
