import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xywmdsieytqsxqpqvcwj.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5d21kc2lleXRxc3hxcHF2Y3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NTQ3MjUsImV4cCI6MjEwMjIzMDcyNX0.NLcWlLKvdmrJY5z-n27vWPD_Y3nAotC7nPtnRtKPReY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
