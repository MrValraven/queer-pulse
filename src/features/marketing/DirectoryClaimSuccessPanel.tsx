import { Link } from "react-router-dom";
import { ModalSheet, SuccessPanel } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { ListingClaimPolicyDTO } from "./listBusiness/api/listingClaims.api";
import styles from "./DirectoryClaimModal.module.css";

/**
 * The confirmation panel `DirectoryClaimModal` shows once a claim has been
 * filed, extracted to keep the modal itself under the 200-line component cap.
 */
export function DirectoryClaimSuccessPanel({
  onClose,
  placeName,
  policy,
  demoMode,
}: {
  onClose: () => void;
  placeName: string;
  policy: ListingClaimPolicyDTO | null;
  demoMode: boolean;
}) {
  const { t } = useTranslation();

  return (
    <ModalSheet
      onClose={onClose}
      success
      ariaLabel={t("marketing:directory.detail.claim.successAriaLabel")}
    >
      <SuccessPanel
        title={t("marketing:directory.detail.claim.successTitle")}
        em={t("marketing:directory.detail.claim.successEm")}
        onClose={onClose}
        closeLabel={t("marketing:directory.detail.claim.doneCta")}
        steps={
          policy
            ? [
                t("marketing:directory.detail.claim.policyTurnaround", {
                  count: policy.reviewTurnaroundDays,
                }),
              ]
            : undefined
        }
        // Where the claim can be watched from here. QueerPulse sends no mail,
        // so the claimant comes back to this page rather than waiting on a
        // message that would never arrive.
        //
        // Live only, matching `DirectoryAsideFooter`'s guard on the same
        // destination: a demo claim resolves in the browser and is never
        // stored, so that page would answer this confirmation with "you
        // haven't claimed a listing yet".
        footer={
          demoMode ? undefined : (
            <Link className={styles.trackLink} to={routes.listingClaims}>
              {t("marketing:directory.detail.claim.trackCta")}
            </Link>
          )
        }
      >
        {t("marketing:directory.detail.claim.successBody", {
          name: placeName,
        })}
      </SuccessPanel>
    </ModalSheet>
  );
}
