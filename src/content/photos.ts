import type { StaticImageData } from "next/image";
import burgundyBlazer from "@/assets/photos/burgundy-blazer.jpg";
import graphicDuo from "@/assets/photos/graphic-duo.jpg";
import greyCoat from "@/assets/photos/grey-coat.jpg";
import loungingTrio from "@/assets/photos/lounging-trio.jpg";
import redSky from "@/assets/photos/red-sky.jpg";
import satinSlip from "@/assets/photos/satin-slip.jpg";
import silhouette from "@/assets/photos/silhouette.jpg";
import windswept from "@/assets/photos/windswept.jpg";
import yellowPuffer from "@/assets/photos/yellow-puffer.jpg";

export type Photo = {
  src: StaticImageData;
  alt: string;
};

export const photos = {
  burgundyBlazer: {
    src: burgundyBlazer,
    alt: "Model in a burgundy blazer and black leather gloves seated inside a glass box",
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
  redSky: {
    src: redSky,
    alt: "Model in an oversized red set against a clear blue sky",
  },
  satinSlip: {
    src: satinSlip,
    alt: "Model in a silver satin slip dress and black opera gloves",
  },
  silhouette: {
    src: silhouette,
    alt: "Model in an oversized black coat with one hand raised to her head",
  },
  windswept: {
    src: windswept,
    alt: "Black-and-white portrait of a model with windswept hair",
  },
  yellowPuffer: {
    src: yellowPuffer,
    alt: "Model in a yellow puffer and sunglasses leaning against a red window frame",
  },
} satisfies Record<string, Photo>;
