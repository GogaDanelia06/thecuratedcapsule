import { publicClient, editorClient } from "@/lib/supabase/server";
import { databaseConfigured } from "@/lib/supabase/config";
export const dynamic = "force-dynamic";
export async function GET(_request: Request, {params}: {params:Promise<{name:string}>}) {
  const {name} = await params;
  if (!databaseConfigured() || !/^[0-9a-f-]{36}\.webp$/.test(name)) return new Response("Not found",{status:404});
  // Let the database storage policies decide if this photo is public.
  const publicResult = await publicClient().storage.from("article-images").download(name);
  if (publicResult.data) return new Response(publicResult.data,{headers:{"Content-Type":"image/webp","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
  const client = await editorClient();
  const {data:{user}} = await client.auth.getUser();
  if (!user) return new Response("Not found",{status:404});
  const {data} = await client.storage.from("article-images").download(name);
  return data ? new Response(data,{headers:{"Content-Type":"image/webp","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}}) : new Response("Not found",{status:404});
}
