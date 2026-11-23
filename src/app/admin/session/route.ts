import { NextResponse } from "next/server";
import { editorClient } from "@/lib/supabase/server";
import { databaseConfigured } from "@/lib/supabase/config";
import { requestOrigin, sameOrigin } from "@/lib/cms/http";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response("Invalid origin", { status: 403 });
  const origin = requestOrigin(request);
  const form = await request.formData();
  const next = String(form.get("next") || "/admin");
  const destination = /^\/admin(?:\/|$)/.test(next) && !next.includes("\\") && !next.startsWith("/admin/session") && !next.startsWith("/admin/login") ? next : "/admin";
  const fail = (error: string) => NextResponse.redirect(new URL(`/admin/login?error=${error}&next=${encodeURIComponent(destination)}`, origin),303);
  if (!databaseConfigured()) return fail("configuration");
  const client = await editorClient();
  if (form.get("action") === "logout") {
    await client.auth.signOut();
    return NextResponse.redirect(new URL("/admin/login",origin),303);
  }
  const email = String(form.get("email") || "").trim();
  const password = String(form.get("password") || "");
  if (email.length > 320 || password.length > 1000) return fail("credentials");
  const {data,error} = await client.auth.signInWithPassword({email,password});
  if (error || !data.user) return fail(error?.status === 429 ? "rate" : "credentials");
  const {data: editor} = await client.from("cms_editors").select("user_id").eq("user_id",data.user.id).maybeSingle();
  if (!editor) { await client.auth.signOut(); return fail("access"); }
  return NextResponse.redirect(new URL(destination,origin),303);
}
