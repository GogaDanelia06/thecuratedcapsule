export type ResaleRecord = {
  name: string;
  brand: string;
  retail: number;
  resale: number;
};

export type Season = {
  id: string;
  label: string;
  records: readonly ResaleRecord[];
};

export const resaleScaleMax = 1400;

export const seasons: readonly Season[] = [
  {
    id: "ss26",
    label: "Spring 26",
    records: [
      { name: "Mirror-finish blazer", brand: "Aureline", retail: 520, resale: 690 },
      { name: "Butter leather trench", brand: "Norr Atelier", retail: 980, resale: 1240 },
      { name: "Layered mesh dress", brand: "Norr Atelier", retail: 260, resale: 185 },
      { name: "Chrome cuff", brand: "Studio Fen", retail: 120, resale: 88 },
      { name: "Square-toe slingback", brand: "Aureline", retail: 148, resale: 210 },
    ],
  },
  {
    id: "aw25",
    label: "Autumn 25",
    records: [
      { name: "Shearling car coat", brand: "Halvard", retail: 1150, resale: 1330 },
      { name: "Foiled jersey gown", brand: "Aureline", retail: 690, resale: 420 },
      { name: "Bias slip dress", brand: "Halvard", retail: 320, resale: 395 },
      { name: "Lacquered glove", brand: "Studio Fen", retail: 210, resale: 160 },
      { name: "Colour-block anorak", brand: "Norr Atelier", retail: 295, resale: 340 },
    ],
  },
];
