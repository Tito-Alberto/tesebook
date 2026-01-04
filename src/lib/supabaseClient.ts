import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://dpykoyrbukiqundvzegc.supabase.co';
const FALLBACK_ANON = 'sb_publishable_SijqO6Qf6jOD6Je2RsYRuw_P2rBCWMv';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON;

if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Usando valores default do Supabase. Defina EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no seu .env.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
