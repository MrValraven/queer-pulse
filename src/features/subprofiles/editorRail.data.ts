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
import type { SkinChapterDescriptor } from "./skinBlockFields.data";
import { hasSkinBlocks, skinChaptersForKind } from "./skinChapters";

/**
 * Every rail-selectable pane. `identity`/`presence`/`address` are three
 * DISTINCT rail entries (per the design), each routing to its OWN pane in
 * `EditorPaneRouter` — but all three read/write the same shared
 * `useSubprofileMetaEditor` instance (lifted to `EditorPaneRouter`, the
 * hook's single PATCH still covers all of them together) — see `PANE_HEADER`
 * in `editorPaneHeaders.data.ts`. `section:${SubprofileSection}` is a
 * section's own pane: a section edited inside Page blocks has none, and an
 * older link to it is redirected to its chapter (`sectionsInPageBlocks`).
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
  /** `sectionItems` (topic rows, normalised on save) or `sectionList` (the
   *  section editor, rows sent as drafted). */
  controlKind: "sectionItems" | "sectionList";
}

/**
 * The sections a kind edits inside its Page blocks chapters, keyed by their
 * `section:<name>` pane key and read from the kind's chapters. Every kind
 * edits its sections there: a therapist's specialisms through a
 * `sectionItems` control (in "How you work"), every other section through a
 * `sectionList` control in a chapter of its own. They get no Content rail
 * entry or pane of their own, an older link to that pane opens the chapter
 * and field (`useEditorPane`), and their pending changes carry the control's
 * label (`useEditorRowsState`).
 */
export function sectionsInPageBlocks(
  kind: SubprofileKind,
): Map<string, SectionInPageBlocks> {
  const sectionsInBlocks = new Map<string, SectionInPageBlocks>();
  for (const chapter of skinChaptersForKind(kind)) {
    for (const group of chapter.groups) {
      for (const control of group.controls) {
        const controlKind = control.kind;
        const isSectionControl =
          controlKind === "sectionItems" || controlKind === "sectionList";
        if (!isSectionControl || !control.section) continue;
        sectionsInBlocks.set(sectionPaneKey(control.section), {
          section: control.section,
          chapter: chapter.key,
          field: control.path,
          labelKey: control.labelKey,
          controlKind,
        });
      }
    }
  }
  return sectionsInBlocks;
}

/** The sections whose rows are normalised on diff and save (blank topics and
 *  lines dropped): only those edited through a `sectionItems` control. */
export function sectionsNormalizedOnSave(kind: SubprofileKind): Set<string> {
  const sections = new Set<string>();
  for (const entry of sectionsInPageBlocks(kind).values()) {
    if (entry.controlKind === "sectionItems") sections.add(entry.section);
  }
  return sections;
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
  /** The pane's chapters, listed under its row as sub-rows that each open
   *  `?chapter=<key>`. Only the Page blocks entry carries them, so an owner
   *  sees where their Mixes or Gigs live before opening the pane. */
  chapters?: SkinChapterDescriptor[];
}

export interface EditorRailGroup {
  headingKey: string;
  entries: EditorRailEntry[];
}

/**
 * Builds the grouped rail nav: This side (identity/presence/address/Page
 * blocks, the last with its chapters as sub-rows) / Content (one entry per
 * section that still has its own pane, badge
 * = item count) / People (affiliations/owners) / Publish (badge = the same
 * client-only `estimateDraftReadiness` count the dashboard's
 * `SideReadinessRing` uses, shown as a plain "x/y ready" label here to suit
 * the rail row's tight vertical space). A group with no entries is dropped:
 * every kind now edits its sections inside Page blocks chapters, so the
 * Content group only appears while some section keeps a pane of its own.
 */
export function buildEditorRailGroups(
  subprofile: SubprofileView,
): EditorRailGroup[] {
  const readiness = estimateDraftReadiness(subprofile);
  const sectionsInBlocks = sectionsInPageBlocks(subprofile.kind);

  const groups: EditorRailGroup[] = [
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
        // Every kind has Page blocks chapters now (its sections at least);
        // `hasSkinBlocks` still guards a kind that would have none.
        ...(hasSkinBlocks(subprofile.kind)
          ? [
              {
                key: "skinBlocks" as const,
                labelKey: "subprofiles:editorRail.skinBlocks",
                icon: FiLayout,
                chapters: skinChaptersForKind(subprofile.kind),
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
  return groups.filter((group) => group.entries.length > 0);
}
