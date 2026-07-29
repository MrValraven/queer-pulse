import { Link } from "react-router-dom";
import { FiCheck, FiClock } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import type { Community } from "../homepage/data/types";
import type { CommunityDetail, Person } from "./communityDetails";
import { CommunityHeroAvatars } from "./CommunityHeroAvatars";
import styles from "./CommunityDetailPage.module.css";

/** Community detail hero: breadcrumb, title, meta row and the join/edit CTAs. */
export function CommunityDetailHero({
  community,
  detail,
  joined,
  requested,
  joinLabel,
  canEdit,
  heroAvatars,
  memberNum,
  hasCount,
  onJoin,
  onLeave,
  onEdit,
}: {
  community: Community;
  detail: CommunityDetail;
  joined: boolean;
  requested: boolean;
  joinLabel: string;
  canEdit: boolean;
  heroAvatars: Person[];
  memberNum: number;
  hasCount: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.hero}>
      <div className={`wrap ${styles.heroInner}`}>
        <Link to={routes.communities} className={styles.breadcrumb}>
          {t("communities:detail.breadcrumb")}
        </Link>
        <div className={styles.typeBadge}>
          <span className={styles.dot} />
          {detail.badge}
        </div>
        <h1 className={styles.h1}>{community.name}</h1>
        <p className={styles.heroSub}>{community.description}</p>
        <div className={styles.heroMeta}>
          <span>{community.count}</span>
          <span className={styles.metaSep} />
          <span>{detail.founded}</span>
          <span className={styles.metaSep} />
          <span>{detail.cadence}</span>
        </div>
        <div className={styles.actRow}>
          {joined ? (
            <Button variant="jade" onClick={onLeave}>
              <FiCheck aria-hidden /> {t("communities:detail.joined")}
            </Button>
          ) : requested ? (
            <Button variant="ghost" disabled>
              <FiClock aria-hidden /> {t("communities:detail.requested")}
            </Button>
          ) : (
            <Button variant="primary" onClick={onJoin}>
              {joinLabel}
            </Button>
          )}
          {canEdit && (
            <Button variant="ghost" onClick={onEdit}>
              {t("communities:edit.cta")}
            </Button>
          )}
          <CommunityHeroAvatars
            avatars={heroAvatars}
            memberNum={memberNum}
            hasCount={hasCount}
          />
        </div>
      </div>
    </div>
  );
}
