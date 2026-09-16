// src/features/messages/contactSafetyDetector.ts

/**
 * What kind of off-platform-risk content a draft contains. A message can
 * trip more than one at once (e.g. a phone number AND "pay by MB WAY").
 */
export type ContactSafetySignal =
  "phone" | "email" | "offPlatform" | "banking" | "externalPayment";

/**
 * A lightweight, client-side heuristic flag for the P0.7 messaging-safety
 * slice: phone numbers, emails, IBAN/banking details, and external-payment
 * prompts in a draft message. This is the exact off-platform pattern behind
 * the Portugal rental-scam playbook the housing feature is exposed to (get
 * paid before a viewing, over WhatsApp/bank transfer, outside any record),
 * see `references/queerpulse-messaging-map.md` roadmap notes. Deliberately
 * advisory, not enforcement: the composer still lets the message send (see
 * `Composer.tsx`'s `handleSend`); this only surfaces a same-tab warning
 * before/while the sender types. Never call this to block a send, and never
 * treat a false negative here as a security boundary. The actual boundaries
 * (block enforcement, report review) are server-side. Regexes are kept
 * conservative (real-world formats, not exhaustive) to avoid noisy false
 * positives on ordinary chat (prices, dates, addresses).
 */

// Matches an email address anywhere in the text.
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

// A run of 7+ digits, optionally grouped with spaces/dots/dashes/parens and
// an optional leading `+`. Long enough to catch a real phone number (PT
// mobiles are 9 digits; most international numbers are 8-15) while staying
// short enough to still require digit grouping (so it doesn't fire on a
// stray long number like an order id embedded in prose without punctuation;
// those still match, which is an acceptable false positive for an advisory,
// non-blocking hint).
const PHONE_RE = /(?:\+?\d[\d\s().-]{6,}\d)/;

// Date-shaped digit runs the phone check must ignore: ISO (2026-09-15,
// 2026.09.15) and day-first (15/09/2026, 15-09-2026, 15.09.2026, and the
// two-digit-year form 15-09-26). What actually keeps this from colliding
// with a phone number's 3x3 grouping (912 345 678) is each field's width:
// every date field here is `\d{1,2}` (day/month) or `\d{4}` (year), never
// the bare 3-digit groups a phone number is chunked into. Written with
// `/-.\//` separators only; phone numbers are grouped with spaces far more
// often than with slashes or a leading 4-digit year.
const DATE_RE =
  /\b\d{4}[-.]\d{1,2}[-.]\d{1,2}\b|\b\d{1,2}[-./]\d{1,2}[-./]\d{2,4}\b/g;

// Price/amount-shaped digit runs the phone check must ignore, split into
// three bounded forms instead of one greedy pattern, because an unbounded
// thousands-grouping can walk straight into an adjacent phone number: a PT
// mobile (912 345 678) is *also* grouped in exact 3-digit runs, so nothing
// in the digits alone tells "thousands separator" and "phone group" apart.
// Each form below caps how many groups it will absorb and, for the
// currency-before-number form, only allows grouping at all when a decimal
// cents suffix is present (a real price like "€ 1 200,50"); a bare
// currency + small number ("€50") only ever masks itself, so it can't eat
// into a phone number that happens to start right after it.
const PRICE_PREFIX_RE =
  /[€$£]\s?\d{1,3}(?:[ .,]\d{3}){0,2}(?:[.,]\d{2})(?!\d)|[€$£]\s?\d{1,3}(?!\d)/;
// Currency after the number (1 200 €, 1 200 000 €): the currency symbol
// itself terminates the match, so up to two thousands groups are safe here.
const PRICE_SUFFIX_RE = /\b\d{1,3}(?:[ .,]\d{3}){0,2}\s?[€$£]/;
// A bare PT-style amount with no currency symbol at all (1.200,00): the
// mandatory decimal-cents suffix is the anchor, bounded the same way.
const PRICE_BARE_RE = /\b\d{1,3}(?:[ .]\d{3}){0,2},\d{2}\b/;
const PRICE_RE = new RegExp(
  `${PRICE_PREFIX_RE.source}|${PRICE_SUFFIX_RE.source}|${PRICE_BARE_RE.source}`,
  "g",
);
// Cheap pre-check so an ordinary message with no currency symbol and no
// decimal-cents shape never pays for the pattern above at all (it's the
// only one of these with any nested repetition, so it's the one worth
// gating on plain text like a long run of digits and spaces).
const PRICE_HINT_RE = /[€$£]|\d[.,]\d{2}(?!\d)/;

/**
 * Replaces date- and price-shaped digit runs with `#` placeholders (same
 * length, so nothing else shifts) before the phone check runs, so a viewing
 * date or a rent figure never reads as a phone number. Only feeds `PHONE_RE`;
 * the email/banking/external-payment checks still scan the original text.
 */
function maskNonPhoneDigitRuns(text: string): string {
  const dateMasked = text.replace(DATE_RE, (match) => "#".repeat(match.length));
  if (!PRICE_HINT_RE.test(dateMasked)) return dateMasked;
  return dateMasked.replace(PRICE_RE, (match) => "#".repeat(match.length));
}

