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
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500 selection:text-white">
      <Navbar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
      />

      <main className="container mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div>
                <StatsBar assets={assets} loading={false} />
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
                  loading={false}
                />
                {assets.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border p-12 text-center my-8 bg-card/40">
                    <Database className="h-12 w-12 text-muted-foreground/40 mb-3" />
                    <h3 className="text-lg font-bold text-foreground">Get Started with Demo Data</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-1">
                      Populate your account with sample assets and import candidates to explore all features.
                    </p>
                    <button
                      onClick={handleSeedDemo}
                      disabled={seeding}
                      className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
                    >
                      {seeding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Database className="h-4 w-4" />
                      )}
                      <span>{seeding ? 'Loading Demo Data...' : 'Load Demo Data'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

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
