import React from 'react';
import { Building, Users, Shield, Heart, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BackButton } from '../components/BackButton';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div>
        <BackButton fallback="/home" />
      </div>

      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full">
          <Sparkles className="w-3.5 h-3.5" />
          <span>About HostelTalkies</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          "Your Hostel. Your People. Your Talkies."
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          HostelTalkies was founded to bring modern, student-first digital community tools to college hostel residents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">Why HostelTalkies?</h2>
          <p>
            Traditional college ERPs and notice boards are cumbersome, static, and lack a sense of belonging. Meanwhile, chaotic WhatsApp groups result in lost listings, spam, and privacy exposure.
          </p>
          <p>
            HostelTalkies solves this with a purpose-built platform that combines peer-to-peer marketplace, lost and found tracking, study materials repository, emergency hostel notices, and direct messaging into one unified experience.
          </p>
          
          <div className="pt-2 space-y-2">
            {[
              '100% Student & Hostel Community focused',
              'Database-driven hostels, blocks, categories, and services',
              'Privacy-first: room numbers are never forced',
              'Transparent moderation & reporting against spam and scams',
            ].map((pt, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-tr from-brand-600 to-indigo-700 p-8 rounded-3xl text-white space-y-6 shadow-xl">
          <h3 className="text-xl font-bold">Community Vision</h3>
          <p className="text-xs text-indigo-100 leading-relaxed">
            Every senior has notes to pass down. Every junior needs a cycle or study desk. Every wing loses keys in the mess. HostelTalkies connects all of us.
          </p>
          <div className="pt-4 border-t border-indigo-400/30 flex items-center justify-between text-xs">
            <span>Built by Students • Powered by DRF & React</span>
            <Link to="/register" className="px-4 py-2 bg-white text-slate-900 font-bold rounded-xl shadow transition hover:bg-indigo-50">
              Join Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
