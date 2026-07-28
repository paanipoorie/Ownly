import React from 'react';
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

  const stats = [
    { label: 'Total Assets', value: totalAssets, mono: true },
    { label: 'Portfolio Value', value: formatCurrency(totalValue, assets[0]?.purchase_currency || 'INR'), mono: true },
    { label: 'Active Warranties', value: activeWarranties, mono: true },
    { label: 'Exchange Windows', value: activeExchanges, mono: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-neutral-200 dark:bg-neutral-800 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 mb-8 shadow-2xs">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-card px-5 py-4 flex flex-col justify-between transition-colors duration-200"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            {stat.label}
          </span>
          <span
            className={`mt-1.5 text-lg font-bold tracking-tight text-foreground ${
              stat.mono ? 'font-mono' : ''
            }`}
          >
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
};
