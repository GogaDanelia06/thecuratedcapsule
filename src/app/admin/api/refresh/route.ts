import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { requestOrigin, sameOrigin } from "@/lib/cms/http";
import { CONTENT_TAG, authorizedEditor } from "@/lib/supabase/server";

/**
 * "Refresh website" in the admin: drops the cached public pages so changes made
 * outside the admin (for example SQL run in Supabase) show up straight away.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response("Invalid origin", { status: 403 });
  if (!(await authorizedEditor())) return new Response("Sign in again", { status: 401 });
  revalidateTag(CONTENT_TAG, { expire: 0 });
  return NextResponse.redirect(new URL("/admin?refreshed=1", requestOrigin(request)), 303);
}
