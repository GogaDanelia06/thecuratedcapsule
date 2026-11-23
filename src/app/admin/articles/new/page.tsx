import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { authorizedEditor } from "@/lib/supabase/server";
import { ArticleEditor } from "@/features/admin/article-editor";
import { emptyArticle } from "@/lib/cms/schema";
export const dynamic = "force-dynamic";
export default async function NewArticle() {
  if (!(await authorizedEditor())) redirect("/admin/login?error=access");
  return (
    <ArticleEditor
      initial={{
        id: randomUUID(),
        document: emptyArticle(),
        revision: 0,
        published_revision: null,
        updated_at: new Date().toISOString(),
      }}
    />
  );
}
