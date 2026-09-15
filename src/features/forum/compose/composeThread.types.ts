import type { TranslateOptions } from "../../../shared/i18n/types";

// ── The full-page composer's contract ────────────────────────────────────────
// `/forum/new` replaces `ComposeThreadModal`, and it carries far more than the
// modal's five fields. This file is the single shape every part of that page
// agrees on: the state, the derived readouts the rail renders, and the two
// advisory/blocking verdicts (`ComposeNudge`, `ComposeBlocker`) that the
// footer and the body column read.
//
// Everything here is DATA. No React, no i18n lookup, no DOM: a nudge carries a
// catalog KEY plus its interpolation values, never a finished sentence, so the
// same verdict reads correctly in English and Portuguese and can be unit
// tested without a provider around it.

/**
 * What the member says they are writing. Chosen first, because it changes the
 * title placeholder, the body placeholder, the outline scaffold and (for two
 * of the four) the default category.
 */
export type PostKind = "question" | "guide" | "proposal" | "share";

/**
 * The language the thread is written in. `auto` lets the page detect it from
 * the text; the other three are the member overriding that detection, with
 * `both` for a post written twice over.
 */
export type PostLanguage = "auto" | "pt" | "en" | "both";

/**
 * How the post leaves the composer. `now` publishes immediately, `schedule`
 * hands it a future timestamp, and `review` sends it to a moderator to read
 * before anyone else does.
 */
export type PublishMode = "now" | "schedule" | "review";

/**
 * When the thread stops taking replies on its own. Offered only for the
 * categories where a stale thread actively misleads (a room that is gone, a
 * job that is filled). See `CLOSE_AFTER_CATEGORIES`. `poll` ties the closure
 * to the attached poll's own deadline.
 */
export type CloseAfter = "never" | "2w" | "30d" | "90d" | "poll";

/** When an attached poll stops accepting votes. */
export type PollCloses = "never" | "3d" | "1w" | "2w";

/** A poll attached to the opening post. */
export interface ComposePoll {
  /**
   * Between 2 and 6 options. Blanks are allowed WHILE TYPING (an empty row is
   * how the member adds the next one); publishing is blocked until two of them
   * carry text, by `pollNeedsTwoOptions` in `composeBlockers.ts`.
   */
  options: string[];
  /** May a voter pick more than one option? */
  allowMultiple: boolean;
  closes: PollCloses;
}

/** One photo staged on the opening post. */
export interface ComposePhoto {
  /**
   * The value the publish call sends: the private storage key in live mode, a
   * local `blob:` URL in demo (see `useUploadImage`). Never the image bytes.
   */
  key: string;
  /** Instantly-renderable local preview, safe as an `<img src>` in both modes. */
  previewUrl: string;
  /** The member's description for people who cannot see the photo. */
  alt: string;
}

/** Everything the composer holds. One object, so a draft save is one snapshot. */
export interface ComposeThreadState {
  /** The chosen kind, or null before the member has picked one. */
  kind: PostKind | null;
  /** The thread title. Capped at `COMPOSE_TITLE_MAX_LENGTH` characters. */
  title: string;
  /** The opening post, in the markdown-lite the forum renders. */
  body: string;
  /** The selected forum category id (`CATS`), or null before one is chosen. */
  category: string | null;
  /** The community this posts inside. `""` means the town square, where every
   *  member sees it. */
  communitySlug: string;
  /** Also surface a community post in the town square. Meaningless while
   *  `communitySlug` is `""`. */
  crossPost: boolean;
  /** Up to `COMPOSE_TAG_LIMIT` lowercase tags, without their leading `#`. */
  tags: string[];
  /** Publish under the "QueerPulse Official" byline. Staff only. */
  isOfficial: boolean;
  /** Hide the author's name from other members. Moderators still see it. */
  isAnonymous: boolean;
  /** A second member credited on the post, by slug, or null for none. */
  coAuthorSlug: string | null;
  /** Staged photos, up to `COMPOSE_PHOTO_LIMIT`, in display order. */
  photos: ComposePhoto[];
  /** Ids from `CONTENT_WARNINGS` the member flagged on this post. */
  contentWarnings: string[];
  /** The attached poll, or null when there is none. */
  poll: ComposePoll | null;
  language: PostLanguage;
  /** A Lisbon-area neighbourhood value from `NEIGHBOURHOODS`, or null. Offered
   *  only for the categories in `NEIGHBOURHOOD_CATEGORIES`. */
  neighbourhood: string | null;
  closeAfter: CloseAfter;
}

/** The empty composer. Exported so a reset and a first mount agree exactly. */
export const EMPTY_COMPOSE_THREAD_STATE: ComposeThreadState = {
  kind: null,
  title: "",
  body: "",
  category: null,
  communitySlug: "",
  crossPost: false,
  tags: [],
  isOfficial: false,
  isAnonymous: false,
  coAuthorSlug: null,
  photos: [],
  contentWarnings: [],
  poll: null,
  language: "auto",
  neighbourhood: null,
  closeAfter: "never",
};

/** Hard cap on the title, matching the prototype's `maxlength`. */
export const COMPOSE_TITLE_MAX_LENGTH = 120;

/** How many tags one thread may carry. */
export const COMPOSE_TAG_LIMIT = 5;

