import { revalidateTag } from "next/cache";
import { z } from "zod";
import { sameOrigin } from "@/lib/cms/http";
import { productSchema } from "@/lib/cms/schema";
import { CONTENT_TAG, authorizedEditor } from "@/lib/supabase/server";

const saveSchema = z
  .object({ mode: z.enum(["create", "update"]), product: productSchema })
  .strict();
const deleteSchema = z.object({ id: z.string().max(80) }).strict();

const COLUMNS = "id,name,brand,price,photo,photo_alt,url";

function fail(error: string, status: number) {
  return Response.json({ error }, { status });
}

async function guard(request: Request) {
  if (!sameOrigin(request)) return { response: fail("Invalid origin.", 403) };
  const editor = await authorizedEditor();
  if (!editor) return { response: fail("Your session expired. Sign in again.", 401) };
  return { editor };
}

export async function POST(request: Request) {
  const { editor, response } = await guard(request);
  if (!editor) return response;

  const input = saveSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return fail(input.error.issues[0]?.message ?? "Check the product details.", 400);
  }
  const { mode, product } = input.data;
  const row = { ...product, updated_at: new Date().toISOString() };

  const { data, error } =
    mode === "create"
      ? await editor.client.from("products").insert(row).select(COLUMNS).single()
      : await editor.client
          .from("products")
          .update(row)
          .eq("id", product.id)
          .select(COLUMNS)
          .single();

  if (error) {
    if (error.code === "23505") return fail("A product with this name already exists.", 409);
    if (error.code === "PGRST116") return fail("This product was deleted in another tab.", 404);
    return fail("The product could not be saved. Please try again.", 500);
  }
  revalidateTag(CONTENT_TAG, { expire: 0 });
  return Response.json({ product: productSchema.parse(data) });
}

export async function DELETE(request: Request) {
  const { editor, response } = await guard(request);
  if (!editor) return response;

  const input = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return fail("Choose a product to delete.", 400);

  const { error } = await editor.client.from("products").delete().eq("id", input.data.id);
  if (error) return fail("The product could not be deleted. Please try again.", 500);
  revalidateTag(CONTENT_TAG, { expire: 0 });
  return Response.json({ deleted: true });
}
