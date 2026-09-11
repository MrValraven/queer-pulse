import {
  RSVP_CUTOFF_LABEL_KEYS,
  RSVP_CUTOFF_UNTIL_END_LABEL_KEY,
  RSVP_CUTOFF_UNTIL_END_OPTION,
  type CostKind,
  type RsvpCutoff,
} from "../gatheringExtras";

/**
 * Static values for chapter 3, "Who is it for?" (WhoChapter and its fields).
 * Label copy is catalog keys (i18n Pattern A, see createGathering.data.ts).
 */

/** The cutoffs the "RSVPs close" select offers, earliest close first. */
const RSVP_CUTOFF_OPTION_ORDER: readonly RsvpCutoff[] = [
  "three-days-before",
  "day-before",
  "one-hour-before",
  "at-start",
];

/** The "RSVPs close" select's options, earliest close first: the three lead
 *  times, then "When it starts", then "When it ends", which keeps RSVPs open
 *  until the gathering is over. Values are select values;
 *  `optionValueToRsvpCutoff` turns one back into the form's cutoff. */
export const RSVP_CUTOFF_OPTIONS: ReadonlyArray<{
  value: string;
  labelKey: string;
}> = [
  ...RSVP_CUTOFF_OPTION_ORDER.map((cutoff) => ({
    value: cutoff,
    labelKey: RSVP_CUTOFF_LABEL_KEYS[cutoff],
  })),
  {
    value: RSVP_CUTOFF_UNTIL_END_OPTION,
    labelKey: RSVP_CUTOFF_UNTIL_END_LABEL_KEY,
  },
];

/** How long the co-host search waits after the last keystroke before it asks
 *  the server. */
export const COHOST_SEARCH_DEBOUNCE_MS = 300;

/** The capacity stepper's bounds, the same range the capacity input has
 *  always accepted. An empty field means no cap on spots. */
export const MIN_CAPACITY = 2;
export const MAX_CAPACITY = 200;

/** The free-text cost line ("5 to 15 EUR sliding scale"), as long as the
 *  capacity step has always allowed. */
export const MAX_COST_TEXT_LENGTH = 120;

/** How many people the co-host search shows at once. */
export const COHOST_RESULT_LIMIT = 6;

/** The cost line's example, per paid cost kind. A free gathering has no cost
 *  line, so it has no placeholder. */
export const COST_PLACEHOLDER_KEYS: Record<
  Exclude<CostKind, "free">,
  string
> = {
  "pay-what-you-can": "gatherings:create.v2.who.costPlaceholderPayWhatYouCan",
  fixed: "gatherings:create.v2.who.costPlaceholderFixed",
};
