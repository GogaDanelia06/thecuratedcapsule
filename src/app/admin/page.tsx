import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/features/admin/admin-header";
import { ArticleList } from "@/features/admin/article-list";
import styles from "@/features/admin/studio.module.css";
import { emptyHomepage, homepageSchema, type Draft } from "@/lib/cms/schema";
import { authorizedEditor } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const editor = await authorizedEditor();
  if (!editor) redirect("/admin/login?error=access");
  const { deleted } = await searchParams;

  const [{ data, error }, settings] = await Promise.all([
    editor.client.from("article_drafts").select("*").order("updated_at", { ascending: false }),
    editor.client.from("site_settings").select("document").eq("id", "homepage").maybeSingle(),
  ]);
  const homepage = settings.data ? homepageSchema.parse(settings.data.document) : emptyHomepage;

  return (
    <main className={styles.studio}>
      <AdminHeader current="/admin" />
      <section className={styles.dashboard}>
        <div className={styles.headingRow}>
          <div>
            <p className={styles.eyebrow}>YOUR EDITORIAL DESK</p>
            <h1>Your articles</h1>
            <p>Drafts are private. Published articles appear in The Edit on the homepage.</p>
          </div>
          <Link className={styles.primary} href="/admin/articles/new">
            + New article
          </Link>
        </div>
        {error ? (
          <p role="alert" className={styles.error}>
            The articles could not be loaded. Refresh the page; if it keeps happening, check the
            database setup.
          </p>
        ) : (
          <ArticleList drafts={data as Draft[]} homepage={homepage} justDeleted={deleted === "1"} />
        )}
      </section>
    </main>
  );
}
