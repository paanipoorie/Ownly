export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  google_id?: string;
  created_at?: string;
}

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category: string;
  merchant: string;
  invoice_number?: string;
  purchase_price: number;
  purchase_currency: string;
  purchase_date?: string;
  warranty_expiry?: string;
  exchange_deadline?: string;
  notes?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimelineEvent {
  id: string;
  user_id: string;
  asset_id?: string;
  asset?: Asset;
  event_type: 'purchase' | 'warranty' | 'exchange' | string;
  title: string;
  description?: string;
  event_date: string;
  created_at?: string;
}

export interface ImportCandidate {
  id: string;
  user_id: string;
  gmail_message_id: string;
  sender: string;
  subject: string;
  snippet: string;
  parsed_data: string; // JSON string
  status: 'pending' | 'confirmed' | 'ignored';
  created_at?: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  asset_id?: string;
  asset?: Asset;
  reminder_type: string;
  scheduled_for: string;
  sent_at?: string;
  created_at?: string;
}

export type WarrantyStatus = 'active' | 'expiring_soon' | 'expired' | 'none';
export type ExchangeStatus = 'active' | 'expiring_soon' | 'expired' | 'none';

export interface FilterState {
  search: string;
  category: string;
  warrantyStatus: string;
  sortBy: 'newest' | 'oldest' | 'price_desc' | 'price_asc' | 'warranty_asc';
}
