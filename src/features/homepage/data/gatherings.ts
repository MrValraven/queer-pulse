import type { Gathering } from "./types";

// Lisbon neighbourhood names are proper nouns and read identically in both
// catalogs (see the gatherings feature's `HOOD_KEYS` for the same call).
export const neighbourhoods: string[] = [
  "Príncipe Real",
  "Alfama",
  "Marvila",
  "Mouraria",
  "Graça",
  "Cais do Sodré",
  "Arroios",
  "Bairro Alto",
];

export const gatherings: Gathering[] = [
  {
    id: "supper-club-12",
    day: "06",
    month: "Jun",
    type: "Supper Club",
    title: "Queer Supper Club №12",
    hood: "Mouraria",
    detail: "Hosted by Tomás B.",
    spotsValue: "8",
    spotsLabelKey: "homepage:gatherings.spots.seatsLeft",
  },
  {
    id: "portfolio-night",
    day: "14",
    month: "Jun",
    type: "Mixer",
    title: "Portfolio Night: Designers & Photographers",
    hood: "Príncipe Real",
    detail: "Open to all members",
    spotsValue: "32",
    spotsLabelKey: "homepage:gatherings.spots.going",
  },
  {
    id: "studio-visit",
    day: "21",
    month: "Jun",
    type: "Studio Visit",
    title: "Inside Beatriz's Ceramics Studio",
    hood: "Graça",
    detail: "Limited to 10",
    spotsValue: "3",
    spotsLabelKey: "homepage:gatherings.spots.spotsLeft",
  },
  {
    id: "founders-breakfast",
    day: "02",
    month: "Jul",
    type: "Breakfast",
    title: "Founders & Builders Breakfast",
    hood: "Marvila",
    detail: "Early start, good coffee",
    spotsLabelKey: "homepage:gatherings.spots.casual",
  },
];
