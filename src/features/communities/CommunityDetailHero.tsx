import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiMail } from "react-icons/fi";
import { FeatureHelp } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { routes } from "../../app/routeMap";
import type { Community } from "../homepage/data/types";
import type { CommunityDetail, Person } from "./communityDetails";
import type { CommunityParentRef } from "./api/communities.api";
import { CommunityHeroActions } from "./CommunityHeroActions";
import { CommunityHeroSecondaryActions } from "./CommunityHeroSecondaryActions";
import { SpaceBreadcrumb } from "./SpaceBreadcrumb";
import { leadingInitials } from "../../shared/lib/initials";
import styles from "./CommunityDetailPage.module.css";

/** Community detail hero: breadcrumb, title, meta row and the join/edit CTAs.
 *  The save/share/report icon row is `CommunityHeroSecondaryActions`, split
 *  out purely to keep this component under the repo's 200-line limit. */
export function CommunityDetailHero({
  community,
  detail,
  avatarImageUrl,
  joined,
  requested,
  isInvited,
  isInviteOnlyLocked,
  canDeclineInvite,
  canWithdrawRequest,
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
  onAcceptInvite,
  onDeclineInvite,
  onWithdrawRequest,
  onEdit,
  parent = null,
  isParentMembershipRequired = false,
}: {
  community: Community;
  detail: CommunityDetail;
  /** The community's own square identity mark, or "" when it has none (PRD-146).
   *  Empty falls back to the generated initial, exactly as the founding
   *  wizard's live card preview does. */
  avatarImageUrl: string;
  joined: boolean;
  requested: boolean;
  isInvited: boolean;
  isInviteOnlyLocked: boolean;
  canDeclineInvite: boolean;
  canWithdrawRequest: boolean;
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
  onAcceptInvite: () => void;
  onDeclineInvite: () => void;
  onWithdrawRequest: () => void;
  onEdit: () => void;
  /** Set on a space (subcommunity): its parent. Swaps the plain back link
   *  for `SpaceBreadcrumb` and drives `CommunityHeroActions`' parent gate. */
  parent?: CommunityParentRef | null;
  /** True until the viewer joins the space's parent. */
  isParentMembershipRequired?: boolean;
}) {
  const { t } = useTranslation();
  // The report subject id for a `community` report IS the slug. Prefer the one
  // the card DTO carries; fall back to the route param, which this hero only
  // ever renders under (`/community/:slug`), so a source that does not carry a
  // slug still gets a working report path.
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const communitySlug = community.slug ?? routeSlug;
  // A group named after its book (the backfill sets now_reading = name) would
  // repeat the H1, so the line shows only when the book adds something.
  const nowReading = detail.nowReading?.trim() ?? "";
  const shouldShowNowReading =
    nowReading !== "" && nowReading !== community.name.trim();
  return (
    <header
      className={styles.hero}
      // Plain data attribute (not a CSS-module class) so base.css's
      // `main[data-page-main]:has(...)` can tint the reserved nav-band gap
      // plum too, instead of leaving a cream strip above the hero.
      data-plum
    >
      <div className={`wrap ${styles.heroInner}`}>
        {parent ? (
          <SpaceBreadcrumb parent={parent} spaceName={community.name} />
        ) : (
          <Link to={routes.communities} className={styles.breadcrumb}>
            <FiArrowLeft aria-hidden /> {t("communities:detail.breadcrumb")}
          </Link>
        )}
        <div className={styles.typeBadge}>
          <span className={styles.dot} />
          {detail.badge}
        </div>
        {/* FeatureHelp sits beside the heading, not inside it, so the info
            button doesn't pollute the h1's accessible name. */}
        <div className={styles.h1Row}>
          {/* The community's own mark. Decorative: its name is the heading
              right beside it, so naming the image would only repeat it to a
              screen reader. A community with no mark keeps the generated
              initial the founding wizard's card preview already shows. */}
          <span className={styles.heroMark} aria-hidden>
            {avatarImageUrl ? (
              <img
                className={styles.heroMarkImg}
                src={avatarImageUrl}
                alt=""
                referrerPolicy="no-referrer"
              />
            ) : (
              leadingInitials(community.name, { fallback: "•" })
            )}
          </span>
          <h1 className={styles.h1}>{community.name}</h1>
          <FeatureHelp id="community.detail" />
        </div>
        <p className={styles.heroSub}>{community.description}</p>
        {shouldShowNowReading && (
          <p className={styles.heroReading}>
            <Translation
              i18nKey="communities:detail.nowReading"
              components={{ strong: <strong /> }}
              values={{ book: nowReading }}
            />
          </p>
        )}
        {isInvited && (
          <p className={styles.inviteBanner}>
            <FiMail aria-hidden /> {t("communities:detail.invite.banner")}
          </p>
        )}
        <div className={styles.heroMeta}>
          <span>{community.count}</span>
          <span className={styles.metaSep} />
          <span>{detail.founded}</span>
          <span className={styles.metaSep} />
          <span>{detail.cadence}</span>
        </div>
        <div className={styles.actRow}>
          <CommunityHeroActions
            joined={joined}
            requested={requested}
            isInvited={isInvited}
            isInviteOnlyLocked={isInviteOnlyLocked}
            canDeclineInvite={canDeclineInvite}
            canWithdrawRequest={canWithdrawRequest}
            joinLabel={joinLabel}
            parent={parent}
            isParentMembershipRequired={isParentMembershipRequired}
            onJoin={onJoin}
            onLeave={onLeave}
            onAcceptInvite={onAcceptInvite}
            onDeclineInvite={onDeclineInvite}
            onWithdrawRequest={onWithdrawRequest}
          />
          <CommunityHeroSecondaryActions
            canEdit={canEdit}
            onEdit={onEdit}
            saved={saved}
            onToggleSave={onToggleSave}
            onShare={onShare}
            communityName={community.name}
            communitySlug={communitySlug}
            joined={joined}
            heroAvatars={heroAvatars}
            memberNum={memberNum}
            hasCount={hasCount}
          />
        </div>
      </div>
    </header>
  );
}
