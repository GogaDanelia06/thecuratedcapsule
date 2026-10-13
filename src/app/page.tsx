import { Ticker } from "@/components/ticker";
import { ticker } from "@/content/front-page";
import { BehindTheStory } from "@/features/front-page/behind-the-story";
import { CoverStory } from "@/features/front-page/cover-story";

import { ShopTheLook } from "@/features/front-page/shop-the-look";
import { TheEdit } from "@/features/front-page/the-edit";
import { Trending } from "@/features/front-page/trending";
import { Newsletter } from "@/features/newsletter/newsletter";

export default function HomePage() {
  return (
    <>
      <CoverStory />
      <Ticker items={ticker} />
      <Trending />
      <BehindTheStory />
      <ShopTheLook />
      <TheEdit />
      <Newsletter />
    </>
  );
}
