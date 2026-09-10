import { useTranslation } from "../../shared/i18n/useTranslation";
import type { WallpaperChoice } from "./wallpaper";
import styles from "./WallpaperModal.module.css";

/**
 * The live preview inside `WallpaperModal` — a received and a sent bubble on
 * the wallpaper currently being considered, so the choice is judged against
 * real bubble surfaces rather than against a bare swatch.
 *
 * It carries the same `data-wallpaper-*` attributes the conversation panel
 * does and reuses the same tokens from chat-wallpaper.css, so what shows here
 * is what the log will look like. The bubble styling is deliberately local
 * rather than imported from MessagesPage.module.css: this is a miniature (the
 * real bubbles carry avatars, timestamps, receipts and reaction slots), and
 * pulling in the real classes would drag all of that with it.
 */
export function WallpaperPreview({ choice }: { choice: WallpaperChoice }) {
  const { t } = useTranslation();
  return (
    <div
      className={styles.preview}
      data-wallpaper-ground={choice.ground}
      data-wallpaper-doodles={choice.hasDoodles ? "on" : "off"}
      // The sample lines are decorative filler, not content anyone needs read
      // aloud; the swatch buttons carry the accessible names for this control.
      aria-hidden
    >
      <span className={styles.previewBubbleReceived}>
        {t("messages:wallpaper.previewReceived")}
      </span>
      <span className={styles.previewBubbleSent}>
        {t("messages:wallpaper.previewSent")}
      </span>
    </div>
  );
}
