import { useId } from "react";
import { Button, Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useMemberEarlyAccess } from "../api/useAdminEarlyAccess";
import { AdminAccessPanel, AdminAccessRow } from "../AdminAccessRow";
import { AdminMemberEarlyAccessRow } from "./AdminMemberEarlyAccessRow";
import styles from "../AdminMembersPage.module.css";

/**
 * The member drawer's Early access section, under Roles & access: one switch
 * per feature that is in early access right now. It folds in once the record
 * is read, so "Off" never flashes for a member who holds a grant, and it is
 * absent while no feature is in early access. A failed read keeps the section
 * with a warn row and Retry.
 */
export function AdminMemberEarlyAccessSection({
  memberId,
}: {
  memberId: string;
}) {
  const { t } = useTranslation();
  const earlyAccess = useMemberEarlyAccess(memberId);
  const headingId = useId();
  // Retry on a never-loaded failed query resets it to pending, so the error
  // branch reads errorUpdateCount and stays mounted (focus on Retry) while
  // the retry is in flight.
  const hasLoadFailed =
    earlyAccess.data === undefined && earlyAccess.errorUpdateCount > 0;
  const isRetrying = hasLoadFailed && earlyAccess.isFetching;
  const features = earlyAccess.data?.features ?? [];
  const isShown = hasLoadFailed || features.length > 0;

  return (
    <Collapse isOpen={isShown} className={styles.dSection}>
      <section aria-labelledby={headingId}>
        <h3 id={headingId} className={styles.dHeading}>
          {t("admin:earlyAccess.drawer.title")}
        </h3>
        <p className={styles.dHint}>{t("admin:earlyAccess.drawer.hint")}</p>
        <AdminAccessPanel>
          {hasLoadFailed ? (
            <AdminAccessRow
              title={t("admin:earlyAccess.drawer.title")}
              status={t("admin:earlyAccess.row.loadFailed")}
              tone="warn"
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  aria-disabled={isRetrying || undefined}
                  onClick={() => {
                    if (!isRetrying) void earlyAccess.refetch();
                  }}
                >
                  {t("admin:earlyAccess.row.retry")}
                </Button>
              }
            />
          ) : (
            features.map((feature) => (
              <AdminMemberEarlyAccessRow
                key={feature.featureKey}
                memberId={memberId}
                featureKey={feature.featureKey}
                grant={feature.grant}
              />
            ))
          )}
        </AdminAccessPanel>
      </section>
    </Collapse>
  );
}
