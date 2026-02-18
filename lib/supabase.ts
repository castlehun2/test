import { createClient } from '@supabase/supabase-js';

export type ResponseRow = {
  id: string;
  name: string;
  team: string | null;
  role: string | null;
  submitted_at: string;
  q1_frequency: string;
  q2_depth: string;
  q3_application: string;
  q4_system_items: string[];
  q5_literacy: string;
  q5_prompt: string;
  q5_validation: string;
  q5_security: string;
  score_total: number;
  level: string;
};

export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error('Supabase env vars are missing.');
  }

  return createClient(url, serviceRole, { auth: { persistSession: false } });
}
