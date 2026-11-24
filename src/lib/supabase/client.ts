import { createBrowserClient } from "@supabase/ssr"
import { supabaseEnv } from "@/lib/supabase/env"

export function createClient() {
  const env = supabaseEnv()
  if (!env) {
    throw new Error("Supabase env is missing")
  }
  return createBrowserClient(env.url, env.key)
}
