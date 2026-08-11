import { createContext, useContext } from "react";
import type { AffiliationInputDTO, SocialLinkDTO } from "./api/subprofiles.api";
import type { SubprofileEditorRow } from "./subprofileSectionEditorRows";
import type { AffiliationRow } from "./SubprofileAffiliationRow";
import type { SubprofileMetaEditor } from "./useSubprofileMetaEditor";
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
export const withAffiliationUid = (item: AffiliationInputDTO): AffiliationRow => ({
  ...item,
  _uid: `affiliation-${uidSequence++}`,
});

export interface SubprofileEditorContextValue {
  /** The meta-field editor (identity/presence/address) — its own hook. */
  meta: SubprofileMetaEditor;
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
  /** Commit every dirty area in one fan-out; toasts a summary. */
  saveAll: () => Promise<void>;
  /** Reset every area back to its loaded baseline. */
  discardAll: () => void;
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
