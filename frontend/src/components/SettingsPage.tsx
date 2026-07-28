import React, { useState, useEffect } from 'react';
import { Mail, Loader2, Play } from 'lucide-react';
import type { User, Reminder } from '../lib/types';
import { fetchReminders, triggerProcessReminders } from '../lib/api';
import { formatDate } from '../lib/utils';

interface SettingsPageProps {
  user: User | null;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const loadReminders = async () => {
    setLoading(true);
    try {
      const data = await fetchReminders();
      setReminders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const handleProcessNow = async () => {
    setProcessing(true);
    setStatusMessage('');
    try {
      const count = await triggerProcessReminders();
      setStatusMessage(`Successfully processed ${count} due reminders.`);
      await loadReminders();
    } catch {
      setStatusMessage('Error processing reminders.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-2 space-y-6 text-xs">
      {/* Account spec */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-card p-5 shadow-3xs">
        <h2 className="text-sm font-bold text-foreground mb-4">Account & System Configuration</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800/40">
            <span className="text-neutral-400 dark:text-neutral-500">Account Email</span>
            <span className="font-semibold text-foreground">
              {user ? user.email : 'demo-user@ownly.app'}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800/40">
            <span className="text-neutral-400 dark:text-neutral-500">API Connection</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Connected (Local API)
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-neutral-400 dark:text-neutral-500">Notification Engine status</span>
            <span className="font-semibold text-foreground">Active (Every 1 hr)</span>
          </div>
        </div>
      </div>

      {/* Reminder Engine stats */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-card p-5 shadow-3xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-sm font-bold text-foreground">Reminder Notification Queue</h2>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 max-w-md leading-relaxed">
              Monitors upcoming warranty expirations (7-day advance email) and return/exchange deadlines (3-day advance email).
            </p>
          </div>

          <button
            onClick={handleProcessNow}
            disabled={processing}
            className="flex items-center gap-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shrink-0"
          >
            {processing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            <span>Trigger Check</span>
          </button>
        </div>

        {statusMessage && (
          <div className="mb-4 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-600 dark:text-emerald-400">
            {statusMessage}
          </div>
        )}

        {/* Reminders audit list */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Scheduled Alerts Queue
          </h3>

          {loading ? (
            <div className="flex h-16 items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
            </div>
          ) : reminders.length > 0 ? (
            <div className="space-y-2">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className="flex items-center justify-between rounded-md border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-neutral-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">
                        {rem.reminder_type === 'warranty_7day'
                          ? '7-Day Warranty Expiry Warning'
                          : rem.reminder_type === 'exchange_3day'
                          ? '3-Day Return Window Warning'
                          : rem.reminder_type}
                      </span>
                      <p className="text-neutral-400 dark:text-neutral-500 text-[10px] mt-0.5">
                        Scheduled: {formatDate(rem.scheduled_for)}
                      </p>
                    </div>
                  </div>

                  <div>
                    {rem.sent_at ? (
                      <span className="inline-flex items-center rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 font-medium text-neutral-500">
                        Dispatched
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 italic">No alerts scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );
};
