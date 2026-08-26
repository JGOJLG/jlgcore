import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://odejfklpijxktvabhjms.supabase.co";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_oe4c1PNAThAMLaFJwAx9aA_x1gBB3wt";

export const supabase = createClient(supabaseUrl, supabaseKey);
