import { useState } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import { AdminChip, AdminDrawer } from "./ui";
import { AdminLegalRequestDetailFacts } from "./AdminLegalRequestDetailFacts";
import { AdminLegalRequestVoidModal } from "./AdminLegalRequestVoidModal";
import { useAdminLegalRequest } from "./api/useAdminLegalRequests";
import styles from "./AdminLegalRequestsPage.module.css";

/**
 * One recorded demand in full.
 *
 * The record is fetched fresh when the pane opens rather than read off the
 * cached list page, so an amendment a colleague made since the list loaded is
 * on screen before anybody strikes the row.
 *
 * LOADING, EMPTY AND FAILED ARE THREE DIFFERENT THINGS HERE. A pane that fell
 * back to a blank record on a failed read would tell an admin that a demand
 * naming their members carries no disclosure and no gag order, which is a
 * sentence this product cannot afford to say by accident.
 */
export function AdminLegalRequestDetail({
  recordId,
  onClose,
  onAmend,
}: {
  recordId: string;
  onClose: () => void;
  onAmend: (recordId: string) => void;
}) {
  const { t, language } = useTranslation();
  const { data: record, isLoading, isError } = useAdminLegalRequest(recordId);
  const [isVoidOpen, setIsVoidOpen] = useState(false);

  return (
    <>
      <AdminDrawer
        onClose={onClose}
        label={t("admin:legalRequests.detail.drawerLabel")}
        head={
          <>
            <p className={styles.drawerEyebrow}>
              {t("admin:legalRequests.detail.eyebrow")}
            </p>
            <h2 className={styles.drawerTitle}>
              {record
                ? record.requestingBody
                : t("admin:legalRequests.detail.untitled")}
            </h2>
          </>
        }
        foot={
          record && !record.isVoided ? (
            <>
              <Button
                variant="ghost"
                type="button"
                onClick={() => onAmend(record.id)}
              >
                {t("admin:legalRequests.action.amend")}
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={() => setIsVoidOpen(true)}
              >
                {t("admin:legalRequests.action.void")}
              </Button>
            </>
          ) : undefined
        }
      >
        {isLoading ? (
          <div className={styles.rows}>
            {[0, 1, 2, 3].map((skeletonIndex) => (
              <SkeletonLine
                key={skeletonIndex}
                height={44}
                style={{ borderRadius: 12 }}
              />
            ))}
          </div>
        ) : isError || !record ? (
          <p className={`${styles.notice} ${styles.errorNotice}`}>
            <FiAlertTriangle aria-hidden className={styles.noticeIcon} />
            {t("admin:legalRequests.detail.loadError")}
          </p>
        ) : (
          <>
            {record.isVoided && (
              <div className={styles.voidBanner}>
                <p className={styles.detailValue}>
                  {t("admin:legalRequests.detail.voidedOn", {
                    date: formatDate(record.voidedAt ?? "", language, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }),
                  })}
                </p>
                <p className={styles.detailValue}>
                  {record.voidReason ??
                    t("admin:legalRequests.detail.noVoidReason")}
                </p>
              </div>
            )}
            {record.isUnderGagOrder && (
              <div className={styles.chipRow}>
                <AdminChip tone="violet" dot>
                  {t("admin:legalRequests.gagOrderChip")}
                </AdminChip>
              </div>
            )}
            <AdminLegalRequestDetailFacts record={record} />
          </>
        )}
      </AdminDrawer>

      {isVoidOpen && record && (
        <AdminLegalRequestVoidModal
          record={record}
          onClose={() => setIsVoidOpen(false)}
          onVoided={onClose}
        />
      )}
    </>
  );
}
