/** Chapter 1's limits. The title cap is the design's: a board card has room
 *  for about this much, and the counter says so. */
export const MAX_TITLE_LENGTH = 80;

/** The description's soft budget (ruling F2): a board card shows about this
 *  many characters, so the counter reads against it and warns past it. Text
 *  past the budget is kept and publishes as usual. */
export const DESCRIPTION_CARD_BUDGET = 400;

/** The description's hard cap, mirroring the backend's `MaxLength(10000)` on
 *  `CreateEventDto.description`. */
export const MAX_DESCRIPTION_STORAGE_LENGTH = 10_000;

/** At most this many title suggestion chips. */
export const MAX_TITLE_SUGGESTIONS = 3;

/** The cover slot's height in px, the design's `.cover-f` strip. */
export const COVER_SLOT_HEIGHT = 120;
