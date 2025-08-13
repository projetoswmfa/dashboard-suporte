// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://orqxfneopvvdwnfvnxya.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycXhmbmVvcHZ2ZHduZnZueHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODExNTIsImV4cCI6MjA3MDA1NzE1Mn0.IDr6lWDxO8mzsL55HJtNqIvEwNd5HKRURv0OXnkuIBU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    },
    heartbeatIntervalMs: 15000,
    reconnectAfterMs: () => [1000, 2000, 5000, 10000]
  },
  global: {
    headers: {
      'X-Client-Info': 'dashboard-chamados@1.0.0'
    }
  }
});