import { Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
export interface UpcomingItem {
  event: CommunityEvent;
  name: string;
  slug: string;
}

/**
 * The "My communities" rail: what's coming up, and communities worth a look.
 *
 * It used to lead with a text list of the communities you belong to — that is
 * now the page's own card grid, so the list would just repeat it in miniature.
 */
export function CommunitiesHomeSidebar({
  upcoming,
  suggestions,
}: {
  upcoming: UpcomingItem[];
  suggestions: Community[];
}) {
  const { t } = useTranslation();
  return (
    <aside className={styles.sidebar}>
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
