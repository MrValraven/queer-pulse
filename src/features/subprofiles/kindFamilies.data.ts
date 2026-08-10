import type { SubprofileKind } from "./api/subprofiles.api";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";
import { SKIN_OF, type SkinFamily } from "./subprofile-skins";

/**
 * One craft family, grouped for the create-flow's "By craft" step 1 picker
 * (`.fams`/`.fam`/`.fam-head`/`.kinds` in the design). A member never picks a
 * family directly — it's implied by whichever kind they pick (`SKIN_OF`) —
 * this only groups the flat 17-kind list under a shared heading so the
 * picker reads as "what kind of page will this be" rather than a wall of
 * buttons. `subprofile-kinds.ts` stays the single source for the per-kind
 * data (sections/labels/slugs); this file is layered on top of it, not a
 * replacement.
 */
export interface KindFamily {
  family: SkinFamily;
  labelKey: string;
  noteKey: string;
  kinds: SubprofileKind[];
}

/** Screen/stage-adjacent crafts first, quieter ones last — mirrors the
 *  design prototype's family order. */
const FAMILY_ORDER: SkinFamily[] = [
  "stage",
  "studio",
  "page",
  "workshop",
  "practice",
  "table",
];

const FAMILY_COPY_KEYS: Record<
  SkinFamily,
  { labelKey: string; noteKey: string }
> = {
  stage: {
    labelKey: "subprofiles:family.stage.label",
    noteKey: "subprofiles:family.stage.note",
  },
  studio: {
    labelKey: "subprofiles:family.studio.label",
    noteKey: "subprofiles:family.studio.note",
  },
  page: {
    labelKey: "subprofiles:family.page.label",
    noteKey: "subprofiles:family.page.note",
  },
  workshop: {
    labelKey: "subprofiles:family.workshop.label",
    noteKey: "subprofiles:family.workshop.note",
  },
  practice: {
    labelKey: "subprofiles:family.practice.label",
    noteKey: "subprofiles:family.practice.note",
  },
  table: {
    labelKey: "subprofiles:family.table.label",
    noteKey: "subprofiles:family.table.note",
  },
};

// Every kind, in the app's canonical declaration order (KIND_LABEL_KEYS'
// insertion order), so each family's kind list is stable and deterministic.
const ALL_KINDS = Object.keys(KIND_LABEL_KEYS) as SubprofileKind[];

/** Kinds grouped under their shared page family, in canonical kind order
 *  within each family. */
export const KIND_FAMILIES: KindFamily[] = FAMILY_ORDER.map((family) => ({
  family,
  ...FAMILY_COPY_KEYS[family],
  kinds: ALL_KINDS.filter((kind) => SKIN_OF[kind] === family),
}));
