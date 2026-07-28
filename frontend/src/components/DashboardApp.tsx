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

            {/* Imports Tab (Smart Imports Module Preview) */}
            {activeTab === 'imports' && (
              <div className="max-w-2xl mx-auto py-8">
                <div className="rounded-3xl border border-border/80 bg-card p-8 text-center shadow-md">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4">
                    <Inbox className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Gmail Purchase Importer</h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Connect your Gmail account to automatically scan for purchase receipts, order confirmation emails, and invoice attachments from Amazon, Flipkart, Apple, and more.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href="http://localhost:3000/api/auth/login"
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:brightness-110 transition-all"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Connect Gmail Account</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="max-w-xl mx-auto py-8">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-md">
                  <h2 className="text-lg font-bold text-foreground mb-4">Account & Preference Settings</h2>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">User Status</span>
                      <span className="font-semibold text-foreground">
                        {user ? user.email : 'Demo Guest User'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Default Currency</span>
                      <span className="font-semibold text-foreground">INR (₹)</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <span className="text-muted-foreground">Backend API Status</span>
                      <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Connected (:3000)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
