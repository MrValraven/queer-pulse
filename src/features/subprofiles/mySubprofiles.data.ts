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
