import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfile } from "../../app/providers/useProfile";
import { InlineText, PronounPicker, VisibilityPicker } from "./profileEditControls";
import { ProfileShortBioField } from "./ProfileShortBioField";
import styles from "./ProfileEdit.module.css";

/**
 * The identity half of the profile editor — visibility, name, staff badge,
 * short bio, pronouns and neighbourhood — shared by the desktop and mobile
 * editors. `centered` applies the mobile centering treatment (centered labels,
 * name and chips); desktop passes it falsy for the left-aligned column.
 */
export function ProfileEditIdentityFields({
  centered = false,
}: {
  centered?: boolean;
}) {
  const { t } = useTranslation();
  const { profile, draft, updateDraft } = useProfile();
  return (
    <div className={centered ? styles.identityCentered : undefined}>
      <div className={styles.field}>
        <label className={styles.fieldLabel}>
          {t("members:profileEdit.field.statusVisibility")}
        </label>
        <VisibilityPicker
          value={draft.visibility}
          onChange={(visibility) => updateDraft({ visibility })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>
          {t("members:profileEdit.field.name")}
        </label>
        <div className={styles.nameEdit}>
          <InlineText
            value={draft.first}
            ariaLabel={t("members:profileEdit.field.firstNameLabel")}
            placeholder={t("members:profileEdit.field.firstPlaceholder")}
            className={styles.nameInput}
            onChange={(value) => updateDraft({ first: value })}
          />
          <InlineText
            value={draft.last}
            ariaLabel={t("members:profileEdit.field.lastNameLabel")}
            placeholder={t("members:profileEdit.field.lastPlaceholder")}
            className={`${styles.nameInput} ${styles.lastInput}`}
            onChange={(value) => updateDraft({ last: value })}
          />
        </div>
      </div>

      <div className={styles.badgeRow}>
        <MemberStaffBadge slug={profile.slug} size="lg" />
      </div>

      <ProfileShortBioField />

      <div className={styles.field}>
        <label className={styles.fieldLabel}>
          {t("members:profileEdit.field.pronouns")}
        </label>
        <PronounPicker
          value={draft.pronouns}
          onChange={(pronouns) => updateDraft({ pronouns })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>
          {t("members:profileEdit.field.neighbourhood")}
        </label>
        <InlineText
          value={draft.hood}
          ariaLabel={t("members:profileEdit.field.neighbourhood")}
          placeholder={t("members:profileEdit.field.neighbourhoodPlaceholder")}
          className={styles.hoodInput}
          onChange={(value) => updateDraft({ hood: value })}
        />
      </div>
    </div>
  );
}
