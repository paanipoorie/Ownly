import React from 'react';
import { Package, ShieldCheck, RefreshCw, DollarSign } from 'lucide-react';
import type { Asset } from '../lib/types';
import { formatCurrency, getWarrantyStatus, getExchangeStatus } from '../lib/utils';

interface StatsBarProps {
  assets: Asset[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ assets }) => {
  const totalAssets = assets.length;

  const totalValue = assets.reduce((sum, item) => sum + (item.purchase_price || 0), 0);

  const activeWarranties = assets.filter((item) => {
    const { status } = getWarrantyStatus(item.warranty_expiry);
    return status === 'active' || status === 'expiring_soon';
  }).length;

  const activeExchanges = assets.filter((item) => {
    const { status } = getExchangeStatus(item.exchange_deadline);
    return status === 'active' || status === 'expiring_soon';
  }).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Assets */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-all hover:shadow-md hover:border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Assets
            </p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {totalAssets}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Package className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Total Portfolio Value */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-all hover:shadow-md hover:border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Portfolio Value
            </p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {formatCurrency(totalValue, assets[0]?.purchase_currency || 'INR')}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Active Warranties */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-all hover:shadow-md hover:border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Active Warranties
            </p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {activeWarranties}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Active Exchange Windows */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-xs transition-all hover:shadow-md hover:border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Exchange Windows
            </p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {activeExchanges}
            </h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <RefreshCw className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
