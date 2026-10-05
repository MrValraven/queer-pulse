import type { IdentityKind } from "../../../shared/contracts/contracts";
import type { MailboxSummary } from "../../../shared/api/mailboxViewer";
import { initialsOf } from "../../../shared/api/refs";
import type { TFunction } from "../../../shared/i18n/types";
import type { MailboxAttribution } from "../api/mailboxes.api";
import { OFFICIAL_AVATAR_URL } from "../officialAvatar";

/** The catalog key naming each kind of mailbox. */
export const MAILBOX_KIND_LABEL_KEYS: Record<IdentityKind, string> = {
  profile: "messages:mailbox.kind.profile",
  listing: "messages:mailbox.kind.listing",
  subprofile: "messages:mailbox.kind.subprofile",
  company: "messages:mailbox.kind.company",
  official: "messages:mailbox.kind.official",
};

/** The QueerPulse Team mailbox wears the same "QP" mark as the member's own
 *  official thread, rather than the "QT" its name's initials would give. */
const OFFICIAL_MAILBOX_INITIALS = "QP";

/** The name a mailbox shows. The server sends a null name when the row that
 *  owns the mailbox vanished mid-request. */
export function mailboxDisplayName(
  mailbox: Pick<MailboxSummary, "displayName">,
  t: TFunction,
): string {
  return mailbox.displayName ?? t("messages:mailbox.untitled");
}

/** The avatar a mailbox shows: its own, or the app icon for the QueerPulse
 *  Team mailbox when the server sends none. */
export function mailboxAvatarUrl(
  mailbox: Pick<MailboxSummary, "avatarUrl" | "kind">,
): string | undefined {
  return (
    mailbox.avatarUrl ??
    (mailbox.kind === "official" ? OFFICIAL_AVATAR_URL : undefined)
  );
}

/** Avatar initials for a mailbox name: its first and last words, or the
 *  official mark for the QueerPulse Team mailbox. */
export function mailboxInitials(name: string, kind?: IdentityKind): string {
  if (kind === "official") return OFFICIAL_MAILBOX_INITIALS;
  const words = name.trim().split(/\s+/).filter(Boolean);
  const firstWord = words[0] ?? "";
  const lastWord = words.length > 1 ? (words[words.length - 1] ?? "") : "";
  return initialsOf(firstWord, lastWord);
}

/** The member's own first name, from their personal mailbox: the word the
 *  server signs their replies with. */
export function memberFirstNameOf(
  mailboxes: readonly MailboxSummary[] | undefined,
): string | undefined {
  const firstName = mailboxes
    ?.find((mailbox) => mailbox.kind === "profile")
    ?.displayName?.trim()
    .split(/\s+/)[0];
  return firstName || undefined;
}

/**
 * ENG-456: whether a customer sees the member's own first name beside a
 * reply sent as `mailbox`. The mailbox switch and the member's own
 * preference must both allow it, and an unlinked persona never names anyone.
 * `attribution`, when this session holds it, is newer than the list.
 */
export function isMemberNamedToCustomers(
  mailbox: MailboxSummary,
  attribution?: MailboxAttribution,
): boolean {
  if (mailbox.kind === "profile") return false;
  const shouldShowStaffNames =
    attribution?.shouldShowStaffNames ?? mailbox.shouldShowStaffNames;
  const shouldAllowMyName =
    attribution?.shouldAllowMyName ?? mailbox.shouldAllowMyName;
  const staffNamesLockedReason =
    attribution?.staffNamesLockedReason ?? mailbox.staffNamesLockedReason;
  return (
    shouldShowStaffNames === true &&
    shouldAllowMyName === true &&
    !staffNamesLockedReason
  );
}
