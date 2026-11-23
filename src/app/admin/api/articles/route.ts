import { revalidateTag } from "next/cache";
import { z } from "zod";
import { sameOrigin } from "@/lib/cms/http";
import { saveSchema } from "@/lib/cms/schema";
import { CONTENT_TAG, authorizedEditor } from "@/lib/supabase/server";

const MAX_BODY_BYTES = 300_000;

function fail(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail("Invalid origin.", 403);
  const editor = await authorizedEditor();
  if (!editor) return fail("Your editor session expired. Sign in again before saving.", 401);

  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) return fail("This article is too large.", 413);

  let input;
  try {
    input = saveSchema.parse(JSON.parse(body));
  } catch {
    return fail("Check the title, web address, date, and article fields.", 400);
  }
  const { action, document } = input;
  if (document.products.length > 0) {
    const { data: known } = await editor.client
      .from("products")
      .select("id")
      .in("id", document.products);
    if (known?.length !== new Set(document.products).size) {
      return fail("One of the selected products no longer exists. Untick it and try again.", 400);
    }
  }
  if (action === "publish" && !document.body.trim()) {
    return fail("Write your article before publishing.", 400);
  }
  if (action === "publish" && document.cover && !document.coverAlt.trim()) {
    return fail("Add a cover photo description before publishing.", 400);
  }

  const { data, error } = await editor.client.rpc("save_article", {
    p_id: input.id,
    p_document: document,
    p_revision: input.revision,
    p_action: action,
  });
  if (error) {
    if (error.code === "40001") {
      return fail(
        "Another tab saved this article. Copy your changes, then reload before saving again.",
        409,
      );
    }
    if (error.code === "23505") {
      return fail("That web address belongs to another article. Choose a different one.", 409);
    }
    return fail(
      "The article could not be saved. Your changes are still in the editor. Please try again.",
      500,
    );
  }

  // Drafts are private, so only publishing changes what readers see. Expire the
  // cached pages immediately so the editor sees the result on the next load.
  if (action !== "save") revalidateTag(CONTENT_TAG, { expire: 0 });

  return Response.json({ draft: data });
}

const deleteSchema = z.object({ id: z.uuid() }).strict();

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return fail("Invalid origin.", 403);
  const editor = await authorizedEditor();
  if (!editor) return fail("Your editor session expired. Sign in again before deleting.", 401);

  const input = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return fail("Choose an article to delete.", 400);

  const { data: wasPublished, error } = await editor.client.rpc("delete_article", {
    p_id: input.data.id,
  });
  if (error) {
    if (error.code === "P0002") return fail("This article was already deleted.", 404);
    if (error.code === "PGRST202") {
      return fail("Deleting needs a one-time database update. Ask the site administrator.", 500);
    }
    return fail("The article could not be deleted. Please try again.", 500);
  }

  if (wasPublished) revalidateTag(CONTENT_TAG, { expire: 0 });
  return Response.json({ deleted: true });
}
