// src/features/messages/contactSafetyDetector.ts

/**
 * What kind of off-platform-risk content a draft contains. A message can
 * trip more than one at once (e.g. a phone number AND "pay by MB WAY").
 */
export type ContactSafetySignal =
  | "phone"
  | "email"
  | "banking"
  | "externalPayment";

/**
 * A lightweight, client-side heuristic flag for the P0.7 messaging-safety
 * slice: phone numbers, emails, IBAN/banking details, and external-payment
 * prompts in a draft message. This is the exact off-platform pattern behind
 * the Portugal rental-scam playbook the housing feature is exposed to (get
 * paid before a viewing, over WhatsApp/bank transfer, outside any record) —
 * see `references/queerpulse-messaging-map.md` roadmap notes. Deliberately
 * advisory, not enforcement: the composer still lets the message send (see
 * `Composer.tsx`'s `handleSend`); this only surfaces a same-tab warning
 * before/while the sender types. Never call this to block a send, and never
 * treat a false negative here as a security boundary — the actual boundaries
 * (block enforcement, report review) are server-side. Regexes are kept
 * conservative (real-world formats, not exhaustive) to avoid noisy false
 * positives on ordinary chat (prices, dates, addresses).
 */

// Matches an email address anywhere in the text.
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

// A run of 7+ digits, optionally grouped with spaces/dots/dashes/parens and
// an optional leading `+`. Long enough to catch a real phone number (PT
// mobiles are 9 digits; most international numbers are 8–15) while staying
// short enough to still require digit grouping (so it doesn't fire on a
// stray long number like an order id embedded in prose without punctuation —
// those still match, which is an acceptable false positive for an advisory,
// non-blocking hint).
const PHONE_RE = /(?:\+?\d[\d\s().-]{6,}\d)/;

// IBAN: two letters + two check digits + up to 30 alphanumerics, optionally
// space-grouped in 4s (how people usually paste one). Case-insensitive.
const IBAN_RE = /\b[A-Za-z]{2}\d{2}(?:[ ]?[A-Za-z0-9]{4}){2,7}\b/;

// Explicit banking-request keywords (EN + PT) that aren't already caught by
// the IBAN shape — e.g. someone asks for banking details in prose without
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

// Off-platform payment rails + the "pay before you've seen it" scam prompt
// itself (EN + PT) — the exact pattern this detector exists to counter.
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
  "crypto",
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

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((needle) => haystack.includes(needle));
}

/**
 * Scans a draft message and returns the distinct safety signals it contains,
 * in a stable order (`phone`, `email`, `banking`, `externalPayment`). Empty
 * array = nothing flagged. Pure and synchronous — cheap enough to call on
 * every keystroke (the composer debounces via its own render cadence, not
 * this function).
 */
export function detectContactSafetySignals(text: string): ContactSafetySignal[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const lower = trimmed.toLowerCase();

  const signals: ContactSafetySignal[] = [];
  if (PHONE_RE.test(trimmed)) signals.push("phone");
  if (EMAIL_RE.test(trimmed)) signals.push("email");
  if (IBAN_RE.test(trimmed) || includesAny(lower, BANKING_KEYWORDS)) {
    signals.push("banking");
  }
  if (includesAny(lower, EXTERNAL_PAYMENT_KEYWORDS)) {
    signals.push("externalPayment");
  }
  return signals;
}
