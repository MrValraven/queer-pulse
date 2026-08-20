import { FiArrowLeft, FiArrowRight, FiCalendar } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { useEvent } from "./api/useEvent";
import type { GatheringDetail } from "./data";
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
  LiveCancelledEventCard,
} from "./GatheringCancelledSections";
import styles from "./GatheringCancelledPage.module.css";

const CALENDAR = routes.calendar;
const GATHERING = routes.gatherings;

/**
 * The gathering-cancelled route. Demo keeps the full static prototype below
 * (its host note / refund line / "next visit" alternatives are organizer-
 * authored prototype flavor, same as `GatheringRecapPage`'s demo write-up —
 * never reached by a real cancellation). Live resolves the REAL cancelled
 * event off `:slug` and renders only what's actually true about it: the push
 * notification that lands someone here is already targeted at one specific
 * event, so the page it opens has to be too, instead of always showing the
 * same fictional "Marta" cancellation regardless of which gathering it was.
 */
export function GatheringCancelledPage() {
  const { slug: param } = useParams();
  const { demoMode } = useDemoMode();
  const { data, isLoading } = useEvent(param);

  if (demoMode) return <DemoGatheringCancelled />;

  const gathering = data?.gathering ?? null;
  if (!gathering) return <CancelledUnavailable loading={isLoading} />;
  return <LiveGatheringCancelled gathering={gathering} />;
}

/** Live loading / not-found frame — live has no cancelled-event detail until
 *  the fetch resolves. */
function CancelledUnavailable({ loading }: { loading: boolean }) {
  const { t } = useTranslation();
  return (
    <PageShell>
      <div className={styles.page}>
        {loading ? (
          <>
            <SkeletonLine width="30%" height={18} />
            <SkeletonLine width="60%" height={40} style={{ marginTop: 16 }} />
            <SkeletonLine width="90%" height={16} style={{ marginTop: 16 }} />
          </>
        ) : (
          <EmptyState
            icon={<FiCalendar />}
            title={t("gatherings:gathering.notFoundTitle")}
            description={t("gatherings:gathering.notFoundDescription")}
            action={{
              label: t("gatherings:prototypeComingSoon.browseCta"),
              to: routes.events,
            }}
          />
        )}
      </div>
    </PageShell>
  );
}

/**
 * The real cancelled-event view: the gathering's actual title, host, original
 * schedule, and venue — no invented cancellation reason (the backend doesn't
 * record one) and no fabricated refund/reschedule copy (gatherings have no
 * ticketing/payment concept to refund in this app). Just the honest facts
 * plus a way back to browsing what's still on.
 */
function LiveGatheringCancelled({ gathering }: { gathering: GatheringDetail }) {
  const { t } = useTranslation();
  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={CALENDAR} className={styles.back}>
          <FiArrowLeft aria-hidden /> {t("gatherings:cancelled.back")}
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
            <p>{t("gatherings:cancelled.stampBodyLive")}</p>
          </div>
        </div>

        <LiveCancelledEventCard gathering={gathering} />

        <div className={styles.footActions}>
          <Button variant="ghost" to={CALENDAR}>
            {t("gatherings:cancelled.calendarCta")}
          </Button>
          <Button variant="primary" to={GATHERING}>
            {t("gatherings:prototypeComingSoon.browseCta")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        </div>
      </div>
    </PageShell>
  );
}

/** The full static cancelled-gathering prototype — unchanged demo experience. */
function DemoGatheringCancelled() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const cancelledAgo = fmt.relativeTime(-CANCELLED_HOURS_AGO, "hour");

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={CALENDAR} className={styles.back}>
          <FiArrowLeft aria-hidden /> {t("gatherings:cancelled.back")}
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
            <FiArrowRight aria-hidden />
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
