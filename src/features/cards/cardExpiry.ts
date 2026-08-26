import type { MyCardDTO } from "./api/cards.api";

/**
 * How close to its expiry a card has to be before its holder can renew it.
 *
 * Mirrors the backend's `CARD_EXPIRY_WARNING_LEAD_DAYS`, which is the same
 * number the T-30 warning notification goes out on. Keeping the two aligned is
 * what makes the bell honest: a notification that says "renew it now" must
 * never arrive before the button appears. The server checks the window again on
 * every renewal, so this decides what to SHOW and never what is allowed.
 */
export const CARD_RENEWAL_WINDOW_DAYS = 30;

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

/**
 * What a card's dates say about it right now.
 *
 * Read from `expiresAt` rather than from the effective status, because the two
 * answer different questions: a card issued by a frozen community reads
 * "suspended" whatever its dates say, and its holder still needs to know when
 * the term runs out.
 */
export type CardExpiryState = "never" | "inDate" | "expiringSoon" | "expired";

export function cardExpiryState(
  card: MyCardDTO,
  now: number = Date.now(),
): CardExpiryState {
  if (!card.expiresAt) return "never";
  const expiresAt = new Date(card.expiresAt).getTime();
  if (Number.isNaN(expiresAt)) return "never";
  if (expiresAt <= now) return "expired";
  if (expiresAt - now <= CARD_RENEWAL_WINDOW_DAYS * DAY_IN_MILLISECONDS) {
    return "expiringSoon";
  }
  return "inDate";
}

/** Whole days until a card's term runs out, floored at 1 so a card a few hours
 *  from expiry reads "in 1 day" rather than "in 0 days". */
export function daysUntilExpiry(
  card: MyCardDTO,
  now: number = Date.now(),
): number {
  if (!card.expiresAt) return 0;
  const expiresAt = new Date(card.expiresAt).getTime();
  if (Number.isNaN(expiresAt)) return 0;
  return Math.max(1, Math.round((expiresAt - now) / DAY_IN_MILLISECONDS));
}

/**
 * Whether to offer this card's holder a Renew control.
 *
 * Three conditions, all of which the server enforces again on the write:
 * the programme opted in, the term is inside its last thirty days (or already
 * past), and the card is not one an issuer withdrew. A suspended or revoked
 * card is deliberately excluded here as it is there: the community took it
 * away on purpose, and only the community can give it back.
 */
export function isCardSelfRenewable(
  card: MyCardDTO,
  now: number = Date.now(),
): boolean {
  if (!card.program.allowsSelfRenew) return false;
  if (card.status === "suspended" || card.status === "revoked") return false;
  const state = cardExpiryState(card, now);
  return state === "expired" || state === "expiringSoon";
}
