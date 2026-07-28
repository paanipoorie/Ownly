import type { User, Asset, TimelineEvent } from './types';

const API_BASE = 'http://localhost:3000/api';

export class APIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

let globalOnError: ((error: APIError) => void) | null = null;

export function setGlobalErrorHandler(handler: (error: APIError) => void) {
  globalOnError = handler;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    let msg = `request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body.error) msg = body.error;
    } catch {}
    const err = new APIError(msg, res.status);
    if (globalOnError) globalOnError(err);
    throw err;
  }
  return res.json();
}

// Sample mock data for demo mode when user is not authenticated with Go backend
const INITIAL_MOCK_ASSETS: Asset[] = [
  {
    id: 'demo-asset-1',
    user_id: 'demo-user',
    name: 'MacBook Pro 16" M3 Max',
    description: 'Space Black, 36GB RAM, 1TB SSD. Primary work computer.',
    category: 'Electronics',
    merchant: 'Apple Store',
    invoice_number: 'INV-2026-9812',
    purchase_price: 349900.0,
    purchase_currency: 'INR',
    purchase_date: new Date(Date.now() - 45 * 86400000).toISOString().split('T')[0],
    warranty_expiry: new Date(Date.now() + 320 * 86400000).toISOString().split('T')[0],
    exchange_deadline: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    notes: 'Covered under AppleCare+. Receipt uploaded.',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: 'demo-asset-2',
    user_id: 'demo-user',
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Wireless Noise Canceling Headphones in Silver.',
    category: 'Electronics',
    merchant: 'Amazon',
    invoice_number: 'AMZ-88219-441',
    purchase_price: 29990.0,
    purchase_currency: 'INR',
    purchase_date: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
    warranty_expiry: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0], // Expiring soon!
    exchange_deadline: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // Exchange open!
    notes: 'Bought during festival sale with bank discount.',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'demo-asset-3',
    user_id: 'demo-user',
    name: 'Dyson V15 Detect Vacuum',
    description: 'Cordless vacuum cleaner with laser illumination.',
    category: 'Appliances',
    merchant: 'Croma',
    invoice_number: 'CRM-77402',
    purchase_price: 62900.0,
    purchase_currency: 'INR',
    purchase_date: new Date(Date.now() - 400 * 86400000).toISOString().split('T')[0],
    warranty_expiry: new Date(Date.now() - 35 * 86400000).toISOString().split('T')[0], // Expired!
    exchange_deadline: new Date(Date.now() - 385 * 86400000).toISOString().split('T')[0],
    notes: '2 year warranty expired recently.',
    image_url: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 400 * 86400000).toISOString(),
  },
  {
    id: 'demo-asset-4',
    user_id: 'demo-user',
    name: 'Herman Miller Aeron Chair',
    description: 'Ergonomic Office Chair, Size B, Graphite.',
    category: 'Furniture',
    merchant: 'Herman Miller Direct',
    invoice_number: 'HM-2025-0041',
    purchase_price: 145000.0,
    purchase_currency: 'INR',
    purchase_date: new Date(Date.now() - 120 * 86400000).toISOString().split('T')[0],
    warranty_expiry: new Date(Date.now() + 3500 * 86400000).toISOString().split('T')[0], // 12-yr warranty
    exchange_deadline: new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0],
    notes: '12-year manufacturer warranty.',
    image_url: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=800&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
  },
];

let localAssets: Asset[] = [...INITIAL_MOCK_ASSETS];

async function tryFetch<T>(fn: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof APIError && globalOnError) globalOnError(err);
    return fallback();
  }
}

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    return await apiFetch<User>('/auth/me');
  } catch {
    return null;
  }
}

export async function fetchAssets(): Promise<Asset[]> {
  return tryFetch(
    async () => {
      const data = await apiFetch<Asset[]>('/assets');
      if (Array.isArray(data)) return data;
      throw new APIError('invalid response', 500);
    },
    () => [...localAssets]
  );
}

export async function searchAssets(query: string, category?: string): Promise<Asset[]> {
  return tryFetch(
    async () => {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (category) params.append('category', category);
      const data = await apiFetch<Asset[]>(`/search?${params.toString()}`);
      if (Array.isArray(data)) return data;
      throw new APIError('invalid response', 500);
    },
    () =>
      localAssets.filter((item) => {
        if (query) {
          const q = query.toLowerCase();
          const match =
            item.name?.toLowerCase().includes(q) ||
            item.merchant?.toLowerCase().includes(q) ||
            item.invoice_number?.toLowerCase().includes(q) ||
            item.notes?.toLowerCase().includes(q) ||
            item.category?.toLowerCase().includes(q);
          if (!match) return false;
        }
        if (category && category !== 'all' && item.category !== category) return false;
        return true;
      })
  );
}

export async function createAsset(asset: Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Asset> {
  return tryFetch(
    async () => {
      return apiFetch<Asset>('/assets', {
        method: 'POST',
        body: JSON.stringify(asset),
      });
    },
    () => {
      const newAsset: Asset = {
        ...asset,
        id: `local-${Date.now()}`,
        user_id: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localAssets = [newAsset, ...localAssets];
      return newAsset;
    }
  );
}

export async function updateAsset(id: string, asset: Partial<Asset>): Promise<Asset> {
  return tryFetch(
    async () => {
      return apiFetch<Asset>(`/assets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(asset),
      });
    },
    () => {
      localAssets = localAssets.map((item) =>
        item.id === id ? { ...item, ...asset, updated_at: new Date().toISOString() } : item
      );
      return localAssets.find((item) => item.id === id)!;
    }
  );
}

