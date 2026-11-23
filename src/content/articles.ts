import "server-only";
import { cache } from "react";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import { publicClient } from "@/lib/supabase/server";
import { databaseConfigured } from "@/lib/supabase/config";
import { articleSchema } from "@/lib/cms/schema";
import { renderArticle } from "@/lib/cms/render";
import { isProductId } from "./products";

// Read-only fallback until the database is connected. Never used to hide database errors.
const legacyArticles = cache(async () => {
  const directory = path.join(process.cwd(),"src/content/articles");
  const files = (await readdir(directory)).filter(file => file.endsWith(".mdoc"));
  return Promise.all(files.map(async file => {
    const text = await readFile(path.join(directory,file),"utf8");
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) throw new Error(`Invalid legacy article: ${file}`);
    return articleSchema.parse({ ...parse(match[1]), slug:file.slice(0,-5), body:match[2] });
  }));
});
export const getArticles = cache(async () => {
  if (!databaseConfigured()) return (await legacyArticles()).sort((a,b) => b.publishedAt.localeCompare(a.publishedAt));
  const {data,error} = await publicClient().from("articles").select("document").order("published_at",{ascending:false});
  if (error) throw new Error("Published articles could not be loaded.");
  return (data || []).map(row => articleSchema.parse(row.document)).sort((a,b) => b.publishedAt.localeCompare(a.publishedAt));
});
export const getArticle = cache(async (slug: string) => {
  let document;
  if (!databaseConfigured()) document = (await legacyArticles()).find(article => article.slug === slug);
  else {
    const {data,error} = await publicClient().from("articles").select("document").eq("slug",slug).maybeSingle();
    if (error) throw new Error("This article could not be loaded.");
    if (data) document = articleSchema.parse(data.document);
  }
  if (!document) return undefined;
  return {...renderArticle(document),products:document.products.filter(isProductId)};
});
export function articlePath(article: {slug:string}) { return `/articles/${article.slug}` as const; }