/** How many photos one opening post may carry. */
export const COMPOSE_PHOTO_LIMIT = 4;

/**
 * Longest a photo description may be.
 *
 * Not a style preference: the draft row's `meta` bag caps every string it
 * holds at 2048 characters (`MAX_DRAFT_META_VALUE_LENGTH`), and one alt over
 * that would make the server reject the WHOLE bag, so a single long
 * description would silently cost the member every other autosaved field.
 * Comfortably above anything a useful description needs.
 */
export const COMPOSE_ALT_MAX_LENGTH = 600;

/** The fewest and most options a poll may offer. */
export const COMPOSE_POLL_MIN_OPTIONS = 2;
export const COMPOSE_POLL_MAX_OPTIONS = 6;

/** Title length at which the composer stops calling a title too short. */
export const COMPOSE_TITLE_READY_LENGTH = 8;

/** Body length (plain text, markers stripped) at which the body counts as
 *  "enough context to answer". */
export const COMPOSE_BODY_READY_LENGTH = 40;

// ── Checklist ────────────────────────────────────────────────────────────────

/** The five things the rail's "Ready to post" list tracks. */
export type ComposeChecklistId = "title" | "body" | "category" | "kind" | "tag";

/** One row of the rail's readiness checklist. */
export interface ComposeChecklistItem {
  id: ComposeChecklistId;
  /** Catalog key for the row's label. */
  labelKey: string;
  /** True once the member has satisfied this row. */
  isDone: boolean;
  /**
   * False for the two rows that are advice rather than a requirement (a kind,
   * a tag). Only the required rows gate `canPublish`.
   */
  isRequired: boolean;
  /** Catalog key for a short "what is still missing" line, when there is one
   *  worth saying (the body row counts down the characters left). */
  hintKey?: string;
  /** Interpolation values for `hintKey`. */
  hintValues?: TranslateOptions;
}

// ── Audience ────────────────────────────────────────────────────────────────

/**
 * One place a thread can be posted to, as the composer needs it. A lean shape
 * on purpose: the nudges and the rail read four things about an audience, and
 * binding them to a full community DTO would make them untestable.
 */
export interface ComposeAudience {
  /** The community slug. `""` is the town square. */
  slug: string;
  /** The community's own name, already resolved. Member-authored, never a key. */
  name: string;
  /** True when only members can read what is posted inside it. */
  isPrivate: boolean;
  /** How many members can see a post here, when that number is known. */
  memberCount?: number;
}

// ── Nudges ──────────────────────────────────────────────────────────────────

/** Which advisory the composer is raising. */
export type ComposeNudgeId =
  | "contact"
  | "crisis"
  | "privateCommunity"
  | "missingAlt"
  | "longGuideNoHeadings"
  | "doxxing";

/**
 * How loudly a nudge reads. `neutral` is a note, `warn` is a caution about
 * what publishing would expose, and `help` is the crisis row, which offers
 * help rather than commentary.
 */
export type ComposeNudgeTone = "neutral" | "warn" | "help";

/** A helpline the crisis nudge lists. The numbers are real and dialled
 *  verbatim, so they are values rather than catalog keys. */
export interface ComposeHelpline {
  id: string;
  /** Catalog key for the service's name. */
  nameKey: string;
  /** The number to dial, exactly as it is dialled. */
  number: string;
}

/** One advisory row under the body. */
export interface ComposeNudge {
  id: ComposeNudgeId;
  tone: ComposeNudgeTone;
  /** Catalog key for the bolded opening clause. */
  titleKey: string;
  /** Catalog key for the explanation under it. */
  bodyKey: string;
  /** Interpolation values shared by both keys. */
  values?: TranslateOptions;
  /**
   * What a dismissal is remembered under. Usually the id, so dismissing it
   * once is enough. The crisis nudge folds the matched wording into this key,
   * so a dismissal covers the text that raised it and a NEW match raises it
   * again rather than staying silently hidden.
   */
  dismissKey: string;
  /** False for the doxxing nudge, which cannot be waved away. */
  isDismissible: boolean;
  /** True when the row carries a checkbox whose acknowledgement is what
   *  unblocks publishing (the doxxing row). */
  requiresAcknowledgement: boolean;
  /** Catalog key for that checkbox's label. */
  acknowledgementLabelKey?: string;
  /** The rows the crisis nudge lists, in the order they are shown. */
  helplines?: readonly ComposeHelpline[];
}

// ── Blockers ────────────────────────────────────────────────────────────────

/** Why publishing is refused. */
export type ComposeBlockerId =
  | "duplicateTitle"
  | "unacknowledgedDoxxing"
  | "pollNeedsTwoOptions"
  | "tooManyPhotos";

/**
 * One reason the Publish button stays disabled, in the order the footer should
 * say them. Rate limiting is deliberately absent: the server owns it, and a
 * client-side cooldown only ever lies to a member whose real allowance the
 * server would have granted. A 429 is surfaced by the publish flow instead.
 */
export interface ComposeBlocker {
  id: ComposeBlockerId;
  /** Catalog key for the footer message. */
  messageKey: string;
  /** Interpolation values for `messageKey`. */
  values?: TranslateOptions;
}
