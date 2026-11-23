import { ApiError } from "../../../shared/api/client";
import type { SendCommunityGiftBody } from "./api/communityBadges.api";
import { COMMUNITY_GIFT_NOTE_MAX_LENGTH } from "./communityBadges.catalog";

/** Code points of the trimmed note, so an emoji counts as one character the
 *  way the backend counts it. */
export function giftNoteLength(note: string): number {
  return Array.from(note.trim()).length;
}

/**
 * Whether the dialog may send. A gift must be picked, the note must fit, no
 * send may be in flight, and the weekly allowance must not be used up. An
 * allowance that has not loaded (`null`) does not hold Send: the backend
 * enforces the cap and answers with its own reason code.
 */
export function canSubmitGift(input: {
  giftKey: string | null;
  note: string;
  remaining: number | null;
  isPending: boolean;
}): boolean {
  if (input.giftKey === null || input.isPending) return false;
  if (input.remaining !== null && input.remaining <= 0) return false;
  return giftNoteLength(input.note) <= COMMUNITY_GIFT_NOTE_MAX_LENGTH;
}

/** The request body: the trimmed note is left out when it is blank. */
export function giftSendBody(
  recipientSlug: string,
  giftKey: string,
  note: string,
): SendCommunityGiftBody {
  const trimmedNote = note.trim();
  return trimmedNote === ""
    ? { recipientSlug, giftKey }
    : { recipientSlug, giftKey, note: trimmedNote };
}

/** Whether a failed send was the weekly cap, so the allowance is stale. */
export function isWeeklyLimitRefusal(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  const body = error.data as { code?: unknown } | null | undefined;
  return body?.code === "gift_weekly_limit_reached";
}
