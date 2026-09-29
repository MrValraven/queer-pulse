import { useId } from "react";
import { FiArrowRight, FiUsers } from "react-icons/fi";
import { Button, SkeletonLine } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useToast } from "../../../shared/components/feedback/useToast";
import { communityPath } from "../../../app/routeMap";
import { ambassadorErrorKey } from "./adminAmbassadors.api";
import {
  useAdminAmbassadorCircle,
  useTakeAmbassadorCircleStaffSeat,
} from "./useAdminAmbassadors";
import styles from "./AdminAmbassadorsPage.module.css";

/**
 * The private "QueerPulse Ambassadors" community: how many are in it, a way
 * in, and a staff seat for the viewer when they do not hold one yet. The seat
 * is a mod seat, which is what posting previews and polls and restyling the
 * card programme need.
 */
export function AdminAmbassadorCirclePanel() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const headingId = useId();
  const { data: circle, isLoading, isError } = useAdminAmbassadorCircle();
  const takeSeat = useTakeAmbassadorCircleStaffSeat();

  function handleTakeSeat() {
    takeSeat.mutate(undefined, {
      onSuccess: () =>
        showToast(t("admin:ambassadors.circle.seatTaken"), "success"),
      onError: (error) => showToast(t(ambassadorErrorKey(error)), "error"),
    });
  }

  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.panelTitle}>
        <FiUsers aria-hidden className={styles.panelIcon} />
        {t("admin:ambassadors.circle.title")}
      </h2>
      <p className={styles.panelHint}>{t("admin:ambassadors.circle.hint")}</p>
      {isLoading ? (
        <SkeletonLine height={44} />
      ) : isError || !circle ? (
        <p className={styles.panelHint}>
          {t("admin:ambassadors.circle.error")}
        </p>
      ) : (
        <>
          <p className={styles.circleCount}>
            {t("admin:ambassadors.circle.memberCount", {
              count: circle.memberCount,
            })}
          </p>
          <div className={styles.circleActions}>
            <Button variant="ghost" size="sm" to={communityPath(circle.slug)}>
              {t("admin:ambassadors.circle.open")} <FiArrowRight aria-hidden />
            </Button>
            {!circle.isViewerMember && (
              <Button
                variant="plum"
                size="sm"
                disabled={takeSeat.isPending}
                onClick={handleTakeSeat}
              >
                {t("admin:ambassadors.circle.takeSeat")}
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
