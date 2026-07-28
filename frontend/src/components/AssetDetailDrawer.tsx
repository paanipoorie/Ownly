import React from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  RefreshCw,
  Calendar,
  DollarSign,
  FileText,
  Building2,
  Tag,
  Edit2,
  Trash2,
  Clock,
} from 'lucide-react';
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

  // Filter timeline events for this asset
  const assetEvents = timelineEvents.filter((evt) => evt.asset_id === asset.id);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full w-full max-w-lg flex-col justify-between border-l border-border bg-card shadow-2xl overflow-y-auto animate-slide-in"
      >
        {/* Header */}
        <div>
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/90 px-6 py-4 backdrop-blur-md">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Asset Details
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(asset)}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                onClick={() => onDelete(asset)}
                className="flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Hero Banner / Image */}
          <div className="relative h-64 w-full bg-muted/40 overflow-hidden">
            {asset.image_url ? (
              <img
                src={asset.image_url}
                alt={asset.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 text-muted-foreground">
                <Tag className="h-16 w-16 opacity-30" />
              </div>
            )}
            <span className="absolute bottom-3 left-3 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-border/40 shadow-xs">
              {asset.category || 'General'}
            </span>
          </div>

          {/* Title & Description */}
          <div className="px-6 py-5 border-b border-border/60">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{asset.name}</h2>
            {asset.description && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {asset.description}
              </p>
            )}
          </div>

          {/* Key Properties Grid */}
          <div className="grid grid-cols-2 gap-4 px-6 py-5 border-b border-border/60 text-sm">
            <div>
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-indigo-500" /> Purchase Price
              </span>
              <p className="mt-1 font-semibold text-foreground text-base">
                {formatCurrency(asset.purchase_price, asset.purchase_currency)}
              </p>
            </div>

            <div>
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-indigo-500" /> Merchant / Store
              </span>
              <p className="mt-1 font-semibold text-foreground">
                {asset.merchant || 'Unspecified'}
              </p>
            </div>

            <div>
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" /> Purchase Date
              </span>
              <p className="mt-1 font-medium text-foreground">
                {formatDate(asset.purchase_date)}
              </p>
            </div>

            <div>
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-indigo-500" /> Invoice Number
              </span>
              <p className="mt-1 font-medium text-foreground font-mono">
                {asset.invoice_number || 'N/A'}
              </p>
            </div>
          </div>

          {/* Warranty & Exchange Status Section */}
          <div className="px-6 py-5 border-b border-border/60">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Warranty & Exchange Protection
            </h3>

            <div className="space-y-3">
              {/* Warranty Banner */}
              <div
                className={`flex items-center justify-between rounded-xl p-3.5 border ${
                  warranty.status === 'active'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : warranty.status === 'expiring_soon'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                    : 'bg-muted/40 border-border/60 text-muted-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  {warranty.status === 'active' && <ShieldCheck className="h-5 w-5 text-emerald-500" />}
                  {warranty.status === 'expiring_soon' && <ShieldAlert className="h-5 w-5 text-amber-500 animate-pulse" />}
                  {warranty.status === 'expired' && <ShieldX className="h-5 w-5 text-muted-foreground" />}
                  {warranty.status === 'none' && <ShieldX className="h-5 w-5 text-muted-foreground" />}
                  <div>
                    <h4 className="text-sm font-semibold">Warranty Status</h4>
                    <p className="text-xs opacity-90">{warranty.label}</p>
                  </div>
                </div>
                {asset.warranty_expiry && (
                  <span className="text-xs font-mono font-medium">
                    {formatDate(asset.warranty_expiry)}
                  </span>
                )}
              </div>

              {/* Exchange Banner */}
              <div
                className={`flex items-center justify-between rounded-xl p-3.5 border ${
                  exchange.status === 'active' || exchange.status === 'expiring_soon'
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300'
                    : 'bg-muted/40 border-border/60 text-muted-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-purple-500" />
                  <div>
                    <h4 className="text-sm font-semibold">Exchange / Return Window</h4>
                    <p className="text-xs opacity-90">{exchange.label}</p>
                  </div>
                </div>
                {asset.exchange_deadline && (
                  <span className="text-xs font-mono font-medium">
                    {formatDate(asset.exchange_deadline)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Asset Notes */}
          {asset.notes && (
            <div className="px-6 py-5 border-b border-border/60">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Notes & Instructions
              </h3>
              <p className="text-sm text-foreground bg-muted/30 p-3.5 rounded-xl border border-border/40 whitespace-pre-wrap">
                {asset.notes}
              </p>
            </div>
          )}

          {/* Asset Timeline History */}
          <div className="px-6 py-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-500" /> Asset Event History
            </h3>

            {assetEvents.length > 0 ? (
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {assetEvents.map((evt) => (
                  <div key={evt.id} className="relative pl-8">
                    <div className="absolute left-1.5 top-1 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-background bg-indigo-600" />
                    <p className="text-xs text-muted-foreground">{formatDate(evt.event_date)}</p>
                    <h5 className="text-sm font-semibold text-foreground">{evt.title}</h5>
                    {evt.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{evt.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No timeline events recorded yet.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 bg-muted/20">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-border py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
