import React, { useState } from 'react';
import { Handshake, Calendar, CheckCircle } from 'lucide-react';
import { Modal } from './Modal';
import api from '../api/client';

interface BorrowModalProps {
  postId: number;
  postTitle: string;
  onClose: () => void;
  onRequestSubmitted?: () => void;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({
  postId,
  postTitle,
  onClose,
  onRequestSubmitted,
}) => {
  const [returnDate, setReturnDate] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.post(`/posts/${postId}/request_borrow/`, {
        return_date: returnDate || null,
        note,
      });
      setIsSuccess(true);
      if (onRequestSubmitted) onRequestSubmitted();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit borrow request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Request to Borrow" maxWidth="max-w-md">
      {isSuccess ? (
        <div className="py-6 text-center space-y-2">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
          <h4 className="font-bold text-slate-800">Borrow Request Sent!</h4>
          <p className="text-xs text-slate-500">The owner has been notified. You will receive an alert once accepted.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-purple-900">
            <span className="font-bold">Item:</span> {postTitle}
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Intended Return Date (Optional)</label>
            <input
              type="date"
              value={returnDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-purple-500 outline-none text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Message / Note to Item Owner</label>
            <textarea
              rows={3}
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Need this for my mid-sem exam tomorrow. Will return sanitized!"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-purple-500 outline-none resize-none text-xs"
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
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending...' : 'Send Borrow Request'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
