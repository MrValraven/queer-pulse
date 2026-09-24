import type { Language } from "../../../shared/i18n/types";
import { inviteFullUrlFor } from "../../../shared/lib/inviteUrl";
import type { JoinRequestView } from "../api/useJoinRequests";
import { formatEmailDate, type EmailFillValues } from "./emailTemplatePurposes";

/** Fills `{expiresOn}` when an invite has no expiry, so "works until ..."
 *  still reads as a sentence. */
const NO_EXPIRY_PHRASE: Record<Language, string> = {
  en: "it is used",
  pt: "ser usado",
};

/** "Kai Mendes" -> "Kai": a welcome reads warmer by first name. */
export function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name.trim();
}

export function welcomeEmailValues(
  item: Pick<JoinRequestView, "name" | "inviteCode" | "inviteExpiresAt">,
  language: Language,
): EmailFillValues {
  const expiresAt = item.inviteExpiresAt
    ? new Date(item.inviteExpiresAt)
    : null;
  const hasExpiry = expiresAt !== null && !Number.isNaN(expiresAt.getTime());
  return {
    name: firstNameOf(item.name),
    inviteLink: item.inviteCode ? inviteFullUrlFor(item.inviteCode) : undefined,
    expiresOn: hasExpiry
      ? formatEmailDate(expiresAt, language)
      : NO_EXPIRY_PHRASE[language],
  };
}
