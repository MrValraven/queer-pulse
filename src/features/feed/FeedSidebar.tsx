import { Link } from "react-router-dom";
import {
  Avatar,
  AvatarStack,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useMemberContact } from "../connect/useMemberContact";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";
import { gatheringPath } from "../gatherings/data";
import type { SidebarGathering, SidebarMember } from "./feed.data";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import styles from "./FeedPage.module.css";

function UpcomingRowSkeleton() {
  return (
    <div className={styles.upcomingRow} aria-hidden>
      <SkeletonLine
        width={46}
        height={22}
        style={{ borderRadius: 6, flex: "none" }}
      />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="70%" height={13} />
        <SkeletonLine width="45%" height={12} style={{ marginTop: 6 }} />
      </div>
    </div>
  );
}

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

export function FeedSidebar({
  loading = false,
  populated = false,
  members = [],
  gatherings = [],
}: {
  loading?: boolean;
  populated?: boolean;
  /** Rows for the "New this week" widget — the demo mock in demo mode, the
   *  live recently-joined members in live mode. Empty renders the empty state. */
  members?: SidebarMember[];
  /** Rows for the "Upcoming" widget in live mode — the viewer's own gatherings.
   *  Ignored in demo mode, which renders its own curated rows. Empty renders the
   *  empty state. */
  gatherings?: SidebarGathering[];
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbCard}>
        <div className={styles.sbTitle}>
          {t("feed:sidebar.upcomingHeading")}
        </div>
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <UpcomingRowSkeleton key={i} />
          ))
        ) : populated ? (
          <>
            <Link
              to={gatheringPath("queer-night-swim")}
              className={`${styles.upcomingRow} ${styles.revealRow}`}
            >
              <span className={styles.datePill}>22 Jun</span>
              <div>
                <div className={styles.upName}>Queer Night Swim</div>
                <div className={styles.upVenue}>Piscina Municipal</div>
              </div>
            </Link>
            <Link
              to={gatheringPath("queer-book-club")}
              className={`${styles.upcomingRow} ${styles.revealRow}`}
              style={{ animationDelay: "60ms" }}
            >
              <span className={styles.datePill}>19 Jul</span>
              <div>
                <div className={styles.upName}>Queer Book Club</div>
                <div className={styles.upVenue}>LX Factory</div>
              </div>
            </Link>
          </>
        ) : gatherings.length === 0 ? (
          <p className={styles.sbEmpty}>{t("feed:sidebar.upcomingEmpty")}</p>
        ) : (
          gatherings.map((gathering, i) => (
            <Link
              key={gathering.to}
              to={gathering.to}
              className={`${styles.upcomingRow} ${styles.revealRow}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className={styles.datePill}>
                {fmt.date(gathering.date, { day: "numeric", month: "short" })}
              </span>
              <div>
                <div className={styles.upName}>{gathering.name}</div>
                {gathering.venue && (
                  <div className={styles.upVenue}>{gathering.venue}</div>
                )}
              </div>
            </Link>
          ))
        )}
        <Link to={routes.calendar} className={styles.sbLink}>
          {t("feed:sidebar.seeCalendar")}
        </Link>
      </div>

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
          {t("feed:sidebar.browseMembers")}
        </Link>
      </div>

      <div className={styles.sbCard}>
        <div className={styles.sbTitle}>
          {t("feed:sidebar.connectionsHeading")}
        </div>
        {loading ? (
          <ConnectionsSkeleton />
        ) : !populated ? (
          <p className={styles.sbEmpty}>{t("feed:sidebar.connectionsEmpty")}</p>
        ) : (
          <div className={`${styles.connWidget} ${styles.revealRow}`}>
            <AvatarStack
              size={28}
              avatars={[
                { initials: "SR", tint: "jade" },
                { initials: "AK", tint: "coral" },
                { initials: "JP", tint: "plum" },
                { initials: "TM", tint: "jade" },
                { initials: "MF", tint: "coral" },
                { initials: "KL", tint: "plum" },
              ]}
            />
            <div>
              <div className={styles.connCount}>
                {t("feed:sidebar.connectionsCount", { count: 42 })}
              </div>
              <Link
                to={routes.connections}
                style={{
                  fontSize: 12,
                  color: "var(--accent-ink)",
                  fontWeight: 600,
                }}
              >
                {t("feed:sidebar.manage")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
