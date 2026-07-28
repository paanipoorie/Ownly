import React from 'react';
import { MoreVertical, Edit2, Trash2, Tag, Calendar, Shield } from 'lucide-react';
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

  const getWarrantyDotColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500';
      case 'expiring_soon':
        return 'bg-amber-500 animate-pulse';
      case 'expired':
        return 'bg-neutral-300 dark:bg-neutral-700';
      default:
        return 'bg-transparent';
    }
  };

  const getExchangeDotColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-indigo-500';
      case 'expiring_soon':
        return 'bg-purple-500 animate-pulse';
      default:
        return 'bg-transparent';
    }
  };

  return (
    <div
      onClick={() => onSelect(asset)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-card transition-all duration-200 hover:border-neutral-400 dark:hover:border-neutral-700 cursor-pointer shadow-3xs"
    >
      <div>
        {/* Aspect Ratio Box for Image */}
        <div className="relative aspect-4/3 w-full bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 overflow-hidden">
          {asset.image_url ? (
            <img
              src={asset.image_url}
              alt={asset.name}
              className="h-full w-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-300 dark:text-neutral-700">
              <Tag className="h-8 w-8 stroke-[1.2]" />
            </div>
          )}

          {/* Action Menu */}
          <div className="absolute top-2.5 right-2.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-background/90 text-foreground backdrop-blur-xs border border-neutral-200 dark:border-neutral-800 hover:bg-background transition-colors"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-1 w-32 rounded-md border border-neutral-200 dark:border-neutral-800 bg-popover p-1 shadow-md z-20"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(asset);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs text-popover-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(asset);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Area */}
        <div className="p-4 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
              {asset.category || 'Other'}
            </span>
            {asset.merchant && (
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate max-w-[120px]">
                {asset.merchant}
              </span>
            )}
          </div>

          <h4 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
            {asset.name}
          </h4>
        </div>
      </div>

      {/* Footer Area */}
      <div className="px-4 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/40">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-lg font-bold font-mono text-foreground">
            {formatCurrency(asset.purchase_price, asset.purchase_currency)}
          </span>
        </div>

        {/* Status Indicators (Dot and simple labels) */}
        <div className="flex flex-col gap-1.5 text-[11px]">
          {/* Warranty status indicator */}
          {warranty.status !== 'none' && (
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${getWarrantyDotColor(warranty.status)}`} />
              <span className="truncate">{warranty.label}</span>
            </div>
          )}

          {/* Exchange status indicator */}
          {exchange.status !== 'none' && (
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${getExchangeDotColor(exchange.status)}`} />
              <span className="truncate">{exchange.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
