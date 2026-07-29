import { Link } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import {
  CANCELLATION_REASON,
  CANCELLED_HOURS_AGO,
  RESCHEDULE_DATE,
} from "./gatheringCancelled.data";
import {
  CancelledAlternatives,
  CancelledEventCard,
  CancelledHostNote,
  CancelledRefundInfo,
} from "./GatheringCancelledSections";
import styles from "./GatheringCancelledPage.module.css";

const CALENDAR = routes.calendar;
const GATHERING = routes.gatherings;

export function GatheringCancelledPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const cancelledAgo = fmt.relativeTime(-CANCELLED_HOURS_AGO, "hour");

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={CALENDAR} className={styles.back}>
          {t("gatherings:cancelled.back")}
        </Link>

        <div className={styles.stamp}>
          <div className={styles.stampIc}>
            <svg viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <div>
            <h2>{t("gatherings:cancelled.stampTitle")}</h2>
            <p>
              {CANCELLATION_REASON}
              <b>{cancelledAgo}</b>. {t("gatherings:cancelled.stampBody")}
            </p>
          </div>
        </div>

        <CancelledEventCard />

        <CancelledRefundInfo />

        <CancelledHostNote />

        <CancelledAlternatives />

        <div className={styles.footActions}>
          <Button variant="ghost" to={CALENDAR}>
            {t("gatherings:cancelled.calendarCta")}
          </Button>
          <Button variant="primary" to={GATHERING}>
            {t("gatherings:cancelled.rsvpCta", {
              date: fmt.date(RESCHEDULE_DATE, {
                day: "numeric",
                month: "short",
              }),
            })}{" "}
            →
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
