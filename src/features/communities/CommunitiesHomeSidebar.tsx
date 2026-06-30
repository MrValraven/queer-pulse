import { Link } from "react-router-dom";
import { FiArrowRight, FiPlus } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import type { Community } from "../homepage/data/types";
import type { CommunityEvent } from "./community.model";
import type { CommunityRole } from "./membership.types";
import { RoleBadge } from "./CommunityBadges";
import styles from "./CommunitiesHomePage.module.css";

export interface MyCommunity {
  slug: string;
  name: string;
  count: string;
  role: CommunityRole;
}
export interface UpcomingItem {
  event: CommunityEvent;
  name: string;
  slug: string;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

export function CommunitiesHomeSidebar({
  communities,
  upcoming,
  suggestions,
}: {
  communities: MyCommunity[];
  upcoming: UpcomingItem[];
  suggestions: Community[];
}) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbCard}>
        <div className={styles.sbLbl}>Your communities</div>
        {communities.map((c) => (
          <Link
            key={c.slug}
            to={`/community/${c.slug}`}
            className={styles.sbRow}
          >
            <div className={styles.sbIc}>{initials(c.name)}</div>
            <div className={styles.sbRowMain}>
              <div className={styles.sbName}>
                {c.name} <RoleBadge role={c.role} />
              </div>
              <div className={styles.sbMeta}>{c.count}</div>
            </div>
          </Link>
        ))}
        <Link to={routes.communities} className={styles.sbFootLink}>
          Discover more <FiArrowRight aria-hidden />
        </Link>
      </div>

      {upcoming.length > 0 && (
        <div className={styles.sbCard}>
          <div className={styles.sbLbl}>Upcoming in your communities</div>
          {upcoming.map(({ event, name, slug }) => (
            <Link
              key={event.id}
              to={`/community/${slug}`}
              className={styles.upRow}
            >
              <div className={styles.upDate}>
                <div className={styles.upDd}>{event.dd}</div>
                <div className={styles.upMm}>{event.mm}</div>
              </div>
              <div className={styles.sbRowMain}>
                <div className={styles.sbName}>{event.title}</div>
                <div className={styles.sbMeta}>{name}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className={styles.sbCard}>
          <div className={styles.sbLbl}>Communities you might like</div>
          {suggestions.map((c) => (
            <Link
              key={c.slug}
              to={`/community/${c.slug}`}
              className={styles.sbRow}
            >
              <div className={[styles.sbIc, styles.sbIcSuggest].join(" ")}>
                <FiPlus aria-hidden />
              </div>
              <div className={styles.sbRowMain}>
                <div className={styles.sbName}>{c.name}</div>
                <div className={styles.sbMeta}>{c.count}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
}
