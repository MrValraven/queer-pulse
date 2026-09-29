import type { SkinFamily } from "./subprofile-skins";

/**
 * The order each page family renders its content, read top to bottom, which
 * is the order its derived Page blocks chapters follow
 * (`derivedSkinChapters.ts`). `sections` expands to one chapter per content
 * section of the kind, `gallery` to the photo gallery, and a `blocks` entry
 * to one chapter holding those `SkinData` blocks. Block positions come from
 * `SubprofileSkinExtras.tsx` (top and afterBio slots read first, the end
 * slot last) and, for practice, `PracticeBody.tsx`'s two columns.
 */
export type PageOutlineEntry =
  | { kind: "sections" }
  | { kind: "gallery" }
  | { kind: "blocks"; key: string; blockKeys: string[] };

const SECTIONS: PageOutlineEntry = { kind: "sections" };
const GALLERY: PageOutlineEntry = { kind: "gallery" };
const top = (...blockKeys: string[]): PageOutlineEntry => ({
  kind: "blocks",
  key: "top",
  blockKeys,
});
const end = (...blockKeys: string[]): PageOutlineEntry => ({
  kind: "blocks",
  key: "end",
  blockKeys,
});

export const PAGE_OUTLINE_BY_FAMILY: Record<SkinFamily, PageOutlineEntry[]> = {
  stage: [SECTIONS, GALLERY, end("booker")],
  studio: [SECTIONS, GALLERY],
  page: [top("excerpt"), SECTIONS, GALLERY, end("colophon")],
  workshop: [SECTIONS, GALLERY],
  practice: [
    SECTIONS,
    {
      kind: "blocks",
      key: "howYouWork",
      blockKeys: ["approach", "training", "firstSession"],
    },
    GALLERY,
    // Two chapters, the way the therapist splits the same ground: what it
    // costs and when, then where it happens and who sends people.
    {
      kind: "blocks",
      key: "fees",
      blockKeys: ["practical", "feeSchedule", "availability"],
    },
    {
      kind: "blocks",
      key: "place",
      blockKeys: ["venue", "access", "referrals"],
    },
  ],
  table: [top("menuMeta"), SECTIONS, GALLERY],
  chart: [top("sky", "birthData"), SECTIONS, GALLERY, end("ethics")],
  chair: [top("chair"), SECTIONS, GALLERY, end("beforeYouSit")],
  runway: [SECTIONS, GALLERY, end("credits")],
  gallery: [top("onView"), SECTIONS, GALLERY, end("visit")],
  history: [SECTIONS, GALLERY, end("record")],
  collective: [top("nextAction"), SECTIONS, GALLERY, end("principles")],
  classroom: [top("fees"), SECTIONS, GALLERY, end("promises")],
  quest: [top("atTheTable"), SECTIONS, GALLERY],
};
