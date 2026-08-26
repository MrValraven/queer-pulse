import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { Button, Reveal, SkeletonLine } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useEvents } from "../gatherings/api/useEvents";
import { eventZoneFormat } from "../gatherings/eventTimezone";
import type { CalendarEvent } from "../gatherings/data";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import { MarketingSection } from "./MarketingSection";
import styles from "./ArrivingPage.module.css";

const SHOWN_COUNT = 2;

/**
 * The next two gatherings, soonest first.
 *
 * `isDemoRegistry` covers one honest exception: the demo registry is a frozen
 * fixture whose gatherings are dated to a fixed prototype season, so once real
 * time passes it every date is behind us. Demo mode then shows the two
 * earliest rows so the prototype still paints. Live mode never falls back: an
 * empty upcoming list renders the empty state and says so.
 */
function pickNextGatherings(
  events: CalendarEvent[],
  isDemoRegistry: boolean,
): CalendarEvent[] {
  const sorted = [...events].sort(
    (first, second) => first.date.getTime() - second.date.getTime(),
  );
  const now = Date.now();
  const stillToCome = sorted.filter((event) => event.date.getTime() >= now);
  if (stillToCome.length > 0) return stillToCome.slice(0, SHOWN_COUNT);
  return isDemoRegistry ? sorted.slice(0, SHOWN_COUNT) : [];
}

function GatheringRow({
  gathering,
  delay,
}: {
  gathering: CalendarEvent;
  delay: number;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const zone = eventZoneFormat(gathering.timezone, gathering.date);
  return (
    <Reveal
      as={Link}
      to={gathering.to}
      className={styles.firstGather}
      delay={delay}
    >
      <span className={styles.fgDate}>
        <span className={styles.d}>
          {fmt.date(gathering.date, { day: "numeric", ...zone.dateOptions })}
        </span>
        <span className={styles.m}>
          {fmt.date(gathering.date, { month: "short", ...zone.dateOptions })}
        </span>
      </span>
      <span className={styles.fgBody}>
        <span className={styles.fgBadge}>{gathering.org}</span>
        <span className={styles.fgTitle}>{gathering.title}</span>
        <span className={styles.fgMeta}>
          {t("marketing:arriving.firstStep.eventMeta", {
            hood: gathering.hood,
            time: fmt.time(gathering.date, zone.timeOptions),
          })}
        </span>
      </span>
      <span className={styles.fgGo} aria-hidden>
        <FiArrowRight />
      </span>
    </Reveal>
  );
}

function GatheringsLoading() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("marketing:arriving.firstStep.loading")}>
      {[0, 1].map((placeholderIndex) => (
        <div className={styles.fgSkeleton} key={placeholderIndex}>
          <SkeletonLine width={56} height={44} />
          <div className={styles.fgSkeletonText}>
            <SkeletonLine width="55%" height={20} />
            <SkeletonLine width="35%" height={14} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Live upcoming gatherings. Only mounted once we know the reader can read
 *  them, so `useEvents` never fires a doomed request from a public page. */
function UpcomingGatherings() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { items, isLoading, isError, refetch } = useEvents({
    filter: "upcoming",
  });
  const shown = useMemo(
    () => pickNextGatherings(items, demoMode),
    [items, demoMode],
  );

  if (isLoading) return <GatheringsLoading />;

  if (isError) {
    return (
      <div className={styles.fgNotice} role="alert">
        <p>{t("marketing:arriving.firstStep.error")}</p>
        <Button variant="ghost-dark" onClick={() => refetch()}>
          {t("marketing:arriving.firstStep.retry")}
        </Button>
      </div>
    );
  }

  if (shown.length === 0) {
    return (
      <div className={styles.fgNotice}>
        <p>{t("marketing:arriving.firstStep.empty")}</p>
        <Button to={routes.gatherings} variant="ghost-dark">
          {t("marketing:arriving.firstStep.emptyCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.fgList}>
        {shown.map((gathering, index) => (
          <GatheringRow
            gathering={gathering}
            key={gathering.to}
            delay={index * 70}
          />
        ))}
      </div>
      <Reveal as="div" className={styles.commCta} delay={140}>
        <Button to={routes.gatherings} variant="ghost-dark">
          {t("marketing:arriving.firstStep.allCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
      </Reveal>
    </>
  );
}

/** Shown to a logged-out visitor: the calendar is a members' surface, so the
 *  page says that plainly instead of advertising a gathering nobody outside
 *  can open. */
function GatheringsLocked() {
  const { t } = useTranslation();
  return (
    <div className={styles.fgNotice}>
      <p>{t("marketing:arriving.firstStep.locked")}</p>
      <Button to={requestInvitePath("arriving")} variant="ghost-dark">
        {t("marketing:arriving.firstStep.lockedCta")}{" "}
        <FiArrowRight aria-hidden />
      </Button>
    </div>
  );
}

/**
 * "Your first step" — real upcoming gatherings, soonest first.
 *
 * This section used to advertise one hardcoded card dated 14 June 2026: an
 * event that never happened and, by the time anyone read it, sat two months in
 * the past. It now reads the same `useEvents({ filter: "upcoming" })` source
 * the gatherings hub uses, which branches demo/live inside the hook.
 */
export function ArrivingGatheringsSection() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { loggedIn, checking } = useAuth();
  const isSessionUnknown = !demoMode && checking;
  const canReadGatherings = demoMode || loggedIn;

  return (
    <MarketingSection
      tone="plum"
      eyebrow={t("marketing:arriving.firstStep.eyebrow")}
      title={
        <Translation
          i18nKey="marketing:arriving.firstStep.title"
          components={{ em: <em /> }}
        />
      }
      lead={t("marketing:arriving.firstStep.intro")}
    >
      {isSessionUnknown ? (
        <GatheringsLoading />
      ) : canReadGatherings ? (
        <UpcomingGatherings />
      ) : (
        <GatheringsLocked />
      )}
    </MarketingSection>
  );
}
