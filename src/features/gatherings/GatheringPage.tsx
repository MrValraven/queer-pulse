import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiCalendar } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  EmptyState,
  FeatureHelp,
  SkeletonLine,
  Tag,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSimulatedLoad } from "../../shared/hooks";
import { useMemberContact } from "../connect/useMemberContact";
import { ReportSubjectControl } from "../safety/ReportSubjectControl";
import { routes } from "../../app/routeMap";
import { JoinVouchCallout } from "./JoinVouchCallout";
import { MeetTheTable } from "./table/MeetTheTable";
import { GatheringSidebar } from "./GatheringSidebar";
import { GatheringHeroActions } from "./GatheringHeroActions";
import { GatheringMoreRail } from "./GatheringMoreRail";
import { GatheringLineupSection } from "./GatheringLineupSection";
import { GoingAttendeesPreview } from "./GoingAttendeesPreview";
import { GatheringDetailPanels } from "./GatheringDetailPanels";
import {
  gatheringDetails,
  gatheringKind,
  resolveGathering,
  type GatheringDetail,
} from "./data";
import { useGatheringRsvp } from "./useGatheringRsvp";
import { eventZoneFormat } from "./eventTimezone";
import { useEvent } from "./api/useEvent";

import styles from "./GatheringPage.module.css";

/**
 * The gathering's loading / not-found frame. Live has no gathering until the
 * fetch resolves — a skeleton while loading, then a real "not found" state if
 * the slug resolves to nothing. Demo always resolves, so this is live-only.
 */