export async function deleteAsset(id: string): Promise<boolean> {
  try {
    await apiFetch(`/assets/${id}`, { method: 'DELETE' });
    return true;
  } catch (err) {
    if (err instanceof APIError) {
      if (globalOnError) globalOnError(err);
      localAssets = localAssets.filter((item) => item.id !== id);
      return true;
    }
    localAssets = localAssets.filter((item) => item.id !== id);
    return true;
  }
}

export async function fetchTimeline(): Promise<TimelineEvent[]> {
  return tryFetch(
    async () => {
      const data = await apiFetch<TimelineEvent[]>('/timeline');
      if (Array.isArray(data)) return data;
      throw new APIError('invalid response', 500);
    },
    () => {
      const events: TimelineEvent[] = [];
      localAssets.forEach((asset) => {
        if (asset.purchase_date) {
          events.push({
            id: `evt-p-${asset.id}`,
            user_id: asset.user_id,
            asset_id: asset.id,
            asset: asset,
            event_type: 'purchase',
            title: `Purchased ${asset.name}`,
            description: `Bought from ${asset.merchant || 'Merchant'} for ${asset.purchase_currency} ${asset.purchase_price.toLocaleString()}`,
            event_date: asset.purchase_date,
          });
        }
        if (asset.warranty_expiry) {
          events.push({
            id: `evt-w-${asset.id}`,
            user_id: asset.user_id,
            asset_id: asset.id,
            asset: asset,
            event_type: 'warranty',
            title: `Warranty Expiry: ${asset.name}`,
            description: `Warranty coverage expires on ${asset.warranty_expiry}`,
            event_date: asset.warranty_expiry,
          });
        }
        if (asset.exchange_deadline) {
          events.push({
            id: `evt-e-${asset.id}`,
            user_id: asset.user_id,
            asset_id: asset.id,
            asset: asset,
            event_type: 'exchange',
            title: `Exchange Deadline: ${asset.name}`,
            description: `Return/Exchange window closes on ${asset.exchange_deadline}`,
            event_date: asset.exchange_deadline,
          });
        }
      });
      return events.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
    }
  );
}

export async function uploadFile(file: File): Promise<{ url: string; filename: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new APIError(body.error || 'upload failed', res.status);
    }
    return await res.json();
  } catch (err) {
    if (err instanceof APIError && globalOnError) globalOnError(err);
    return {
      url: URL.createObjectURL(file),
      filename: file.name,
    };
  }
}

