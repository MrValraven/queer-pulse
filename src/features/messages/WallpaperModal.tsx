import { useState } from "react";
import { Button, CheckLine, Modal, Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { WallpaperPreview } from "./WallpaperPreview";
import {
  WALLPAPER_GROUNDS,
  clearConversationWallpaper,
  resolveWallpaper,
  setBaseWallpaper,
  setConversationWallpaper,
  useWallpaperStore,
  type WallpaperGround,
} from "./wallpaper";
import styles from "./WallpaperModal.module.css";

/**
 * The chat-wallpaper picker, opened from the conversation menu.
 *
 * Two axes rather than a list of finished presets: a ground swatch and a
 * doodles switch. Six grounds and one switch give twelve looks out of far less
 * markup than twelve preset tiles would need, and adding a hue later is one
 * line in chat-wallpaper.css plus one entry in `WALLPAPER_GROUNDS`.
 *
 * The pick is held locally until Save so the preview can be scrubbed without
 * repainting the chat underneath on every tap. "Every chat" writes the base
 * instead of this conversation's own entry — see `setBaseWallpaper`, which also
 * clears the per-chat entries that only duplicated it.
 */
export function WallpaperModal({
  conversationId,
  chatName,
  onClose,
}: {
  conversationId: string;
  /** Shown in the modal subtitle so it is obvious which chat is being changed. */
  chatName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const store = useWallpaperStore();
  const applied = resolveWallpaper(store, conversationId);
  const hasOwnChoice = !!store.byConversation[conversationId];

  const [ground, setGround] = useState<WallpaperGround>(applied.ground);
  const [hasDoodles, setHasDoodles] = useState(applied.hasDoodles);
  const [isForEveryChat, setIsForEveryChat] = useState(false);

  const save = () => {
    const choice = { ground, hasDoodles };
    if (isForEveryChat) setBaseWallpaper(choice);
    else setConversationWallpaper(conversationId, choice);
    onClose();
  };

  const reset = () => {
    clearConversationWallpaper(conversationId);
    setGround(store.base.ground);
    setHasDoodles(store.base.hasDoodles);
  };

  return (
    <Modal
      title={t("messages:wallpaper.title")}
      sub={t("messages:wallpaper.sub", { name: chatName })}
      onClose={onClose}
      footer={
        <div className={styles.footer}>
          {hasOwnChoice && (
            <Button variant="ghost" onClick={reset}>
              {t("messages:wallpaper.reset")}
            </Button>
          )}
          <div className={styles.footerEnd}>
            <Button variant="ghost" onClick={onClose}>
              {t("messages:wallpaper.cancel")}
            </Button>
            <Button variant="primary" onClick={save}>
              {t("messages:wallpaper.save")}
            </Button>
          </div>
        </div>
      }
    >
      <WallpaperPreview choice={{ ground, hasDoodles }} />

      <div
        className={styles.swatches}
        role="radiogroup"
        aria-label={t("messages:wallpaper.groundLegend")}
      >
        {WALLPAPER_GROUNDS.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={ground === option}
            // Each swatch is a colour with no text, so the name has to come
            // from here or the a11y gate fails the control outright.
            aria-label={t(`messages:wallpaper.ground.${option}`)}
            title={t(`messages:wallpaper.ground.${option}`)}
            className={
              ground === option ? styles.swatchSelected : styles.swatch
            }
            data-wallpaper-ground={option}
            data-wallpaper-doodles={hasDoodles ? "on" : "off"}
            onClick={() => setGround(option)}
          />
        ))}
      </div>

      <div className={styles.doodleRow}>
        <span className={styles.doodleText}>
          <span className={styles.doodleTitle}>
            {t("messages:wallpaper.doodlesTitle")}
          </span>
          <span className={styles.doodleSub}>
            {t("messages:wallpaper.doodlesSub")}
          </span>
        </span>
        <Toggle
          checked={hasDoodles}
          onChange={setHasDoodles}
          label={t("messages:wallpaper.doodlesTitle")}
        />
      </div>

      <CheckLine
        checked={isForEveryChat}
        onChange={setIsForEveryChat}
        title={t("messages:wallpaper.everyChatTitle")}
        sub={t("messages:wallpaper.everyChatSub")}
      />
    </Modal>
  );
}
