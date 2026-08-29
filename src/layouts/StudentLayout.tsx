import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export const StudentLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isMessagesPage = location.pathname.startsWith('/messages');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading HostelTalkies...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If user account is blocked
  if (user?.is_blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-xl border border-rose-100">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Account Blocked</h2>
          <p className="text-sm text-slate-600">
            Your HostelTalkies account has been restricted by an administrator.
          </p>
          {user.block_reason && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl text-left">
              <strong>Reason:</strong> {user.block_reason}
            </div>
          )}
          <p className="text-xs text-slate-400">
            If you believe this is an error, please contact campus administration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-slate-50 ${isMessagesPage ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
      {/* On mobile in messages page, hide global navbar so chat is 100% full screen */}
      <div className={isMessagesPage ? 'hidden lg:block' : 'block'}>
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      <div className={`flex-1 flex w-full mx-auto ${isMessagesPage ? 'min-h-0 overflow-hidden max-w-full lg:max-w-7xl' : 'max-w-7xl'}`}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className={`flex-1 min-w-0 ${
          isMessagesPage
            ? 'lg:pl-64 p-0 md:p-4 lg:p-6 pb-0 flex flex-col overflow-hidden h-full'
            : 'lg:pl-64 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8'
        }`}>
          <Outlet />
        </main>
      </div>

      {/* Mobile & Tablet Bottom Navigation - Hidden when inside Chat/Messages page for full screen experience */}
      {!isMessagesPage && <BottomNav />}
    </div>
  );
};

