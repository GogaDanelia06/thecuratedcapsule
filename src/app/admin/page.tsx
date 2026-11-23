import Link from "next/link";
import { redirect } from "next/navigation";
import { authorizedEditor } from "@/lib/supabase/server";
import type { Draft } from "@/lib/cms/schema";
import styles from "@/features/admin/studio.module.css";
export const dynamic = "force-dynamic";
export default async function Dashboard() {
  const editor = await authorizedEditor();
  if (!editor) redirect("/admin/login?error=access");
  const {data,error} = await editor.client.from("article_drafts").select("*").order("updated_at",{ascending:false});
  return <main className={styles.studio}>
    <header className={styles.topbar}><Link href="/admin" className={styles.brand}>THE CURATED CAPSULE <span>ARTICLE STUDIO</span></Link><nav><Link href="/" target="_blank">View website ↗</Link><form method="post" action="/admin/session"><input type="hidden" name="action" value="logout"/><button>Sign out</button></form></nav></header>
    <section className={styles.dashboard}><p className={styles.eyebrow}>YOUR EDITORIAL DESK</p><div className={styles.headingRow}><div><h1>Stories worth sharing.</h1><p>Write at your own pace. Nothing goes live until you publish.</p></div><Link className={styles.primary} href="/admin/articles/new">+ New article</Link></div>
      {error ? <p role="alert" className={styles.error}>The article database could not be loaded. Check that the database migration has been applied.</p> : !data?.length ? <div className={styles.empty}><h2>Your first story starts here.</h2><p>Create a new article, or import your existing articles using the migration script.</p></div> : <div className={styles.articleList}>{(data as Draft[]).map(draft => <Link key={draft.id} href={`/admin/articles/${draft.id}`} className={styles.articleRow}><div><span className={styles.badge}>{draft.published_revision === null ? "Draft" : draft.published_revision === draft.revision ? "Published" : "Unpublished changes"}</span><h2>{draft.document.title}</h2><p>{draft.document.kicker || "Article"} · {draft.document.publishedAt}</p></div><span>Edit article →</span></Link>)}</div>}
    </section>
  </main>;
}
