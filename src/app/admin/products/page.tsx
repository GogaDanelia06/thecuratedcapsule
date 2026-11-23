import { redirect } from "next/navigation";
import { AdminHeader } from "@/features/admin/admin-header";
import { ProductManager } from "@/features/admin/product-manager";
import styles from "@/features/admin/studio.module.css";
import { productSchema } from "@/lib/cms/schema";
import { authorizedEditor } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const editor = await authorizedEditor();
  if (!editor) redirect("/admin/login?error=access");

  const { data, error } = await editor.client
    .from("products")
    .select("id,name,brand,price,photo,photo_alt,url")
    .order("name");

  return (
    <main className={styles.studio}>
      <AdminHeader current="/admin/products" />
      <section className={styles.dashboard}>
        <div className={styles.headingRow}>
          <div>
            <p className={styles.eyebrow}>SHOP</p>
            <h1>Products</h1>
            <p>
              The pieces readers can buy. Add them to an article under “Shop this article”, or to
              Shop the look on the Homepage tab.
            </p>
          </div>
        </div>
        {error ? (
          <p role="alert" className={styles.error}>
            Products could not be loaded. If this is the first time, run the products database setup
            in Supabase.
          </p>
        ) : (
          <ProductManager initial={data.map((row) => productSchema.parse(row))} />
        )}
      </section>
    </main>
  );
}
