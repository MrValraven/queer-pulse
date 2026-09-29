import { LoadErrorState } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminFlaggedRows } from "./AdminMemberRows";
import { MemberRowsSkeleton } from "./AdminMembersRoster";
import type { useAdminFlagged } from "./api/useAdminMembers";
import { hasFailedWithoutData, isRetryingFailedRead } from "./queryLoadFailure";
import styles from "./AdminMembersPage.module.css";

/**
 * The "Flagged" tab body: skeleton, error, empty line or rows, mirroring
 * `AdminMembersRoster`.
 *
 * DES-424: loading, a failed read and a truly empty list used to share one
 * blank `.rows` div. A failed read now says so with a retry, so an expired
 * grant never reads as "no one is flagged".
 */
export function AdminFlaggedTab({
  flaggedQuery,
  onOpenMember,
}: {
  flaggedQuery: ReturnType<typeof useAdminFlagged>;
  onOpenMember: (memberId: string) => void;
}) {
  const { t } = useTranslation();

  if (hasFailedWithoutData(flaggedQuery)) {
    // A retry in flight keeps the panel, so focus stays on its busy Retry.
    return (
      <LoadErrorState
        headingLevel={2}
        isRetrying={isRetryingFailedRead(flaggedQuery)}
        onRetry={() => void flaggedQuery.refetch()}
        title={
          <Translation
            i18nKey="admin:members.flagged.loadError.title"
            components={{ em: <em /> }}
          />
        }
        description={t("admin:members.flagged.loadError.body")}
      />
    );
  }

  // Only an answered read can say the list is empty.
  const flaggedMembers = flaggedQuery.data;
  if (flaggedMembers === undefined) return <MemberRowsSkeleton />;
  if (flaggedMembers.length === 0) {
    return (
      <p className={styles.emptyLine}>{t("admin:members.flagged.empty")}</p>
    );
  }

  return (
    <AdminFlaggedRows members={flaggedMembers} onOpenMember={onOpenMember} />
  );
}
