import type { IconType } from "react-icons";
import {
  FiAtSign,
  FiCheckCircle,
  FiGlobe,
  FiLayout,
  FiMapPin,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import type { SubprofileView } from "./api/subprofiles.adapters";
import type { SubprofileKind, SubprofileSection } from "./api/subprofiles.api";
import { estimateDraftReadiness } from "./subprofileDraftReadiness";
import { hasSkinBlocks, skinChaptersForKind } from "./skinBlockFields.data";

/**
 * Every rail-selectable pane. `identity`/`presence`/`address` are three
 * DISTINCT rail entries (per the design), each routing to its OWN pane in
 * `EditorPaneRouter` — but all three read/write the same shared
 * `useSubprofileMetaEditor` instance (lifted to `EditorPaneRouter`, the
 * hook's single PATCH still covers all of them together) — see `PANE_HEADER`
 * in `editorPaneHeaders.data.ts`. `section:${SubprofileSection}` is one entry
 * per `subprofile.sections` item (already `sectionsForKind(kind)`, incl. the
 * universal `links` section).
 */
export type EditorPaneKey =
  | "identity"
  | "presence"
  | "address"
  | "skinBlocks"
  | `section:${SubprofileSection}`
  | "affiliations"
  | "owners"
  | "publish";

export const sectionPaneKey = (section: SubprofileSection): EditorPaneKey =>
  `section:${section}`;

/** A section edited inside the Page blocks chapters: where it opens, and the
 *  label its pending changes carry (the control's own label). */
export interface SectionInPageBlocks {
  section: SubprofileSection;
  chapter: string;
  field: string;
  labelKey: string;
}

/**
 * The sections a kind edits inside its Page blocks chapters, through a
 * `sectionItems` control (a therapist's specialisms, in "How you work"), keyed
 * by their `section:<name>` pane key and read from the kind's chapters. They
 * get no Content rail entry or pane of their own, an older link to that pane
 * opens the chapter and field (`useEditorPane`), and their pending changes
 * carry the control's label (`useEditorRowsState`).
 */
export function sectionsInPageBlocks(
  kind: SubprofileKind,
): Map<string, SectionInPageBlocks> {
  const sectionsInBlocks = new Map<string, SectionInPageBlocks>();
  for (const chapter of skinChaptersForKind(kind)) {
    for (const group of chapter.groups) {
      for (const control of group.controls) {
        if (control.kind !== "sectionItems" || !control.section) continue;
        sectionsInBlocks.set(sectionPaneKey(control.section), {
          section: control.section,
          chapter: chapter.key,
          field: control.path,
          labelKey: control.labelKey,
        });
      }
    }
  }
  return sectionsInBlocks;
}

export interface EditorRailEntry {
  key: EditorPaneKey;
  labelKey: string;
  icon: IconType;
  /** Right-aligned `.rail-n` count, already formatted (item count / ready-of-total). */
  badge?: string;
  /**
   * When set, the row renders the draft-readiness `.ring` graphic in place of
   * its `icon` (and no `badge`) — matching the design's "Get it live" Publish
   * row. Same `estimateDraftReadiness` counts the dashboard's
   * `SideReadinessRing` uses; only the Publish entry carries it.
   */
  ring?: { readyCount: number; totalCount: number };
}

export interface EditorRailGroup {
  headingKey: string;
  entries: EditorRailEntry[];
}

/**
 * Builds the grouped rail nav: This side (identity/presence/address) / Content
 * (one entry per section, badge = item count) / People (affiliations/owners) /
 * Publish (badge = the same client-only `estimateDraftReadiness` count the
 * dashboard's `SideReadinessRing` uses — a plain "x/y ready" label here rather
 * than the ring graphic itself, the task's explicitly-allowed lower-risk option
 * given the rail row's tight vertical space).
 */
export function buildEditorRailGroups(
  subprofile: SubprofileView,
): EditorRailGroup[] {
  const readiness = estimateDraftReadiness(subprofile);
  const sectionsInBlocks = sectionsInPageBlocks(subprofile.kind);

  return [
    {
      headingKey: "subprofiles:editorRail.thisSide",
      entries: [
        {
          key: "identity",
          labelKey: "subprofiles:editorRail.identity",
          icon: FiUser,
        },
        {
          key: "presence",
          labelKey: "subprofiles:editorRail.presence",
          icon: FiAtSign,
        },
        {
          key: "address",
          labelKey: "subprofiles:editorRail.address",
          icon: FiGlobe,
        },
        // Only when this persona's derived skin has owner-editable SkinData
        // blocks (studio/workshop have none) — see `hasSkinBlocks`.
        ...(hasSkinBlocks(subprofile.kind)
          ? [
              {
                key: "skinBlocks" as const,
                labelKey: "subprofiles:editorRail.skinBlocks",
                icon: FiLayout,
              },
            ]
          : []),
      ],
    },
    {
      headingKey: "subprofiles:editorRail.content",
      entries: subprofile.sections
        .filter(
          (section) => !sectionsInBlocks.has(sectionPaneKey(section.section)),
        )
        .map((section) => ({
          key: sectionPaneKey(section.section),
          labelKey: section.labelKey,
          icon: section.icon,
          badge: String(section.items.length),
        })),
    },
    {
      headingKey: "subprofiles:editorRail.people",
      entries: [
        {
          key: "affiliations",
          labelKey: "subprofiles:affiliationsEditor.title",
          icon: FiMapPin,
        },
        { key: "owners", labelKey: "subprofiles:owners.title", icon: FiUsers },
      ],
    },
    {
      headingKey: "subprofiles:editorRail.publishGroup",
      entries: [
        {
          key: "publish",
          labelKey: "subprofiles:editorRail.getItLive",
          icon: FiCheckCircle,
          ring: {
            readyCount: readiness.readyCount,
            totalCount: readiness.totalCount,
          },
        },
      ],
    },
  ];
}
