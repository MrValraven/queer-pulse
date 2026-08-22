import {
  Avatar,
  Button,
  FadeIn,
  FeatureHelp,
} from "../../shared/components/ui";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { leadingInitials } from "../../shared/lib/initials";
import { requestInvitePath } from "../auth/api/joinRequestSource";
import type { PublicProfileDTO } from "./api/publicProfile.api";
import {
  PublicProfileActivity,
  PublicProfileLinks,
  PublicProfileWork,
} from "./PublicProfileParts";
import styles from "./PublicProfilePage.module.css";

/**
 * Everything `GET /public/profiles/:slug` actually serves, rendered exactly
 * once for both places it belongs: the addressable public page a stranger
 * lands on (`PublicProfileBySlug`) and the owner's own preview of it
 * (`PublicProfileOwnPreview`).
 *
 * It takes a `PublicProfileDTO` and nothing else, on purpose. The preview used
 * to be built from the full in-app `Member` and so promised visitors things the
 * public endpoint never sends — neighbourhood, tenure, vouch count, socials —
 * which meant a member decided whether to publish on the strength of a page
 * that does not exist. Sharing this one component makes that class of drift
 * impossible: if a field isn't on the DTO, neither surface can show it.
 *
 * Callers own the page frame (`PageShell`, `PageMeta`, any preview banner).
 */
export function PublicProfilePublicView({
  profile,
}: {
  profile: PublicProfileDTO;
}) {
  const { t } = useTranslation();

  return (
    <>
      <header className={styles.publicHead}>
        <Avatar
          initials={leadingInitials(profile.displayName)}
          src={profile.avatarUrl ?? undefined}
          alt=""
          size={92}
        />
        <div>
          <div className={styles.eyebrow}>
            {t("members:publicProfile.head.eyebrow", { slug: profile.slug })}
          </div>
          <h1 className={styles.name}>
            {profile.displayName} <FeatureHelp id="members.profile" />
          </h1>
          {profile.pronouns && (
            <div className={styles.pronouns}>
              <span className={styles.pron}>{profile.pronouns}</span>
            </div>
          )}
          <div className={styles.badgeRow}>
            <MemberStaffBadge slug={profile.slug} size="lg" />
          </div>
          {profile.tagline && (
            <p className={styles.publicTagline}>{profile.tagline}</p>
          )}
        </div>
      </header>

      {profile.bio && (
        <FadeIn as="section" className={styles.sec} delay={80}>
          <div className={styles.secH}>
            <h2>{t("members:publicBySlug.aboutHeading")}</h2>
          </div>
          <p className={styles.bio}>{profile.bio}</p>
        </FadeIn>
      )}

      <PublicProfileLinks links={profile.links} />
      <PublicProfileWork work={profile.work} />
      <PublicProfileActivity activity={profile.activity} />

      <div className={styles.bottomCta}>
        <div>
          <h3>{t("members:publicBySlug.joinTitle")}</h3>
          <p>{t("members:publicBySlug.joinBody")}</p>
        </div>
        <div className={styles.bottomCtaActions}>
          <Button variant="primary" to={requestInvitePath("public_profile")}>
            {t("common:cta.requestInvite")}
          </Button>
        </div>
      </div>
    </>
  );
}
