import type { StaticImageData } from "next/image";
import blackSuitLook from "@/assets/photos/black-suit-look.jpg";
import burgundyBlazer from "@/assets/photos/burgundy-blazer.jpg";
import cornfieldJacket from "@/assets/photos/cornfield-jacket.jpg";
import graphicDuo from "@/assets/photos/graphic-duo.jpg";
import greyCoat from "@/assets/photos/grey-coat.jpg";
import hoboBag from "@/assets/photos/hobo-bag.jpg";
import kittenHeels from "@/assets/photos/kitten-heels.jpg";
import loungingTrio from "@/assets/photos/lounging-trio.jpg";
import necklace from "@/assets/photos/necklace.jpg";
import openMagazine from "@/assets/photos/open-magazine.jpg";
import pleatedTrousers from "@/assets/photos/pleated-trousers.jpg";
import redSky from "@/assets/photos/red-sky.jpg";
import rooftopSun from "@/assets/photos/rooftop-sun.jpg";
import satinSlip from "@/assets/photos/satin-slip.jpg";
import silhouette from "@/assets/photos/silhouette.jpg";
import sunglassesProfile from "@/assets/photos/sunglasses-profile.jpg";
import suitJacket from "@/assets/photos/suit-jacket.jpg";
import windswept from "@/assets/photos/windswept.jpg";
import yellowPuffer from "@/assets/photos/yellow-puffer.jpg";

export type Photo = {
  src: StaticImageData;
  alt: string;
};

export const photos = {
  blackSuitLook: {
    src: blackSuitLook,
    alt: "Flat lay of a black collarless jacket and pleated trousers with a bronze leather hobo bag, a gold pendant necklace and burgundy kitten-heel pumps",
  },
  burgundyBlazer: {
    src: burgundyBlazer,
    alt: "Model in a burgundy blazer and black leather gloves seated inside a glass box",
  },
  cornfieldJacket: {
    src: cornfieldJacket,
    alt: "Model in a red and white graphic jacket standing in a cornfield",
  },
  graphicDuo: {
    src: graphicDuo,
    alt: "Two models in white sunglasses, one in a yellow graphic dress",
  },
  greyCoat: {
    src: greyCoat,
    alt: "Model in a grey tailored coat and cropped top photographed from below",
  },
  loungingTrio: {
    src: loungingTrio,
    alt: "Three models lying together on crumpled linen",
  },
  openMagazine: {
    src: openMagazine,
    alt: "An open fashion magazine resting on a grey sofa",
  },
  redSky: {
    src: redSky,
    alt: "Model in an oversized red set against a clear blue sky",
  },
  rooftopSun: {
    src: rooftopSun,
    alt: "Model in a white camisole shading her eyes against a blue sky",
  },
  satinSlip: {
    src: satinSlip,
    alt: "Model in a silver satin slip dress and black opera gloves",
  },
  silhouette: {
    src: silhouette,
    alt: "Model in an oversized black coat with one hand raised to her head",
  },
  sunglassesProfile: {
    src: sunglassesProfile,
    alt: "Black-and-white close-up of a profile in angular sunglasses",
  },
  windswept: {
    src: windswept,
    alt: "Black-and-white portrait of a model with windswept hair",
  },
  yellowPuffer: {
    src: yellowPuffer,
    alt: "Model in a yellow puffer and sunglasses leaning against a red window frame",
  },
  hoboBag: {
    src: hoboBag,
    alt: "Bronze leather hobo bag with a rolled shoulder strap",
  },
  kittenHeels: {
    src: kittenHeels,
    alt: "Pair of burgundy leather pointed kitten-heel pumps",
  },
  necklace: {
    src: necklace,
    alt: "Gold sculptural pendant on a fine black cord",
  },
  pleatedTrousers: {
    src: pleatedTrousers,
    alt: "Black pleated wide-leg trousers",
  },
  suitJacket: {
    src: suitJacket,
    alt: "Black collarless tailored jacket",
  },
} satisfies Record<string, Photo>;
