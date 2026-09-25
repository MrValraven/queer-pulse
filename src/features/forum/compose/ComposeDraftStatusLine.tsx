import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ForumDraftStatus } from "../useForumComposerDraft";
import styles from "./ComposeFooter.module.css";

/** Every reading the line can show. All of them are laid out at once, one on
 *  top of the other, so the slot is always as wide as the longest and the
 *  footer never moves when the first save lands. */
const LABEL_KEY_BY_STATUS: Record<Exclude<ForumDraftStatus, "idle">, string> = {
  saving: "forum:draft.saving",
  saved: "forum:draft.saved",
  restored: "forum:draft.restored",
};

/**
 * "Draft saved", with a dot that is jade once the text is safe on the server
 * and coral while a save is still in flight. Silent while there is nothing
 * true to say, which is what `idle` means.
 *
 * The line fades in once, on its first reading. After that "Saving" and
 * "Draft saved" swap in place: they flip on every autosave, and a fade each
 * time would flicker under a member who is still typing. The dot's colour
 * carries the change.
 */
export function ComposeDraftStatusLine({
  status,
}: {
  status: ForumDraftStatus;
}) {
  const { t } = useTranslation();
  const isIdle = status === "idle";
  return (
    <span
      className={styles.saved}
      data-idle={isIdle}
      role="status"
      aria-label={t("forum:composePage.foot.statusLabel")}
    >
      <span
        className={styles.savedDot}
        data-state={status === "saving" ? "pending" : "settled"}
        aria-hidden
      />
      <span className={styles.savedSlot}>
        {Object.entries(LABEL_KEY_BY_STATUS).map(([labelStatus, labelKey]) => {
          const isShown = labelStatus === status;
          return (
            <span
              key={labelKey}
              className={styles.savedText}
              data-shown={isShown}
              aria-hidden={!isShown}
            >
              {t(labelKey)}
            </span>
          );
        })}
      </span>
    </span>
  );
}
