import { notFound, redirect } from "next/navigation";
import { authorizedEditor } from "@/lib/supabase/server";
import { ArticleEditor } from "@/features/admin/article-editor";
import type { Draft } from "@/lib/cms/schema";
export const dynamic = "force-dynamic";
export default async function EditPage({params}: {params:Promise<{id:string}>}) {
  const editor = await authorizedEditor(); if (!editor) redirect("/admin/login?error=access");
  const {id} = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const {data,error} = await editor.client.from("article_drafts").select("*").eq("id",id).maybeSingle();
  if (error) throw new Error("The article could not be loaded.");
  if (!data) notFound();
  return <ArticleEditor initial={data as Draft}/>;
}