// IBAN: two letters + two check digits + up to 30 alphanumerics, optionally
// space-grouped in 4s (how people usually paste one). Case-insensitive.
const IBAN_RE = /\b[A-Za-z]{2}\d{2}(?:[ ]?[A-Za-z0-9]{4}){2,7}\b/;

// Explicit banking-request keywords (EN + PT) that aren't already caught by
// the IBAN shape, e.g. someone asks for banking details in prose without
// pasting the number itself.
const BANKING_KEYWORDS = [
  "iban",
  "swift",
  "bic code",
  "bank account",
  "sort code",
  "routing number",
  "número de conta",
  "conta bancária",
  "transferência bancária",
  "dados bancários",
];

// Off-platform payment rails plus the "pay before you've seen it" scam
// prompt itself (EN + PT); the exact pattern this detector exists to counter.
const EXTERNAL_PAYMENT_KEYWORDS = [
  "paypal",
  "venmo",
  "cash app",
  "cashapp",
  "zelle",
  "wise.com",
  "wise transfer",
  "revolut",
  "mb way",
  "mbway",
  "western union",
  "moneygram",
  "wire transfer",
  "bank transfer",
  "bitcoin",
  "pay before",
  "deposit before",
  "pay upfront",
  "advance payment",
  "pagamento antecipado",
  "pagar antes",
  "depósito antes",
  "adiantamento",
  "sinal antes de ver",
];

// "crypto" gets its own whole-word pattern rather than joining the plain
// substring list above: as a plain substring it matches inside ordinary
// words like "cryptography" or "cryptographic" that have nothing to do with
// a payment rail.
const EXTERNAL_PAYMENT_SLANG_RE = /\bcrypto\b/i;

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((needle) => haystack.includes(needle));
}

// PRD-367: messaging-app names/handles/links used to push the conversation
// off QueerPulse and out of any record, the same "get in touch elsewhere"
// step that usually precedes the external-payment ask this detector already
// screens for below. Longer, unambiguous brand names/domains are plain
// substrings (mirrors BANKING_KEYWORDS/EXTERNAL_PAYMENT_KEYWORDS' own style,
// including "wise.com" there); a real PT phrase ("fala comigo no whatsapp",
// "manda mensagem no telegram") already contains one of these as a
// substring, so no separate "let's move to <app>" pattern is needed on top.
// Deliberately NOT included: the bare word "signal" (too common in ordinary
// English — "no signal", "send a signal" — to be a useful hint) and "no
// signal" as a phrase (PT's "no Signal" = "on Signal" collides with that
// exact English phrase, so it's left out rather than risk that false
// positive); only unambiguous Signal phrasing counts.
const OFF_PLATFORM_KEYWORDS = [
  "whatsapp",
  "whats app",
  "wa.me",
  "signal.me",
  "signal app",
  "on signal",
  "via signal",
  "aplicação signal",
  "aplicacao signal",
  "app signal",
  "instagram",
  "instagram.com",
  "ig dm",
  "dm on ig",
  "dm me on ig",
  "ig.me",
  "snapchat",
];

// "zap" (PT slang for WhatsApp) and "insta" (EN/PT slang for Instagram) are
// short, generic-looking tokens that would over-match as a plain substring
// (e.g. "zapping", "instant", "instalar"), so each gets its own whole-word
// pattern instead of joining the list above. "telegram" and "t.me" join them
// here for the same reason: as a plain substring, "telegram" matches inside
// the ordinary Portuguese word "telegrama" (a telegram/cable, nothing to do
// with the app), and "t.me" matches inside an unrelated domain that merely
// happens to contain those four characters in a row, e.g. "format.mediumsite.com".
const OFF_PLATFORM_SLANG_RE = /\b(zap|insta|telegram|t\.me)\b/i;

/**
 * Scans a draft message and returns the distinct safety signals it contains,
 * in a stable order (`phone`, `email`, `offPlatform`, `banking`,
 * `externalPayment`). Empty array = nothing flagged. Pure and synchronous,
 * cheap enough to call on every keystroke (the composer debounces via its own
 * render cadence, not this function).
 */
export function detectContactSafetySignals(
  text: string,
): ContactSafetySignal[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const lower = trimmed.toLowerCase();

  const signals: ContactSafetySignal[] = [];
  if (PHONE_RE.test(maskNonPhoneDigitRuns(trimmed))) signals.push("phone");
  if (EMAIL_RE.test(trimmed)) signals.push("email");
  if (
    includesAny(lower, OFF_PLATFORM_KEYWORDS) ||
    OFF_PLATFORM_SLANG_RE.test(lower)
  ) {
    signals.push("offPlatform");
  }
  if (IBAN_RE.test(trimmed) || includesAny(lower, BANKING_KEYWORDS)) {
    signals.push("banking");
  }
  if (
    includesAny(lower, EXTERNAL_PAYMENT_KEYWORDS) ||
    EXTERNAL_PAYMENT_SLANG_RE.test(lower)
  ) {
    signals.push("externalPayment");
  }
  return signals;
}
