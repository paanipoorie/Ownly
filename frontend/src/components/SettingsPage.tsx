import React, { useState, useEffect } from 'react';
import { Mail, Bell, Shield, Server, CheckCircle2, Play, Loader2 } from 'lucide-react';
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
      setStatusMessage(`Successfully processed ${count} due reminder(s) and dispatched notification emails.`);
      await loadReminders();
    } catch {
      setStatusMessage('Error processing reminders.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      {/* Account Info */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-500" />
          Account & System Configuration
        </h2>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2.5 border-b border-border/60">
            <span className="text-muted-foreground">User Email</span>
            <span className="font-semibold text-foreground">
              {user ? user.email : 'demo-user@ownly.app'}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5 border-b border-border/60">
            <span className="text-muted-foreground">Backend API Server</span>
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected (:3000)
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5 border-b border-border/60">
            <span className="text-muted-foreground">Reminder Scheduler Ticker</span>
            <span className="font-semibold text-foreground">Active (Every 1 hr)</span>
          </div>
        </div>
      </div>

      {/* Reminder Engine Controls */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-500" />
              Reminder Engine & Email Notifications
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automated notifications sent 7 days before warranty expiration & 3 days before return windows close.
            </p>
          </div>

          <button
            onClick={handleProcessNow}
            disabled={processing}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shrink-0"
          >
            {processing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            <span>Process Reminders Now</span>
          </button>
        </div>

        {statusMessage && (
          <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Scheduled Reminders List */}
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Scheduled Reminders ({reminders.length})
          </h3>

          {loading ? (
            <div className="flex h-20 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
            </div>
          ) : reminders.length > 0 ? (
            <div className="space-y-2.5">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-indigo-500 shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">
                        {rem.reminder_type === 'warranty_7day'
                          ? 'Warranty 7-Day Warning'
                          : rem.reminder_type === 'exchange_3day'
                          ? 'Exchange 3-Day Warning'
                          : rem.reminder_type}
                      </span>
                      <p className="text-muted-foreground text-[11px]">
                        Scheduled for: {formatDate(rem.scheduled_for)}
                      </p>
                    </div>
                  </div>

                  <div>
                    {rem.sent_at ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        Sent {formatDate(rem.sent_at)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Pending Delivery
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No scheduled reminders currently active.</p>
          )}
        </div>
      </div>
    </div>
  );
};
