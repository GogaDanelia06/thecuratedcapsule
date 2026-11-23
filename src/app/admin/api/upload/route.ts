import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { authorizedEditor } from "@/lib/supabase/server";
import { sameOrigin } from "@/lib/cms/http";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  const editor = await authorizedEditor();
  if (!editor) return Response.json({ error: "Sign in again to upload photos." }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (
    !(file instanceof File) ||
    file.size > 4 * 1024 * 1024 ||
    !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)
  )
    return Response.json(
      { error: "Choose a JPG, PNG, WebP, or AVIF photo under 4 MB." },
      { status: 400 },
    );
  try {
    // Decode real image bytes, remove metadata and reject SVG/HTML uploads.
    const output = await sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 40_000_000,
    })
      .rotate()
      .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
    const name = `${randomUUID()}.webp`;
    const { error } = await editor.client.storage
      .from("article-images")
      .upload(name, output, { contentType: "image/webp", upsert: false });
    if (error) throw error;
    return Response.json({ url: `/media/articles/${name}` });
  } catch {
    return Response.json(
      { error: "The photo could not be uploaded. Check that it is a valid image and try again." },
      { status: 400 },
    );
  }
}
