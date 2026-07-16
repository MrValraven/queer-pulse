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
  const { draft, updateDraft } = useProfile();

  const length = draft.role.trim().length;
  const showCounter = length >= COUNTER_VISIBLE_FROM;
  const isOverLimit = length > DIRECTORY_BLURB_MAX_CHARS;

  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>Short bio</label>
      <p className={styles.fieldHelp}>
        The line people read in the members directory, before they open your
        profile.
      </p>
      <InlineTextarea
        value={draft.role}
        ariaLabel="Short bio"
        placeholder="A line or two on who you are and what you're around for."
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
          {length} / {DIRECTORY_BLURB_MAX_CHARS}
          {isOverLimit && " — your card shows the first two lines"}
        </p>
      )}
      <DirectoryCardPreview />
    </div>
  );
}
