import { useState } from "react";
import { m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { keepOnFrameLoop } from "./checkinMotion";
import { gatheringLiveState, type GatheringLiveState } from "./doorWindow";
import styles from "./CheckinMeter.module.css";

const FILL_SPRING = { type: "spring", stiffness: 170, damping: 26 } as const;
const FILL_REDUCED = { duration: 0.12 } as const;

interface CheckinMeterProps {
  /** `null` = the platform no longer keeps this gathering's check-ins. */
  arrivedCount: number | null;
  goingCount: number;
  seatsTaken: number;
  waitlistCount: number;
  startAt: Date;
  endAt: Date | null;
  now: Date;
}

function StateBadge({ state }: { state: GatheringLiveState }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  let label: string;
  if (state.kind === "upcoming") {
    label = t("gatherings:checkin.state.upcoming", {
      date: fmt.date(state.startAt),
    });
  } else if (state.kind === "startsIn") {
    label =
      state.hours > 0
        ? t("gatherings:checkin.state.startsInHours", {
            hours: state.hours,
            minutes: state.minutes,
          })
        : t("gatherings:checkin.state.startsInMinutes", {
            count: state.minutes,
          });
  } else {
    label =
      state.kind === "live"
        ? t("gatherings:checkin.state.live")
        : t("gatherings:checkin.state.ended");
  }
  const isLive = state.kind === "live";
  return (
    <span className={isLive ? styles.badgeLive : styles.badge}>
      {isLive ? <span className={styles.liveDot} aria-hidden="true" /> : null}
      {label}
    </span>
  );
}

/** The arrival meter at the top of the Check-in tab. */
export function CheckinMeter({
  arrivedCount,
  goingCount,
  seatsTaken,
  waitlistCount,
  startAt,
  endAt,
  now,
}: CheckinMeterProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [previousArrivedCount, setPreviousArrivedCount] =
    useState(arrivedCount);

  const isEveryoneHere =
    arrivedCount !== null && goingCount > 0 && arrivedCount === goingCount;

  if (previousArrivedCount !== arrivedCount) {
    setPreviousArrivedCount(arrivedCount);
    setIsCelebrating(
      isEveryoneHere &&
        previousArrivedCount !== null &&
        previousArrivedCount < goingCount,
    );
  }

  const state = gatheringLiveState(startAt, endAt, now);
  const arrived = arrivedCount ?? 0;
  const fillTarget = goingCount > 0 ? Math.min(arrived / goingCount, 1) : 0;
  const guestCount = Math.max(seatsTaken - goingCount, 0);
  const seatsLine = [
    t("gatherings:checkin.meter.seats", { count: seatsTaken }),
    t("gatherings:checkin.meter.people", { count: goingCount }),
  ].join(" · ");

  return (
    <section className={styles.card}>
      <div className={styles.topRow}>
        <StateBadge state={state} />
        <span className={styles.muted}>
          {t("gatherings:checkin.meter.waitlist")} {fmt.number(waitlistCount)}
        </span>
      </div>

      {arrivedCount === null ? (
        <>
          <p className={styles.headline}>
            {t("gatherings:door.checkInsNotKept")}
          </p>
          <p className={styles.muted}>
            {t("gatherings:door.checkInsNotKeptNote")}
          </p>
        </>
      ) : (
        <>
          <p className={styles.headline}>
            <Translation
              i18nKey="gatherings:checkin.meter.arrived"
              values={{ count: arrived, total: fmt.number(goingCount) }}
              slots={{
                count: (
                  <em>
                    <RollingNumber
                      value={fmt.number(arrived)}
                      numericValue={arrived}
                    />
                  </em>
                ),
              }}
            />
          </p>
          <div
            className={styles.track}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={goingCount}
            aria-valuenow={Math.min(arrived, goingCount)}
            aria-label={t("gatherings:checkin.meter.progressAria")}
          >
            <m.div
              className={
                isCelebrating
                  ? `${styles.fill} ${styles.fillShimmer}`
                  : styles.fill
              }
              style={{ transformOrigin: "0 50%" }}
              // Mounts at the current share, so a remount (leaving focus
              // mode) shows the bar as it was; only a real change moves it.
              initial={false}
              animate={{ scaleX: fillTarget }}
              transition={reducedMotion ? FILL_REDUCED : FILL_SPRING}
            />
          </div>
          {isEveryoneHere ? (
            <m.p
              className={styles.everyoneHere}
              onUpdate={keepOnFrameLoop}
              // Fades in when the last guest arrives; a remount shows it.
              initial={
                isCelebrating ? { opacity: 0, y: reducedMotion ? 0 : 4 } : false
              }
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? FILL_REDUCED : { duration: 0.25 }}
            >
              {t("gatherings:checkin.meter.everyoneHere")}
            </m.p>
          ) : null}
        </>
      )}

      {guestCount > 0 && (
        <p className={styles.muted}>
          {`${seatsLine} ${t("gatherings:checkin.meter.guests", { count: guestCount })}`}
        </p>
      )}
    </section>
  );
}
