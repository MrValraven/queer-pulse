import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { routes } from "../../../../app/routeMap";
import { useLeaveCoManagement } from "../api/useListingCoManagers";
import styles from "./CoManagers.module.css";

/**
 * A co-manager handing the listing back.
 *
 * Their own decision to make, so it never needs the owner. Confirmed once,
 * because it ends their access immediately and only the owner can undo it by
 * asking again.
 */
export function CoManagerStepDown({
  listingRef,
  listingName,
}: {
  listingRef: string;
  listingName: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const leave = useLeaveCoManagement(listingRef);
  const [isConfirming, setIsConfirming] = useState(false);

  const stepDown = () => {
    leave.mutate(undefined, {
      onSuccess: () => {
        showToast(
          t("marketing:listBusiness.coManagers.leftToast", {
            name: listingName,
          }),
          "info",
        );
        void navigate(routes.accountProfile);
      },
      onError: () =>
        showToast(t("marketing:listBusiness.coManagers.leaveError"), "error"),
    });
  };

  return (
    <div className={styles.stepDown}>
      <h3 className={styles.heading}>
        {t("marketing:listBusiness.coManagers.stepDownHeading")}
      </h3>
      <p className={styles.intro}>
        {t("marketing:listBusiness.coManagers.stepDownIntro")}
      </p>

      {isConfirming ? (
        <div
          className={styles.confirm}
          role="alertdialog"
          aria-label={t("marketing:listBusiness.coManagers.stepDownCta")}
        >
          <p className={styles.confirmText}>
            {t("marketing:listBusiness.coManagers.stepDownConfirm", {
              name: listingName,
            })}
          </p>
          <div className={styles.confirmActions}>
            <Button variant="ghost" onClick={() => setIsConfirming(false)}>
              {t("marketing:listBusiness.coManagers.stepDownCancel")}
            </Button>
            <Button
              variant="primary"
              disabled={leave.isPending}
              onClick={stepDown}
            >
              {t("marketing:listBusiness.coManagers.stepDownYes")}
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.stepDownActions}>
          <Button variant="ghost" onClick={() => setIsConfirming(true)}>
            {t("marketing:listBusiness.coManagers.stepDownCta")}
          </Button>
        </div>
      )}
    </div>
  );
}
