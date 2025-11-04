'use client';

import { createBrowserClient } from '@supabase/ssr';

// Client-side Supabase client (only for use in 'use client' components)
export const supabaseBrowser = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// Backwards compatible named export
let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_, prop) {
    if (!clientInstance) {
      clientInstance = supabaseBrowser();
    }
    return (clientInstance as any)[prop];
  }
});
