import React from 'react';
import { Search, X } from 'lucide-react';
import type { FilterState } from '../lib/types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  categories: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  categories,
}) => {
  const hasActiveFilters =
    filters.search || filters.category !== 'all' || filters.warrantyStatus !== 'all';

  const resetFilters = () => {
    onFilterChange({
      search: '',
      category: 'all',
      warrantyStatus: 'all',
      sortBy: 'newest',
    });
  };

  return (
    <div className="space-y-3 mb-8">
      {/* Primary Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          placeholder="Search items, brands, stores, invoice numbers, notes..."
          className="w-full pl-10 pr-10 py-2.5 rounded-md bg-card border border-neutral-200 dark:border-neutral-800 text-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-700 transition-colors"
        />
        {filters.search && (
          <button
            onClick={() => onFilterChange({ ...filters, search: '' })}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Secondary Filter options */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Selector */}
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
            className="py-1.5 px-3 rounded-md bg-card border border-neutral-200 dark:border-neutral-800 text-xs text-foreground focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-700 transition-colors"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Warranty Status Selector */}
          <select
            value={filters.warrantyStatus}
            onChange={(e) => onFilterChange({ ...filters, warrantyStatus: e.target.value })}
            className="py-1.5 px-3 rounded-md bg-card border border-neutral-200 dark:border-neutral-800 text-xs text-foreground focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-700 transition-colors"
          >
            <option value="all">All Warranties</option>
            <option value="active">Active Warranty</option>
            <option value="expiring_soon">Expiring Soon (30d)</option>
            <option value="expired">Expired Warranty</option>
          </select>

          {/* Sort Selector */}
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })
            }
            className="py-1.5 px-3 rounded-md bg-card border border-neutral-200 dark:border-neutral-800 text-xs text-foreground focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-700 transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="warranty_asc">Warranty Expiring Soonest</option>
          </select>
        </div>

        {/* Clear Trigger */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-neutral-400 hover:text-foreground font-medium transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
