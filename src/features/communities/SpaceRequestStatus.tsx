import { forwardRef } from "react";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import type { Formatters } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SpaceRequestDTO } from "./api/communitySpaceRequests.api";
import styles from "./SpaceRequestPanel.module.css";

/** The open/approved/declined status callouts, split out of `SpaceRequestPanel`
 *  to keep that component under the repo's 200-line cap. The pending status
 *  paragraph's ref is forwarded so the panel can focus it after a create
 *  succeeds, the same way `SpaceRequestNoteForm`'s textarea ref is focused
 *  after a withdraw. */
export const SpaceRequestStatus = forwardRef<
  HTMLParagraphElement,
  {
    request: SpaceRequestDTO | null;
    isApproved: boolean;
    canAsk: boolean;
    onWithdraw: () => void;
    isWithdrawPending: boolean;
    fmt: Formatters;
  }
>(function SpaceRequestStatus(
  { request, isApproved, canAsk, onWithdraw, isWithdrawPending, fmt },
  statusTextRef,
) {
  const { t } = useTranslation();
  const isOpen = request?.status === "open";
  const isDeclined = request?.status === "declined";

  return (
    <>
      {isOpen && request && (
        <div className={styles.status}>
          <FiClock aria-hidden="true" className={styles.icon} />
          <p className={styles.statusText} tabIndex={-1} ref={statusTextRef}>
            {t("communities:spaces.request.pending", {
              date: fmt.date(new Date(request.createdAt), {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            })}
          </p>
          {canAsk && (
            <Button
              variant="ghost"
              disabled={isWithdrawPending}
              onClick={onWithdraw}
            >
              {t("communities:spaces.request.withdraw")}
            </Button>
          )}
        </div>
      )}

      {isApproved && (
        <div className={styles.status}>
          <FiCheckCircle
            aria-hidden="true"
            className={`${styles.icon} ${styles.iconOk}`}
          />
          <p className={styles.statusText}>
            {t("communities:spaces.request.approved")}
          </p>
        </div>
      )}

      {isDeclined && request && (
        <div className={styles.declined}>
          <p className={styles.statusText}>
            {t("communities:spaces.request.declined")}
          </p>
          {request.declineReason && (
            <p className={styles.reason}>
              {t("communities:spaces.request.declinedReason", {
                reason: request.declineReason,
              })}
            </p>
          )}
          {canAsk && (
            <p className={styles.hint}>
              {t("communities:spaces.request.askAgain")}
            </p>
          )}
        </div>
      )}
    </>
  );
});
