import type { ImageSlotTint } from "../../shared/components/ui";

export interface Show {
  title: string;
  when: string;
  venue: string;
  blurb: string;
  tint: ImageSlotTint;
}

export const SHOWS: Show[] = [
  {
    title: "Soft Edges",
    when: "May 2026",
    venue: "borrowed space, Marvila",
    blurb:
      "Eleven makers, one weekend, work that refused to resolve. The show that started the supper-club-meets-crit idea.",
    tint: "coral",
  },
  {
    title: "Kiln Season",
    when: "February 2026",
    venue: "Atelier Pulso",
    blurb:
      "A winter of glazes — including the deep coral that took four tries and nearly got abandoned.",
    tint: "jade",
  },
  {
    title: "First Editions",
    when: "November 2025",
    venue: "Atelier Pulso",
    blurb:
      "The riso group-buy paid off: a room of two-colour prints, zines, and very inky hands.",
    tint: "plum",
  },
  {
    title: "Open Walls",
    when: "September 2025",
    venue: "Anjos43",
    blurb:
      "Our first proper group show. Half the work was unfinished on purpose. All of it sold or stayed in the family.",
    tint: "plum",
  },
];
