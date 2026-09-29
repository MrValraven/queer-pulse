import { createContext, useContext } from "react";
import type { AffiliationInputDTO, SocialLinkDTO } from "./api/subprofiles.api";
import type { SubprofileView } from "./api/subprofiles.adapters";
import type { SubprofileEditorRow } from "./subprofileSectionEditorRows";
import type { AffiliationRow } from "./SubprofileAffiliationRow";
import type { SubprofileMetaEditor } from "./useSubprofileMetaEditor";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import type { PendingChange } from "./subprofileEditorDiff";

/**
 * Shared state for the subprofile editor's ONE global save. Every editable
 * area (the three meta panes, each content section, social links, and
 * affiliations) reads and writes this context instead of holding its own
 * `rows`/`dirty` + Save button — so a single `saveAll()` commits everything at
 * once and `pending` gives the savebar a live, itemized list of what changed.
 * See `SubprofileEditorProvider` for the owner and `subprofileEditorDiff` for
 * how `pending` is derived.
 */

/** A social link working-row: the wire DTO plus a client-only key for React
 *  and for `_uid`-based diffing (mirrors the section-row `_uid` scheme). */
export type SocialRow = SocialLinkDTO & { _uid: string };

// One shared counter for the two list-row kinds this module seeds. `_uid` only
// needs to be stable + unique within an editor session, so any monotonic
// string works; new rows added after seed simply won't match a baseline uid.
let uidSequence = 0;
export const withSocialUid = (link: SocialLinkDTO): SocialRow => ({
  ...link,
  _uid: `social-${uidSequence++}`,
});
export const withAffiliationUid = (
  item: AffiliationInputDTO,
): AffiliationRow => ({
  ...item,
  _uid: `affiliation-${uidSequence++}`,
});

/**
 * ENG-451: the editor's hold on the persona's `editVersion`, for a persona
 * write made outside the Save chain (an item revision restore) that must still
 * carry the version and join the one conflict state.
 */
export interface EditorEditVersionControls {
  /** The version the editor's next write must carry. */
  getEditVersion: () => number;
  /** Take the version a conditional write answered with, so the next Save
   *  carries it. Only a write that SENT the precondition may hand one in: an
   *  unconditional write's version could hide a co-owner's save. */
  adoptEditVersion: (nextEditVersion: number) => void;
  /** Raise the conflict alert, as a Save refused with
   *  `PERSONA_EDIT_CONFLICT` does. */
  markEditConflict: () => void;
}

export interface SubprofileEditorContextValue extends EditorEditVersionControls {
  /** The persona being edited, as loaded. */
  subprofile: SubprofileView;
  /** The meta-field editor (identity/presence/address) — its own hook. */
  meta: SubprofileMetaEditor;
  /** The persona-level `SkinData` block editor ("Page blocks" pane). */
  skinBlocks: SubprofileSkinBlocksEditor;
  /** Working rows per content section, keyed by `SubprofileSection`. */
  sectionRows: Record<string, SubprofileEditorRow[]>;
  setSectionRows: (section: string, rows: SubprofileEditorRow[]) => void;
  socialRows: SocialRow[];
  setSocialRows: (rows: SocialRow[]) => void;
  affiliationRows: AffiliationRow[];
  setAffiliationRows: (rows: AffiliationRow[]) => void;
  /** Live, itemized list of every unsaved change across all areas. */
  pending: PendingChange[];
  /** `pending.length > 0`. */
  dirty: boolean;
  /** Any area's mutation is in flight. */
  saving: boolean;
  /** `dirty` and the meta fields pass their validation gates. */
  canSave: boolean;
  /** Commit every dirty area in one fan-out; toasts a summary. Resolves true
   *  once nothing is left unsaved, false when a gate or any area failed. */
  saveAll: () => Promise<boolean>;
  /** Reset every area back to its loaded baseline. */
  discardAll: () => void;
  /** ENG-451: a save was refused because someone else saved this persona
   *  after the editor loaded it. The savebar shows the conflict alert. */
  hasEditConflict: boolean;
  /** Refetch the persona and re-seed every editor area from it (the conflict
   *  alert's Reload). Drops every unsaved change in this editor. */
  reloadLatest: () => void;
  /** The Reload refetch is in flight. */
  isReloading: boolean;
  /** The last Reload failed; the editor kept its edits and the alert says so. */
  hasReloadFailed: boolean;
  /** How many Reloads re-seeded this editor (0 on first load). Above 0, the
   *  freshly remounted pane moves focus to its heading. */
  reloadGeneration: number;
  /** Explicit escape hatch from the editor's normal seed-once row state:
   *  re-seeds ONE section's rows + baseline from freshly-fetched subprofile
   *  data, discarding any in-progress draft for that section only. Wired to
   *  `useEditorRowsState`'s `reseedSection` — see its doc for why this must
   *  stay opt-in and never fire from a routine refetch. */
  reseedSection: (section: string, nextSubprofile: SubprofileView) => void;
}

export const SubprofileEditorContext =
  createContext<SubprofileEditorContextValue | null>(null);

export function useSubprofileEditorContext(): SubprofileEditorContextValue {
  const context = useContext(SubprofileEditorContext);
  if (!context) {
    throw new Error(
      "useSubprofileEditorContext must be used within a SubprofileEditorProvider",
    );
  }
  return context;
}
