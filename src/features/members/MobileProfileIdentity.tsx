import { Eyebrow, Tag, TagRow } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { PublicProfileBadge } from "./PublicProfileBadge";
import { SocialLinksRow } from "./SocialLinksRow";
import { VISIBILITY_LABEL_KEY } from "./profileSections.data";
import type { MemberProfile } from "./data/memberProfiles";
import styles from "./MobileProfile.module.css";

/**
 * The full-width identity block of the Instagram-style mobile profile header:
 * visibility eyebrow, name, role/pronouns, location + member-since, the "Here
 * for" intent block, bio, tags and social links. Sits below the avatar+stats
 * top row in `MobileProfileHeader`, split out purely to keep both components
 * under the 200-line component budget — the gating logic mirrors
 * `ProfileHero` in `ProfileSections.tsx` exactly (same data, same rules).
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
      <Eyebrow live className={styles.identityEyebrow}>
        {t(VISIBILITY_LABEL_KEY[profile.visibility])}
      </Eyebrow>
      <div className={styles.identityNameRow}>
        <h1 className={styles.identityName}>
          {profile.first} <em>{profile.last}</em>
        </h1>
        {isSelf && <PublicProfileBadge />}
      </div>
      <div className={styles.identityRole}>
        <span>
          {profile.role}
          {profile.pronouns && (
            <span className={styles.identityPronoun}>
              {" "}
              · {profile.pronouns}
            </span>
          )}
        </span>
        <MemberStaffBadge slug={profile.slug} size="lg" />
      </div>
      <div className={styles.identityWhere}>
        <span className={styles.identityLoc}>
          <span className={styles.identityPin} aria-hidden />
          {t("members:profile.hero.location", { hood: profile.hood })}
        </span>
        {profile.since && (
          <span className={styles.identityMuted}>
            {t("members:profile.hero.memberSince", { since: profile.since })}
          </span>
        )}
      </div>
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
      <SocialLinksRow
        links={profile.socials}
        self={isSelf}
        onEdit={onEditLinks}
      />
    </div>
  );
}