function GatheringUnavailable({ loading }: { loading: boolean }) {
  const { t } = useTranslation();
  return (
    <PageShell>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.back}>
            <Link to={routes.calendar} className={styles.backLink}>
              <FiArrowLeft aria-hidden />{" "}
              {t("gatherings:common.backToGatherings")}
            </Link>
          </div>
          {loading ? (
            <>
              <SkeletonLine width="30%" height={18} />
              <SkeletonLine width="70%" height={40} style={{ marginTop: 16 }} />
              <SkeletonLine width="90%" height={16} style={{ marginTop: 16 }} />
            </>
          ) : (
            <EmptyState
              icon={<FiCalendar />}
              title={t("gatherings:gathering.notFoundTitle")}
              description={t("gatherings:gathering.notFoundDescription")}
              action={{
                label: (
                  <>
                    <FiArrowLeft aria-hidden />{" "}
                    {t("gatherings:common.backToGatherings")}
                  </>
                ),
                to: routes.calendar,
              }}
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}

export function GatheringPage() {
  const { slug: param } = useParams();
  const { demoMode } = useDemoMode();
  const simLoading = useSimulatedLoad();
  const { data, isLoading } = useEvent(param);
  // NEVER fall back to the mock registry in live — that leaked demo gatherings
  // into production. Demo resolves the route param against the mock; live uses
  // only the fetched event (null until it resolves, or if the slug 404s).
  const gathering = demoMode
    ? resolveGathering(param)
    : (data?.gathering ?? null);
  const loading = demoMode ? simLoading : isLoading;

  if (!gathering) return <GatheringUnavailable loading={loading} />;
  return <GatheringDetailBody gathering={gathering} routeParam={param} />;
}

/**
 * The gathering itself, once it has resolved.
 *
 * Split from the loader above for one reason: the hero's RSVP button and the
 * sidebar's RSVP panel are two views of ONE decision, so they have to share one
 * `useGatheringRsvp` — and a hook cannot live above the loader's "not found"
 * early return, which has no gathering to give it. Two independent copies (what
 * this page shipped with) meant the hero could read "Cancel RSVP" while the
 * sidebar beside it still offered "Reserve a seat".
 */
function GatheringDetailBody({
  gathering,
  routeParam,
}: {
  gathering: GatheringDetail;
  routeParam: string | undefined;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode } = useDemoMode();
  const { connected, contact } = useMemberContact(gathering.hostSlug);
  const rsvp = useGatheringRsvp(gathering);

  const kind = gatheringKind(gathering);
  // Date + start time read in the gathering's own zone, with the short zone
  // name appended when that zone differs from the reader's.
  const zone = eventZoneFormat(gathering.timezone, gathering.date);

  // The "more gatherings" rail is mock-only; live has no list endpoint here, so
  // it stays empty rather than leaking demo gatherings into production.
  const others = demoMode
    ? Object.values(gatheringDetails).filter(
        (other) => other.slug !== gathering.slug,
      )
    : [];

  return (
    <PageShell>
      <div className={styles.page}>
        <div className="wrap">
          <div className={styles.back}>
            <Link to={routes.calendar} className={styles.backLink}>
              <FiArrowLeft aria-hidden />{" "}
              {t("gatherings:common.backToGatherings")}
            </Link>
          </div>

          <div className={styles.grid}>
            <div>
              <div className={styles.typeRow}>
                <span className={styles.type}>{gathering.type}</span>
                <Tag
                  className={
                    kind === "event" ? styles.badgeEvent : styles.badgeGathering
                  }
                >
                  {t(
                    kind === "event"
                      ? "gatherings:gathering.badge.event"
                      : "gatherings:gathering.badge.gathering",
                  )}
                </Tag>
              </div>
              <h1 className={styles.title}>
                {gathering.title} <FeatureHelp id="events.detail" />
              </h1>
              <div className={styles.meta}>
                <span className={styles.metaItem}>
                  <span className={styles.metaDot} />
                  {fmt.date(gathering.date, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    ...zone.dateOptions,
                  })}
                </span>
                <span className={styles.metaItem}>
                  <span className={styles.metaDot} />
                  {fmt.time(gathering.date, zone.timeOptions)}
                </span>
                <span className={styles.metaItem}>
                  <span className={styles.metaDot} />
                  {gathering.hood}
                </span>
                <span className={styles.metaItem}>
                  <span className={styles.metaDot} />
                  {t("gatherings:common.hostedBy")} {gathering.host}
                </span>
              </div>
              <p className={styles.body}>{gathering.body}</p>
              <GatheringHeroActions
                gathering={gathering}
                routeParam={routeParam}
                rsvp={rsvp}
              />

              <GoingAttendeesPreview gathering={gathering} />

              {/* LOC-04/06/08 — announcements, where it actually is, the six
                  accessibility answers, and "tell someone where I'm going".
                  Live only: the demo registry carries none of that data. */}
              <GatheringDetailPanels
                gathering={gathering}
                demoMode={demoMode}
              />

              {/* "Meet the table" is demo-only: the backend exposes no seat /
                  attendee data yet, so live mode omits it rather than leak the
                  mock seats into production. */}
              {demoMode && gathering.type === "Supper Club" && (
                <MeetTheTable
                  title={gathering.title}
                  neighbourhood={gathering.hood}
                />
              )}

              <div className={styles.calloutWrap}>
                <JoinVouchCallout />
              </div>

              <GatheringLineupSection gathering={gathering} />

              {/* PRD-284. Reporting a gathering used to live only in the
                  member's own "My events" list, so raising a suspicious event
                  meant RSVP'ing to it first, which puts the reporter on the
                  host's attendee list. This is the same `event` report, on the
                  page where a member first meets the gathering and where
                  everyone who has not RSVP'd is looking at it.

                  Deliberately quiet and deliberately ungated: the same
                  `ReportSubjectControl` the per-photo trigger uses a level
                  down, and `POST /reports` is public (PRD-280), so a visitor
                  reading a public gathering page can raise it too.

                  `subjectId` is the SLUG. The moderation console resolves an
                  `event` subject with `WHERE e.slug = ANY(...)`, and
                  `myEvents.adapters` already files these as `dto.slug`, so
                  both entry points name the same row. It reads no clock, so
                  the demo registry's past-dated gatherings keep it. */}
              <div className={styles.reportRow}>
                <ReportSubjectControl
                  subjectType="event"
                  subjectId={gathering.slug}
                  subjectName={gathering.title}
                  label={t("gatherings:gathering.reportCta")}
                  ariaLabel={t("gatherings:gathering.reportAriaLabel", {
                    title: gathering.title,
                  })}
                />
              </div>
            </div>

            <GatheringSidebar
              gathering={gathering}
              connected={connected}
              contact={contact}
              rsvp={rsvp}
            />
          </div>

          {others.length > 0 && <GatheringMoreRail others={others} />}
        </div>
      </div>
    </PageShell>
  );
}
