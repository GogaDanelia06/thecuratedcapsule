import type { StaticImageData } from "next/image";
import burgundyBlazer from "@/assets/photos/burgundy-blazer.jpg";
import cornfieldJacket from "@/assets/photos/cornfield-jacket.jpg";
import graphicDuo from "@/assets/photos/graphic-duo.jpg";
import greyCoat from "@/assets/photos/grey-coat.jpg";
import loungingTrio from "@/assets/photos/lounging-trio.jpg";
import openMagazine from "@/assets/photos/open-magazine.jpg";
import redSky from "@/assets/photos/red-sky.jpg";
import rooftopSun from "@/assets/photos/rooftop-sun.jpg";
import satinSlip from "@/assets/photos/satin-slip.jpg";
import silhouette from "@/assets/photos/silhouette.jpg";
import sunglassesProfile from "@/assets/photos/sunglasses-profile.jpg";
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
} satisfies Record<string, Photo>;
