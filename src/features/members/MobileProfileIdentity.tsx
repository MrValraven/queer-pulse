import { Tag, TagRow } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ProfileNetworkStats } from "./ProfileNetworkStats";
import { SocialLinksRow } from "./SocialLinksRow";
import type { MemberProfile } from "./data/memberProfiles";
import styles from "./MobileProfile.module.css";

/**
 * The left-aligned details block of the Instagram-style mobile profile
 * header: member-since, the "Here for" intent block, bio, tags and social
 * links. Sits below the centered identity cap and full-width stats row in
 * `MobileProfileHeader` — the eyebrow, name, role/pronouns and location now
 * live in `MobileProfileIdentityTop`, split out so the header can center
 * that block beneath the avatar while this one stays left-aligned. The
 * gating logic mirrors `ProfileHero` in `ProfileSections.tsx` exactly (same
 * data, same rules).
 */
export function MobileProfileIdentity({
  profile,
  isSelf,
  onEditLinks,
}: {
  profile: MemberProfile;
  isSelf: boolean;
  onEditLinks?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.identity}>
      {profile.since && (
        <div className={styles.identityWhere}>
          <span className={styles.identityMuted}>
            {t("members:profile.hero.memberSince", { since: profile.since })}
          </span>
        </div>
      )}
      {profile.lookingFor &&
        profile.lookingFor.length > 0 &&
        (isSelf || profile.lookingForPublic) && (
          <div className={styles.identityHereFor}>
            <span className={styles.identityHereForLabel}>
              {t("members:hero.hereFor.label")}
            </span>
            {profile.lookingFor.map((intentLabel) => (
              <span key={intentLabel} className={styles.identityHereForChip}>
                {intentLabel}
              </span>
            ))}
            {isSelf && (
              <span className={styles.identityHereForHint}>
                {profile.lookingForPublic
                  ? t("members:hero.hereFor.hintPublic")
                  : t("members:hero.hereFor.hintPrivate")}
              </span>
            )}
          </div>
        )}
      <p className={styles.identityBio}>{profile.bio}</p>
      <TagRow className={styles.identityTags}>
        {profile.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </TagRow>
      {/* Private "Your network" chips — owner-only, mirroring the desktop hero.
          `isSelf` here already excludes the visitor-preview state. */}
      {isSelf && <ProfileNetworkStats ownerSlug={profile.slug} />}
      <SocialLinksRow
        links={profile.socials}
        self={isSelf}
        onEdit={onEditLinks}
      />
    </div>
  );
}
