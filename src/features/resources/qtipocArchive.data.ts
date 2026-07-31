import type { ImageSlotTint } from "../../shared/components/ui";

export interface ArchivePiece {
  title: string;
  kind: "Photo essay" | "Written" | "Oral" | "Document";
  year: string;
  blurb: string;
  tint: ImageSlotTint;
}

export const PIECES: ArchivePiece[] = [
  {
    title: "Supper & Sounds, Mouraria",
    kind: "Photo essay",
    year: "2026",
    blurb:
      "A full set from the shared dinner that goes from Nairobi to São Paulo on one playlist.",
    tint: "coral",
  },
  {
    title: "Letters to my younger self",
    kind: "Written",
    year: "2025",
    blurb:
      "Seven members write to the people they were before they found each other.",
    tint: "plum",
  },
  {
    title: "The ingredients-from-home stories",
    kind: "Oral",
    year: "2025",
    blurb:
      "Recorded reflections behind the map — what each spot means, in people's own voices.",
    tint: "jade",
  },
  {
    title: '"A visibility gap" — responses',
    kind: "Document",
    year: "2024",
    blurb:
      "The community's collected replies to the article that named some things that needed naming.",
    tint: "plum",
  },
];
