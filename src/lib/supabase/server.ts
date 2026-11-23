import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { databaseConfig } from "./config";

export async function editorClient() {
  const { url, key } = databaseConfig();
  const jar = await cookies();
  return createServerClient(url, key, {
    cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" },
    cookies: {
      getAll: () => jar.getAll(),
      setAll: values => { try { values.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch { /* Proxy refreshes cookies for Server Components. */ } },
    },
  });
}
export function publicClient() {
  const { url, key } = databaseConfig();
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) } });
}
export async function authorizedEditor() {
  const client = await editorClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  const { data } = await client.from("cms_editors").select("user_id").eq("user_id", user.id).maybeSingle();
  return data ? { client, user } : null;
}
