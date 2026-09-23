import type { TFunction } from "../../shared/i18n/types";

/**
 * Business mailboxes, design section 9 (I2): the identity a moderator-visible
 * message was sent as. The report drawer (`AdminReportDrawerContext.tsx`) and
 * the conversation viewer (`AdminReportConversationMessage.tsx`) each read one
 * off a different DTO shape, so this takes only the two fields both shapes
 * share, giving the two render sites one shared formatting to agree on.
 */
export interface SentAsIdentityLike {
  displayName: string | null;
  kind: "listing" | "subprofile" | "company" | null;
}

/** The kind label reuses the mailbox switcher's own catalog keys
 *  (`messages:mailbox.kind.*`) as their single shared source, so the
 *  moderator reads the identical word a staff member sees on their own
 *  switcher. */
const SENT_AS_KIND_LABEL_KEY: Record<
  NonNullable<SentAsIdentityLike["kind"]>,
  string
> = {
  listing: "messages:mailbox.kind.listing",
  subprofile: "messages:mailbox.kind.subprofile",
  company: "messages:mailbox.kind.company",
};

/**
 * "Sent as Café Lisboa (Directory listing)": the moderator-only line naming
 * the identity a message was sent as, beside the human sender the drawer or
 * the conversation viewer already names, whatever either attribution switch
 * says a customer sees.
 *
 * A gone identity keeps its `identityId` but reads null `kind`/`displayName`
 * (see `SentAsIdentityDTO`), so this falls back to a translated "Deleted
 * identity" name and drops the kind parenthetical, since there is no live
 * kind left to state.
 */
export function sentAsIdentityLabel(
  sentAsIdentity: SentAsIdentityLike,
  t: TFunction,
): string {
  const name =
    sentAsIdentity.displayName ??
    t("admin:moderation.reportDrawer.sentAsIdentity.deletedName");
  if (!sentAsIdentity.kind) {
    return t("admin:moderation.reportDrawer.sentAsIdentity.label", { name });
  }
  return t("admin:moderation.reportDrawer.sentAsIdentity.labelWithKind", {
    name,
    kind: t(SENT_AS_KIND_LABEL_KEY[sentAsIdentity.kind]),
  });
}
