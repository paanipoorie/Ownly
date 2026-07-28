import React, { useState, useEffect, useCallback } from 'react';
import type { User, Asset, TimelineEvent, FilterState } from '../lib/types';
import {
  fetchCurrentUser,
  fetchAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  fetchTimeline,
  setGlobalErrorHandler,
  fetchSeedDemo,
} from '../lib/api';
import { Navbar } from './Navbar';
import { StatsBar } from './StatsBar';
import { FilterBar } from './FilterBar';
import { AssetGrid } from './AssetGrid';
import { AssetDetailDrawer } from './AssetDetailDrawer';
import { AssetFormModal } from './AssetFormModal';
import { TimelinePage } from './TimelinePage';
import { ImportsPage } from './ImportsPage';
import { SettingsPage } from './SettingsPage';
import { ErrorBoundary } from './ErrorBoundary';
import { ToastProvider, useToast } from './ui/toast';
import { Database, Loader2 } from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Appliances',
  'Clothing',
  'Furniture',
  'Books',
  'Vehicles',
  'Jewelry',
  'Sports',
  'Other',
];

interface DashboardAppProps {
  initialTab?: 'dashboard' | 'timeline' | 'imports' | 'settings';
}

const DashboardInner: React.FC<DashboardAppProps> = ({ initialTab = 'dashboard' }) => {
  const [user, setUser] = useState<User | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'timeline' | 'imports' | 'settings'>(
    initialTab
  );

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    warrantyStatus: 'all',
    sortBy: 'newest',
  });

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Sync document title with active tab
  useEffect(() => {
    const formattedTab = activeTab === 'imports' ? 'Imports' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    document.title = `${formattedTab} | Ownly`;
  }, [activeTab]);

  // Set up global error handler
  useEffect(() => {
    setGlobalErrorHandler((error) => {
      addToast('error', 'Request Failed', error.message);
    });
  }, [addToast]);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);

      const [loadedAssets, loadedTimeline] = await Promise.all([
        fetchAssets(),
        fetchTimeline(),
      ]);

      setAssets(loadedAssets);
      setTimelineEvents(loadedTimeline);
      setLoading(false);
    }
    loadData();
  }, []);

  const reloadData = useCallback(async () => {
    const [loadedAssets, loadedTimeline] = await Promise.all([
      fetchAssets(),
      fetchTimeline(),
    ]);
    setAssets(loadedAssets);
    setTimelineEvents(loadedTimeline);

    if (selectedAsset) {
      const updated = loadedAssets.find((a) => a.id === selectedAsset.id);
      setSelectedAsset(updated || null);
    }
  }, [selectedAsset]);

  const handleCreateAsset = async (
    assetData: Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await createAsset(assetData);
    addToast('success', 'Asset Created', `${created.name} has been added to your portfolio.`);
    await reloadData();
  };

  const handleUpdateAsset = async (
    assetData: Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!assetToEdit) return;
    await updateAsset(assetToEdit.id, assetData);
    addToast('success', 'Asset Updated', `${assetToEdit.name} has been updated.`);
    await reloadData();
    setAssetToEdit(null);
  };

  const handleDeleteAsset = async (asset: Asset) => {
    if (confirm(`Are you sure you want to delete "${asset.name}"?`)) {
      await deleteAsset(asset.id);
      addToast('info', 'Asset Deleted', `${asset.name} has been removed.`);
      if (selectedAsset?.id === asset.id) {
        setSelectedAsset(null);
      }
      await reloadData();
    }
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      await fetchSeedDemo();
      addToast('success', 'Demo Data Loaded', 'Sample assets and import candidates have been added.');
      await reloadData();
    } catch (err: any) {
      addToast('error', 'Seed Failed', err.message || 'Could not load demo data.');
    } finally {
      setSeeding(false);
    }
  };

  const handleOpenAddModal = () => {
    setAssetToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (asset: Asset) => {
    setAssetToEdit(asset);
    setIsFormModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-neutral-800 dark:selection:bg-neutral-200 selection:text-white dark:selection:text-neutral-900">
      <Navbar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col h-64 items-center justify-center gap-3">
            <img src="/favicon.svg" alt="Ownly" className="h-8 w-8 animate-pulse opacity-85" />
            <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Loading Ownly...</span>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div>
                <StatsBar assets={assets} />
                <FilterBar
                  filters={filters}
                  onFilterChange={setFilters}
                  categories={CATEGORIES}
                />
                <AssetGrid
                  assets={assets}
                  filters={filters}
                  onSelect={setSelectedAsset}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteAsset}
                  onOpenAddModal={handleOpenAddModal}
                />
                {assets.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 p-16 text-center my-6 bg-card">
                    <h3 className="text-sm font-bold text-foreground">Explore Ownly with Demo Data</h3>
                    <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500 max-w-xs leading-relaxed">
                      Populate your catalog instantly with mock assets, import candidates, and active warranty countdowns.
                    </p>
                    <button
                      onClick={handleSeedDemo}
                      disabled={seeding}
                      className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold px-4 py-2 hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                      {seeding ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        null
                      )}
                      <span>{seeding ? 'Loading Seeding Data...' : 'Seed Sample Catalog'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <TimelinePage
                events={timelineEvents}
                onSelectAsset={setSelectedAsset}
              />
            )}

            {activeTab === 'imports' && (
              <ImportsPage onCandidateConfirmed={reloadData} />
            )}

            {activeTab === 'settings' && <SettingsPage user={user} />}
          </>
        )}
      </main>

      <AssetDetailDrawer
        asset={selectedAsset}
        timelineEvents={timelineEvents}
        onClose={() => setSelectedAsset(null)}
        onEdit={(asset) => {
          setSelectedAsset(null);
          handleOpenEditModal(asset);
        }}
        onDelete={(asset) => {
          setSelectedAsset(null);
          handleDeleteAsset(asset);
        }}
      />

      <AssetFormModal
        isOpen={isFormModalOpen}
        assetToEdit={assetToEdit}
        onClose={() => {
          setIsFormModalOpen(false);
          setAssetToEdit(null);
        }}
        onSubmit={assetToEdit ? handleUpdateAsset : handleCreateAsset}
        categories={CATEGORIES}
      />
    </div>
  );
};

export const DashboardApp: React.FC<DashboardAppProps> = (props) => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <DashboardInner {...props} />
      </ToastProvider>
    </ErrorBoundary>
  );
};
