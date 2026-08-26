import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../api/client';
import { CreditsModal } from '../components/CreditsModal';

export const PublicLayout: React.FC = () => {
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar showSearch={false} />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                  HT
                </div>
                <span className="font-bold text-slate-900 text-base">HostelTalkies</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                "Your Hostel. Your People. Your Talkies."<br />
                The official hostel community platform for peer trading, campus notices, lost & found, and student life.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Community</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link to="/home" className="hover:text-brand-600">Home</Link></li>
                <li><Link to="/marketplace" className="hover:text-brand-600">Hostel Marketplace</Link></li>
                <li><Link to="/lost-found" className="hover:text-brand-600">Lost & Found</Link></li>
                <li><Link to="/study" className="hover:text-brand-600">Study Resources</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Information</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link to="/about" className="hover:text-brand-600">About HostelTalkies</Link></li>
                <li><Link to="/guidelines" className="hover:text-brand-600">Community Guidelines</Link></li>
                <li><Link to="/contact" className="hover:text-brand-600">Contact & Feedback</Link></li>
                <li><Link to="/notices" className="hover:text-brand-600">Official Notices</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Portals</h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link to="/login" className="hover:text-brand-600">Student Login</Link></li>
                <li><Link to="/register" className="hover:text-brand-600">Create Student Account</Link></li>
                <li><a href={`${API_BASE_URL}/admin/`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">Admin Portal ↗</a></li>
              </ul>
            </div>
          </div>


          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="space-y-0.5 text-center sm:text-left">
              <div>
                © 2026 HostelTalkies. All Rights Reserved.
              </div>
              <div className="text-slate-600">
                Designed &amp; Developed by <strong className="text-slate-800 font-semibold">Siddharth Singh</strong>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowCreditsModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-600 text-xs font-bold rounded-xl border border-slate-200/80 hover:border-brand-200 transition active:scale-95 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Credits &amp; Support</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Credits & Support Modal */}
      <CreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
      />
    </div>
  );
};
