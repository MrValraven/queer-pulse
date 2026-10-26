import type { Language, TFunction } from "../../shared/i18n/types";
import type {
  AdminInviteBulkAction,
  AdminInviteBulkSkipReason,
  AdminInviteBulkSkippedDTO,
  AdminInviteStatus,
} from "./api/adminInvites.api";

/** The order skipped reasons are named in, most to least surprising. */
const SKIP_REASON_ORDER: AdminInviteBulkSkipReason[] = [
  "not_found",
  "accepted",
  "revoked",
  "expired",
  "still_valid",
];

/** The status a bulk action acts on: refresh brings back expired invites,
 *  revoke pulls pending ones. */
export const BULK_ACTION_SOURCE_STATUS: Record<
  AdminInviteBulkAction,
  AdminInviteStatus
> = { refresh: "expired", revoke: "valid" };

/** The status an invite has once a bulk action changed it. */
export const BULK_ACTION_TARGET_STATUS: Record<
  AdminInviteBulkAction,
  AdminInviteStatus
> = { refresh: "valid", revoke: "revoked" };

/**
 * One sentence naming every invite a bulk request left alone, grouped by
 * reason with each reason's count, e.g. "Left as they were: 2 were already
 * accepted and 1 no longer exists". Null when nothing was skipped.
 */
export function skippedInvitesSummary(
  t: TFunction,
  language: Language,
  skipped: AdminInviteBulkSkippedDTO[],
): string | null {
  if (skipped.length === 0) return null;
  const countByReason = new Map<AdminInviteBulkSkipReason, number>();
  for (const skippedInvite of skipped) {
    countByReason.set(
      skippedInvite.reason,
      (countByReason.get(skippedInvite.reason) ?? 0) + 1,
    );
  }
  const reasonPhrases = SKIP_REASON_ORDER.filter((reason) =>
    countByReason.has(reason),
  ).map((reason) =>
    t(`admin:adminInvites.bulk.skipReason.${reason}`, {
      count: countByReason.get(reason) ?? 0,
    }),
  );
  const reasons = new Intl.ListFormat(language, {
    type: "conjunction",
  }).format(reasonPhrases);
  return t("admin:adminInvites.bulk.skippedToast", { reasons });
}
