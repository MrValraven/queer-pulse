import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  FORUM_DRAFT_STATUS_LABEL_KEY,
  type ForumDraftStatus,
} from "../useForumComposerDraft";
import styles from "./ComposeFooter.module.css";

/** The dot's colour per reading: coral while a save is in flight, danger red
 *  while the text is not yet stored, jade otherwise. */
const DOT_STATE_BY_STATUS: Record<
  ForumDraftStatus,
  "pending" | "failed" | "settled"
> = {
  idle: "settled",
  saving: "pending",
  saved: "settled",
  restored: "settled",
  unsaved: "failed",
};

/**
 * "Draft saved", with a dot that is jade once the text is safe on the server,
 * coral while a save is still in flight, and red while a failed save waits for
 * its retry. On a failed save the words turn red too, because it is the one
 * reading the member must notice. Silent while there is nothing true to say,
 * which is what `idle` means.
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
  const dotState = DOT_STATE_BY_STATUS[status];
  return (
    <span
      className={styles.saved}
      data-idle={isIdle}
      data-state={dotState}
      role="status"
      aria-label={t("forum:composePage.foot.statusLabel")}
    >
      <span className={styles.savedDot} data-state={dotState} aria-hidden />
      <span className={styles.savedSlot}>
        {/* Every reading is laid out at once, one on top of the other, so
            the slot is always as wide as the longest and the footer never
            moves when the first save lands. */}
        {Object.entries(FORUM_DRAFT_STATUS_LABEL_KEY).map(
          ([labelStatus, labelKey]) => {
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
          },
        )}
      </span>
    </span>
  );
}
