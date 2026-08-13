import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wamdmopfyhcbljeeclph.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbWRtb3BmeWhjYmxqZWVjbHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MTkxOTAsImV4cCI6MjA5MzM5NTE5MH0.zWu_CLZ2RGCVaY_Tbj81V1xAJOI6xbgaPnnpxgnt7cg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
