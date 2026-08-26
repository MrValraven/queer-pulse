import { useEffect, useState, type ReactNode } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { Footer } from "../../../shared/components/layout";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "../GatheringDashboardPage.module.css";

// The brand wordmark and the gathering's own title are content, not chrome —
// they come from a constant / the API, never a literal JSX string, so the
// i18n sweep's no-literal-string lint stays satisfied without a catalog key.
const BRAND_QUEER = "Queer";
const BRAND_PULSE = "Pulse";

/** How often the door clock reticks. Ten seconds is close enough for a wall
 *  clock and cheap enough to leave running all evening. */
const CLOCK_TICK_MS = 10000;

/** One of the three numbers across the top of the door. */
export interface DoorStat {
  value: number;
  labelKey: string;
  /** Draw the number as the coral emphasis. At most one stat should. */
  emphasis?: boolean;
}

/** Split a `"Title: subtitle"` heading so the half after the colon renders as
 *  the coral italic emphasis the display type calls for. */
function renderGatheringTitle(title: string) {
  const colonIndex = title.indexOf(":");
  if (colonIndex === -1) return title;
  return (
    <>
      {title.slice(0, colonIndex).trim()}:{" "}
      <em>{title.slice(colonIndex + 1).trim()}</em>
    </>
  );
}

/**
 * The day-of dashboard's frame: the running clock, the way back to manage, the
 * gathering's own title, its three headline numbers, and the retention notice.
 *
 * Shared by the live door and the demo prototype so the two cannot drift into
 * looking like different products, while the roster inside each stays entirely
 * separate. A live host must never be handed the demo's guests.
 */
export function DoorShell({
  title,
  manageTo,
  stats,
  children,
}: {
  title: string;
  manageTo: string;
  stats: DoorStat[];
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [clock, setClock] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(
      () => setClock(new Date()),
      CLOCK_TICK_MS,
    );
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <>
      <div className={styles.page}>
        <div className={styles.topbar}>
          <Link to={routes.homepage} className={styles.brand}>
            <span className={styles.brandDot} />
            <span>
              {BRAND_QUEER}
              <span className={styles.brandQ}>{BRAND_PULSE}</span>
            </span>
          </Link>
          <Link to={manageTo} className={styles.backLink}>
            <FiArrowLeft aria-hidden /> {t("gatherings:dashboard.backToManage")}
          </Link>
          <span className={styles.clock}>{fmt.time(clock)}</span>
        </div>

        <div className={styles.hero}>
          <div className={`wrap ${styles.heroInner}`}>
            <div className={styles.liveBadge}>
              <span className={styles.liveDot} />{" "}
              {t("gatherings:dashboard.inProgress")}
            </div>
            <div className={styles.heroTitle}>
              {renderGatheringTitle(title)}
            </div>
            <div className={styles.heroStats}>
              {stats.map((stat) => (
                <div key={stat.labelKey}>
                  <div className={styles.hsN}>
                    {stat.emphasis ? <em>{stat.value}</em> : stat.value}
                  </div>
                  <div className={styles.hsL}>{t(stat.labelKey)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.body}>
          <div className="wrap">{children}</div>
        </div>

        <div className={styles.dataFooter}>
          <div className={`wrap ${styles.dfInner}`}>
            <div className={styles.dfText}>
              {t("gatherings:dashboard.dataRetentionNotice")}
            </div>
            <div className={styles.dfDot} />
            <div className={styles.dfText}>
              {t("gatherings:dashboard.attendanceRecordsNotice")}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
