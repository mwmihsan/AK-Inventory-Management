import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase project URL and anon key
const supabaseUrl = 'https://olwsbgarnulhvmltppff.supabase.co'; // e.g., 'https://abcdefgh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sd3NiZ2FybnVsaHZtbHRwcGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMDEzOTQsImV4cCI6MjA2MzU3NzM5NH0.2Zwudn9IS7vlBAYysD_2cV6KT6SegIfRfUlOyf_lP2k'; // From your project settings

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types (matching our schema)
export interface DatabaseProduct {
  id: string;
  name: string;
  barcode?: string;
  category: string;
  unit: 'kg' | 'g' | 'lb' | 'oz' | 'piece';
  unit_price: number;
  current_stock: number;
  min_stock_level: number;
  lead_time: number;
  notes?: string;
  added_date: string;
  last_updated: string;
}

export interface DatabaseSupplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone: string;
  address?: string;
  notes?: string;
  added_date: string;
  last_updated: string;
}

export interface DatabasePurchase {
  id: string;
  date: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  supplier_id: string;
  supplier_name: string;
  payment_method: 'cash' | 'credit' | 'cheque';
  notes?: string;
  created_at: string;
}