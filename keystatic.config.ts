import { collection, config, fields } from "@keystatic/core";
import { productOptions } from "@/content/products";

const imageOptions = {
  directory: "public/images/articles",
  publicPath: "/images/articles/",
};

// With GitHub storage every save in /keystatic is a commit, which triggers a
// Vercel redeploy. Without it the editor writes straight to local files, which
// only works under `pnpm dev`.
export const usesGitHubStorage = process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === "github";

export default config({
  storage: usesGitHubStorage
    ? { kind: "github", repo: "GogaDanelia06/thecuratedcapsule" }
    : { kind: "local" },
  ui: {
    brand: { name: "The Curated Capsule" },
  },
  collections: {
    articles: collection({
      label: "Articles",
      slugField: "title",
      path: "src/content/articles/*",
      format: { contentField: "content" },
      entryLayout: "content",
      columns: ["title", "publishedAt"],
      schema: {
        title: fields.slug({
          name: { label: "Title", validation: { isRequired: true } },
          slug: { label: "Web address", description: "Used in the link: /articles/…" },
        }),
        emphasis: fields.text({
          label: "Italic words",
          description: "Words from the title to show in italics, e.g. “extravaganza”.",
        }),
        kicker: fields.text({
          label: "Category",
          description: "Small label above the title, e.g. “Travel edit”.",
        }),
        dek: fields.text({ label: "Subtitle", multiline: true }),
        author: fields.text({ label: "Author" }),
        publishedAt: fields.date({
          label: "Publish date",
          defaultValue: { kind: "today" },
          validation: { isRequired: true },
        }),
        cover: fields.image({ label: "Cover photo", ...imageOptions }),
        coverAlt: fields.text({
          label: "Cover photo description",
          description: "Describe the photo for people using screen readers.",
        }),
        products: fields.multiselect({
          label: "Shop this article",
          description: "Products shown next to the article with a Buy button.",
          options: productOptions,
        }),
        content: fields.markdoc({
          label: "Article",
          options: { image: imageOptions },
        }),
      },
    }),
  },
});
