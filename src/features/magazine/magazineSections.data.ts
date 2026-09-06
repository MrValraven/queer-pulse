/**
 * CNT-20 — the canonical magazine section/topic taxonomy, mirroring the
 * seeded `MagazineSection` rows (`queerpulse-backend/src/magazine/entities/
 * magazine-section.entity.ts`: Cover, Features, Reported, Interview, Essays,
 * Service, Photo, Review, Column, "Last word"). Demo mode's static section
 * list for `MagazineSectionsPage` AND for the editor desk. Live mode reads
 * the same rows off the real `GET /magazine/sections` instead
 * (`useMagazineSections`), which returns exactly these five fields.
 *
 * This is the ONLY hand-written copy of the taxonomy on the frontend.
 * `data/desk.data.ts` re-exports it rather than restating it: a second
 * curated list beside a taxonomy it mirrors drifts silently, and on the desk
 * that drift has teeth, because a commission filed into a section name no
 * seeded row carries is a piece the Issue plan can never account for.
 *
 * `target` and `note` are the issue-planning fields the desk's Issue plan
 * renders (spec §3.5 gap counts). They are real columns on the entity and
 * real fields on `SectionResponse`, so demo and live carry the same shape and
 * neither surface has to branch on mode once the list is in hand.
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
  /** How many pieces an issue wants here, for the Issue plan's gap count. */
  target: number;
  /** The desk's one-line house rule for the section. */
  note: string;
  orderIndex: number;
}

export const DEMO_SECTIONS: MagazineSectionMeta[] = [
  {
    id: "cover",
    name: "Cover",
    target: 1,
    note: "One piece, always commissioned first",
    orderIndex: 0,
  },
  {
    id: "features",
    name: "Features",
    target: 2,
    note: "Reported, 1200–3000 words",
    orderIndex: 1,
  },
  {
    id: "reported",
    name: "Reported",
    target: 2,
    note: "Data-led; deck or prose",
    orderIndex: 2,
  },
  {
    id: "interview",
    name: "Interview",
    target: 1,
    note: "Q&A format",
    orderIndex: 3,
  },
  {
    id: "essays",
    name: "Essays",
    target: 3,
    note: "At least one new voice",
    orderIndex: 4,
  },
  {
    id: "service",
    name: "Service",
    target: 2,
    note: "Practical, checked twice",
    orderIndex: 5,
  },
  { id: "photo", name: "Photo", target: 1, note: "Deck only", orderIndex: 6 },
  {
    id: "review",
    name: "Review",
    target: 1,
    note: "Books, film, nightlife",
    orderIndex: 7,
  },
  {
    id: "column",
    name: "Column",
    target: 1,
    note: "Standing column",
    orderIndex: 8,
  },
  {
    id: "last-word",
    name: "Last word",
    target: 1,
    note: "Written last, by an editor",
    orderIndex: 9,
  },
];
