import type { CostKind } from "./gatheringExtras";

/**
 * How guests pay a host for a paid gathering: an optional link (Revolut,
 * PayPal, Ko-fi) and optional instructions in the host's own words ("MB WAY
 * to 912 345 678 with your name, or cash at the door").
 *
 * DISPLAY ONLY. QueerPulse takes no money and holds no payment: these are
 * words and a link the host gives their guests, and nothing that renders them
 * may promise a charge, a refund or a ticket.
 *
 * Shared by the create wizard, the edit-details modal and the detail page, so
 * all three read the same rule for what a usable link is.
 */

/** The backend's `@MaxLength(500)` on `paymentUrl`. */
export const MAX_PAYMENT_URL_LENGTH = 500;
/** The backend's `@MaxLength(500)` on `paymentInstructions`. */
export const MAX_PAYMENT_INSTRUCTIONS_LENGTH = 500;

/** Starts with a scheme such as `https:`, `http:` or `mailto:`. */
const SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:/i;

/** Whether this cost kind asks guests for money, so the payment fields apply. */
export function isPaidCostKind(costKind: CostKind): boolean {
  return costKind !== "free";
}

/**
 * The link as the host most likely meant it: trimmed, with `https://` put in
 * front of a bare domain such as `revolut.me/ana`. A link that already names
 * a scheme is left as typed, so `http://` still reads as the error it is.
 */
export function completePaymentLink(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || SCHEME_PATTERN.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Why the backend would refuse a payment link, each with its own message. */
export type PaymentLinkProblem =
  "notHttps" | "noDomain" | "tooLong" | "unparseable";

/** The message each problem shows under the link field, in the wizard and in
 *  the edit-details modal alike. */
export const PAYMENT_LINK_PROBLEM_KEYS: Record<PaymentLinkProblem, string> = {
  notHttps: "gatherings:create.v2.who.paymentLinkNotHttps",
  noDomain: "gatherings:create.v2.who.paymentLinkNoDomain",
  tooLong: "gatherings:create.v2.who.paymentLinkTooLong",
  unparseable: "gatherings:create.v2.who.paymentLinkUnparseable",
};

/**
 * Why the backend would refuse this payment link, or `null` when it would
 * take it. It has to be a full `https:` URL with a real domain, within the
 * length limit. Empty passes: the link is optional. A bare domain passes too,
 * since it is completed with `https://` on blur and again on the way out.
 */
export function paymentLinkProblem(value: string): PaymentLinkProblem | null {
  const completed = completePaymentLink(value);
  if (!completed) return null;
  if (completed.length > MAX_PAYMENT_URL_LENGTH) return "tooLong";
  let parsed: URL;
  try {
    parsed = new URL(completed);
  } catch {
    return "unparseable";
  }
  if (parsed.protocol !== "https:") return "notHttps";
  if (!parsed.hostname.includes(".")) return "noDomain";
  return null;
}

/** Whether the backend will accept this payment link (`paymentLinkProblem`
 *  finds nothing wrong with it). */
export function isValidPaymentLink(value: string): boolean {
  return paymentLinkProblem(value) === null;
}

/** Where a usable payment link goes, for the quiet line under its button:
 *  the hostname without a leading `www.`, or `null` when it does not parse. */
export function paymentLinkHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./i, "") || null;
  } catch {
    return null;
  }
}

/** The two payment fields as the create and update payloads carry them. */
export interface PaymentDetailsPayload {
  paymentUrl: string | null;
  paymentInstructions: string | null;
}

/**
 * The payment fields for the wire. A free gathering sends `null` for both,
 * and so does a blank field. Both are trimmed first: the server validates the
 * link before it trims, so a stray space would be refused.
 */
export function paymentDetailsPayload(
  costKind: CostKind,
  paymentUrl: string,
  paymentInstructions: string,
): PaymentDetailsPayload {
  if (!isPaidCostKind(costKind)) {
    return { paymentUrl: null, paymentInstructions: null };
  }
  return {
    paymentUrl: completePaymentLink(paymentUrl) || null,
    paymentInstructions: paymentInstructions.trim() || null,
  };
}
