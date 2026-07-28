import React from 'react';
import { X, Edit2, Trash2, Tag, Calendar, ShieldAlert } from 'lucide-react';
import type { Asset, TimelineEvent } from '../lib/types';
import { formatCurrency, formatDate, getWarrantyStatus, getExchangeStatus } from '../lib/utils';

interface AssetDetailDrawerProps {
  asset: Asset | null;
  timelineEvents: TimelineEvent[];
  onClose: () => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

export const AssetDetailDrawer: React.FC<AssetDetailDrawerProps> = ({
  asset,
  timelineEvents,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!asset) return null;

  const warranty = getWarrantyStatus(asset.warranty_expiry);
  const exchange = getExchangeStatus(asset.exchange_deadline);
  const assetEvents = timelineEvents.filter((evt) => evt.asset_id === asset.id);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full w-full max-w-md flex-col justify-between border-l border-neutral-200 dark:border-neutral-800 bg-card shadow-lg overflow-y-auto animate-slide-in"
      >
        {/* Drawer Header Controls */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-card px-5 py-3.5 backdrop-blur-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Specifications
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(asset)}
              className="inline-flex items-center gap-1 rounded-md border border-neutral-200 dark:border-neutral-800 px-2.5 py-1 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <Edit2 className="h-3 w-3" />
              Edit
            </button>
            <button
              onClick={() => onDelete(asset)}
              className="inline-flex items-center gap-1 rounded-md border border-neutral-200 dark:border-neutral-800 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/5 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-foreground transition-colors ml-1"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Info Content container */}
        <div className="flex-1 p-5 space-y-6">
          {/* Main Visual Image Banner */}
          <div className="relative aspect-16/10 w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md overflow-hidden">
            {asset.image_url ? (
              <img
                src={asset.image_url}
                alt={asset.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-300 dark:text-neutral-700">
                <Tag className="h-10 w-10 stroke-[1.2]" />
              </div>
            )}
          </div>

          {/* Title Area */}
          <div>
            <span className="text-[10px] font-mono tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
              {asset.category || 'Other'}
            </span>
            <h2 className="text-lg font-bold tracking-tight text-foreground mt-0.5">{asset.name}</h2>
            {asset.description && (
              <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal">
                {asset.description}
              </p>
            )}
          </div>

          {/* Notion-style Metadata Grid */}
          <div className="border-y border-neutral-200 dark:border-neutral-800/80 py-4 space-y-3 text-xs">
            <div className="grid grid-cols-3">
              <span className="text-neutral-400 dark:text-neutral-500">Purchase Price</span>
              <span className="col-span-2 font-mono font-semibold text-foreground">
                {formatCurrency(asset.purchase_price, asset.purchase_currency)}
              </span>
            </div>

            <div className="grid grid-cols-3">
              <span className="text-neutral-400 dark:text-neutral-500">Merchant / Store</span>
              <span className="col-span-2 font-medium text-foreground">
                {asset.merchant || '—'}
              </span>
            </div>

            <div className="grid grid-cols-3">
              <span className="text-neutral-400 dark:text-neutral-500">Purchase Date</span>
              <span className="col-span-2 font-medium text-foreground">
                {formatDate(asset.purchase_date)}
              </span>
            </div>

            <div className="grid grid-cols-3">
              <span className="text-neutral-400 dark:text-neutral-500">Invoice Number</span>
              <span className="col-span-2 font-mono text-foreground">
                {asset.invoice_number || '—'}
              </span>
            </div>
          </div>

          {/* Warranty & Returns Alerts */}
          <div className="space-y-2.5 text-xs">
            {warranty.status !== 'none' && (
              <div className="flex items-center justify-between p-3 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80">
                <div className="flex items-center gap-2.5">
                  <span className={`h-2 w-2 rounded-full ${
                    warranty.status === 'active' ? 'bg-emerald-500' :
                    warranty.status === 'expiring_soon' ? 'bg-amber-500' : 'bg-neutral-400'
                  }`} />
                  <div>
                    <span className="font-semibold block">Warranty Status</span>
                    <span className="text-neutral-400 dark:text-neutral-500 text-[10px]">{warranty.label}</span>
                  </div>
                </div>
                {asset.warranty_expiry && (
                  <span className="font-mono text-neutral-500 text-[11px]">{formatDate(asset.warranty_expiry)}</span>
                )}
              </div>
            )}

            {exchange.status !== 'none' && (
              <div className="flex items-center justify-between p-3 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80">
                <div className="flex items-center gap-2.5">
                  <span className={`h-2 w-2 rounded-full ${
                    exchange.status === 'active' || exchange.status === 'expiring_soon' ? 'bg-indigo-500' : 'bg-neutral-400'
                  }`} />
                  <div>
                    <span className="font-semibold block">Return Window</span>
                    <span className="text-neutral-400 dark:text-neutral-500 text-[10px]">{exchange.label}</span>
                  </div>
                </div>
                {asset.exchange_deadline && (
                  <span className="font-mono text-neutral-500 text-[11px]">{formatDate(asset.exchange_deadline)}</span>
                )}
              </div>
            )}
          </div>

          {/* Special Notes area */}
          {asset.notes && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Notes
              </h4>
              <p className="text-xs text-foreground bg-neutral-50 dark:bg-neutral-900 p-3 rounded-md border border-neutral-200 dark:border-neutral-800/60 whitespace-pre-wrap leading-relaxed">
                {asset.notes}
              </p>
            </div>
          )}

          {/* History Event log */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Event Log
            </h4>
            {assetEvents.length > 0 ? (
              <div className="space-y-3 relative pl-3 border-l border-neutral-200 dark:border-neutral-800">
                {assetEvents.map((evt) => (
                  <div key={evt.id} className="relative text-xs">
                    <div className="absolute -left-[16px] top-1.5 h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600 border border-card" />
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono block">
                      {formatDate(evt.event_date)}
                    </span>
                    <span className="font-semibold text-foreground">{evt.title}</span>
                    {evt.description && (
                      <span className="text-neutral-400 dark:text-neutral-500 block text-[11px] mt-0.5">
                        {evt.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 dark:text-neutral-500 italic">No events recorded.</p>
            )}
          </div>
        </div>

        {/* Footer info closing button */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 px-5 py-3 bg-neutral-50 dark:bg-neutral-900/50">
          <button
            onClick={onClose}
            className="w-full rounded-md border border-neutral-200 dark:border-neutral-800 py-1.5 text-xs font-semibold text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Close Detail Sheet
          </button>
        </div>
      </div>
    </div>
  );
};
