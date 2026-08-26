import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, HeartHandshake, EyeOff, Flag } from 'lucide-react';
import { BackButton } from '../components/BackButton';

export const CommunityGuidelinesPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-xs text-slate-600">
      <div>
        <BackButton fallback="/home" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Community Guidelines</h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          HostelTalkies is a safe, polite, and trustworthy student community. Please adhere to these rules.
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">What We Encourage</h3>
              <p className="text-[11px] text-slate-400">Best practices for positive hostel interaction</p>
            </div>
          </div>
          <ul className="space-y-2.5 pl-2">
            <li>• <strong>Accurate descriptions:</strong> Describe items truthfully, including condition and any scratches/defects.</li>
            <li>• <strong>Punctual returns:</strong> Always return borrowed lab items, books, and tools by the promised date.</li>
            <li>• <strong>Lost & Found precision:</strong> Provide clear location landmarks (e.g. Mess 2 counter, Library 3rd floor).</li>
            <li>• <strong>Respectful communication:</strong> Treat peers with cordiality in comments and private messages.</li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Prohibited Actions</h3>
              <p className="text-[11px] text-slate-400">Violations will lead to suspension or permanent account block</p>
            </div>
          </div>
          <ul className="space-y-2.5 pl-2">
            <li>• <strong>No fake listings or scams:</strong> Listing items not in your possession or attempting payment fraud.</li>
            <li>• <strong>No harassment or hate speech:</strong> Abuse, derogatory remarks, or discrimination based on identity.</li>
            <li>• <strong>No unauthorized commercial spam:</strong> Off-campus mass advertising without administration approval.</li>
            <li>• <strong>No privacy violations:</strong> Do not publicly disclose someone else's personal contact or room number without consent.</li>
          </ul>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Reporting & Moderation</h3>
              <p className="text-[11px] text-slate-400">How violations are handled</p>
            </div>
          </div>
          <p className="leading-relaxed">
            Students can report any listing, comment, or user profile with a single click. The hostel administration reviews pending reports directly from the Django Admin Moderation Panel and takes immediate action (hiding posts, issuing warnings, or blocking accounts).
          </p>
        </div>
      </div>
    </div>
  );
};
