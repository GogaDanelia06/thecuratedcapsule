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

export const newsletterPhoto = photos.loungingTrio;
