// src/features/messages/messageBodyLimit.ts
/**
 * The server's message body length bound, mirrored client-side so the
 * composer and inline editor can surface it before a send/edit round-trips
 * only to 400. Source of truth is the backend DTOs, which both currently
 * agree on 5000:
 *   - `queerpulse-backend/src/messaging/dto/send-message.dto.ts` `SendMessageDto.body` `@MaxLength(5000)`
 *   - `queerpulse-backend/src/messaging/dto/edit-message.dto.ts` `EditMessageDto.body` `@MaxLength(5000)`
 * If a future change makes the edit limit diverge from the send limit, add a
 * second exported constant (e.g. `MESSAGE_BODY_EDIT_MAX_LENGTH`) so each
 * limit stays named for what it is.
 *
 * Both DTOs also run `TrimMessageBody()` (a `class-transformer` `@Transform`)
 * before validating, which trims the body first so leading/trailing
 * whitespace can't pad past the limit or fake a non-empty message. The
 * helpers below trim for the same reason, so a client-side "over limit" or
 * "empty" reading always matches what the server will decide.
 */
export const MESSAGE_BODY_MAX_LENGTH = 5000;

/** How close to the limit (in characters remaining) before a length counter
 *  is worth showing. Below this, the limit isn't a live concern and a
 *  counter would just be visual noise next to every bubble/edit field. */
const MESSAGE_BODY_COUNTER_THRESHOLD = 500;

/**
 * Trimmed length of a draft/edit body, counted the same way the server does.
 * `class-validator`'s `@MaxLength` delegates to `validator`'s `isLength`
 * (`queerpulse-backend/node_modules/validator/lib/isLength.js`), which does
 * not just read `str.length`: it also subtracts one for every surrogate pair
 * (an astral character, such as most emoji, stored as two UTF-16 code units)
 * and one for every "presentation sequence" (a character immediately
 * followed by a variation selector, U+FE0E or U+FE0F), so a single emoji
 * counts as one character on both sides. This mirrors that exactly. It also
 * trims first, matching the DTOs' `TrimMessageBody()` transform, which runs
 * before either `@MaxLength` or `@MinLength` validates.
 */
export function getMessageBodyLength(body: string): number {
  const trimmedBody = body.trim();
  const presentationSequences =
    trimmedBody.match(/[^\uFE0F\uFE0E][\uFE0F\uFE0E]/g) ?? [];
  const surrogatePairs =
    trimmedBody.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) ?? [];
  return (
    trimmedBody.length - presentationSequences.length - surrogatePairs.length
  );
}

/** True once the trimmed body exceeds `maxLength`, matching the server's
 *  `@MaxLength` rejection exactly, using the same trimmed, `isLength`-style
 *  length the server validates against. */
export function isMessageBodyOverLimit(
  body: string,
  maxLength: number = MESSAGE_BODY_MAX_LENGTH,
): boolean {
  return getMessageBodyLength(body) > maxLength;
}

/** True once a length counter is worth rendering: within
 *  `MESSAGE_BODY_COUNTER_THRESHOLD` characters of the limit, or already over
 *  it. Keeps the counter hidden for the overwhelming majority of ordinary,
 *  short messages. */
export function shouldShowMessageLengthCounter(
  body: string,
  maxLength: number = MESSAGE_BODY_MAX_LENGTH,
): boolean {
  return (
    maxLength - getMessageBodyLength(body) <= MESSAGE_BODY_COUNTER_THRESHOLD
  );
}
