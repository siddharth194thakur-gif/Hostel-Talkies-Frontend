import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Users,
  Wrench,
  GraduationCap,
  Calendar,
  BellRing,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  HeartHandshake,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      title: 'Buy & Sell',
      description: 'Trade cycles, calculators, books, mattresses, and electronics with hostel mates safely.',
      icon: ShoppingBag,
      color: 'bg-indigo-50 text-brand-600',
    },
    {
      title: 'Lost & Found',
      description: 'Quickly report and recover keys, ID cards, headphones, and notebooks left in messes or labs.',
      icon: Search,
      color: 'bg-rose-50 text-rose-600',
    },
    {
      title: 'Hostel Community',
      description: 'Find roommates, exchange rooms, post queries, and coordinate sports or study groups.',
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Study Resources',
      description: 'Access previous year question papers (PYQs), topper handwritten notes, and reference books.',
      icon: GraduationCap,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Hostel Services',
      description: 'Instant directory for laundry, Xerox, electrician, barber, and campus amenities.',
      icon: Wrench,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Official Notice Board',
      description: 'Never miss urgent hostel announcements, water maintenance, or sports registrations.',
      icon: BellRing,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Events & LAN Nights',
      description: 'Stay updated on gaming tournaments, cultural open mics, acoustic nights, and tournaments.',
      icon: Calendar,
      color: 'bg-pink-50 text-pink-600',
    },
    {
      title: 'Private Messaging',
      description: 'Chat directly with buyers and sellers without exposing personal phone numbers.',
      icon: MessageSquare,
      color: 'bg-teal-50 text-teal-600',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-12 sm:py-20 overflow-hidden">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>The Private Digital Community for Hostel Students</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          "Your Hostel. Your People. <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">
            Your Talkies.
          </span>"
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Connect with fellow residents, buy & sell pre-loved campus essentials, borrow tools, share notes, find lost items, and stay informed on official notices.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-full shadow-lg shadow-brand-500/25 transition active:scale-95"
            >
              <span>Go to My Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-full shadow-lg shadow-brand-500/25 transition active:scale-95"
              >
                <span>Join HostelTalkies</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/home"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-full border border-slate-200 shadow-sm transition active:scale-95"
              >
                <span>Explore Community</span>
              </Link>
            </>
          )}
        </div>

        {/* Demo Fast Login Banner */}
        {!isAuthenticated && (
          <div className="pt-4 max-w-md mx-auto">
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-900 flex items-center justify-between">
              <span>Quick Demo Access: <strong>siddharth@student.edu</strong></span>
              <Link to="/login" className="font-bold underline text-brand-700">
                Log In →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Everything Hostel Life Needs</h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Designed specifically for student convenience, privacy, and community collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16 border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">How HostelTalkies Works</h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Simple, authentic, and protected for verified hostel students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center justify-center mx-auto">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base">Select Your Hostel</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sign up and choose your hostel. Block and room numbers are completely optional to respect your personal privacy.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center justify-center mx-auto">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base">Post or Discover</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                List cycles, study tables, calculators, free giveaways, or browse lost & found and official priority notices.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center justify-center mx-auto">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base">Chat & Coordinate</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Use built-in student messaging to agree on meetups or borrow requests without broadcasting private contact numbers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Privacy Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Student Privacy & Safety First</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              A private platform built for students, moderated by hostel admin.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your room number is never forced on your profile. Moderation tools allow immediate reporting of spam or misconduct, keeping your community safe.
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-3 w-full sm:w-auto">
            <Link
              to="/register"
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl text-center shadow transition active:scale-95"
            >
              Get Started Now
            </Link>
            <Link
              to="/guidelines"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl text-center backdrop-blur transition"
            >
              Read Community Rules
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
