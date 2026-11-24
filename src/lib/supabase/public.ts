import { createClient } from "@supabase/supabase-js"
import { supabaseEnv } from "@/lib/supabase/env"

export function createPublicClient() {
  const env = supabaseEnv()
  if (!env) return null
  return createClient(env.url, env.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}
