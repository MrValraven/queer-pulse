import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfile } from "../../app/providers/useProfile";
import { directoryBlurb, isBlurbBorrowedFromBio } from "./directoryBlurb";
import { MemberCardBody } from "./MemberCardBody";
import card from "./MemberDirectoryFilterPage.module.css";
import styles from "./ProfileEdit.module.css";

/**
 * The member's own directory card, rendered live from the unsaved draft — so the
 * two-line clamp, the tag overflow and the borrowed-bio fallback are all visible
 * while they type, instead of being discovered later by strangers.
 *
 * It renders the real `MemberCardBody` on purpose. If this ever becomes a
 * lookalike, it stops being a preview.
 */
export function DirectoryCardPreview() {
  const { t } = useTranslation();
  const { profile, draft } = useProfile();

  const name = `${draft.first} ${draft.last}`.trim();
  const initials =
    ((draft.first[0] ?? "") + (draft.last[0] ?? "")).toUpperCase() ||
    profile.initials;
  const blurb = directoryBlurb(draft.role, draft.bio);
  const borrowedFromBio = isBlurbBorrowedFromBio(draft.role, draft.bio);

  return (
    <div className={styles.previewWrap}>
      <span className={styles.previewCaption}>
        {t("members:directory.preview.caption")}
      </span>
      <div className={`${card.mCard} ${card.mCardMe} ${card.mCardStatic}`}>
        <MemberCardBody
          name={name}
          slug={profile.slug}
          initials={initials}
          tint={profile.tint}
          photo={draft.photo}
          meta={draft.pronouns}
          blurb={blurb}
          tags={draft.tags.map((label) => ({ label }))}
          isMe
        />
      </div>
      {borrowedFromBio && (
        <p className={styles.previewNote}>
          {t("members:directory.preview.borrowedNote")}
        </p>
      )}
    </div>
  );
}
