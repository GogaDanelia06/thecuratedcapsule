import type { Metadata } from "next";
import { ShopTheLook } from "@/features/front-page/shop-the-look";

export const metadata: Metadata = {
  title: "Outfits",
  alternates: { canonical: "/outfits" },
};

export default function OutfitsPage() {
  return <ShopTheLook />;
}
