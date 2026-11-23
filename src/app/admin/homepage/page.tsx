import { redirect } from "next/navigation";
import { AdminHeader } from "@/features/admin/admin-header";
import { HomepageEditor } from "@/features/admin/homepage-editor";
import styles from "@/features/admin/studio.module.css";
import { emptyHomepage, homepageSchema, productSchema } from "@/lib/cms/schema";
import { authorizedEditor } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomepageSettingsPage() {
  const editor = await authorizedEditor();
  if (!editor) redirect("/admin/login?error=access");

  const [settings, products, articles] = await Promise.all([
    editor.client.from("site_settings").select("document").eq("id", "homepage").maybeSingle(),
    editor.client.from("products").select("id,name,brand,price,photo,photo_alt,url").order("name"),
    editor.client
      .from("articles")
      .select(
        "slug,title:document->>title,kicker:document->>kicker,cover:document->>cover,publishedAt:document->>publishedAt",
      )
      .order("published_at", { ascending: false }),
  ]);
  const failed = settings.error || products.error || articles.error;

  return (
    <main className={styles.studio}>
      <AdminHeader current="/admin/homepage" />
      <section className={`${styles.dashboard} ${styles.narrow}`}>
        <div className={styles.headingRow}>
          <div>
            <p className={styles.eyebrow}>FRONT PAGE</p>
            <h1>Homepage</h1>
            <p>
              Choose the cover story, arrange the articles in The Edit and pick the outfit for Shop
              the look.
            </p>
          </div>
        </div>
        {failed ? (
          <p role="alert" className={styles.error}>
            The homepage settings could not be loaded. If this is the first time, run the products
            and homepage database setup in Supabase.
          </p>
        ) : (
          <HomepageEditor
            initial={settings.data ? homepageSchema.parse(settings.data.document) : emptyHomepage}
            catalog={products.data.map((row) => productSchema.parse(row))}
            articles={articles.data.map((row) => ({
              slug: row.slug,
              title: String(row.title ?? ""),
              kicker: String(row.kicker ?? ""),
              cover: String(row.cover ?? ""),
              publishedAt: String(row.publishedAt ?? ""),
            }))}
          />
        )}
      </section>
    </main>
  );
}
