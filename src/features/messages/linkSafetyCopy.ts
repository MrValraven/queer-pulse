// src/features/messages/linkSafetyCopy.ts
import { messages as enMessages } from "../../shared/i18n/catalogs/en/messages";
import { messages as ptMessages } from "../../shared/i18n/catalogs/pt/messages";
import { detectLanguage, intlLocale } from "../../shared/i18n/locale";
import { resolveEntry } from "../../shared/i18n/translate";
import type { TFunction } from "../../shared/i18n/types";
import type { LinkSafetyReason } from "./linkSafety";

/** Bare `messages` catalog paths (no `messages:` namespace prefix — see the
 *  two resolvers below for why each needs a different form of this key). */
const REASON_PATH: Record<LinkSafetyReason, string> = {
  shortener: "link.suspiciousReason.shortener",
  punycode: "link.suspiciousReason.punycode",
  ipAddress: "link.suspiciousReason.ipAddress",
  credentialsInUrl: "link.suspiciousReason.credentialsInUrl",
  lookalike: "link.suspiciousReason.lookalike",
};

/** The plain-words explanation for one suspicious-link reason, via the
 *  ordinary `useTranslation()` `t` a ordinary component already has on hand
 *  (`LinkPreview`, `ConversationMediaLinkList`). */
export function linkSafetyReasonLabel(
  reason: LinkSafetyReason,
  t: TFunction,
): string {
  return t(`messages:${REASON_PATH[reason]}`);
}

/** Every tripped reason's label, joined into one readable sentence set — used
 *  both for the warning icon's accessible name (so a screen reader gets the
 *  full "why" without needing to activate anything first) and the confirm
 *  dialog's body. */
export function linkSafetyReasonsLabel(
  reasons: LinkSafetyReason[],
  t: TFunction,
): string {
  return reasons.map((reason) => linkSafetyReasonLabel(reason, t)).join(" ");
}

const MESSAGES_CATALOGS = { en: enMessages, pt: ptMessages };

/** Resolves one bare `messages` catalog path WITHOUT a hook — same technique
 *  `linkify.tsx`'s own `resolveMessagesString` uses (see that doc for why):
 *  duplicated rather than imported so this module has no dependency on
 *  `linkify.tsx`, only the other way around. EN is the fallback, as
 *  everywhere else. */
function resolveStatic(path: string): string {
  const language = detectLanguage();
  const active = resolveEntry(
    MESSAGES_CATALOGS[language],
    path,
    intlLocale(language),
  );
  if (active !== undefined) return active;
  return resolveEntry(MESSAGES_CATALOGS.en, path, "en") ?? `messages:${path}`;
}

/** The same reasons sentence as `linkSafetyReasonsLabel`, resolved WITHOUT a
 *  hook — for `linkify.tsx`'s `ChatLinkAnchor`, which `linkify.test.tsx`
 *  exercises directly with no `I18nProvider` ancestor. */
export function linkSafetyReasonsLabelStatic(
  reasons: LinkSafetyReason[],
): string {
  return reasons.map((reason) => resolveStatic(REASON_PATH[reason])).join(" ");
}
