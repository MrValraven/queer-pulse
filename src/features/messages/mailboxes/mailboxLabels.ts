import type { IdentityKind } from "../../../shared/contracts/contracts";
import type { MailboxSummary } from "../../../shared/api/mailboxViewer";
import { initialsOf } from "../../../shared/api/refs";
import type { TFunction } from "../../../shared/i18n/types";

/** The catalog key naming each kind of mailbox. */
export const MAILBOX_KIND_LABEL_KEYS: Record<IdentityKind, string> = {
  profile: "messages:mailbox.kind.profile",
  listing: "messages:mailbox.kind.listing",
  subprofile: "messages:mailbox.kind.subprofile",
  company: "messages:mailbox.kind.company",
};

/** The name a mailbox shows. The server sends a null name when the row that
 *  owns the mailbox vanished mid-request. */
export function mailboxDisplayName(
  mailbox: Pick<MailboxSummary, "displayName">,
  t: TFunction,
): string {
  return mailbox.displayName ?? t("messages:mailbox.untitled");
}

/** Avatar initials for a mailbox name: its first and last words. */
export function mailboxInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const firstWord = words[0] ?? "";
  const lastWord = words.length > 1 ? (words[words.length - 1] ?? "") : "";
  return initialsOf(firstWord, lastWord);
}
