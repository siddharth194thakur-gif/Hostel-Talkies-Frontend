import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, MessageSquare, Heart, MessageCircle, AlertCircle, Handshake } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { EmptyState } from '../components/LoadingSkeleton';
import { BackButton } from '../components/BackButton';

export const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4 text-brand-600" />;
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-current" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-indigo-500" />;
      case 'borrow_request':
        return <Handshake className="w-4 h-4 text-purple-600" />;
      case 'notice':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <BackButton fallback="/home" />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500">Stay updated on your listings, messages, and hostel alerts</p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold rounded-xl transition"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markAsRead(notif.id);
                if (notif.link) navigate(notif.link);
              }}
              className={`p-4 flex items-start gap-3.5 cursor-pointer transition ${
                !notif.is_read ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                {getNotifIcon(notif.notification_type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(notif.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
              </div>

              {!notif.is_read && (
                <div className="w-2 h-2 rounded-full bg-brand-600 shrink-0 self-center" />
              )}
            </div>
          ))
        ) : (
          <div className="p-12">
            <EmptyState
              title="No notifications yet"
              message="When other students message, like, or comment on your posts, you will see alerts here."
            />
          </div>
        )}
      </div>
    </div>
  );
};
