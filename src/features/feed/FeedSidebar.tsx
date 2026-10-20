import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import {
  Avatar,
  AvatarStack,
  LoadErrorState,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useMemberContact } from "../connect/useMemberContact";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type {
  SidebarConnections,
  SidebarGathering,
  SidebarMember,
} from "./feed.data";
import { FEED_MUTED_PATH } from "./feedMutedPath";
import { FeedSidebarUpcoming } from "./FeedSidebarUpcoming";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import styles from "./FeedPage.module.css";

function MemberRowSkeleton() {
  return (
    <div className={styles.sbMemberRow} aria-hidden>
      <SkeletonAvatar size={30} />
      <SkeletonLine width="55%" height={13} />
    </div>
  );
}

/**
 * The "New this week" row's connect affordance. Lives in its own component so
 * `useMemberContact` — a hook — is called at a component top level rather than
 * inside the `members.map` below (hooks can't run in a loop callback).
 */
function SidebarConnectButton({ person }: { person: SidebarMember }) {
  const { t } = useTranslation();
  const { connected, contact } = useMemberContact(person.slug);
  return (
    <button
      type="button"
      className={styles.linkBtn}
      onClick={() => contact({ slug: person.slug, name: person.name })}
    >
      {connected ? t("connect:contact.message") : t("feed:action.connect")}
    </button>
  );
}

function ConnectionsSkeleton() {
  return (
    <div className={styles.connWidget} aria-hidden>
      <div style={{ display: "flex" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ marginLeft: i === 0 ? 0 : -8 }}>
            <SkeletonAvatar size={28} />
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        <SkeletonLine width="60%" height={14} />
        <SkeletonLine width="35%" height={12} style={{ marginTop: 6 }} />
      </div>
    </div>
  );
}

const NO_CONNECTIONS: SidebarConnections = { count: 0, avatars: [] };

export function FeedSidebar({
  loading = false,
  populated = false,
  members = [],
  gatherings = [],
  connections = NO_CONNECTIONS,
}: {
  loading?: boolean;
  /** Demo-only switch for the "Upcoming" widget's curated mock rows. It no
   *  longer gates the connections widget: see SOC-06 below. */
  populated?: boolean;
  /** Rows for the "New this week" widget — the demo mock in demo mode, the
   *  live recently-joined members in live mode. Empty renders the empty state. */
  members?: SidebarMember[];
  /** Rows for the "Upcoming" widget in live mode: the viewer's own gatherings.
   *  Ignored when `populated` is set, which paints the curated demo rows.
   *  Empty renders the empty state. */
  gatherings?: SidebarGathering[];
  /** The member's real connection count and a short avatar sample, in BOTH
   *  modes (SOC-06). */
  connections?: SidebarConnections;
}) {
  const { t } = useTranslation();
  return (
    <aside className={styles.sidebar}>
      <FeedSidebarUpcoming
        loading={loading}
        populated={populated}
        gatherings={gatherings}
      />

      <div className={styles.sbCard}>
        <div className={styles.sbTitle}>
          {t("feed:sidebar.newThisWeekHeading")}
        </div>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <MemberRowSkeleton key={i} />)
        ) : members.length === 0 ? (
          <p className={styles.sbEmpty}>{t("feed:sidebar.newMembersEmpty")}</p>
        ) : (
          members.map((person, i) => (
            <div
              key={person.slug}
              className={`${styles.sbMemberRow} ${styles.revealRow}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Link
                to={`/members/${person.slug}`}
                className={styles.sbMemberLink}
              >
                <Avatar
                  initials={person.initials}
                  tint={person.tint}
                  src={person.photo}
                  size={30}
                />
                <span className={styles.sbMemberName}>{person.name}</span>
                <MemberStaffBadge slug={person.slug} />
              </Link>
              <SidebarConnectButton person={person} />
            </div>
          ))
        )}
        <Link to={routes.members} className={styles.sbLink}>
          {t("feed:sidebar.browseMembers")} <FiArrowRight aria-hidden />
        </Link>
      </div>

      {/* SOC-06: no `populated` gate here any more. The widget used to be
          shown only in demo mode, where it was six hardcoded initials and a
          fixed "42"; in live mode every member was permanently told they had
          no connections. Both modes now read the real list, and the empty
          state means what it says. */}
      <div className={styles.sbCard}>
        <div className={styles.sbTitle}>
          {t("feed:sidebar.connectionsHeading")}
        </div>
        {loading ? (
          <ConnectionsSkeleton />
        ) : connections.hasFailed ? (
          /* Never the empty line on a failed lookup: "no connections yet" is
             the exact claim SOC-06 removed from this widget. */
          <LoadErrorState compact onRetry={connections.onRetry} />
        ) : connections.count === 0 ? (
          <p className={styles.sbEmpty}>{t("feed:sidebar.connectionsEmpty")}</p>
        ) : (
          <div className={`${styles.connWidget} ${styles.revealRow}`}>
            <AvatarStack size={28} avatars={connections.avatars} />
            <div>
              <div className={styles.connCount}>
                {t("feed:sidebar.connectionsCount", {
                  count: connections.count,
                })}
              </div>
              <Link to={routes.connections} className={styles.sbInlineLink}>
                {t("feed:sidebar.manage")} <FiArrowRight aria-hidden />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* SOC-18: the way back. A mute a member cannot find again is a mute
          they cannot undo, so the managed list is one tap from the feed. */}
      <div className={styles.sbCard}>
        <div className={styles.sbTitle}>{t("feed:mute.sidebarHeading")}</div>
        <p className={styles.sbEmpty}>{t("feed:mute.sidebarBlurb")}</p>
        <Link to={FEED_MUTED_PATH} className={styles.sbLink}>
          {t("feed:mute.manageLink")} <FiArrowRight aria-hidden />
        </Link>
      </div>
    </aside>
  );
}
