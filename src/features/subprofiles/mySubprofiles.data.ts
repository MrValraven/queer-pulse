import type { BadgeTone } from "../../shared/components/ui";
import type {
  LinkVisibility,
  SubprofileKind,
  SubprofileStatus,
} from "./api/subprofiles.api";
import type {
  PublicSubprofileView,
  SubprofileView,
} from "./api/subprofiles.adapters";
import { KIND_LABEL_KEYS } from "./subprofile-kinds";

/** i18n label-key indirection: `status`/`linkVisibility` are PERSISTED fields,
 *  so the Record key is the stable canonical id; `labelKey` resolves via
 *  `t()` at render (SideCard.tsx, SubprofileEditorPage.tsx). */
export const STATUS_BADGE: Record<
  SubprofileStatus,
  { tone: BadgeTone; labelKey: string }
> = {
  draft: { tone: "amber", labelKey: "subprofiles:status.draft" },
  published: { tone: "jade", labelKey: "subprofiles:status.published" },
};

/** Link-state pill: linked to the main profile vs a standalone persona. */
export const LINK_BADGE: Record<
  LinkVisibility,
  { tone: BadgeTone; labelKey: string }
> = {
  linked: { tone: "violet", labelKey: "subprofiles:link.linked" },
  unlinked: { tone: "plum", labelKey: "subprofiles:link.standalone" },
};

/** Ceiling on personas per member, enforced on the dashboard's create
 *  affordances (`MySubprofilesPage`). */
export const MAX_SUBPROFILES = 12;

/** The dashboard's two groups: the personas a visitor actually sees on this
 *  member's profile, and the ones that exist without appearing there. */
export interface SubprofileProfileGroups {
  /** Listed on the member's profile, in the order they appear. Only this
   *  group is drag-reorderable. */
  shownOnProfile: SubprofileView[];
  /** Everything else, in its existing relative order: drafts, and standalone
   *  personas that deliberately live away from the profile. */
  notShownOnProfile: SubprofileView[];
}

/**
 * Split a member's personas by whether they reach their profile.
 *
 * Two independent fields have to agree for a persona to be listed there: it is
 * tied to the profile (`linkVisibility === "linked"`) and it is live
 * (`status === "published"`). A draft is written but not out yet; a standalone
 * persona is out but on its own page. Either one alone keeps it off the
 * profile, so the reorder grid would otherwise offer a member positions for
 * cards nobody can see.
 *
 * Relative order is preserved inside both groups, which is what lets the
 * reorder mutation rebuild the complete id list the API demands: the moved
 * on-profile group first, then this function's `notShownOnProfile` untouched.
 */
export function splitByProfileVisibility(
  subprofiles: SubprofileView[],
): SubprofileProfileGroups {
  const shownOnProfile: SubprofileView[] = [];
  const notShownOnProfile: SubprofileView[] = [];
  for (const subprofile of subprofiles) {
    const isShownOnProfile =
      subprofile.linkVisibility === "linked" &&
      subprofile.status === "published";
    if (isShownOnProfile) shownOnProfile.push(subprofile);
    else notShownOnProfile.push(subprofile);
  }
  return { shownOnProfile, notShownOnProfile };
}

/** Why one persona stays off the profile, and where the editor should open to
 *  change that. `pane` is an `EditorPaneKey` carried as a plain string so this
 *  data module keeps no dependency on the editor's rail. */
export interface NotShownOnProfileReason {
  reasonKey: string;
  actionKey: string;
  /** `?pane=` value for the editor deep link (`useEditorPane`). */
  pane: "publish" | "address";
}

/**
 * The single reason to show for a persona that is not listed on the profile.
 *
 * A persona can be both a draft AND standalone, so one wins: draft does,
 * because publishing is the step that has to happen first either way, and
 * offering "change where it lives" on something nobody can see yet sends the
 * member to fix the second problem before the first.
 */
export function notShownOnProfileReason(
  subprofile: SubprofileView,
): NotShownOnProfileReason {
  if (subprofile.status === "draft") {
    return {
      reasonKey: "subprofiles:mine.notShown.draftReason",
      actionKey: "subprofiles:mine.notShown.draftAction",
      pane: "publish",
    };
  }
  return {
    reasonKey: "subprofiles:mine.notShown.standaloneReason",
    actionKey: "subprofiles:mine.notShown.standaloneAction",
    pane: "address",
  };
}

const VALID_KINDS = new Set<string>(Object.keys(KIND_LABEL_KEYS));

/** Narrow a raw `?kind=` query value to a real `SubprofileKind`, or `null` if
 *  it's missing or unrecognized. Never trust a URL param as-is. */
export function isValidSubprofileKind(
  value: string | null,
): value is SubprofileKind {
  return value !== null && VALID_KINDS.has(value);
}

/**
 * Adapt an owner-dashboard row (`SubprofileView`, no owner-tie/social-proof
 * fields) into the `PublicSubprofileView` shape `SubprofileShareCard` reads for
 * the persona's NAME and vCard content.
 *
 * It deliberately carries no `ownerSlug`. The share card takes its URL as an
 * already-resolved prop (`personaOwnerAddress`, resolved once in
 * `OwnerSideCard`), so nothing downstream derives an address from this object
 * and a half-populated view cannot become a half-right link. The
 * owner-viewing-their-own-card social-proof fields don't apply here either, so
 * they default to `false`.
 */
export function toPublicView(subprofile: SubprofileView): PublicSubprofileView {
  return {
    ...subprofile,
    ownerSlug: undefined,
    ownerName: undefined,
    viewerEndorsed: false,
    viewerFollowing: false,
    // The signed-in owner is trivially a member of their own persona.
    viewerIsMember: true,
  };
}
