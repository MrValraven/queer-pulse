import { Link } from "react-router-dom";
import { FiAlertTriangle, FiArrowRight, FiPlus } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FeatureHelp,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { createGatheringPath, gatheringPath } from "../gatherings/data";
import { useCommunityUpcomingGatherings } from "./api/useCommunityUpcomingGatherings";
import type { CommunityEvent } from "./community.model";
import detail from "./CommunityDetailPage.module.css";
import styles from "./CommunityHubTabs.module.css";

function EventRow({ ev }: { ev: CommunityEvent }) {
  const { t } = useTranslation();
  // Link to the specific gathering when this row mirrors a real one; otherwise
  // fall back to the gatherings landing (fabricated rows have no detail page).
  const to = ev.slug ? gatheringPath(ev.slug) : routes.gatherings;
  return (
    <div
      className={[styles.eventRow, ev.past && styles.eventPast]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={detail.gDate}>
        <div className={detail.gDd}>{ev.dd}</div>
        <div className={detail.gDm}>{ev.mm}</div>
      </div>
      <div className={styles.eventMain}>
        <div className={detail.gTitle}>{ev.title}</div>
        <div className={detail.gMeta}>
          {ev.meta}
          {ev.spots ? ` · ${ev.spots}` : ""}
        </div>
      </div>
      {ev.past ? (
        ev.recapHref && (
          <Link to={to} className={styles.recapLink}>
            {t("communities:detail.events.recapCta")}{" "}
            <FiArrowRight aria-hidden />
          </Link>
        )
      ) : (
        <Button variant="primary" to={to}>
          {t("communities:detail.events.rsvpCta")}
        </Button>
      )}
    </div>
  );
}

/** A placeholder event row, shape-matched to the real thing, while the
 *  live-mode fetch is in flight (`GET /communities/:slug/pulse` for a roster
 *  member, `.../upcoming-gatherings` for everybody else). */
function EventRowSkeleton() {
  return (
    <div className={styles.eventRow} aria-hidden="true">
      <div className={detail.gDate}>
        <SkeletonLine width={22} height={22} />
        <SkeletonLine width={28} height={11} style={{ marginTop: 6 }} />
      </div>
      <div className={styles.eventMain}>
        <SkeletonLine width="55%" height={14} />
        <SkeletonLine width="35%" height={12} style={{ marginTop: 8 }} />
      </div>
    </div>
  );
}

/**
 * "Host a gathering here" — the Events tab's way out of a read-only calendar.
 * Deep-links the create-gathering wizard with this community preselected
 * (`createGatheringPath`), so the new gathering is filed here by default.
 * Members only: the wizard's community picker and the backend both require a
 * membership, so offering it to anyone else would fail on publish.
 */
function HostGatheringCta({
  communitySlug,
  isProminent,
}: {
  communitySlug: string;
  /** The empty state gets the loud version with a line of encouragement; a
   *  tab that already has gatherings gets the quiet one under the list. */
  isProminent: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={isProminent ? styles.hostCtaLoud : styles.hostCtaQuiet}>
      {isProminent && (
        <p className={styles.hostCtaLead}>
          {t("communities:detail.events.host.lead")}
        </p>
      )}
      <Button
        variant={isProminent ? "primary" : "ghost"}
        to={createGatheringPath(communitySlug)}
      >
        <FiPlus aria-hidden /> {t("communities:detail.events.host.cta")}
      </Button>
    </div>
  );
}

export function EventsTab({
  events,
  communitySlug,
  isMember,
  isLoading = false,
  isError = false,
  onRetry,
}: {
  events: CommunityEvent[];
  /** This community's slug, used to preselect it in the create-gathering
   *  wizard behind the "host a gathering here" call to action. */
  communitySlug: string;
  /** Whether the viewer belongs to this community. Only members are offered
   *  the host call to action. */
  isMember: boolean;
  /** True while the live-mode fetch is in flight (always `false` in demo). */
  isLoading?: boolean;
  /** True when the live-mode fetch failed (always `false` in demo). */
  isError?: boolean;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  const canHost = isMember && communitySlug.length > 0;
  // PRD-145. A prospective member's gatherings are paged at 10 by their own
  // endpoint, and only this tab has anywhere to put a "show more" control.
  // Subscribing here shares the query the detail state hook already started
  // (same key, same react-query cache entry, one request), so this reads the
  // pages it loaded rather than fetching a second copy. Disabled for a member,
  // whose gatherings come from the pulse, and inert in demo mode.
  const nonMemberGatherings = useCommunityUpcomingGatherings(communitySlug, {
    enabled: !isMember,
  });
  const isProspectiveMember = !isMember;

  if (isLoading) {
    return (
      <div aria-busy="true">
        <div className={detail.secLbl}>
          {t("communities:detail.events.upcoming")}
        </div>
        <EventRowSkeleton />
        <EventRowSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<FiAlertTriangle />}
        title={t("communities:detail.events.error.title")}
        description={t("communities:detail.events.error.description")}
        action={
          onRetry
            ? {
                label: t("communities:detail.events.error.retryCta"),
                onClick: onRetry,
              }
            : undefined
        }
      />
    );
  }

  // Show every upcoming gathering (soonest first — the list is date-ordered),
  // not just the next one; the sidebar already highlights the single soonest.
  const upcoming = events.filter((e) => !e.past);
  const past = events.filter((e) => e.past);
  return (
    <div>
      <div className={detail.secLbl}>
        {t("communities:detail.events.upcoming")}{" "}
        <FeatureHelp id="community.events" />
      </div>
      {upcoming.length > 0 ? (
        <>
          {upcoming.map((ev) => (
            <EventRow key={ev.id} ev={ev} />
          ))}
          {nonMemberGatherings.hasMore && (
            <div className={detail.eventsLoadMore}>
              <Button
                variant="ghost"
                disabled={nonMemberGatherings.isLoadingMore}
                onClick={nonMemberGatherings.loadMore}
              >
                {nonMemberGatherings.isLoadingMore
                  ? t("communities:common.loading")
                  : t("communities:detail.events.loadMore")}
              </Button>
            </div>
          )}
          {canHost && (
            <HostGatheringCta
              communitySlug={communitySlug}
              isProminent={false}
            />
          )}
        </>
      ) : (
        <>
          <p className={styles.eventsEmpty}>
            {t("communities:detail.events.noUpcoming")}
          </p>
          {canHost && (
            <HostGatheringCta communitySlug={communitySlug} isProminent />
          )}
        </>
      )}
      {/* The prospective member's endpoint deliberately omits the gatherings
          this community keeps to its members, so a short or empty list here
          can mean "nothing on the calendar" OR "nothing we can show you". One
          honest line stops the tab from implying the first when it is the
          second. Members see the full list and need no such caveat. */}
      {isProspectiveMember && (
        <p className={detail.eventsNonMemberNote}>
          {t("communities:detail.events.nonMemberNote")}
        </p>
      )}

      {past.length > 0 && (
        <>
          <div className={detail.secLbl} style={{ marginTop: 32 }}>
            {t("communities:detail.events.past")}
          </div>
          {past.map((ev) => (
            <EventRow key={ev.id} ev={ev} />
          ))}
        </>
      )}
    </div>
  );
}
