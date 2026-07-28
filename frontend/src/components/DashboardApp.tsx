import React, { useState, useEffect } from 'react';
import type { User, Asset, TimelineEvent, FilterState } from '../lib/types';
import {
  fetchCurrentUser,
  fetchAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  fetchTimeline,
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
import { Inbox, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

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

export const DashboardApp: React.FC<DashboardAppProps> = ({
  initialTab = 'dashboard',
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Reload assets & timeline
  const reloadData = async () => {
    const [loadedAssets, loadedTimeline] = await Promise.all([
      fetchAssets(),
      fetchTimeline(),
    ]);
    setAssets(loadedAssets);
    setTimelineEvents(loadedTimeline);

    // Refresh selected asset if drawer is open
    if (selectedAsset) {
      const updated = loadedAssets.find((a) => a.id === selectedAsset.id);
      setSelectedAsset(updated || null);
    }
  };

  const handleCreateAsset = async (
    assetData: Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    await createAsset(assetData);
    await reloadData();
  };

  const handleUpdateAsset = async (
    assetData: Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!assetToEdit) return;
    await updateAsset(assetToEdit.id, assetData);
    await reloadData();
    setAssetToEdit(null);
  };

  const handleDeleteAsset = async (asset: Asset) => {
    if (confirm(`Are you sure you want to delete "${asset.name}"?`)) {
      await deleteAsset(asset.id);
      if (selectedAsset?.id === asset.id) {
        setSelectedAsset(null);
      }
      await reloadData();
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
      {/* Top Navigation */}
      <Navbar
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
      />

      {/* Main Container */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        {/* Loading Spinner */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
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
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <TimelinePage
                events={timelineEvents}
                onSelectAsset={setSelectedAsset}
              />
            )}

            {/* Imports Tab (Gmail Smart Imports) */}
            {activeTab === 'imports' && (
              <ImportsPage onCandidateConfirmed={reloadData} />
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && <SettingsPage user={user} />}
          </>
        )}
      </main>

      {/* Asset Detail Drawer */}
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

      {/* Add / Edit Form Modal */}
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
