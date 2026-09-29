import type { PublishDeckDto } from "./api/deckAdmin.api";
import type { DeckPublishStatus } from "./desk/deck/DeckPublishRail";

/**
 * The publish-timing half of the PATCH body for one click of the
 * Publish/Schedule/Unpublish button.
 *
 * `published: true` is kept for "now" rather than an equivalent
 * `publishedAt`, because the server reads the boolean as "keep the original
 * first-publish date if there is one". Unpublishing and scheduling both need
 * the instant, so they send `publishedAt`. Assumes the caller has already
 * gated the button so `scheduledAt` is a valid future instant whenever the
 * status is `"schedule"` (see `isFutureInstant` in `DeckPublishRail`).
 */
export function buildDeckPublishTiming(
  published: boolean,
  publishStatus: DeckPublishStatus,
  scheduledAt: string | null,
): PublishDeckDto {
  if (published) return { publishedAt: null };
  if (publishStatus === "schedule" && scheduledAt) {
    return { publishedAt: new Date(scheduledAt).toISOString() };
  }
  return { published: true };
}

/** The i18n key for the success toast after that same action resolves. */
export function deckPublishToastKey(
  published: boolean,
  publishStatus: DeckPublishStatus,
): string {
  if (published) return "magazine:deck.editor.unpublishedToast";
  if (publishStatus === "schedule")
    return "magazine:deck.editor.scheduledToast";
  return "magazine:deck.editor.publishedToast";
}
