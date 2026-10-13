import { photos, type Photo } from "./photos";
import type { ProductId } from "./products";

export type TickerItem = {
  text: string;
  tone?: "serif" | "alert";
};

export type TrendingPick = {
  productId: ProductId;
  category: string;
  title: string;
  blurb: string;
  savesGrowth: number;
};

export type LookPiece = {
  productId: ProductId;
  note: string;
};

export type PriceDrop = {
  productId: ProductId;
  was: number;
};

export const ticker: readonly TickerItem[] = [
  { text: "Chrome tailoring, up 412% in saves" },
  { text: "Butter leather is the new denim", tone: "serif" },
  { text: "Sheer layering — week three at number one" },
  { text: "Four price drops today", tone: "alert" },
];

export const behindTheStory = {
  label: "Behind the story",
  title: "A season that agreed with itself",
  body: "Four cities, one finish. When the mills get there first, the runway follows — and the resale market tells you which pieces people actually wanted to wear on a Tuesday.",
  faces: [photos.greyCoat, photos.burgundyBlazer, photos.yellowPuffer],
  caption: ["Look 12,", "five pieces"],
} as const;

export const trending: readonly TrendingPick[] = [
  {
    productId: "blazer",
    category: "Chrome",
    title: "Mirror-finish blazer",
    blurb: "The piece that broke resale. Three colourways left.",
    savesGrowth: 4.12,
  },
  {
    productId: "trench",
    category: "Leather",
    title: "Butter trench",
    blurb: "Soft, unlined, oversized. Sells out every restock.",
    savesGrowth: 2.87,
  },
  {
    productId: "mesh",
    category: "Sheer",
    title: "Layered mesh dress",
    blurb: "Three weeks at number one on the saves board.",
    savesGrowth: 1.93,
  },
  {
    productId: "anorak",
    category: "Outerwear",
    title: "Colour-block anorak",
    blurb: "The one menswear piece that crossed over this month.",
    savesGrowth: 1.5,
  },
];

export const lookOfTheWeek = {
  photo: photos.blackSuitLook,
  caption: "Look 12 · buy it whole or piece by piece",
  pieces: [
    { productId: "suitJacket", note: "four sizes left" },
    { productId: "pleatedTrousers", note: "runs long" },
    { productId: "hoboBag", note: "one size" },
    { productId: "pendant", note: "adjustable cord" },
    { productId: "kittenHeels", note: "sizes 36–41" },
  ] satisfies LookPiece[],
};

export const priceDrops: readonly PriceDrop[] = [
  { productId: "blazer", was: 520 },
  { productId: "mesh", was: 260 },
  { productId: "slingback", was: 148 },
  { productId: "cuff", was: 120 },
];

export const newsletterPhoto = photos.loungingTrio;
