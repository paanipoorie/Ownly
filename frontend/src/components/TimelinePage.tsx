import React, { useState } from 'react';
import { Clock } from 'lucide-react';
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

  const getEventBorderColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'border-emerald-500';
      case 'warranty':
        return 'border-blue-500';
      case 'exchange':
        return 'border-amber-500';
      default:
        return 'border-neutral-400';
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-2">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
            Timeline Log
          </h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 leading-relaxed">
            Chronological audit of purchase events, active warranties, and return windows.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 rounded-md bg-neutral-100 dark:bg-neutral-800 p-0.5 border border-neutral-200/50 dark:border-neutral-800">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-card text-foreground shadow-2xs'
                : 'text-neutral-500 hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('purchase')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              filterType === 'purchase'
                ? 'bg-card text-foreground shadow-2xs'
                : 'text-neutral-500 hover:text-foreground'
            }`}
          >
            Purchases
          </button>
          <button
            onClick={() => setFilterType('warranty')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              filterType === 'warranty'
                ? 'bg-card text-foreground shadow-2xs'
                : 'text-neutral-500 hover:text-foreground'
            }`}
          >
            Warranties
          </button>
          <button
            onClick={() => setFilterType('exchange')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
              filterType === 'exchange'
                ? 'bg-card text-foreground shadow-2xs'
                : 'text-neutral-500 hover:text-foreground'
            }`}
          >
            Exchanges
          </button>
        </div>
      </div>

      {/* Timeline Grouping */}
      {groupedEvents.length > 0 ? (
        <div className="space-y-6">
          {groupedEvents.map(([monthYear, groupEvts]) => (
            <div key={monthYear} className="space-y-3">
              {/* Heading */}
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 pt-2">
                {monthYear}
              </h3>

              {/* Event rows */}
              <div className="relative pl-4 space-y-3.5 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[1px] before:bg-neutral-200 dark:before:bg-neutral-800">
                {groupEvts.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => evt.asset && onSelectAsset(evt.asset)}
                    className="group relative flex items-center justify-between gap-4 rounded-md border border-neutral-200 dark:border-neutral-800 bg-card p-3.5 transition-all duration-200 hover:border-neutral-400 dark:hover:border-neutral-700 cursor-pointer shadow-3xs"
                  >
                    {/* Hollow dot marker */}
                    <div
                      className={`absolute -left-[20.5px] top-1/2 -translate-y-1/2 flex h-3.5 w-3.5 items-center justify-center rounded-full border bg-card ${getEventBorderColor(
                        evt.event_type
                      )}`}
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600" />
                    </div>

                    {/* Metadata & Description */}
                    <div className="flex items-center gap-3">
                      {evt.asset?.image_url && (
                        <img
                          src={evt.asset.image_url}
                          alt={evt.title}
                          className="h-8 w-8 rounded-md object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
                            {evt.event_type}
                          </span>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                            • {formatDate(evt.event_date)}
                          </span>
                        </div>
                        <h4 className="mt-0.5 font-bold text-foreground text-xs group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                          {evt.title}
                        </h4>
                        {evt.description && (
                          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 line-clamp-1">
                            {evt.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price summary */}
                    <div className="shrink-0 text-right">
                      {evt.asset && (
                        <span className="text-xs font-mono font-bold text-foreground">
                          {formatCurrency(evt.asset.purchase_price, evt.asset.purchase_currency)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 p-16 text-center my-6 bg-card">
          <h3 className="text-sm font-bold text-foreground">Timeline Empty</h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs mt-1.5 leading-relaxed">
            Events will dynamically populate as you add or import assets to your account.
          </p>
        </div>
      )}
    </div>
  );
};
