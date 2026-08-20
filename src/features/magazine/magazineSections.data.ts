/**
 * CNT-20 — the canonical magazine section/topic taxonomy, mirroring the
 * seeded `MagazineSection` rows (`queerpulse-backend/src/magazine/entities/
 * magazine-section.entity.ts`: Cover, Features, Reported, Interview, Essays,
 * Service, Photo, Review, Column, "Last word"). Demo mode's static section
 * list for `MagazineSectionsPage` — live mode reads the same names off the
 * real `GET /magazine/sections` instead (`useMagazineSections`).
 *
 * Kept as plain names rather than slugs: both `MagazineArticle.section` and
 * this list are free text matched by exact string equality (mirrors the `tag`
 * filter) — a section here with zero matching demo articles just renders a
 * tile with a 0 count rather than being hidden, same as a live section whose
 * name has drifted from what's actually stamped on published articles.
 */
export interface MagazineSectionMeta {
  id: string;
  name: string;
  orderIndex: number;
}

export const DEMO_SECTIONS: MagazineSectionMeta[] = [
  { id: "cover", name: "Cover", orderIndex: 0 },
  { id: "features", name: "Features", orderIndex: 1 },
  { id: "reported", name: "Reported", orderIndex: 2 },
  { id: "interview", name: "Interview", orderIndex: 3 },
  { id: "essays", name: "Essays", orderIndex: 4 },
  { id: "service", name: "Service", orderIndex: 5 },
  { id: "photo", name: "Photo", orderIndex: 6 },
  { id: "review", name: "Review", orderIndex: 7 },
  { id: "column", name: "Column", orderIndex: 8 },
  { id: "last-word", name: "Last word", orderIndex: 9 },
];
