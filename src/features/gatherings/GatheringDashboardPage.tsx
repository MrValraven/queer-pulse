import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { Footer } from "../../shared/components/layout";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  INITIAL_GUESTS,
  nowClock,
  type Guest,
} from "./gatheringDashboard.data";
import { GATHERING_TITLE } from "./manageGathering.data";
import {
  CheckInColumn,
  GuestListCard,
  StatsColumn,
} from "./GatheringDashboardCards";
import styles from "./GatheringDashboardPage.module.css";

const MANAGE = routes.manageGathering;

// The brand wordmark and the gathering's own title are content, not chrome —
// they come from a constant / mock record, never a literal JSX string, so the
// i18n sweep's no-literal-string lint stays satisfied without a catalog key.
const BRAND_QUEER = "Queer";
const BRAND_PULSE = "Pulse";

function renderGatheringTitle(title: string) {
  const idx = title.indexOf("—");
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx).trim()} — <em>{title.slice(idx + 1).trim()}</em>
    </>
  );
}

export function GatheringDashboardPage() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [clock, setClock] = useState(nowClock());
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);

  useEffect(() => {
    const intervalId = window.setInterval(() => setClock(nowClock()), 10000);
    return () => window.clearInterval(intervalId);
  }, []);

  const checkedIn = guests.filter((guest) => guest.status === "in").length;

  const checkInManual = (name: string) => {
    setGuests((prev) =>
      prev.map((guest) =>
        guest.name === name
          ? { ...guest, status: "in", time: nowClock() }
          : guest,
      ),
    );
    showToast(
      t("gatherings:dashboard.checkedInToast", { name: name.split(" ")[0]! }),
      "success",
    );
  };

  return (
    <>
      <div className={styles.page}>
        <div className={styles.topbar}>
          <Link to={routes.homepage} className={styles.brand}>
            <span className={styles.brandDot} />
            {BRAND_QUEER}
            <span className={styles.brandQ}>{BRAND_PULSE}</span>
          </Link>
          <Link to={MANAGE} className={styles.backLink}>
            ← {t("gatherings:dashboard.backToManage")}
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
              {renderGatheringTitle(GATHERING_TITLE)}
            </div>
            <div className={styles.heroStats}>
              <div>
                <div className={styles.hsN}>{checkedIn}</div>
                <div className={styles.hsL}>
                  {t("gatherings:dashboard.checkedIn")}
                </div>
              </div>
              <div>
                <div className={styles.hsN}>14</div>
                <div className={styles.hsL}>
                  {t("gatherings:dashboard.expected")}
                </div>
              </div>
              <div>
                <div className={styles.hsN}>
                  <em>3</em>
                </div>
                <div className={styles.hsL}>
                  {t("gatherings:dashboard.waitlist")}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.body}>
          <div className="wrap">
            <div className={styles.grid}>
              <CheckInColumn guests={guests} onCheckIn={checkInManual} />
              <GuestListCard
                guests={guests}
                checkedIn={checkedIn}
                onCheckIn={checkInManual}
              />
              <StatsColumn />
            </div>
          </div>
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
