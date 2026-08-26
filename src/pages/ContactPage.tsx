import React, { useState } from 'react';
import { Send, CheckCircle, Mail, MessageSquare, Building, AlertCircle } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { BackButton } from '../components/BackButton';

export const ContactPage: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/moderation/feedback/', {
        name,
        email,
        subject,
        message,
      });
      setIsSuccess(true);
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-xs">
      <div>
        <BackButton fallback="/home" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contact & Community Feedback</h1>
        <p className="text-slate-500 max-w-lg mx-auto">
          Have an idea to improve HostelTalkies? Encountered a problem? Let us know!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Hostel Office</h3>
            <p className="text-slate-500 leading-relaxed">
              Main Hostel Administration Center<br />
              Open Mon-Sat: 9:00 AM - 5:30 PM
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Support Email</h3>
            <p className="text-brand-600 font-medium">support@hosteltalkies.edu</p>
          </div>

          <div className="p-5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-indigo-900 space-y-1">
            <div className="font-bold">Admin Notice</div>
            <p className="text-[11px] text-indigo-700 leading-relaxed">
              Feedback submitted here is directly routed to the Django Admin Feedback inbox for review.
            </p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          {isSuccess ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-base font-bold text-slate-900">Message Received!</h3>
              <p className="text-slate-500 max-w-xs mx-auto">
                Thank you for your feedback. Our administration team reviews all messages regularly.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl font-semibold shadow-xs"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Siddharth Singh"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Your Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@hostel.edu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Suggestion for new sports equipment category"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Message / Suggestion</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your suggestion, query, or feedback in detail..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 outline-none resize-none text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md shadow-brand-500/20 transition active:scale-95 disabled:opacity-50 text-xs"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending...' : 'Submit Feedback'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
