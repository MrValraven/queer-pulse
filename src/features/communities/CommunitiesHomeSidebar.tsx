import { Link } from "react-router-dom";
import { FiArrowRight, FiPlus } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { Community } from "../homepage/data/types";
import type { CommunityEvent } from "./community.model";
import type { CommunityRole } from "./membership.types";
import { RoleBadge } from "./CommunityBadges";
import { leadingInitials } from "../../shared/lib/initials";
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

export function CommunitiesHomeSidebar({
  communities,
  upcoming,
  suggestions,
}: {
  communities: MyCommunity[];
  upcoming: UpcomingItem[];
  suggestions: Community[];
}) {
  const { t } = useTranslation();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sbCard}>
        <div className={styles.sbLbl}>
          {t("communities:hub.sidebar.yourCommunities")}
        </div>
        {communities.map((c) => (
          <Link
            key={c.slug}
            to={`/community/${c.slug}`}
            className={styles.sbRow}
          >
            <div className={styles.sbIc}>{leadingInitials(c.name)}</div>
            <div className={styles.sbRowMain}>
              <div className={styles.sbName}>
                {c.name} <RoleBadge role={c.role} />
              </div>
              <div className={styles.sbMeta}>{c.count}</div>
            </div>
          </Link>
        ))}
        <Link to={routes.communities} className={styles.sbFootLink}>
          {t("communities:hub.sidebar.discoverMore")}{" "}
          <FiArrowRight aria-hidden />
        </Link>
      </div>

      {upcoming.length > 0 && (
        <div className={styles.sbCard}>
          <div className={styles.sbLbl}>
            {t("communities:hub.sidebar.upcoming")}
          </div>
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
          <div className={styles.sbLbl}>
            {t("communities:hub.sidebar.suggestions")}
          </div>
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
