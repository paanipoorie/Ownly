import React, { useState, useEffect } from 'react';
import { Inbox, Sparkles, CheckCircle2, XCircle, RefreshCw, ShoppingBag, Loader2, ArrowRight } from 'lucide-react';
import type { ImportCandidate } from '../lib/types';
import { fetchImportCandidates, scanGmailInbox, confirmCandidate, ignoreCandidate } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';

interface ImportsPageProps {
  onCandidateConfirmed: () => void;
}

export const ImportsPage: React.FC<ImportsPageProps> = ({ onCandidateConfirmed }) => {
  const [candidates, setCandidates] = useState<ImportCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await fetchImportCandidates();
      setCandidates(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    try {
      const data = await scanGmailInbox();
      setCandidates(data);
    } finally {
      setScanning(false);
    }
  };

  const handleConfirm = async (id: string) => {
    setActionId(id);
    try {
      await confirmCandidate(id);
      await loadCandidates();
      onCandidateConfirmed();
    } finally {
      setActionId(null);
    }
  };

  const handleIgnore = async (id: string) => {
    setActionId(id);
    try {
      await ignoreCandidate(id);
      await loadCandidates();
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-card p-6 rounded-3xl border border-indigo-500/20 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 mb-1">
            <Inbox className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Gmail Smart Importer</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Import Queue</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-lg">
            Review automatically extracted purchase receipts from your Gmail inbox. Confirm candidates to instantly add them to your Dashboard & Timeline.
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shrink-0"
        >
          {scanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          <span>{scanning ? 'Scanning Inbox...' : 'Scan Gmail Inbox'}</span>
        </button>
      </div>

      {/* Candidates List */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : candidates.length > 0 ? (
        <div className="space-y-4">
          {candidates.map((candidate) => {
            let parsed: any = {};
            try {
              parsed = JSON.parse(candidate.parsed_data || '{}');
            } catch {}

            const isProcessing = actionId === candidate.id;

            return (
              <div
                key={candidate.id}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:border-indigo-500/30 hover:shadow-md"
              >
                {/* Left Parsed Overview */}
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                    <ShoppingBag className="h-6 w-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {parsed.merchant || 'Gmail Import'}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {parsed.invoice_number ? `Order #${parsed.invoice_number}` : candidate.sender}
                      </span>
                    </div>

                    <h3 className="mt-1 text-base font-bold text-foreground">
                      {parsed.name || candidate.subject}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {candidate.snippet}
                    </p>

                    {parsed.purchase_price > 0 && (
                      <div className="mt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(parsed.purchase_price, parsed.purchase_currency || 'INR')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleIgnore(candidate.id)}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Ignore</span>
                  </button>

                  <button
                    onClick={() => handleConfirm(candidate.id)}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    <span>Confirm & Import</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-12 text-center my-6 bg-card/40">
          <CheckCircle2 className="h-12 w-12 text-emerald-500/80 mb-3" />
          <h3 className="text-lg font-bold text-foreground">Import Queue Clear</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            All detected email receipts have been reviewed and imported. Click "Scan Gmail Inbox" above to check for new purchases!
          </p>
        </div>
      )}
    </div>
  );
};
