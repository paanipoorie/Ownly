import React from 'react';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';
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
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 bg-card/60 p-4 rounded-2xl border border-border/60 backdrop-blur-xs">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          placeholder="Search items, merchants, invoice numbers, notes..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border border-border/80 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
        />
        {filters.search && (
          <button
            onClick={() => onFilterChange({ ...filters, search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Select Filters & Sort */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <div className="flex items-center gap-1.5 min-w-[130px]">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:inline" />
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
            className="w-full py-2 px-3 rounded-xl bg-background border border-border/80 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Warranty Status Filter */}
        <select
          value={filters.warrantyStatus}
          onChange={(e) => onFilterChange({ ...filters, warrantyStatus: e.target.value })}
          className="py-2 px-3 rounded-xl bg-background border border-border/80 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
        >
          <option value="all">All Warranties</option>
          <option value="active">Active Warranty</option>
          <option value="expiring_soon">Expiring Soon (30d)</option>
          <option value="expired">Expired Warranty</option>
        </select>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-1.5 min-w-[130px]">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground hidden sm:inline" />
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })
            }
            className="w-full py-2 px-3 rounded-xl bg-background border border-border/80 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="warranty_asc">Warranty Expiring Soonest</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};
