import type { IconType } from "react-icons";
import { FiEye, FiLock } from "react-icons/fi";
import type { VisibilityMode } from "../../../shared/components/ui/VisibilityBadge";
import type { EventVisibility } from "../api/events.api";
import type { GatheringFamily } from "../gatheringCatalog";
import type { RsvpQuestionKey } from "../gatheringExtras";

/**
 * Static data for the live preview card on the create-gathering rail.
 *
 * i18n Pattern A: every label here is a catalog key, resolved by the
 * component that renders it.
 */

/** The three tints a card's cover placeholder can take. */
export type PreviewTint = "coral" | "jade" | "plum";

/**
 * The cover placeholder colour for each family, used while the host has not
 * added a photo. Follows the design's own pairing (a supper club is coral, a
 * workshop or a screening plum, a studio visit or a walk jade) and extends it
 * to the families the design had no tile for: social and party formats read
 * warm, care reads calm, organising reads serious.
 */
export const COVER_TINT_BY_FAMILY: Record<GatheringFamily, PreviewTint> = {
  meet: "coral",
  eat: "coral",
  party: "coral",
  make: "jade",
  learn: "plum",
  watch: "plum",
  move: "jade",
  care: "jade",
  organise: "plum",
};

/** The cover tint before any family is picked. */
export const DEFAULT_COVER_TINT: PreviewTint = "coral";

/** The shared visibility badge's look for each audience scope: the widest
 *  reach is the warm "open" badge, invite only is the quiet "private" one,
 *  everything in between reads as a network. */
export const SCOPE_BADGE_TONE: Record<EventVisibility, VisibilityMode> = {
  public: "open",
  members: "open",
  extended_network: "network",
  network: "network",
  community: "network",
  invite_only: "private",
};

/**
 * The shorter language labels the card uses where the wizard's own label is
 * too long for a meta row. Any language missing here reads with its wizard
 * label (`langLabelKey`).
 */
export const PREVIEW_LANGUAGE_LABEL_KEYS: Readonly<Record<string, string>> = {
  "PT / EN bilingual": "gatherings:create.v2.preview.languageBilingual",
};

/** The chip each optional RSVP question shows under "Asked on RSVP". Access
 *  needs are asked on every gathering (ruling R8), so that chip reads from the
 *  RSVP details form's own label. */
export const RSVP_QUESTION_CHIP_KEYS: Record<RsvpQuestionKey, string> = {
  dietary: "gatherings:create.v2.preview.askedDietary",
  pronouns: "gatherings:create.v2.preview.askedPronouns",
  access: "gatherings:rsvpDetails.accessLabel",
};

/** The two ways the rail can show the card. */
export type PreviewMode = "board" | "attendees";

export interface PreviewModeOption {
  mode: PreviewMode;
  labelKey: string;
  icon: IconType;
}

export const PREVIEW_MODE_OPTIONS: readonly PreviewModeOption[] = [
  {
    mode: "board",
    labelKey: "gatherings:create.v2.preview.modeBoard",
    icon: FiEye,
  },
  {
    mode: "attendees",
    labelKey: "gatherings:create.v2.preview.modeAttendees",
    icon: FiLock,
  },
];

/** How long the card's bump runs, matching `.bump` in the stylesheet. */
export const PREVIEW_BUMP_DURATION_MS = 500;

/** How many co-host avatars the host row stacks before it stops adding faces.
 *  The names line still lists everyone. */
export const MAX_STACKED_HOST_AVATARS = 4;

/** The date shapes the card prints. */
export const PREVIEW_DAY_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
};
export const PREVIEW_WEEKDAY_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
};
export const PREVIEW_MONTH_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "long",
};
/** A span of two days or more prints its date range in this shape. */
export const PREVIEW_RANGE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
};
/** When RSVPs close, as a short weekday and date. */
export const PREVIEW_CLOSES_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
};
