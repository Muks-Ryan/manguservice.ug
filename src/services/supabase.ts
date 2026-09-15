import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gsiygqwnezxjgolacndm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzaXlncXduZXp4amdvbGFjbmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMjc4NjcsImV4cCI6MjEwMDkwMzg2N30.pWlVvVqARL2ESyU9KJZDWaKrq1K4kygmxs1f9XE-dDc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
