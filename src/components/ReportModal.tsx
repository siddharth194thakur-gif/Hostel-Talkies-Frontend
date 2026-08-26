import React, { useState } from 'react';
import { Flag, CheckCircle } from 'lucide-react';
import { Modal } from './Modal';
import api from '../api/client';

interface ReportModalProps {
  reportType: 'post' | 'user' | 'comment';
  targetId: string;
  targetTitle?: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  reportType,
  targetId,
  targetTitle,
  onClose,
}) => {
  const [reason, setReason] = useState('spam');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const reasons = [
    { value: 'spam', label: 'Spam or Commercial Promotion' },
    { value: 'fake_listing', label: 'Fake or Misleading Listing' },
    { value: 'scam', label: 'Scam or Fraudulent Attempt' },
    { value: 'harassment', label: 'Harassment or Offensive Behavior' },
    { value: 'inappropriate_content', label: 'Inappropriate or Explicit Content' },
    { value: 'other', label: 'Other Reason' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/moderation/report/', {
        report_type: reportType,
        target_id: targetId,
        reason,
        details,
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Report ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`}
      maxWidth="max-w-md"
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-2">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
          <h4 className="font-bold text-slate-800">Report Submitted</h4>
          <p className="text-xs text-slate-500">Thank you. Our moderation team will review this report shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {targetTitle && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-600">
              <span className="font-semibold text-slate-700">Target:</span> "{targetTitle}"
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Reason for reporting</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 outline-none text-xs"
            >
              {reasons.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Additional Details (Optional)</label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional context for the administrator..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-brand-500 outline-none resize-none text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
