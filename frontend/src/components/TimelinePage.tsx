import React, { useState } from 'react';
import {
  Clock,
  ShoppingBag,
  ShieldCheck,
  RefreshCw,
  Filter,
  Calendar,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import type { TimelineEvent, Asset } from '../lib/types';
import { formatDate, formatCurrency } from '../lib/utils';

interface TimelinePageProps {
  events: TimelineEvent[];
  onSelectAsset: (asset: Asset) => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({
  events,
  onSelectAsset,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvents = events.filter((evt) => {
    if (filterType === 'all') return true;
    return evt.event_type === filterType;
  });

  // Group events by Month and Year
  const groupedEvents = React.useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    filteredEvents.forEach((evt) => {
      const d = new Date(evt.event_date);
      const key = isNaN(d.getTime())
        ? 'Other'
        : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(evt);
    });
    return Array.from(map.entries());
  }, [filteredEvents]);

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Clock className="h-6 w-6 text-indigo-500" />
            Ownership Timeline
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Chronological log of your purchases, warranty expirations, and exchange deadlines.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-card p-1 border border-border/80 shadow-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterType === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            All ({events.length})
          </button>
          <button
            onClick={() => setFilterType('purchase')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
              filterType === 'purchase'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <ShoppingBag className="h-3 w-3" />
            Purchases
          </button>
          <button
            onClick={() => setFilterType('warranty')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
              filterType === 'warranty'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <ShieldCheck className="h-3 w-3" />
            Warranties
          </button>
          <button
            onClick={() => setFilterType('exchange')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
              filterType === 'exchange'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <RefreshCw className="h-3 w-3" />
            Exchanges
          </button>
        </div>
      </div>

      {/* Timeline List */}
      {groupedEvents.length > 0 ? (
        <div className="space-y-8">
          {groupedEvents.map(([monthYear, groupEvts]) => (
            <div key={monthYear} className="relative">
              {/* Month Header */}
              <div className="sticky top-16 z-20 mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground backdrop-blur-md shadow-xs">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                {monthYear}
              </div>

              {/* Event Cards inside timeline line */}
              <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-purple-500 before:to-border">
                {groupEvts.map((evt) => {
                  const isPurchase = evt.event_type === 'purchase';
                  const isWarranty = evt.event_type === 'warranty';
                  const isExchange = evt.event_type === 'exchange';

                  return (
                    <div
                      key={evt.id}
                      onClick={() => evt.asset && onSelectAsset(evt.asset)}
                      className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-xs transition-all hover:border-indigo-500/40 hover:shadow-md cursor-pointer"
                    >
                      {/* Timeline Node Icon */}
                      <div
                        className={`absolute -left-6 top-5 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-background text-white shadow-xs ${
                          isPurchase
                            ? 'bg-emerald-500'
                            : isWarranty
                            ? 'bg-blue-500'
                            : isExchange
                            ? 'bg-amber-500'
                            : 'bg-indigo-500'
                        }`}
                      >
                        {isPurchase && <ShoppingBag className="h-3 w-3" />}
                        {isWarranty && <ShieldCheck className="h-3 w-3" />}
                        {isExchange && <RefreshCw className="h-3 w-3" />}
                      </div>

                      {/* Content */}
                      <div className="flex items-center gap-4">
                        {evt.asset?.image_url && (
                          <img
                            src={evt.asset.image_url}
                            alt={evt.title}
                            className="h-12 w-12 rounded-xl object-cover border border-border/40 shrink-0"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                isPurchase
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : isWarranty
                                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {evt.event_type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(evt.event_date)}
                            </span>
                          </div>
                          <h4 className="mt-1 font-semibold text-foreground text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {evt.title}
                          </h4>
                          {evt.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {evt.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Link */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {evt.asset && (
                          <span className="text-xs font-semibold text-foreground">
                            {formatCurrency(evt.asset.purchase_price, evt.asset.purchase_currency)}
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-12 text-center my-8 bg-card/40">
          <Clock className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <h3 className="text-base font-bold text-foreground">No events recorded</h3>
          <p className="text-xs text-muted-foreground max-w-xs mt-1">
            Timeline events will automatically populate as you add purchases, warranties, and exchanges.
          </p>
        </div>
      )}
    </div>
  );
};
