import { photos, type Photo } from "./photos";

type ProductDetails = {
  name: string;
  brand: string;
  price: number;
  photo: Photo;
  url: string;
};

const catalog = {
  blazer: {
    name: "Mirror-finish blazer",
    brand: "Aureline",
    price: 385,
    photo: photos.greyCoat,
    url: "https://aureline.example/products/mirror-finish-blazer",
  },
  trench: {
    name: "Butter leather trench",
    brand: "Norr Atelier",
    price: 640,
    photo: photos.burgundyBlazer,
    url: "https://norr-atelier.example/products/butter-leather-trench",
  },
  mesh: {
    name: "Layered mesh dress",
    brand: "Norr Atelier",
    price: 210,
    photo: photos.redSky,
    url: "https://norr-atelier.example/products/layered-mesh-dress",
  },
  anorak: {
    name: "Colour-block anorak",
    brand: "Halvard",
    price: 295,
    photo: photos.graphicDuo,
    url: "https://halvard.example/products/colour-block-anorak",
  },
  cuff: {
    name: "Chrome cuff",
    brand: "Studio Fen",
    price: 95,
    photo: photos.yellowPuffer,
    url: "https://studio-fen.example/products/chrome-cuff",
  },
  slip: {
    name: "Bias slip dress",
    brand: "Halvard",
    price: 128,
    photo: photos.satinSlip,
    url: "https://halvard.example/products/bias-slip-dress",
  },
  slingback: {
    name: "Square-toe slingback",
    brand: "Aureline",
    price: 115,
    photo: photos.loungingTrio,
    url: "https://aureline.example/products/square-toe-slingback",
  },
} satisfies Record<string, ProductDetails>;

export type ProductId = keyof typeof catalog;

export type Product = ProductDetails & { id: ProductId };

export function getProduct(id: ProductId): Product {
  return { id, ...catalog[id] };
}

export function isProductId(value: unknown): value is ProductId {
  return typeof value === "string" && Object.hasOwn(catalog, value);
}
