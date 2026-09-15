import { Ticker } from "@/components/ticker";
import { ticker } from "@/content/front-page";
import { BehindTheStory } from "@/features/front-page/behind-the-story";
import { CoverStory } from "@/features/front-page/cover-story";
import { PriceDrops } from "@/features/front-page/price-drops";
import { ResaleTracker } from "@/features/front-page/resale-tracker";
import { ShopTheLook } from "@/features/front-page/shop-the-look";
import { TheEdit } from "@/features/front-page/the-edit";
import { Trending } from "@/features/front-page/trending";
import { Newsletter } from "@/features/newsletter/newsletter";

export default function HomePage() {
  return (
    <>
      <CoverStory />
      <Ticker items={ticker} />
      <BehindTheStory />
      <Trending />
      <ShopTheLook />
      <TheEdit />
      <ResaleTracker />
      <PriceDrops />
      <Newsletter />
    </>
  );
}
