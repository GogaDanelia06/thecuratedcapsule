import { revalidateTag } from "next/cache";
import { sameOrigin } from "@/lib/cms/http";
import { homepageSchema } from "@/lib/cms/schema";
import { CONTENT_TAG, authorizedEditor } from "@/lib/supabase/server";

function fail(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Invalid origin.", 403);
  const editor = await authorizedEditor();
  if (!editor) return fail("Your session expired. Sign in again.", 401);

  const input = homepageSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return fail(input.error.issues[0]?.message ?? "Check the homepage settings.", 400);
  }
  const homepage = input.data;

  const ids = homepage.look.pieces.map((piece) => piece.productId);
  if (new Set(ids).size !== ids.length)
    return fail("Each product can appear once in the look.", 400);
  if (ids.length > 0) {
    const { data } = await editor.client.from("products").select("id").in("id", ids);
    if (data?.length !== ids.length) {
      return fail(
        "One of the products in the look no longer exists. Remove it and try again.",
        400,
      );
    }
  }

  const { error } = await editor.client
    .from("site_settings")
    .upsert({ id: "homepage", document: homepage, updated_at: new Date().toISOString() });
  if (error) return fail("The homepage could not be saved. Please try again.", 500);

  revalidateTag(CONTENT_TAG, { expire: 0 });
  return Response.json({ homepage });
}
