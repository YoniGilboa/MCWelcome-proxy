import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

// Client for use in client components - created lazily at runtime
export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}

// Backwards compatible export for existing code
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabaseBrowserClient()[prop as keyof SupabaseClient]
  }
})
