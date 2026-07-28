import React, { useState } from 'react';
import { X, Upload, Loader2, Tag, CheckCircle2 } from 'lucide-react';
import type { Asset } from '../lib/types';
import { uploadFile } from '../lib/api';

interface AssetFormModalProps {
  isOpen: boolean;
  assetToEdit?: Asset | null;
  onClose: () => void;
  onSubmit: (assetData: Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  categories: string[];
}

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  isOpen,
  assetToEdit,
  onClose,
  onSubmit,
  categories,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(assetToEdit?.name || '');
  const [description, setDescription] = useState(assetToEdit?.description || '');
  const [category, setCategory] = useState(assetToEdit?.category || 'Electronics');
  const [merchant, setMerchant] = useState(assetToEdit?.merchant || '');
  const [invoiceNumber, setInvoiceNumber] = useState(assetToEdit?.invoice_number || '');
  const [purchasePrice, setPurchasePrice] = useState<number | string>(
    assetToEdit?.purchase_price ?? ''
  );
  const [purchaseCurrency, setPurchaseCurrency] = useState(assetToEdit?.purchase_currency || 'INR');
  const [purchaseDate, setPurchaseDate] = useState(
    assetToEdit?.purchase_date ? assetToEdit.purchase_date.split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [warrantyExpiry, setWarrantyExpiry] = useState(
    assetToEdit?.warranty_expiry ? assetToEdit.warranty_expiry.split('T')[0] : ''
  );
  const [exchangeDeadline, setExchangeDeadline] = useState(
    assetToEdit?.exchange_deadline ? assetToEdit.exchange_deadline.split('T')[0] : ''
  );
  const [notes, setNotes] = useState(assetToEdit?.notes || '');
  const [imageUrl, setImageUrl] = useState(assetToEdit?.image_url || '');

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError('');
    try {
      const res = await uploadFile(file);
      setImageUrl(res.url);
    } catch (err: any) {
      setUploadError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        category,
        merchant: merchant.trim(),
        invoice_number: invoiceNumber.trim(),
        purchase_price: Number(purchasePrice) || 0,
        purchase_currency: purchaseCurrency,
        purchase_date: purchaseDate ? new Date(purchaseDate).toISOString() : undefined,
        warranty_expiry: warrantyExpiry ? new Date(warrantyExpiry).toISOString() : undefined,
        exchange_deadline: exchangeDeadline ? new Date(exchangeDeadline).toISOString() : undefined,
        notes: notes.trim(),
        image_url: imageUrl,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl overflow-hidden my-8"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-foreground">
              {assetToEdit ? 'Edit Asset' : 'Add New Asset'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Asset Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sony WH-1000XM5 Headphones"
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Wireless noise canceling headphones, Silver color"
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Price, Currency, Merchant */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Purchase Price
              </label>
              <input
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Currency
              </label>
              <select
                value={purchaseCurrency}
                onChange={(e) => setPurchaseCurrency(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Merchant / Store
              </label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g. Amazon, Croma, Apple"
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Dates: Purchase, Warranty Expiry, Exchange Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Purchase Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Warranty Expiry
              </label>
              <input
                type="date"
                value={warrantyExpiry}
                onChange={(e) => setWarrantyExpiry(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Exchange Deadline
              </label>
              <input
                type="date"
                value={exchangeDeadline}
                onChange={(e) => setExchangeDeadline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Invoice Number & Image / File Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Invoice / Order #
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="e.g. INV-2026-9812"
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Photo or Receipt Image
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border bg-background hover:bg-muted/40 cursor-pointer transition-colors text-xs font-medium text-muted-foreground">
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                  ) : (
                    <Upload className="h-4 w-4 text-indigo-500" />
                  )}
                  <span>{imageUrl ? 'Change Image' : 'Upload File / Image'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {uploadError && <p className="text-xs text-destructive mt-1">{uploadError}</p>}
            </div>
          </div>

          {/* Image Preview if uploaded */}
          {imageUrl && (
            <div className="relative h-32 w-full rounded-2xl border border-border overflow-hidden bg-muted/40">
              <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 rounded-full bg-background/80 p-1 text-foreground hover:bg-background"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Notes & Special Instructions
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Serial number, extended warranty details, claim instructions..."
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-medium text-white shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>{assetToEdit ? 'Save Changes' : 'Create Asset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
