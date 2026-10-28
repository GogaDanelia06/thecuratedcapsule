import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStory, stories, storyPath } from "@/content/stories";
import { ReadNext } from "@/features/story/read-next";
import { StoryBody } from "@/features/story/story-body";
import { StoryHeader } from "@/features/story/story-header";
import { StoryShop } from "@/features/story/story-shop";
import styles from "./page.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return stories.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/stories/[slug]">): Promise<Metadata> {
  const story = getStory((await params).slug);
  if (!story) return {};

  return {
    title: story.title,
    description: story.dek,
    alternates: { canonical: storyPath(story) },
    openGraph: {
      type: "article",
      title: story.title,
      description: story.dek,
      publishedTime: story.publishedAt,
      images: [{ url: story.cover.src.src, alt: story.cover.alt }],
    },
  };
}

export default async function StoryPage({ params }: PageProps<"/stories/[slug]">) {
  const story = getStory((await params).slug);
  if (!story) notFound();

  return (
    <article>
      <StoryHeader story={story} />
      <div className={styles.layout}>
        <StoryBody blocks={story.body} />
        <StoryShop productIds={story.products} />
      </div>
      <ReadNext teaser={story.readNext} />
    </article>
  );
}
