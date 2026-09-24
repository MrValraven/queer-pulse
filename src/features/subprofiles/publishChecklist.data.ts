import type { SubprofileView } from "./api/subprofiles.adapters";
import { isContentSection } from "./subprofile-kinds";
import { MIN_CONTENT_ITEMS } from "./subprofileEditor.data";
import type { EditorPaneKey } from "./editorRail.data";

/**
 * The completeness requirements an unlinked persona must meet to publish, in the
 * order they're shown. Each requirement maps the exact contract-C5 unmet codes
 * that fail it (`codes`) to friendly, second-person copy, plus the reassuring
 * line shown once it's met (`met`). The live 422 body / demo check returns those
 * same codes, so the checklist reads them straight through.
 *
 * Content items are NOT here: a persona may go live empty, so "add a few
 * pieces" is a `POLISH_NUDGES` entry instead. The backend's `validatePublish`
 * matches (it no longer emits `not_enough_items`).
 *
 * i18n Pattern A: `titleKey`/`metKey`/`failKey` hold catalog keys, resolved by
 * `PublishChecklist.tsx` via `t()`. `codes` are fixed contract-C5 identifiers,
 * never displayed directly, so they stay as plain English ids.
 */
export interface PublishRequirement {
  key: string;
  titleKey: string;
  /** Catalog key for the copy shown when this requirement is satisfied. */
  metKey: string;
  /** Contract-C5 codes that fail this requirement. */
  codes: string[];
  /** Per-code catalog key shown when the requirement isn't met yet. */
  failKey: Record<string, string>;
  /**
   * Where an unmet row's "take me there" lands: the rail pane to open, and the
   * `FIELD_ANCHOR_ID`s to scroll to and flash once it's painted. Usually one
   * field; `language` lists all three the server actually screens, since a 422
   * says only THAT a blocked term is present, never where.
   */
  jump: { pane: EditorPaneKey; anchors: string[] };
}

/**
 * The requirements that apply to one persona, in display order.
 *
 * NONE of them apply to a LINKED persona: it nests under the owner's profile,
 * claims no handle, and is already covered by that profile, so the server's
 * `validatePublish` returns an empty list for it outright — it publishes on a
 * non-empty display name alone. Showing the rows anyway would invent four
 * requirements the server does not have, and gating the button on them would
 * refuse a publish the API would accept.
 */
export function requirementsFor(
  linkVisibility: "linked" | "unlinked",
): PublishRequirement[] {
  return linkVisibility === "linked" ? [] : PUBLISH_REQUIREMENTS;
}

/**
 * DOM ids for the editor fields a checklist row or a `?field=` deep link
 * (`editorFieldDeepLink.data.ts`) can jump to, passed to
 * `FormField`'s `id` (documented there as a scroll/anchor target) at each call
 * site. Held here so the row that navigates and the field that receives the
 * flash can't drift apart.
 */
export const FIELD_ANCHOR_ID = {
  handle: "persona-field-handle",
  avatar: "persona-field-avatar",
  displayName: "persona-field-display-name",
  bio: "persona-field-bio",
  tagline: "persona-field-tagline",
  cover: "persona-field-cover",
  accent: "persona-field-accent",
  availability: "persona-field-availability",
  ctaLabel: "persona-field-cta-label",
  ctaUrl: "persona-field-cta-url",
  socialLinks: "persona-field-social-links",
} as const;

export const PUBLISH_REQUIREMENTS: PublishRequirement[] = [
  {
    key: "handle",
    titleKey: "subprofiles:checklist.reqHandleTitle",
    metKey: "subprofiles:checklist.reqHandleMet",
    codes: ["handle_invalid", "handle_taken", "handle_reserved"],
    failKey: {
      handle_invalid: "subprofiles:checklist.reqHandleFailInvalid",
      handle_taken: "subprofiles:checklist.reqHandleFailTaken",
      handle_reserved: "subprofiles:checklist.reqHandleFailReserved",
    },
    jump: { pane: "address", anchors: [FIELD_ANCHOR_ID.handle] },
  },
  {
    key: "avatar",
    titleKey: "subprofiles:checklist.reqAvatarTitle",
    metKey: "subprofiles:checklist.reqAvatarMet",
    codes: ["avatar_missing"],
    failKey: {
      avatar_missing: "subprofiles:checklist.reqAvatarFail",
    },
    jump: { pane: "identity", anchors: [FIELD_ANCHOR_ID.avatar] },
  },
  {
    key: "bio",
    titleKey: "subprofiles:checklist.reqBioTitle",
    metKey: "subprofiles:checklist.reqBioMet",
    codes: ["bio_too_short"],
    failKey: {
      bio_too_short: "subprofiles:checklist.reqBioFail",
    },
    jump: { pane: "identity", anchors: [FIELD_ANCHOR_ID.bio] },
  },
  {
    key: "language",
    titleKey: "subprofiles:checklist.reqLanguageTitle",
    metKey: "subprofiles:checklist.reqLanguageMet",
    codes: ["blocked_terms"],
    failKey: {
      blocked_terms: "subprofiles:checklist.reqLanguageFail",
    },
    // The handle lives on another pane, so this lands on the two screened
    // fields that share one: name and bio.
    jump: {
      pane: "identity",
      anchors: [FIELD_ANCHOR_ID.displayName, FIELD_ANCHOR_ID.bio],
    },
  },
];

/** Content items (section ≠ links) currently on a persona — the count behind
 *  the optional `items` polish nudge. */
export function contentItemCount(subprofile: SubprofileView): number {
  return subprofile.sections
    .filter((section) => isContentSection(section.section))
    .reduce((total, section) => total + section.items.length, 0);
}

/**
 * Optional "polish" nudges — never gate publishing, carry no contract-C5 `unmet`
 * code, and never touch the backend. Each is derived client-side straight off
 * the loaded `SubprofileView` so the polish list can render instantly alongside
 * the (separate, blocking) `PUBLISH_REQUIREMENTS` checklist above.
 */
export interface PolishNudge {
  key: string;
  titleKey: string;
  /** True once this nudge is satisfied and should drop out of the list. */
  isSatisfied: (subprofile: SubprofileView) => boolean;
}

export const POLISH_NUDGES: PolishNudge[] = [
  {
    // Content used to block publishing (contract-C5 `not_enough_items`). It no
    // longer does, on either side of the wire: a persona can go live empty and
    // fill up afterwards, so this is encouragement rather than a gate.
    key: "items",
    titleKey: "subprofiles:checklist.polishItems",
    isSatisfied: (subprofile) =>
      contentItemCount(subprofile) >= MIN_CONTENT_ITEMS,
  },
  {
    key: "cover",
    titleKey: "subprofiles:checklist.polishCover",
    isSatisfied: (subprofile) => Boolean(subprofile.coverUrl),
  },
  {
    key: "socials",
    titleKey: "subprofiles:checklist.polishSocials",
    isSatisfied: (subprofile) => subprofile.socialLinks.length > 0,
  },
  {
    key: "availability",
    titleKey: "subprofiles:checklist.polishAvailability",
    isSatisfied: (subprofile) => Boolean(subprofile.availability),
  },
];
