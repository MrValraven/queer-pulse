import type { Language, TFunction } from "../../shared/i18n/types";

/** PRD-265. One piece of prose an editor wrote, in both languages. */
export interface AuthoredGovernanceText {
  en: string;
  pt: string;
}

/**
 * PRD-265. One piece of governance-overview prose, from either of the two
 * places it can come from.
 *
 * The four decisions, six principles and four council roles this page shipped
 * with are i18n KEYS: their words live in the catalogs and the reader calls
 * `t(key)`. An entry an editor added afterwards has no key to translate, so it
 * carries its own EN and PT and the reader picks by active language.
 *
 * Written as two explicitly-nullable fields rather than a discriminated union
 * because it crosses the wire: the DTO shape is exactly "one of these two is
 * present", and a `kind` tag would be a field the backend has to invent and
 * keep in step with the presence of the others.
 */
export interface GovernanceText {
  /** Full i18n key (namespace included) for a seeded entry; null when
   *  authored. */
  key: string | null;
  /** The editor's own EN/PT; null when the entry is key-backed. */
  authored: AuthoredGovernanceText | null;
}

/** A seeded entry's text, addressed by the full i18n key the reader resolves. */
export function seededGovernanceText(key: string): GovernanceText {
  return { key, authored: null };
}

/**
 * An authored entry's text, or null when the wire shape carried neither half
 * of the pair. The backend's exclusive-or makes that impossible for anything
 * written through the admin editors; this stays defensive because the payload
 * is jsonb, and a row hand-edited in the database must degrade to "this entry
 * has no text" rather than to a crash on a public page.
 */
export function authoredGovernanceText(
  authored: AuthoredGovernanceText | undefined,
): GovernanceText | null {
  return authored ? { key: null, authored } : null;
}

/**
 * The words to put on screen for one entry.
 *
 * A key resolves through `t` exactly as before. Authored text is picked by
 * active language, falling back to the other language rather than to an empty
 * paragraph: a Portuguese reader seeing an English decision has still been
 * told what was decided, where a blank line on the platform's accountability
 * record tells them nothing. The backend requires both languages at write
 * time, so the fallback is for rows that predate that rule.
 */
export function resolveGovernanceText(
  text: GovernanceText,
  translate: TFunction,
  language: Language,
): string {
  if (text.key) return translate(text.key);
  if (!text.authored) return "";
  const preferred = language === "pt" ? text.authored.pt : text.authored.en;
  return preferred || text.authored.pt || text.authored.en;
}
