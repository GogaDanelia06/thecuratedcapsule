import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { databaseConfig } from "./config";

/** Cache tag on every public article query; publishing revalidates it. */
export const ARTICLES_TAG = "articles";

/** Signed-in editor, acting through their own session cookie. */
export async function editorClient() {
  const { url, key } = databaseConfig();
  const jar = await cookies();
  return createServerClient(url, key, {
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (values) => {
        try {
          values.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          // Server Components cannot set cookies; the proxy refreshes them instead.
        }
      },
    },
  });
}

/**
 * Anonymous reader for public pages. Responses go into the Next.js data cache
 * under ARTICLES_TAG, so visitors are served cached pages and the database is
 * only queried again after a publish (or once an hour as a safety net).
 */
export function publicClient() {
  const { url, key } = databaseConfig();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "force-cache",
          next: { tags: [ARTICLES_TAG], revalidate: 3600 },
        }),
    },
  });
}

/** Uncached anonymous client, for checks that must see the live database. */
export function liveClient() {
  const { url, key } = databaseConfig();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}

export async function authorizedEditor() {
  const client = await editorClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return null;
  const { data } = await client
    .from("cms_editors")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  return data ? { client, user } : null;
}
