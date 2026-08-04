import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfileFeaturedCommunities } from "./useProfileFeaturedCommunities";
import { useProfilePersonas } from "./useProfilePersonas";
import type { MemberProfile } from "./data/memberProfiles";
import type { Member } from "./data/members";
import styles from "./MobileProfile.module.css";

/**
 * Compact 3-column stat row for the mobile profile header (Instagram's
 * posts/followers/following, mapped to honest QueerPulse data: vouches,
 * featured communities, linked personas). Display only — these are NOT
 * links, since on mobile the corresponding sections live in sibling tab
 * panels rather than anchors on this same screen.
 *
 * Vouches resolve synchronously from `profile`. Communities and personas
 * come from live hooks and can be loading in live mode — personas expose
 * `isLoading` and render a skeleton until resolved; the communities hook
 * exposes no loading signal (see `useProfileFeaturedCommunities`), so a
 * resolved array — including an empty one — is treated as final.
 *
 * Two distinct self-flags come in on purpose: `isSelf` is preview-adjusted
 * (`realSelf && !asVisitor`, same as `MobilePersonaHighlights`' `selfView`)
 * and feeds the personas count, so it always agrees with what the persona
 * highlights row above it is showing. `rawIsSelf` is the RAW "is this the
 * owner's page" flag, unaffected by preview — it feeds
 * `useProfileFeaturedCommunities`, matching `ProfileCommunitiesSection`'s own
 * usage (see its doc comment: that hook must resolve from the owner's live
 * draft even while previewing). Using the preview-adjusted flag there instead
 * would zero out the communities count while previewing, even though the
 * Community tab still lists them.
 */
export function MobileProfileStats({
  profile,
  isSelf,
  rawIsSelf,
  otherMember,
  previewing: _previewing,
  ownerSlug,
}: {
  profile: MemberProfile;
  isSelf: boolean;
  rawIsSelf: boolean;
  otherMember: Member | null;
  previewing: boolean;
  ownerSlug: string;
}) {
  const { t } = useTranslation();

  const vouchesCount = profile.vouchers?.length ?? 0;

  const featuredCommunities = useProfileFeaturedCommunities({
    isSelf: rawIsSelf,
    otherMember,
  });
  const communitiesCount = featuredCommunities.length;

  const { personas, isLoading: personasLoading } = useProfilePersonas({
    ownerSlug,
    isSelf,
  });
  const personasCount = personas.length;

  return (
    <div className={styles.statRow}>
      <div className={styles.statColumn}>
        <span className={styles.statNumber}>{vouchesCount}</span>
        <span className={styles.statLabel}>
          {t("members:profile.stats.vouches")}
        </span>
      </div>
      <div className={styles.statColumn}>
        <span className={styles.statNumber}>{communitiesCount}</span>
        <span className={styles.statLabel}>
          {t("members:profile.stats.communities")}
        </span>
      </div>
      <div className={styles.statColumn}>
        {personasLoading ? (
          <SkeletonLine width={24} height={20} />
        ) : (
          <span className={styles.statNumber}>{personasCount}</span>
        )}
        <span className={styles.statLabel}>
          {t("members:profile.stats.personas")}
        </span>
      </div>
    </div>
  );
}
