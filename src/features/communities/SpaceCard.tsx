import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SpaceCardModel } from "./community.model";
import { AccessTierBadge } from "./CommunityBadges";
import { CommunityCardShell } from "./CommunityCardShell";
import { SpaceCardAction } from "./SpaceCardAction";
import styles from "./CommunitiesPage.module.css";

/**
 * One space (subcommunity) card on the parent's Spaces tab. A thin
 * `CommunityCardShell` wrapper, on the same terms as `CommunityCard`: the
 * card links to the space, and `SpaceCardAction` puts the tier's join action
 * in the footer.
 *
 * `space.count` (already resolved by `cardDtoToCommunity`/the demo fixtures
 * through `communities:common.count.members`) is the count label as it
 * stands: the `Community` shape carries no numeric member count, only this
 * pre-formatted, locale-correct string (which already reads "Members only"
 * for a private space).
 *
 * The "You're in" badge reads `isMember`, the viewer's own roster row.
 * `myRole` is the effective role, which a parent's staff carry into every
 * space, so it would mark spaces they never joined.
 */
export function SpaceCard({
  space,
  isParentMember,
  parentName,
  onJoin,
}: {
  space: SpaceCardModel;
  isParentMember: boolean;
  parentName: string;
  onJoin: (space: SpaceCardModel) => void;
}) {
  const { t } = useTranslation();
  const isJoined = space.isMember;

  return (
    <CommunityCardShell
      slug={space.slug}
      name={space.name}
      type={space.type}
      typeLabel={space.typeLabel}
      description={space.description}
      countLabel={space.count}
      avatarImageUrl={space.avatarImageUrl}
      tags={space.tags}
      badge={
        isJoined ? (
          <span className={styles.inBadge}>
            <FiCheck aria-hidden /> {t("communities:spaces.card.joined")}
          </span>
        ) : (
          <AccessTierBadge tier={space.accessTier ?? "public"} isSpace />
        )
      }
      footAction={
        <SpaceCardAction
          space={space}
          isParentMember={isParentMember}
          parentName={parentName}
          onJoin={onJoin}
        />
      }
    />
  );
}
