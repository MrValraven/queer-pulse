import { Link } from "react-router-dom";
import { FiCalendar, FiPlus } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { communityPath } from "../../app/routeMap";
import type { Community } from "../homepage/data/types";
import type { CommunityEvent } from "./community.model";
import type { CommunityRole } from "./membership.types";
import styles from "./CommunitiesHomePage.module.css";

export interface MyCommunity {
  slug: string;
  name: string;
  count: string;
  role: CommunityRole;
}
/** A dated gathering from the demo mock registry. */
export interface UpcomingItem {
  event: CommunityEvent;
  name: string;
  slug: string;
}
/**
 * The live shape: how many gatherings are still ahead in one community.
 *
 * `GET /me/communities/digest` counts them without naming them, and no
 * endpoint answers "the gatherings across all my communities" in one call, so
 * the live card says how many and links into the community rather than
 * inventing titles and dates. Listing them properly would mean a request per
 * community, which is the fan-out the digest exists to replace.
 */
export interface UpcomingCountItem {
  slug: string;
  name: string;
  count: number;
}

/**
 * The "My communities" rail: what's coming up, and communities worth a look.
 *
 * It used to lead with a text list of the communities you belong to — that is
 * now the page's own card grid, so the list would just repeat it in miniature.
 *
 * Both cards hide themselves when empty rather than carrying an empty state.
 * That is honest for each: an empty `upcoming` means no gathering is scheduled
 * in any of your communities, and `GET /communities/suggested` answers `[]`
 * for a member whose connections are all in rooms they have already joined.
 * Neither is news worth a panel.
 */
export function CommunitiesHomeSidebar({
  upcoming,
  upcomingCounts,
  suggestions,
}: {
  upcoming: UpcomingItem[];
  upcomingCounts: UpcomingCountItem[];
  suggestions: Community[];
}) {
  const { t } = useTranslation();
  return (
    <aside className={styles.sidebar}>
      {(upcoming.length > 0 || upcomingCounts.length > 0) && (
        <div className={styles.sbCard}>
          <div className={styles.sbLbl}>
            {t("communities:hub.sidebar.upcoming")}
          </div>
          {upcoming.map(({ event, name, slug }) => (
            <Link
              key={event.id}
              to={communityPath(slug)}
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
          {upcomingCounts.map(({ slug, name, count }) => (
            <Link key={slug} to={communityPath(slug)} className={styles.sbRow}>
              <div className={[styles.sbIc, styles.sbIcUpcoming].join(" ")}>
                <FiCalendar aria-hidden />
              </div>
              <div className={styles.sbRowMain}>
                <div className={styles.sbName}>{name}</div>
                <div className={styles.sbMeta}>
                  {t("communities:hub.sidebar.upcomingCount", { count })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className={styles.sbCard}>
          <div className={styles.sbLbl}>
            {t("communities:hub.sidebar.suggestions")}
          </div>
          {/* `Community.slug` is optional on the shared card shape, and a row
              with no slug has nowhere to link, so it is dropped rather than
              rendered as a dead link to `/community/undefined`. */}
          {suggestions.map((community) =>
            community.slug ? (
              <Link
                key={community.slug}
                to={communityPath(community.slug)}
                className={styles.sbRow}
              >
                <div className={[styles.sbIc, styles.sbIcSuggest].join(" ")}>
                  <FiPlus aria-hidden />
                </div>
                <div className={styles.sbRowMain}>
                  <div className={styles.sbName}>{community.name}</div>
                  <div className={styles.sbMeta}>{community.count}</div>
                </div>
              </Link>
            ) : null,
          )}
        </div>
      )}
    </aside>
  );
}
