import React, { useState } from 'react';
import { X, Upload, Loader2, Check } from 'lucide-react';
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
    } catch {
      setUploadError('Failed to upload file.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-xs animate-fade-in overflow-y-auto" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-lg border border-neutral-200 dark:border-neutral-800 bg-card shadow-lg overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-5 py-3.5 bg-neutral-50 dark:bg-neutral-900/50">
          <h3 className="text-sm font-bold text-foreground">
            {assetToEdit ? 'Edit Asset Specification' : 'Add Asset Specification'}
          </h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-foreground transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Item Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sony WH-1000XM5 Headphones"
              className="w-full px-3 py-2 rounded-md bg-card border border-neutral-200 dark:border-neutral-800 text-xs text-foreground focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
            />
          </div>

          {/* Description & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Wireless noise canceling headphones"
                className="w-full px-3 py-2 rounded-md bg-card border border-neutral-200 dark:border-neutral-800 text-xs text-foreground focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-card border border-neutral-200 dark:border-neutral-800 text-xs text-foreground focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price, Currency, Merchant */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5">
                Purchase Price
              </label>
              <input
                type="number"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-md bg-card border border-neutral-200 dark:border-neutral-800 text-xs text-foreground focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5">
                Currency
              </label>
              <select
                value={purchaseCurrency}
                onChange={(e) => setPurchaseCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-card border border-neutral-200 dark:border-neutral-800 text-xs text-foreground focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5">
                Merchant / Store
              </label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g. Amazon, Apple Store"
                className="w-full px-3 py-2 rounded-md bg-card border border-neutral-200 dark:border-neutral-800 text-xs text-foreground focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
              />
            </div>
          </div>

          {/* Dates: Purchase, Warranty Expiry, Exchange Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5">
                Purchase Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-card border border-neutral-200 dark:border-neutral-800 text-xs text-foreground focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5">
                Warranty Expiry
              </label>
              <input
                type="date"
                value={warrantyExpiry}
                onChange={(e) => setWarrantyExpiry(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-card border border-neutral-200 dark:border-neutral-800 text-xs text-foreground focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5">
                Exchange Deadline
              </label>
              <input
                type="date"
                value={exchangeDeadline}
                onChange={(e) => setExchangeDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-card border border-neutral-200 dark:border-neutral-800 text-xs text-foreground focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
              />
            </div>
          </div>

          {/* Invoice Number & Receipt Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5">
                Invoice / Order #
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="e.g. INV-2026-9812"
                className="w-full px-3 py-2 rounded-md bg-card border border-neutral-200 dark:border-neutral-800 text-xs text-foreground focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5">
                Photo or Receipt File
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-dashed border-neutral-200 dark:border-neutral-800 bg-background hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors text-xs font-semibold text-neutral-500">
                  {isUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  <span>{imageUrl ? 'Replace File' : 'Choose File'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {uploadError && <p className="text-[10px] text-destructive mt-1">{uploadError}</p>}
            </div>
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="relative aspect-16/10 w-full rounded-md border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-neutral-50 dark:bg-neutral-900">
              <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 rounded-md bg-background/80 p-1 text-foreground hover:bg-background border border-neutral-200 dark:border-neutral-800"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1.5">
              Notes & Special Instructions
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Serial numbers, claim links, return codes..."
              className="w-full px-3 py-2 rounded-md bg-card border border-neutral-200 dark:border-neutral-800 text-xs text-foreground focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              <span>{assetToEdit ? 'Save changes' : 'Create Asset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
