import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCalendar } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, EmptyState, FeatureHelp, SkeletonLine, Tag } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSimulatedLoad } from "../../shared/hooks";
import { useMemberContact } from "../connect/useMemberContact";
import { routes } from "../../app/routeMap";
import { JoinVouchCallout } from "./JoinVouchCallout";
import { MeetTheTable } from "./table/MeetTheTable";
import { GatheringSidebar } from "./GatheringSidebar";
import { GatheringBookmarkButton } from "./GatheringBookmarkButton";
import { GatheringMoreRail } from "./GatheringMoreRail";
import { GatheringLineupSection } from "./GatheringLineupSection";
import {
  gatheringDetails,
  gatheringKind,
  resolveGathering,
  type GatheringDetail,
} from "./data";
import { useEvent } from "./api/useEvent";
import { useRsvp, useUnrsvp } from "./api/useEventMutations";

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
              <FiArrowLeft aria-hidden /> {t("gatherings:common.backToGatherings")}
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
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
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
  const { connected, contact } = useMemberContact(gathering?.hostSlug ?? "");
  const rsvp = useRsvp(gathering?.slug ?? "");
  const unrsvp = useUnrsvp(gathering?.slug ?? "");
  // Local optimistic mirror of `myRsvpStatus`: the mutation no-ops the network
  // call in demo, so the confirmed state has to be held here (re-synced when a
  // live refetch resolves new server truth) — same pattern as
  // GatheringBookmarkButton's "Save" toggle and the sidebar's RSVP control.
  const [rsvpStatus, setRsvpStatus] = useState<GatheringDetail["myRsvpStatus"]>(
    gathering?.myRsvpStatus ?? null,
  );
  useEffect(
    () => setRsvpStatus(gathering?.myRsvpStatus ?? null),
    [gathering?.myRsvpStatus],
  );

  if (!gathering) return <GatheringUnavailable loading={loading} />;

  const kind = gatheringKind(gathering);
  const rsvpConfirmed = rsvpStatus === "going" || rsvpStatus === "waitlisted";

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
              <FiArrowLeft aria-hidden /> {t("gatherings:common.backToGatherings")}
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
                  })}
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
              <div className={styles.cta}>
                <Button
                  size="lg"
                  disabled={rsvp.isPending || unrsvp.isPending}
                  onClick={() => {
                    if (rsvpConfirmed) {
                      setRsvpStatus(null);
                      unrsvp.mutate(undefined, {
                        onSuccess: () =>
                          showToast(
                            t("gatherings:rsvpControl.cancelledToast"),
                            "success",
                          ),
                        onError: () =>
                          setRsvpStatus(gathering.myRsvpStatus ?? null),
                      });
                      return;
                    }
                    const next = gathering.isFull ? "waitlisted" : "going";
                    setRsvpStatus(next);
                    rsvp.mutate("going", {
                      onSuccess: () =>
                        showToast(
                          t(
                            next === "waitlisted"
                              ? "gatherings:rsvpControl.waitlistToast"
                              : "gatherings:rsvpControl.goingToast",
                          ),
                          "success",
                        ),
                      onError: () =>
                        setRsvpStatus(gathering.myRsvpStatus ?? null),
                    });
                  }}
                >
                  {rsvpConfirmed
                    ? t("gatherings:rsvpControl.cancelCta")
                    : rsvp.isPending
                      ? t("gatherings:rsvpControl.pendingCta")
                      : t(
                          gathering.isFull
                            ? "gatherings:rsvpControl.waitlistCta"
                            : gathering.ctaKey,
                        )}{" "}
                  <FiArrowRight aria-hidden />
                </Button>
                <GatheringBookmarkButton
                  slug={gathering.slug}
                  param={param}
                  bookmarked={gathering.bookmarked ?? false}
                />
                <Button size="lg" variant="ghost" to={routes.calendar}>
                  {t("gatherings:gathering.seeAllCta")}
                </Button>
              </div>

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
            </div>

            <GatheringSidebar
              gathering={gathering}
              connected={connected}
              contact={contact}
            />
          </div>

          {others.length > 0 && <GatheringMoreRail others={others} />}
        </div>
      </div>
    </PageShell>
  );
}
