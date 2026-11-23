import Link from "next/link";
import { redirect } from "next/navigation";
import { ArticleList } from "@/features/admin/article-list";
import styles from "@/features/admin/studio.module.css";
import type { Draft } from "@/lib/cms/schema";
import { authorizedEditor } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const editor = await authorizedEditor();
  if (!editor) redirect("/admin/login?error=access");
  const { deleted } = await searchParams;

  const { data, error } = await editor.client
    .from("article_drafts")
    .select("*")
    .order("updated_at", { ascending: false });

  return (
    <main className={styles.studio}>
      <header className={styles.topbar}>
        <Link href="/admin" className={styles.brand}>
          THE CURATED CAPSULE <span>ARTICLE STUDIO</span>
        </Link>
        <nav>
          <a href="/" target="_blank" rel="noreferrer">
            View website ↗
          </a>
          <form method="post" action="/admin/session">
            <input type="hidden" name="action" value="logout" />
            <button type="submit">Sign out</button>
          </form>
        </nav>
      </header>
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
          <ArticleList drafts={data as Draft[]} justDeleted={deleted === "1"} />
        )}
      </section>
    </main>
  );
}
