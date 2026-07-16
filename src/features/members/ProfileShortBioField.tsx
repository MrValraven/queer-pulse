import { useTranslation } from "../../shared/i18n/useTranslation";
import { useProfile } from "../../app/providers/ProfileProvider";
import { DIRECTORY_BLURB_MAX_CHARS } from "./directoryBlurb";
import { DirectoryCardPreview } from "./DirectoryCardPreview";
import { InlineTextarea } from "./profileEditControls";
import styles from "./ProfileEdit.module.css";

/** Keep the counter out of the way until the member is near the two-line limit —
 *  it's a warning, not a scoreboard. */
const COUNTER_VISIBLE_FROM = DIRECTORY_BLURB_MAX_CHARS - 30;

/**
 * The short bio: one or two lines that become the member's directory card blurb.
 * Stored as `draft.role` and sent to the backend as `tagline` — the field the
 * card DTO already carries.
 *
 * The limit is deliberately soft. The card clamps to two lines whatever happens,
 * the preview shows that clamp as it lands, and blocking someone mid-sentence to
 * enforce a number the design already enforces visually would just be rude.
 */
export function ProfileShortBioField() {
  const { t } = useTranslation();
  const { draft, updateDraft } = useProfile();

  const length = draft.role.trim().length;
  const showCounter = length >= COUNTER_VISIBLE_FROM;
  const isOverLimit = length > DIRECTORY_BLURB_MAX_CHARS;

  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>
        {t("members:profileEdit.shortBio.label")}
      </label>
      <p className={styles.fieldHelp}>
        {t("members:profileEdit.shortBio.help")}
      </p>
      <InlineTextarea
        value={draft.role}
        ariaLabel={t("members:profileEdit.shortBio.label")}
        placeholder={t("members:profileEdit.shortBio.placeholder")}
        rows={2}
        className={styles.shortBioInput}
        onChange={(value) => updateDraft({ role: value })}
      />
      {showCounter && (
        <p
          className={[styles.counter, isOverLimit && styles.counterOver]
            .filter(Boolean)
            .join(" ")}
        >
          {t("members:profileEdit.shortBio.counter", {
            length,
            max: DIRECTORY_BLURB_MAX_CHARS,
          })}
          {isOverLimit && ` ${t("members:profileEdit.shortBio.overLimit")}`}
        </p>
      )}
      <DirectoryCardPreview />
    </div>
  );
}
