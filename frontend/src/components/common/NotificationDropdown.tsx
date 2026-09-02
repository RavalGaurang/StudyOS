'use client';

import React, { useEffect, useState } from 'react';
import { notificationService, NotificationItem } from '../../services/notificationService';
import { CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import Link from 'next/link';

export const NotificationDropdown: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifs() {
      try {
        const res = await notificationService.getNotifications();
        setNotifications(res.notifications);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadNotifs();
  }, []);

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Notifications</h4>
        <button
          onClick={handleMarkAllAsRead}
          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Mark all as read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto space-y-2">
        {loading ? (
          <p className="text-center text-xs text-slate-400 py-6">Loading alerts...</p>
        ) : notifications.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-6">No notifications</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 rounded-xl border transition-all ${
                notif.isRead
                  ? 'border-slate-100 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400'
                  : 'border-indigo-100 bg-indigo-50/40 dark:border-indigo-900/40 dark:bg-indigo-950/20 text-slate-900 dark:text-slate-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h5 className="text-xs font-bold leading-snug">{notif.title}</h5>
                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-1" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {notif.message}
              </p>
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(notif.createdAt)}
                </span>
                {notif.linkUrl && (
                  <Link
                    href={notif.linkUrl}
                    onClick={onClose}
                    className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    View <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