let localCandidates: any[] = [
  {
    id: 'cand-1',
    user_id: 'demo-user',
    gmail_message_id: 'msg-amz-8812',
    sender: 'auto-confirm@amazon.in',
    subject: 'Your Amazon.in order #408-7712941-0091221 for Sony Bravia 55" 4K TV',
    snippet: 'Thank you for shopping with Amazon.in. Your order details: Sony Bravia 55" 4K Ultra HD Smart TV for ₹59,990.00.',
    parsed_data: JSON.stringify({
      name: 'Sony Bravia 55" 4K Ultra HD Smart TV',
      merchant: 'Amazon',
      category: 'Electronics',
      invoice_number: '408-7712941-0091221',
      purchase_price: 59990,
      purchase_currency: 'INR',
      purchase_date: new Date().toISOString().split('T')[0],
      description: 'Imported from Amazon Order Email',
    }),
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cand-2',
    user_id: 'demo-user',
    gmail_message_id: 'msg-fk-9902',
    sender: 'orders@flipkart.com',
    subject: 'Order Confirmed: Noise ColorFit Pro 4 Smartwatch',
    snippet: 'Your Flipkart Tax Invoice for Noise ColorFit Pro 4 Smartwatch. Total Amount: ₹2,499.00.',
    parsed_data: JSON.stringify({
      name: 'Noise ColorFit Pro 4 Smartwatch',
      merchant: 'Flipkart',
      category: 'Electronics',
      invoice_number: 'FK-990241',
      purchase_price: 2499,
      purchase_currency: 'INR',
      purchase_date: new Date().toISOString().split('T')[0],
      description: 'Imported from Flipkart Invoice',
    }),
    status: 'pending',
    created_at: new Date().toISOString(),
  },
];

export async function fetchImportCandidates(): Promise<any[]> {
  return tryFetch(
    async () => {
      const data = await apiFetch<any[]>('/imports');
      if (Array.isArray(data)) return data;
      throw new APIError('invalid response', 500);
    },
    () => localCandidates.filter((c) => c.status === 'pending')
  );
}

export async function scanGmailInbox(): Promise<any[]> {
  return tryFetch(
    async () => {
      const data = await apiFetch<any[]>('/imports/scan', { method: 'POST' });
      if (Array.isArray(data)) return data;
      throw new APIError('invalid response', 500);
    },
    () => localCandidates.filter((c) => c.status === 'pending')
  );
}

export async function confirmCandidate(id: string): Promise<Asset | null> {
  try {
    return await apiFetch<Asset>(`/imports/${id}/confirm`, { method: 'POST' });
  } catch (err) {
    if (err instanceof APIError && globalOnError) globalOnError(err);
    const found = localCandidates.find((c) => c.id === id);
    if (found) {
      found.status = 'confirmed';
      const parsed = JSON.parse(found.parsed_data);
      return createAsset({
        name: parsed.name,
        description: parsed.description,
        category: parsed.category || 'Electronics',
        merchant: parsed.merchant,
        invoice_number: parsed.invoice_number,
        purchase_price: parsed.purchase_price,
        purchase_currency: parsed.purchase_currency || 'INR',
        purchase_date: parsed.purchase_date,
        warranty_expiry: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        exchange_deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        notes: `Imported via Gmail candidate (${found.gmail_message_id})`,
      });
    }
    return null;
  }
}

export async function ignoreCandidate(id: string): Promise<boolean> {
  try {
    await apiFetch(`/imports/${id}/ignore`, { method: 'POST' });
    return true;
  } catch (err) {
    if (err instanceof APIError && globalOnError) globalOnError(err);
    const found = localCandidates.find((c) => c.id === id);
    if (found) found.status = 'ignored';
    return true;
  }
}

export async function fetchReminders(): Promise<any[]> {
  return tryFetch(
    async () => {
      const data = await apiFetch<any[]>('/reminders');
      if (Array.isArray(data)) return data;
      throw new APIError('invalid response', 500);
    },
    () => [
      {
        id: 'rem-1',
        user_id: 'demo-user',
        reminder_type: 'warranty_7day',
        scheduled_for: new Date(Date.now() + 8 * 86400000).toISOString(),
        sent_at: null,
      },
      {
        id: 'rem-2',
        user_id: 'demo-user',
        reminder_type: 'exchange_3day',
        scheduled_for: new Date(Date.now() - 1 * 86400000).toISOString(),
        sent_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ]
  );
}

export async function triggerProcessReminders(): Promise<number> {
  try {
    const data = await apiFetch<{ processed: number }>('/reminders/process', { method: 'POST' });
    return data.processed || 0;
  } catch (err) {
    if (err instanceof APIError && globalOnError) globalOnError(err);
    return 1;
  }
}

export async function fetchSeedDemo(): Promise<any> {
  return apiFetch('/seed/demo', { method: 'POST' });
}
