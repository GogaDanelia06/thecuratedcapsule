import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createGitHubReader } from "@keystatic/core/reader/github";
import { Tag, type RenderableTreeNode } from "@markdoc/markdoc";
import config, { usesGitHubStorage } from "../../../../../keystatic.config";
import { ADMIN_COOKIE, sessionValid } from "@/lib/admin-auth";
import { getArticle } from "@/content/articles";
import { ArticleHeader } from "@/features/article/article-header";
import { ArticleBody } from "@/features/article/article-body";
import { StoryShop } from "@/features/story/story-shop";
import { SiteShell } from "@/components/site/site-shell";
import { cx } from "@/lib/cx";
import styles from "@/app/(site)/articles/[slug]/page.module.css";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Private article preview",
  robots: { index: false, follow: false },
};
export default async function Preview({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ branch?: string }>;
}) {
  const jar = await cookies();
  if (!sessionValid(jar.get(ADMIN_COOKIE)?.value)) redirect("/admin/login");
  const { slug } = await params;
  const branch = (await searchParams).branch || "main";
  const token = jar.get("keystatic-gh-access-token")?.value;
  const editor = "/keystatic";
  if (usesGitHubStorage && !token)
    return (
      <main style={{ padding: 40 }}>
        <h1>Connect GitHub to preview</h1>
        <p>Your GitHub session has expired. Sign in to the editor, then open Preview again.</p>
        <a href={editor}>Return to editor →</a>
      </main>
    );
  let article;
  try {
    const source = usesGitHubStorage
      ? createGitHubReader(config, {
          repo: "GogaDanelia06/thecuratedcapsule",
          ref: branch,
          token,
        })
      : undefined;
    article = await getArticle(slug, source);
  } catch {
    return (
      <main style={{ padding: 40 }}>
        <h1>Preview is temporarily unavailable</h1>
        <p>Check your GitHub connection and save the article, then try again.</p>
        <a href={editor}>Return to editor →</a>
      </main>
    );
  }
  if (!article)
    return (
      <main style={{ padding: 40 }}>
        <h1>Save your article first</h1>
        <p>This preview shows the latest saved version on the selected branch.</p>
        <a href={editor}>Return to editor →</a>
      </main>
    );
  const imageUrl = (src: string) =>
    usesGitHubStorage && src.startsWith("/images/articles/")
      ? `/admin/preview-image?path=${encodeURIComponent(src)}&branch=${encodeURIComponent(branch)}`
      : src;
  if (article.cover) article.cover = imageUrl(article.cover);
  function rewriteImages(node: RenderableTreeNode | RenderableTreeNode[]) {
    if (Array.isArray(node)) {
      node.forEach(rewriteImages);
      return;
    }
    if (Tag.isTag(node)) {
      if (node.name === "img" && typeof node.attributes.src === "string")
        node.attributes.src = imageUrl(node.attributes.src);
      node.children.forEach(rewriteImages);
    }
  }
  rewriteImages(article.content);
  const hasProducts = article.products.length > 0;
  return (
    <>
      <aside
        style={{
          padding: "16px 24px",
          background: "#14130f",
          color: "white",
          fontSize: 14,
          lineHeight: 1.7,
        }}
      >
        <strong>Private preview · {branch}</strong> — Latest saved version. Unsaved edits are not
        shown.{" "}
        {branch === "main"
          ? "Saving on main also starts publishing."
          : "This branch is separate from the live site."}{" "}
        <a href={editor} style={{ textDecoration: "underline" }}>
          Return to editor
        </a>
        {" · "}
        <a href={`/articles/${encodeURIComponent(slug)}`} style={{ textDecoration: "underline" }}>
          View live article
        </a>
      </aside>
      <SiteShell>
        <article>
          <ArticleHeader article={article} />
          <div className={cx(styles.layout, hasProducts && styles.withShop)}>
            <ArticleBody content={article.content} />
            {hasProducts && <StoryShop productIds={article.products} />}
          </div>
        </article>
      </SiteShell>
    </>
  );
}
