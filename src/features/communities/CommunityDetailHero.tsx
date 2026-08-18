import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiBookmark,
  FiCheck,
  FiClock,
  FiShare2,
} from "react-icons/fi";
import { Button, FeatureHelp } from "../../shared/components/ui";
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
  saved,
  onToggleSave,
  onShare,
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
  saved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
  onJoin: () => void;
  onLeave: () => void;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  return (
    <header
      className={styles.hero}
      // Plain data attribute (not a CSS-module class) so base.css's
      // `main[data-page-main]:has(...)` can tint the reserved nav-band gap
      // plum too, instead of leaving a cream strip above the hero.
      data-plum
    >
      <div className={`wrap ${styles.heroInner}`}>
        <Link to={routes.communities} className={styles.breadcrumb}>
          <FiArrowLeft aria-hidden /> {t("communities:detail.breadcrumb")}
        </Link>
        <div className={styles.typeBadge}>
          <span className={styles.dot} />
          {detail.badge}
        </div>
        {/* FeatureHelp sits beside the heading, not inside it, so the info
            button doesn't pollute the h1's accessible name. */}
        <div className={styles.h1Row}>
          <h1 className={styles.h1}>{community.name}</h1>
          <FeatureHelp id="community.detail" />
        </div>
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
            <Button variant="ghost-dark" disabled>
              <FiClock aria-hidden /> {t("communities:detail.requested")}
            </Button>
          ) : (
            <Button variant="primary" onClick={onJoin}>
              {joinLabel}
            </Button>
          )}
          {canEdit && (
            <Button variant="ghost-dark" onClick={onEdit}>
              {t("communities:edit.cta")}
            </Button>
          )}
          <Button
            variant="ghost-dark"
            onClick={onToggleSave}
            aria-pressed={saved}
            aria-label={t(
              saved
                ? "communities:detail.save.unsaveAriaLabel"
                : "communities:detail.save.saveAriaLabel",
              { name: community.name },
            )}
          >
            <FiBookmark aria-hidden fill={saved ? "currentColor" : "none"} />
            {t(
              saved
                ? "communities:detail.save.saved"
                : "communities:detail.save.cta",
            )}
          </Button>
          <Button
            variant="ghost-dark"
            onClick={onShare}
            aria-label={t("communities:detail.share.ariaLabel", {
              name: community.name,
            })}
          >
            <FiShare2 aria-hidden /> {t("communities:detail.share.cta")}
          </Button>
          <CommunityHeroAvatars
            avatars={heroAvatars}
            memberNum={memberNum}
            hasCount={hasCount}
          />
        </div>
      </div>
    </header>
  );
}
