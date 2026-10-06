import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfile } from "../../app/providers/useProfile";
import { directoryBlurb, isBlurbBorrowedFromBio } from "./directoryBlurb";
import { MemberCardBody } from "./MemberCardBody";
import { useIsMemberCardSplit } from "./memberCardLayout";
import card from "./MemberDirectoryFilterPage.module.css";
import styles from "./ProfileEdit.module.css";

/**
 * The member's own directory card, rendered live from the unsaved draft — so the
 * two-line clamp, the tag overflow and the borrowed-bio fallback are all visible
 * while they type, instead of being discovered later by strangers.
 *
 * It renders the real `MemberCardBody` on purpose. If this ever becomes a
 * lookalike, it stops being a preview. For the same reason it follows the
 * directory's viewport rule: the split card on desktop, at the directory's
 * minimum split card width, and the compact card on phones.
 */
export function DirectoryCardPreview() {
  const { t } = useTranslation();
  const { profile, draft } = useProfile();
  const isSplit = useIsMemberCardSplit();

  const name = `${draft.first} ${draft.last}`.trim();
  const initials =
    ((draft.first[0] ?? "") + (draft.last[0] ?? "")).toUpperCase() ||
    profile.initials;
  // The directory borrows a bio only from an `open` profile (backend
  // `toMemberCard`, ENG-438): a network or private bio sits behind the limited
  // card. Same rule here, so the preview keeps matching what strangers see.
  const borrowableBio = draft.visibility === "open" ? draft.bio : "";
  const blurb = directoryBlurb(draft.role, borrowableBio);
  const borrowedFromBio = isBlurbBorrowedFromBio(draft.role, borrowableBio);

  return (
    <div
      className={[styles.previewWrap, isSplit && styles.previewWrapSplit]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={styles.previewCaption}>
        {t("members:directory.preview.caption")}
      </span>
      <div
        className={[
          card.mCard,
          isSplit && card.mCardSplit,
          card.mCardMe,
          card.mCardStatic,
        ]
          .filter(Boolean)
          .join(" ")}
      >
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
          isSplit={isSplit}
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
