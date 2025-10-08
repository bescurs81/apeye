import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ApiKey = {
  id: string;
  user_id: string;
  service_name: string;
  email_username: string;
  encrypted_password: string;
  encrypted_api_key: string;
  notes: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};
