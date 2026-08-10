import type { SkinData } from "./api/subprofiles.api";
import type { PersonaViewMode } from "./personaSkinRender";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "./api/subprofiles.adapters";
import type { SkinFamily } from "./subprofile-skins";
import { StageBooker, StageNextUp } from "./skins/StageBlocks";
import { StudioChecklist } from "./skins/StudioBlocks";
import { PageColophon, PageExcerpt } from "./skins/PageBlocks";
import { WorkshopSheetMarks } from "./skins/WorkshopBlocks";
import {
  PracticeAccess,
  PracticeFirstSession,
  PracticePractical,
} from "./skins/PracticeBlocks";
import {
  TableDietaryLegend,
  TableMenuCard,
  TableMenuHeader,
} from "./skins/TableBlocks";

export type SkinExtrasSlot = "top" | "afterBio" | "spotlight" | "end";

/**
 * The minimal persona shape every skin block reads — a structural subset of
 * both `SubprofileView` (owner) and `PublicSubprofileView` (public/preview,
 * see `api/subprofiles.adapters.ts`). Both satisfy this shape as-is (no
 * adapter needed), so `SubprofileSkinExtras` works unmodified once Task 5
 * wires it into the renderer for every mode.
 */
export interface SkinExtrasPersona {
  skinData: SkinData | null;
  sections: SubprofileSectionView[];
}

export interface SubprofileSkinExtrasProps {
  persona: SkinExtrasPersona;
  skin: SkinFamily;
  slot: SkinExtrasSlot;
  /** Only read to gate `slot="end"`'s studio `StudioChecklist`, whose rows
   *  open the lightbox — that interaction is stripped in `mode="preview"`
   *  (the Phase-3 editor's docked preview) the same way `SubprofileSections`
   *  gates its own tile clicks. Every other slot/skin combination here is
   *  either static or a `null`-returning read of `persona`, so `mode` is
   *  optional and unused by them. */
  mode?: PersonaViewMode;
  /** The persona's single featured item — only read for `slot="spotlight"`
   *  (table's `MenuCard` reads its `structured.courses`). Every other skin's
   *  spotlight is the generic `Spotlight` component, rendered by the host,
   *  not through this switch. */
  featured?: SubprofileItemView | null;
  /** Opens the studio lightbox at a flattened work index. Passed through to
   *  `StudioChecklist` (slot="end") only when `mode !== "preview"`; the host
   *  owns the open/closed state and must derive its `StudioLightbox` `items`
   *  the same way (see `getStudioWorks` exported from `skins/studioWorks.ts`)
   *  so indices line up between the checklist row clicked and the image
   *  shown. */
  onOpenWork?: (index: number) => void;
}

/**
 * The per-family "skin extras" slot switch — renders the right
 * decorative/data block(s) for `(skin, slot)` per the Phase-1 design's slot
 * table (`phase1-design/structure-notes.md`), or nothing. One switch per slot
 * keeps every family's blocks colocated in their own `skins/*Blocks.tsx` file
 * while this stays a thin router with no rendering logic of its own.
 */
export function SubprofileSkinExtras({
  persona,
  skin,
  slot,
  mode,
  featured,
  onOpenWork,
}: SubprofileSkinExtrasProps) {
  const interactive = mode !== "preview";
  switch (slot) {
    case "top":
      if (skin === "stage") return <StageNextUp persona={persona} />;
      if (skin === "workshop") return <WorkshopSheetMarks />;
      if (skin === "table") return <TableMenuHeader persona={persona} />;
      return null;
    case "afterBio":
      if (skin === "page") return <PageExcerpt persona={persona} />;
      if (skin === "practice") return <PracticePractical persona={persona} />;
      return null;
    case "spotlight":
      // Every other skin's featured item renders through the generic
      // Spotlight — the host only reaches this slot for skin="table".
      if (skin === "table")
        return <TableMenuCard featured={featured ?? null} />;
      return null;
    case "end":
      if (skin === "stage") return <StageBooker persona={persona} />;
      if (skin === "studio")
        return (
          <StudioChecklist
            persona={persona}
            onOpenWork={interactive ? onOpenWork : undefined}
          />
        );
      if (skin === "page") return <PageColophon persona={persona} />;
      if (skin === "practice")
        return (
          <>
            <PracticeFirstSession persona={persona} />
            <PracticeAccess persona={persona} />
          </>
        );
      if (skin === "table") return <TableDietaryLegend persona={persona} />;
      return null;
    default:
      return null;
  }
}
