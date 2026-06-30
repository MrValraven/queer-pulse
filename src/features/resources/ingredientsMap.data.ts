export interface Spot {
  name: string;
  finds: string;
  origin: string;
  hours: string;
}

export interface MapArea {
  hood: string;
  spots: Spot[];
}

export const INTRO = [
  "Thirty-four spots, fourteen countries, all crowd-sourced by the group. This map exists because home is partly a taste, and finding it in a new city is its own kind of belonging. Spot something missing? It is never too late to add yours.",
];

export const AREAS: MapArea[] = [
  {
    hood: "Mouraria & Intendente",
    spots: [
      {
        name: "Mercearia Sol Nascente",
        finds:
          "Cape Verdean staples — cachupa corn, fresh coriander, palm oil.",
        origin: "Cape Verde",
        hours: "Mon–Sat, mornings best",
      },
      {
        name: "Loja Bengali",
        finds:
          "South Asian spices by weight, dals, mustard oil, fresh paneer on weekends.",
        origin: "Bangladesh · India",
        hours: "Daily until late",
      },
      {
        name: "Tropical Martim Moniz",
        finds:
          "Plantain, yam, scotch bonnet, dried fish across West African kitchens.",
        origin: "Nigeria · Ghana",
        hours: "Mon–Sat",
      },
    ],
  },
  {
    hood: "Anjos & Arroios",
    spots: [
      {
        name: "Padaria Cabo-Verdiana",
        finds: "Cape Verdean bakery — open Saturday mornings, sells out fast.",
        origin: "Cape Verde",
        hours: "Sat mornings",
      },
      {
        name: "Mercado de Arroios stalls",
        finds:
          "Brazilian produce — mandioca, açaí, guaraná, fresh tropical fruit.",
        origin: "Brazil",
        hours: "Tue–Sun",
      },
    ],
  },
  {
    hood: "Marvila & Beato",
    spots: [
      {
        name: "Asia Market Marvila",
        finds:
          "East and Southeast Asian — rice flours, fresh herbs, tofu, kimchi.",
        origin: "Vietnam · Korea · China",
        hours: "Daily",
      },
    ],
  },
];
