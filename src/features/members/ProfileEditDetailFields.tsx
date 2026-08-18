import { type RefObject } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfile } from "../../app/providers/useProfile";
import { InlineText, InlineTextarea, TagEditor } from "./profileEditControls";
import { ProfileNowField } from "./ProfileNowField";
import { SocialLinksEditor } from "./SocialLinksEditor";
import styles from "./ProfileEdit.module.css";

/**
 * The lower half of the profile editor — bio, "now"/here-for, tags and links —
 * shared verbatim by the desktop (`EditableProfileHero`) and mobile
 * (`MobileEditableProfileHero`) editors so the field wiring lives in one place.
 * `linksRef` lets the parent's enter-edit focus jump to the Links field.
 */
export function ProfileEditDetailFields({
  linksRef,
}: {
  linksRef: RefObject<HTMLDivElement | null>;
}) {
  const { t } = useTranslation();
  const { draft, updateDraft } = useProfile();
  return (
    <>
      <div className={styles.field}>
        <label className={styles.fieldLabel}>
          {t("members:profileEdit.pronunciation.label")}
        </label>
        <p className={styles.fieldHelp}>
          {t("members:profileEdit.pronunciation.help")}
        </p>
        <InlineText
          value={draft.pronunciation ?? ""}
          ariaLabel={t("members:profileEdit.pronunciation.label")}
          placeholder={t("members:profileEdit.pronunciation.placeholder")}
          className={styles.hoodInput}
          onChange={(value) => updateDraft({ pronunciation: value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>
          {t("members:profileEdit.field.bio")}
        </label>
        <p className={styles.fieldHelp}>{t("members:profileEdit.field.bioHelp")}</p>
        <InlineTextarea
          value={draft.bio}
          ariaLabel={t("members:profileEdit.field.bio")}
          className={styles.bioInput}
          onChange={(value) => updateDraft({ bio: value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>
          {t("members:profileEdit.bioPt.label")}
        </label>
        <p className={styles.fieldHelp}>{t("members:profileEdit.bioPt.help")}</p>
        <InlineTextarea
          value={draft.bioPt ?? ""}
          ariaLabel={t("members:profileEdit.bioPt.label")}
          placeholder={t("members:profileEdit.bioPt.placeholder")}
          className={styles.bioInput}
          onChange={(value) => updateDraft({ bioPt: value })}
        />
      </div>

      <ProfileNowField />

      <div className={styles.field}>
        <label className={styles.fieldLabel}>
          {t("members:profileEdit.notHereFor.label")}
        </label>
        <p className={styles.fieldHelp}>
          {t("members:profileEdit.notHereFor.help")}
        </p>
        <InlineTextarea
          value={draft.notHereFor ?? ""}
          ariaLabel={t("members:profileEdit.notHereFor.label")}
          placeholder={t("members:profileEdit.notHereFor.placeholder")}
          rows={2}
          className={styles.nowInput}
          onChange={(value) => updateDraft({ notHereFor: value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>
          {t("members:profileEdit.field.tags")}
        </label>
        <TagEditor
          tags={draft.tags}
          placeholder={t("members:profileEdit.field.addSkillPlaceholder")}
          onChange={(tags) => updateDraft({ tags })}
        />
      </div>

      <div className={styles.field} ref={linksRef}>
        <label className={styles.fieldLabel}>
          {t("members:profileEdit.field.links")}
        </label>
        <SocialLinksEditor
          links={draft.socials}
          onChange={(socials) => updateDraft({ socials })}
        />
      </div>
    </>
  );
}
