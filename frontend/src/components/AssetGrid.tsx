import React from 'react';
import { Plus } from 'lucide-react';
import type { Asset, FilterState } from '../lib/types';
import { AssetCard } from './AssetCard';
import { getWarrantyStatus } from '../lib/utils';

interface AssetGridProps {
  assets: Asset[];
  filters: FilterState;
  onSelect: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onOpenAddModal: () => void;
}

export const AssetGrid: React.FC<AssetGridProps> = ({
  assets,
  filters,
  onSelect,
  onEdit,
  onDelete,
  onOpenAddModal,
}) => {
  // Apply Search & Filters
  const filtered = React.useMemo(() => {
    return assets.filter((asset) => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesName = asset.name?.toLowerCase().includes(query);
        const matchesMerchant = asset.merchant?.toLowerCase().includes(query);
        const matchesInvoice = asset.invoice_number?.toLowerCase().includes(query);
        const matchesNotes = asset.notes?.toLowerCase().includes(query);
        const matchesCategory = asset.category?.toLowerCase().includes(query);
        if (!matchesName && !matchesMerchant && !matchesInvoice && !matchesNotes && !matchesCategory) {
          return false;
        }
      }

      // Category
      if (filters.category !== 'all' && asset.category !== filters.category) {
        return false;
      }

      // Warranty Status
      if (filters.warrantyStatus !== 'all') {
        const { status } = getWarrantyStatus(asset.warranty_expiry);
        if (filters.warrantyStatus === 'active' && status !== 'active') return false;
        if (filters.warrantyStatus === 'expiring_soon' && status !== 'expiring_soon') return false;
        if (filters.warrantyStatus === 'expired' && status !== 'expired') return false;
      }

      return true;
    });
  }, [assets, filters]);

  // Apply Sorting
  const sorted = React.useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (filters.sortBy === 'newest') {
        const dA = new Date(a.purchase_date || a.created_at || 0).getTime();
        const dB = new Date(b.purchase_date || b.created_at || 0).getTime();
        return dB - dA;
      }
      if (filters.sortBy === 'oldest') {
        const dA = new Date(a.purchase_date || a.created_at || 0).getTime();
        const dB = new Date(b.purchase_date || b.created_at || 0).getTime();
        return dA - dB;
      }
      if (filters.sortBy === 'price_desc') {
        return (b.purchase_price || 0) - (a.purchase_price || 0);
      }
      if (filters.sortBy === 'price_asc') {
        return (a.purchase_price || 0) - (b.purchase_price || 0);
      }
      if (filters.sortBy === 'warranty_asc') {
        const wA = a.warranty_expiry ? new Date(a.warranty_expiry).getTime() : Infinity;
        const wB = b.warranty_expiry ? new Date(b.warranty_expiry).getTime() : Infinity;
        return wA - wB;
      }
      return 0;
    });
  }, [filtered, filters.sortBy]);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 p-16 text-center my-6 bg-card">
        <h3 className="text-sm font-bold text-foreground">No assets found</h3>
        <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500 max-w-xs leading-relaxed">
          {assets.length === 0
            ? 'Track your purchases, warranties, return windows, and invoices in one secure catalog.'
            : 'No assets match your search terms or filter selection.'}
        </p>
        <button
          onClick={onOpenAddModal}
          className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold px-4 py-2 hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add New Asset</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {sorted.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
