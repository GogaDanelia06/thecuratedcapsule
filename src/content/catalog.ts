import "server-only";
import { cache } from "react";
import {
  emptyHomepage,
  homepageSchema,
  productSchema,
  type Homepage,
  type Product,
} from "@/lib/cms/schema";
import { databaseConfigured } from "@/lib/supabase/config";
import { publicClient } from "@/lib/supabase/server";

const PRODUCT_COLUMNS = "id,name,brand,price,photo,photo_alt,url";

/** Every product, alphabetical. Cached with the rest of the site content. */
export const getProducts = cache(async (): Promise<Product[]> => {
  if (!databaseConfigured()) return [];
  const { data, error } = await publicClient()
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("name");
  if (error) throw new Error("Products could not be loaded.", { cause: error });
  return data.map((row) => productSchema.parse(row));
});

/** The products with these ids, in the given order; unknown ids are skipped. */
export async function getProductsById(ids: readonly string[]) {
  const byId = new Map((await getProducts()).map((product) => [product.id, product]));
  return ids.flatMap((id) => byId.get(id) ?? []);
}

export const getHomepage = cache(async (): Promise<Homepage> => {
  if (!databaseConfigured()) return emptyHomepage;
  const { data, error } = await publicClient()
    .from("site_settings")
    .select("document")
    .eq("id", "homepage")
    .maybeSingle();
  if (error) throw new Error("Homepage settings could not be loaded.", { cause: error });
  return data ? homepageSchema.parse(data.document) : emptyHomepage;
});
