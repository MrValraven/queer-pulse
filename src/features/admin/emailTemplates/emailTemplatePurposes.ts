import { intlLocale } from "../../../shared/i18n/locale";
import type { Language } from "../../../shared/i18n/types";
import { inviteFullUrlFor } from "../../../shared/lib/inviteUrl";

/**
 * What each kind of template is for, and so which `{token}`s it may use.
 * Mirrors the backend's `src/email-templates/email-template-purposes.ts`, which
 * rejects any other token at save time.
 */
export const EMAIL_TEMPLATE_PURPOSES = {
  invite_approved: ["name", "inviteLink", "expiresOn"],
  general: [],
} as const satisfies Record<string, readonly string[]>;

export type EmailTemplatePurpose = keyof typeof EMAIL_TEMPLATE_PURPOSES;

export const EMAIL_TEMPLATE_PURPOSE_CODES = Object.keys(
  EMAIL_TEMPLATE_PURPOSES,
) as EmailTemplatePurpose[];

export type EmailPlaceholder =
  (typeof EMAIL_TEMPLATE_PURPOSES)[EmailTemplatePurpose][number];

export type EmailFillValues = Partial<Record<EmailPlaceholder, string>>;

const PLACEHOLDER_PATTERN = /\{([a-zA-Z][a-zA-Z0-9]*)\}/g;
const DAY_MS = 86_400_000;

export function placeholdersFor(
  purpose: EmailTemplatePurpose,
): readonly EmailPlaceholder[] {
  return EMAIL_TEMPLATE_PURPOSES[purpose];
}

/** Tokens in `text` the purpose does not allow, in order, deduplicated. */
export function unknownPlaceholders(
  text: string,
  purpose: EmailTemplatePurpose,
): string[] {
  const allowed: readonly string[] = placeholdersFor(purpose);
  const unknown: string[] = [];
  for (const match of text.matchAll(PLACEHOLDER_PATTERN)) {
    const token = match[1];
    if (token && !allowed.includes(token) && !unknown.includes(token)) {
      unknown.push(token);
    }
  }
  return unknown;
}

/** "1 October 2026" / "1 de outubro de 2026": the long form reads naturally
 *  inside a sentence ("works until ..."). */
export function formatEmailDate(date: Date, language: Language): string {
  return new Intl.DateTimeFormat(intlLocale(language), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** The values the preview and "Copy with sample values" fill in. */
export function sampleValuesFor(
  language: Language,
  now: Date = new Date(),
): EmailFillValues {
  return {
    name: "Alex",
    inviteLink: inviteFullUrlFor("SAMPLE"),
    expiresOn: formatEmailDate(new Date(now.getTime() + 7 * DAY_MS), language),
  };
}
