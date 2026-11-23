import { photos } from "./photos";

export type TickerItem = {
  text: string;
  tone?: "serif" | "alert";
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

export const newsletterPhoto = photos.loungingTrio;
