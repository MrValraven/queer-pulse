import { useId } from "react";
import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminLegalRequestAmendmentEntry } from "./AdminLegalRequestAmendmentEntry";
import { useAdminLegalRequestAmendments } from "./api/useAdminLegalRequests";
import { AdminEmptyState, AdminNotice } from "./ui";
import styles from "./AdminLegalRequestsPage.module.css";

/**
 * Every amendment made to one record since it was entered, newest first
 * (ENG-487). A changed outcome or a lowered notified count moves a published
 * figure, and this is where the pane says who moved it and what it said before.
 *
 * LOADING, FAILED AND EMPTY STAY THREE DIFFERENT THINGS, for the same reason as
 * the record itself: a history that fell back to "no amendments" on a failed
 * read would vouch for a record nobody has checked.
 */
export function AdminLegalRequestAmendments({
  recordId,
}: {
  recordId: string;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const {
    data: amendments,
    isLoading,
    isError,
  } = useAdminLegalRequestAmendments(recordId);

  return (
    <section className={styles.history} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.historyHeading}>
        {t("admin:legalRequests.history.title")}
      </h3>
      {isLoading ? (
        <div className={styles.skeletons}>
          {[0, 1].map((skeletonIndex) => (
            <SkeletonLine
              key={skeletonIndex}
              height={72}
              style={{ borderRadius: "var(--radius-14)" }}
            />
          ))}
        </div>
      ) : isError || !amendments ? (
        <AdminNotice tone="error">
          {t("admin:legalRequests.history.loadError")}
        </AdminNotice>
      ) : amendments.length === 0 ? (
        <AdminEmptyState
          size="inline"
          title={t("admin:legalRequests.history.empty")}
        />
      ) : (
        <ol className={styles.historyList}>
          {amendments.map((amendment) => (
            <AdminLegalRequestAmendmentEntry
              key={amendment.id}
              amendment={amendment}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
