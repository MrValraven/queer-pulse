import type { IconType } from "react-icons";
import { FiStar, FiShield, FiUser } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CommunityCardShell } from "../communities/CommunityCardShell";
import { getLiving } from "../communities/livingCommunities.data";
import {
  ROLE_LABEL_KEY,
  type FeaturedCommunityRef,
} from "./profileCommunities.types";
import styles from "./ProfileCommunityCard.module.css";

/** Icon per role for the shoulder pill. A plain member gets one too — unlike
 *  the roster's `RoleBadge`, this slot is never empty: it is what tells you
 *  how the profile's owner stands in the community they pinned. */
const ROLE_ICON: Record<FeaturedCommunityRef["role"], IconType> = {
  owner: FiStar,
  co_owner: FiStar,
  mod: FiShield,
  member: FiUser,
};

/**
 * A community the member features on their profile, rendered through the same
 * `CommunityCardShell` as the discover grid's cards so the two read as one
 * object. The shoulder's badge slot carries the owner's role instead of the
 * access tier (a pinned community is one they are already in, so the tier has
 * stopped being news), and the footer has no join control since the whole card
 * already links through to the community.
 */
export function ProfileCommunityCard({
  community,
}: {
  community: FeaturedCommunityRef;
}) {
  const { t } = useTranslation();
  // Demo's flagship communities carry a roster and a week's activity on the
  // `living` mock; live mode has neither on this DTO's source, exactly as on
  // the discover card. Never a live read — `getLiving` is a demo registry.
  const living = getLiving(community.slug);
  const roster = living?.roster.slice(0, 4) ?? [];
  const activeThisWeek =
    living?.stats.activeThisWeek ?? community.activeThisWeek;
  const coverImageUrl = community.coverImageUrl ?? undefined;
  const RoleIcon = ROLE_ICON[community.role];

  return (
    <CommunityCardShell
      slug={community.slug}
      name={community.name}
      type={community.type}
      typeLabel={community.typeLabel}
      description={community.tagline}
      countLabel={community.countLabel}
      activeThisWeek={activeThisWeek}
      coverImageUrl={coverImageUrl}
      avatarImageUrl={community.avatarImageUrl ?? undefined}
      tags={community.tags}
      roster={roster}
      badge={
        <span
          className={[
            styles.roleBadge,
            coverImageUrl && styles.roleBadgeOnPhoto,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <RoleIcon aria-hidden /> {t(ROLE_LABEL_KEY[community.role])}
        </span>
      }
    />
  );
}
