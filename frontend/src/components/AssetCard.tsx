import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, RefreshCw, Calendar, Tag, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import type { Asset } from '../lib/types';
import { formatCurrency, formatDate, getWarrantyStatus, getExchangeStatus } from '../lib/utils';

interface AssetCardProps {
  asset: Asset;
  onSelect: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const warranty = getWarrantyStatus(asset.warranty_expiry);
  const exchange = getExchangeStatus(asset.exchange_deadline);

  return (
    <div
      onClick={() => onSelect(asset)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 cursor-pointer"
    >
      {/* Top Image Preview & Badges */}
      <div>
        <div className="relative mb-3 h-44 w-full overflow-hidden rounded-xl bg-muted/40">
          {asset.image_url ? (
            <img
              src={asset.image_url}
              alt={asset.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary/50 to-muted text-muted-foreground">
              <Tag className="h-10 w-10 opacity-30" />
            </div>
          )}

          {/* Category Pill */}
          <span className="absolute top-2.5 left-2.5 rounded-full bg-background/80 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-foreground border border-border/40 shadow-xs">
            {asset.category || 'General'}
          </span>

          {/* Quick Options Menu Button */}
          <div className="absolute top-2.5 right-2.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-md hover:bg-background shadow-xs transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-1 w-36 rounded-xl border border-border bg-popover p-1 shadow-lg backdrop-blur-md z-20"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(asset);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-popover-foreground hover:bg-accent"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit Item
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(asset);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Item
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title & Merchant */}
        <div className="mb-2">
          <h4 className="font-semibold text-foreground text-base line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {asset.name}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {asset.merchant ? `Purchased from ${asset.merchant}` : 'No merchant info'}
          </p>
        </div>
      </div>

      {/* Price & Status Badges */}
      <div>
        <div className="flex items-baseline justify-between mb-3 pt-2 border-t border-border/40">
          <span className="text-xs text-muted-foreground font-medium">Price</span>
          <span className="text-base font-bold text-foreground">
            {formatCurrency(asset.purchase_price, asset.purchase_currency)}
          </span>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Warranty Badge */}
          {warranty.status === 'active' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3 w-3" />
              {warranty.label}
            </span>
          )}

          {warranty.status === 'expiring_soon' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
              <ShieldAlert className="h-3 w-3" />
              {warranty.label}
            </span>
          )}

          {warranty.status === 'expired' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 font-medium text-muted-foreground border border-border/40">
              <ShieldX className="h-3 w-3" />
              Warranty Expired
            </span>
          )}

          {/* Exchange Badge */}
          {(exchange.status === 'active' || exchange.status === 'expiring_soon') && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 font-medium text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <RefreshCw className="h-3 w-3" />
              {exchange.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
