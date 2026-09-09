/*
  PSME-VSUSC Merchandise
  Replace these two values with your Supabase project values.

  IMPORTANT:
  - Use the Supabase Project URL.
  - Use the browser-safe "anon/public" key.
  - NEVER put a service_role/secret key in this file.
*/
const SUPABASE_URL = "https://uqrasnqwttgsrhquuses.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_kcrFFi0V720yDJ5cFPqUeg_6-zY3si-";

const supabaseReady =
  SUPABASE_URL.startsWith("https://") &&
  SUPABASE_URL.endsWith(".supabase.co") &&
  SUPABASE_ANON_KEY.startsWith("sb_publishable_");

const supabaseClient = supabaseReady
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const STORAGE_BUCKET = "payment-proofs";