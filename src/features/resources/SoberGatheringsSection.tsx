import { useState } from "react";
import { FiCheck, FiPlus } from "react-icons/fi";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSimulatedLoad } from "../../shared/hooks";
import { EVENTS, TYPE_CLASS, TYPE_LABEL_KEY } from "./soberPage.data";
import styles from "./SoberPage.module.css";

function EventSkeleton() {
  // Mirrors the .event grid row: date column, body, RSVP pill.
  return (
    <div className={styles.event}>
      <div className={styles.seDate}>
        <SkeletonLine width={44} height={36} style={{ margin: "0 auto" }} />
        <SkeletonLine width={36} height={12} style={{ margin: "6px auto 0" }} />
      </div>
      <div>
        <SkeletonLine width={90} height={18} />
        <SkeletonLine width="60%" height={19} style={{ marginTop: 8 }} />
        <SkeletonLine width="45%" height={13} style={{ marginTop: 8 }} />
      </div>
      <SkeletonLine width={78} height={36} style={{ borderRadius: 999 }} />
    </div>
  );
}

// Demo-only fixture list. Live mode has no gatherings backend.
function SoberDemoEvents() {
  const { t } = useTranslation();
  const isLoading = useSimulatedLoad();
  const [goingIds, setGoingIds] = useState<Set<number>>(
    () => new Set(EVENTS.filter((e) => e.going).map((e) => e.id)),
  );

  return (
    <div className={styles.events} aria-busy={isLoading}>
      {isLoading
        ? Array.from({ length: EVENTS.length }).map((_, index) => (
            <EventSkeleton key={index} />
          ))
        : EVENTS.map((event, index) => {
            const isGoing = goingIds.has(event.id);
            return (
              <FadeIn
                className={styles.event}
                key={event.id}
                delay={Math.min(index, 8) * 60}
              >
                <div className={styles.seDate}>
                  <span className={styles.d}>{event.d}</span>
                  <span className={styles.m}>{event.m}</span>
                </div>
                <div>
                  <div
                    className={`${styles.seType} ${styles[TYPE_CLASS[event.type]]}`}
                  >
                    {t(TYPE_LABEL_KEY[event.type])}
                  </div>
                  <div className={styles.seName}>{event.name}</div>
                  <div className={styles.seMeta}>
                    {event.meta.map((metaItem, metaIndex) => (
                      <span key={metaItem.text}>
                        {metaIndex > 0 && "· "}
                        {metaItem.icon && <metaItem.icon />} {metaItem.text}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className={[styles.seRsvp, isGoing && styles.going]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() =>
                    setGoingIds((previous) => {
                      const next = new Set(previous);
                      if (next.has(event.id)) next.delete(event.id);
                      else next.add(event.id);
                      return next;
                    })
                  }
                >
                  {isGoing ? (
                    <>
                      {t("resources:sober.rsvp.going")} <FiCheck />
                    </>
                  ) : (
                    t("resources:sober.rsvp.cta")
                  )}
                </button>
              </FadeIn>
            );
          })}
    </div>
  );
}

interface SoberGatheringsSectionProps {
  onHost: () => void;
}

export function SoberGatheringsSection({
  onHost,
}: SoberGatheringsSectionProps) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const title = (
    <h2 className={styles.h}>
      <Translation
        i18nKey="resources:sober.gatherings.title"
        components={{ em: <em /> }}
      />
    </h2>
  );

  if (!demoMode) {
    return (
      <div className={styles.sec}>
        <div className="wrap">
          <div className={styles.secHeadRow}>{title}</div>
          <div className={styles.gatheringsEmpty}>
            <p className={styles.sub}>
              {t("resources:sober.gatherings.leadLive")}
            </p>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={onHost}
            >
              {t("resources:sober.gatherings.hostCtaLive")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sec}>
      <div className="wrap">
        <div className={styles.secHeadRow}>
          <div>
            {title}
            <p className={`${styles.sub} ${styles.subFlush}`}>
              {t("resources:sober.gatherings.lead")}
            </p>
          </div>
          <button type="button" className={styles.primaryBtn} onClick={onHost}>
            <FiPlus aria-hidden /> {t("resources:sober.gatherings.hostCta")}
          </button>
        </div>
        <SoberDemoEvents />
      </div>
    </div>
  );
}
