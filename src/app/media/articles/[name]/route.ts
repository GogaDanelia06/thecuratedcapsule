import { databaseConfigured } from "@/lib/supabase/config";
import { editorClient, liveClient } from "@/lib/supabase/server";

const BUCKET = "article-images";
const FILE_NAME = /^[0-9a-f-]{36}\.webp$/;

function image(data: Blob, cacheControl: string) {
  return new Response(data, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": cacheControl,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(_request: Request, { params }: RouteContext<"/media/articles/[name]">) {
  const { name } = await params;
  if (!databaseConfigured() || !FILE_NAME.test(name)) {
    return new Response("Not found", { status: 404 });
  }

  // The storage policies decide what is public: photos used by a published article.
  const published = await liveClient().storage.from(BUCKET).download(name);
  if (published.data) {
    // Every upload gets a new random name, so a file never changes and the CDN
    // can keep it for a year instead of asking the database again.
    return image(published.data, "public, max-age=31536000, s-maxage=31536000, immutable");
  }

  // Unpublished photos are only visible to a signed-in editor.
  const client = await editorClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return new Response("Not found", { status: 404 });
  const draft = await client.storage.from(BUCKET).download(name);
  return draft.data
    ? image(draft.data, "private, no-store")
    : new Response("Not found", { status: 404 });
}
