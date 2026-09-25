import type { DiffSegment } from "../../../../../shared/lib/wordDiff";
import type { ListingDraft } from "../../listBusiness.data";
import type { ListingEditorSectionKey } from "../listingEditor.data";

export type { DiffSegment };

/**
 * The editor sections a saved local copy can change. The rest (trading,
 * co-managers, history, danger zone) save themselves the moment they are
 * used, so a local copy never holds anything for them.
 */
export type RestoreAreaKey = Extract<
  ListingEditorSectionKey,
  | "basics"
  | "story"
  | "services"
  | "practical"
  | "accessibility"
  | "photos"
  | "aboutYou"
  | "permissions"
>;

/** Where a draft field is restored from: one area, or never (fields the
 *  editor cannot change, which always keep what is on screen). */
export type RestoreFieldGroup = RestoreAreaKey | "notRestorable";

/** Every `ListingDraft` key, so a new draft field fails the typecheck until
 *  it is given an area. */
export type RestoreFieldAreaMap = Record<keyof ListingDraft, RestoreFieldGroup>;

/**
 * One changed field as the review shows it. "Before" is what is on screen
 * now; "after" is what bringing the saved copy back would put there. Every
 * display string is already resolved to the reader's language.
 */
export type RestoreFieldChange =
  | {
      kind: "text";
      key: string;
      labelKey: string;
      segments: DiffSegment[];
    }
  | {
      kind: "paragraphs";
      key: string;
      labelKey: string;
      paragraphs: RestoreParagraphChange[];
    }
  | {
      kind: "set";
      key: string;
      labelKey: string;
      added: string[];
      removed: string[];
    }
  | {
      kind: "choice";
      key: string;
      labelKey: string;
      /** "" renders as the empty placeholder. */
      before: string;
      after: string;
    }
  | {
      kind: "rows";
      key: string;
      labelKey: string;
      rows: RestoreRowChange[];
    };

/** One paragraph of the description. `position` is 1-based, counted in the
 *  saved copy for "added" and "changed", and on screen for "removed". */
export interface RestoreParagraphChange {
  key: string;
  status: "changed" | "added" | "removed";
  position: number;
  segments: DiffSegment[];
}

/** One row of a structured field (a service, a menu item, a day of hours, a
 *  date exception, an accessibility answer, a photo slot). `before` is null
 *  for "added", `after` is null for "removed". */
export interface RestoreRowChange {
  key: string;
  status: "added" | "removed" | "changed";
  label: string;
  before: string | null;
  after: string | null;
  beforeImageUrl?: string | null;
  afterImageUrl?: string | null;
}

/** One editor area with at least one changed field, in editor order. */
export interface RestoreDiffArea {
  key: RestoreAreaKey;
  /** The label the jump nav uses for this section (menu-aware). */
  labelKey: string;
  /** Number of changed fields, what "3 changes" counts. */
  changeCount: number;
  fields: RestoreFieldChange[];
}
