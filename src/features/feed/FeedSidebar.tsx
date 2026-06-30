import { Link } from "react-router-dom";
import {
  Avatar,
  AvatarStack,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useConnect } from "../../app/providers/ConnectProvider";
import { routes } from "../../app/routeMap";
import { gatheringPath } from "../gatherings/data";
import { NEW_THIS_WEEK } from "./feed.data";
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
}: {
  loading?: boolean;
  populated?: boolean;
}) {
  const { openConnect } = useConnect();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbCard}>
        <div className={styles.sbTitle}>Upcoming</div>
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <UpcomingRowSkeleton key={i} />
          ))
        ) : !populated ? (
          <p className={styles.sbEmpty}>No gatherings on your calendar yet.</p>
        ) : (
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
        )}
        <Link to={routes.calendar} className={styles.sbLink}>
          See full calendar →
        </Link>
      </div>

      <div className={styles.sbCard}>
        <div className={styles.sbTitle}>New this week</div>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <MemberRowSkeleton key={i} />)
        ) : !populated ? (
          <p className={styles.sbEmpty}>No new members to show yet.</p>
        ) : (
          NEW_THIS_WEEK.map((person, i) => (
            <div
              key={person.name}
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
              </Link>
              <button
                className={styles.linkBtn}
                onClick={() => openConnect(person.slug)}
              >
                Connect
              </button>
            </div>
          ))
        )}
        <Link to={routes.members} className={styles.sbLink}>
          Browse all members →
        </Link>
      </div>

      <div className={styles.sbCard}>
        <div className={styles.sbTitle}>Your connections</div>
        {loading ? (
          <ConnectionsSkeleton />
        ) : !populated ? (
          <p className={styles.sbEmpty}>
            You haven&rsquo;t connected with anyone yet.
          </p>
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
              <div className={styles.connCount}>42 connections</div>
              <Link
                to={routes.connections}
                style={{
                  fontSize: 12,
                  color: "var(--accent-ink)",
                  fontWeight: 600,
                }}
              >
                Manage →
              </Link>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
