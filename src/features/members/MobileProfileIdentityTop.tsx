import { Eyebrow } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { PublicProfileBadge } from "./PublicProfileBadge";
import { VISIBILITY_LABEL_KEY } from "./profileSections.data";
import type { MemberProfile } from "./data/memberProfiles";
import styles from "./MobileProfile.module.css";

/**
 * The centered identity cap of the mobile member profile: the visibility
 * status chip, the name, role/pronouns and location — all centered directly
 * beneath the pride-ring avatar. Split out of `MobileProfileIdentity` (which
 * now holds only the left-aligned details block) so the header can place the
 * name next to the avatar while the bio and tags sit below the stats row.
 */
export function MobileProfileIdentityTop({
  profile,
  isSelf,
}: {
  profile: MemberProfile;
  isSelf: boolean;
}) {
  const { t } = useTranslation();
  // The catalog string is "{hood}, Lisbon", so an empty `hood` used to render a
  // pin followed by a bare ", Lisbon" — which is exactly what a member sees
  // after turning their neighbourhood off, and what every visitor sees on a
  // hidden-hood profile (the backend nulls `location`, the adapter maps it to
  // ""). Show the row only when there is a neighbourhood to show, and honour
  // the owner's own toggle on any non-self view (including their preview).
  const isLocationShown =
    profile.hood.trim().length > 0 && (isSelf || profile.hoodVisible !== false);
  return (
    <div className={styles.identityTop}>
      <Eyebrow live className={styles.identityTopEyebrow}>
        {t(VISIBILITY_LABEL_KEY[profile.visibility])}
      </Eyebrow>
      <div className={styles.identityTopNameRow}>
        <h1 className={styles.identityName}>
          {profile.first} <em>{profile.last}</em>
        </h1>
        {isSelf && <PublicProfileBadge />}
      </div>
      <div className={styles.identityTopRole}>
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
      {isLocationShown && (
        <div className={styles.identityTopLoc}>
          <span className={styles.identityPin} aria-hidden />
          {t("members:profile.hero.location", { hood: profile.hood })}
        </div>
      )}
    </div>
  );
}
