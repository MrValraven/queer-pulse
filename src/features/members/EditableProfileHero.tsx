import { useEffect, useRef } from "react";
import { Reveal } from "../../shared/components/ui";
import type { ImageSlotTint } from "../../shared/components/ui";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfile } from "../../app/providers/ProfileProvider";
import { AvatarEditor } from "./AvatarEditor";
import {
  InlineText,
  InlineTextarea,
  PronounPicker,
  TagEditor,
  VisibilityPicker,
} from "./profileEditControls";
import { ProfileNowField } from "./ProfileNowField";
import { ProfileShortBioField } from "./ProfileShortBioField";
import { SocialLinksEditor } from "./SocialLinksEditor";
import base from "./ProfilePage.module.css";
import styles from "./ProfileEdit.module.css";

function resolveTint(tint: string): ImageSlotTint {
  return tint === "coral" || tint === "jade" || tint === "plum" ? tint : "plum";
}

/**
 * Edit-mode twin of `ProfileHero`: the same hero layout, but every field the user
 * can change is an inline control bound to the draft in `ProfileProvider`. Saving
 * and discarding live in the sticky `ProfileEditBar` rendered by the page.
 */
export function EditableProfileHero({
  focusLinks = false,
}: {
  /** When entered via the "Add/Edit links" affordance, scroll + focus the Links field. */
  focusLinks?: boolean;
}) {
  const { t } = useTranslation();
  const { profile, draft, updateDraft } = useProfile();
  const linksRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!focusLinks) return;
    const raf = requestAnimationFrame(() => {
      const el = linksRef.current;
      if (!el) return;
      el.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
        block: "center",
      });
      el.querySelector<HTMLElement>("select, input, button")?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [focusLinks, reduced]);

  return (
    <header className={base.phero}>
      <div className="wrap">
        <div className={base.pheroGrid}>
          <Reveal className={base.portraitWrap}>
            <AvatarEditor
              photo={draft.photo}
              initials={profile.initials}
              tint={resolveTint(profile.tint)}
              name={`${draft.first} ${draft.last}`}
              onChange={(url) => updateDraft({ photo: url })}
              onRemove={() => updateDraft({ photo: undefined })}
            />
          </Reveal>

          <Reveal delay={80}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                {t("members:profileEdit.field.statusVisibility")}
              </label>
              <VisibilityPicker
                value={draft.visibility}
                onChange={(v) => updateDraft({ visibility: v })}
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
                  onChange={(v) => updateDraft({ first: v })}
                />
                <InlineText
                  value={draft.last}
                  ariaLabel={t("members:profileEdit.field.lastNameLabel")}
                  placeholder={t("members:profileEdit.field.lastPlaceholder")}
                  className={`${styles.nameInput} ${styles.lastInput}`}
                  onChange={(v) => updateDraft({ last: v })}
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
                onChange={(v) => updateDraft({ pronouns: v })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                {t("members:profileEdit.field.neighbourhood")}
              </label>
              <InlineText
                value={draft.hood}
                ariaLabel={t("members:profileEdit.field.neighbourhood")}
                placeholder={t(
                  "members:profileEdit.field.neighbourhoodPlaceholder",
                )}
                className={styles.hoodInput}
                onChange={(v) => updateDraft({ hood: v })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                {t("members:profileEdit.field.bio")}
              </label>
              <p className={styles.fieldHelp}>
                {t("members:profileEdit.field.bioHelp")}
              </p>
              <InlineTextarea
                value={draft.bio}
                ariaLabel={t("members:profileEdit.field.bio")}
                className={styles.bioInput}
                onChange={(v) => updateDraft({ bio: v })}
              />
            </div>

            <ProfileNowField />

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
          </Reveal>
        </div>
      </div>
    </header>
  );
}
