// Turns src/content/articles/*.mdoc into supabase/seed.sql.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { parse } from "yaml";

const dir = "src/content/articles";
const tag = "$" + "article" + "$";
let sql =
  "-- Imports the articles that used to live in src/content/articles, already published.\n" +
  "-- Run once, after the migration. Safe to re-run: existing web addresses are skipped.\n";

for (const file of readdirSync(dir).filter((name) => name.endsWith(".mdoc"))) {
  const [, front, body] = readFileSync(`${dir}/${file}`, "utf8").match(
    /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/,
  );
  const meta = parse(front);
  const doc = {
    title: meta.title,
    slug: file.slice(0, -5),
    emphasis: meta.emphasis ?? "",
    kicker: meta.kicker ?? "",
    dek: meta.dek ?? "",
    author: meta.author ?? "",
    publishedAt: String(meta.publishedAt),
    cover: meta.cover ?? "",
    coverAlt: meta.coverAlt ?? "",
    products: meta.products ?? [],
    body,
  };
  const json = JSON.stringify(doc);
  if (json.includes(tag)) throw new Error(`${file} contains ${tag}`);
  sql += `
with draft as (
  insert into public.article_drafts (document, published_revision)
  values (${tag}${json}${tag}::jsonb, 1)
  on conflict (slug) do nothing
  returning id, slug, document
)
insert into public.articles (id, slug, document)
select id, slug, document from draft;
`;
}

writeFileSync("supabase/seed.sql", sql);
