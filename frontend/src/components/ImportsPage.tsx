import React, { useState, useEffect } from 'react';
import { Inbox, Sparkles, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { ImportCandidate } from '../lib/types';
import { fetchImportCandidates, scanGmailInbox, confirmCandidate, ignoreCandidate } from '../lib/api';
import { formatCurrency } from '../lib/utils';

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
    <div className="max-w-3xl mx-auto py-2">
      {/* Inbox scan controller panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-neutral-50 dark:bg-neutral-900/60 p-5 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-3xs">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block">
            Gmail Integration
          </span>
          <h1 className="text-base font-bold text-foreground">Import Candidates</h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-md leading-relaxed">
            Extract purchases automatically from order confirmation emails. Confirming matches adds them to your collection instantly.
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-1.5 rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold px-3 py-1.5 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all shrink-0"
        >
          {scanning ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          <span>{scanning ? 'Scanning...' : 'Scan Inbox'}</span>
        </button>
      </div>

      {/* Queue items list */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-400 dark:text-neutral-500" />
        </div>
      ) : candidates.length > 0 ? (
        <div className="space-y-3">
          {candidates.map((candidate) => {
            let parsed: any = {};
            try {
              parsed = JSON.parse(candidate.parsed_data || '{}');
            } catch {}

            const isProcessing = actionId === candidate.id;

            return (
              <div
                key={candidate.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-card p-4 transition-all duration-200 hover:border-neutral-400 dark:hover:border-neutral-700 shadow-3xs"
              >
                {/* Details layout */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-[10px] font-bold text-foreground">
                      {parsed.merchant || 'Inbox Match'}
                    </span>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono truncate max-w-[150px]">
                      {parsed.invoice_number ? `#${parsed.invoice_number}` : candidate.sender}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-foreground truncate max-w-md">
                    {parsed.name || candidate.subject}
                  </h3>

                  <div className="flex items-center gap-2">
                    {parsed.purchase_price > 0 && (
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(parsed.purchase_price, parsed.purchase_currency || 'INR')}
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 line-clamp-1 truncate max-w-[250px]">
                      — {candidate.snippet}
                    </span>
                  </div>
                </div>

                {/* Queue decision triggers */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleIgnore(candidate.id)}
                    disabled={isProcessing}
                    className="inline-flex items-center justify-center gap-1 rounded-md border border-neutral-200 dark:border-neutral-800 px-2.5 py-1 text-[11px] font-semibold text-neutral-500 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/35 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-3 w-3" />
                    <span>Ignore</span>
                  </button>

                  <button
                    onClick={() => handleConfirm(candidate.id)}
                    disabled={isProcessing}
                    className="inline-flex items-center justify-center gap-1 rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-3 py-1 text-[11px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    <span>Import</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 p-16 text-center my-6 bg-card">
          <CheckCircle2 className="h-10 w-10 text-emerald-500/80 mb-3 stroke-[1.2]" />
          <h3 className="text-sm font-bold text-foreground">Import Queue Empty</h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs mt-1.5 leading-relaxed">
            All detected purchase candidates have been processed. Click scan above to parse emails for receipts.
          </p>
        </div>
      )}
    </div>
  );
};
