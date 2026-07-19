import { Avatar, Button, VisibilityBadge } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useProfile } from "../../app/providers/ProfileProvider";
import { fullName, type Member } from "../members/data/members";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import styles from "./WorkHubPage.module.css";

/** Share of the employer-facing profile fields the member has actually filled. */
function completenessOf(member: Member): number {
  const checks = [
    Boolean(member.photo),
    Boolean(member.role?.trim()),
    Boolean(member.pronouns?.trim()),
    Boolean(member.hood?.trim()),
    Boolean(member.bio?.trim()),
    member.tags.length > 0,
    member.work.length > 0,
    member.skills.length > 0,
    (member.socials?.length ?? 0) > 0,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

/** The Work Profile summary module — identity at the centre of the workspace. */
export function WorkProfileCard() {
  const { t } = useTranslation();
  // The signed-in member (real profile live, mock currentUser in demo mode).
  const { profile } = useProfile();
  const completeness = completenessOf(profile);
  return (
    <div className={styles.pCard}>
      <div className={styles.pHead}>
        <Avatar
          initials={profile.initials}
          src={profile.photo}
          alt={fullName(profile)}
          tint={profile.tint}
          size={52}
        />
        <div className={styles.pId}>
          <div className={styles.pName}>
            {fullName(profile)}
            {profile.pronouns && (
              <span className={styles.pPronouns}>{profile.pronouns}</span>
            )}
            <MemberStaffBadge slug={profile.slug} />
          </div>
          <div className={styles.pHeadline}>{profile.role}</div>
          <div className={styles.pLocation}>{profile.hood}</div>
        </div>
        <VisibilityBadge mode={profile.visibility} className={styles.pBadge} />
      </div>

      <div className={styles.pMeterRow}>
        <span className={styles.pMeterLabel}>
          {t("economy:workProfile.card.meterLabel", { percent: completeness })}
        </span>
        <div className={styles.meter}>
          <div
            className={styles.meterFill}
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      <div className={styles.pFoot}>
        <p className={styles.pNote}>{t("economy:workProfile.card.note")}</p>
        <Button variant="primary" to={routes.workProfile}>
          {t("economy:workProfile.card.editCta")}
        </Button>
      </div>
    </div>
  );
}
