import { useRef, useState, type KeyboardEvent } from "react";
import { Button, CheckLine, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { WallpaperPreview } from "./WallpaperPreview";
import {
  WALLPAPER_PATTERNS,
  clearConversationWallpaper,
  resolveWallpaper,
  setBaseWallpaper,
  setConversationWallpaper,
  useWallpaperStore,
  type WallpaperPattern,
} from "./wallpaper";
import styles from "./WallpaperModal.module.css";

/**
 * The chat-wallpaper picker, opened from the conversation menu.
 *
 * One axis rather than two: a pattern. Colour grounds are retired because
 * they competed with the pattern for attention, and the swatches at 44px
 * could not show a colour honestly anyway. Seven patterns give seven looks
 * out of one list, and adding one later is one entry in `WALLPAPER_PATTERNS`
 * plus one rule in chat-wallpaper.css.
 *
 * The pick is held locally until Save so the preview can be scrubbed without
 * repainting the chat underneath on every tap. "Every chat" writes the base
 * instead of this conversation's own entry, see `setBaseWallpaper`, which also
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

  const [pattern, setPattern] = useState<WallpaperPattern>(applied.pattern);
  const [isForEveryChat, setIsForEveryChat] = useState(false);
  // Roving tabindex (WAI-ARIA APG radio group, DES-222): the DOM refs the
  // arrow/Home/End handlers below move focus onto, since `tabIndex` alone
  // moves the tab stop but not the browser's actual focus.
  const swatchRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = WALLPAPER_PATTERNS.indexOf(pattern);

  const save = () => {
    const choice = { pattern };
    if (isForEveryChat) setBaseWallpaper(choice);
    else setConversationWallpaper(conversationId, choice);
    onClose();
  };

  const reset = () => {
    clearConversationWallpaper(conversationId);
    setPattern(store.base.pattern);
  };

  /** Moves focus to (and selects) the swatch at `nextIndex`: radios select
   *  on arrow movement rather than needing a separate Space press. */
  const focusAndSelectSwatch = (nextIndex: number) => {
    const option = WALLPAPER_PATTERNS[nextIndex];
    if (!option) return;
    setPattern(option);
    swatchRefs.current[nextIndex]?.focus();
  };

  const onSwatchKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const count = WALLPAPER_PATTERNS.length;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusAndSelectSwatch((index + 1) % count);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusAndSelectSwatch((index - 1 + count) % count);
        break;
      case "Home":
        event.preventDefault();
        focusAndSelectSwatch(0);
        break;
      case "End":
        event.preventDefault();
        focusAndSelectSwatch(count - 1);
        break;
      case " ": {
        const option = WALLPAPER_PATTERNS[index];
        if (option) {
          event.preventDefault();
          setPattern(option);
        }
        break;
      }
      default:
        break;
    }
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
      <WallpaperPreview choice={{ pattern }} />

      <div
        className={styles.swatches}
        role="radiogroup"
        aria-label={t("messages:wallpaper.patternLegend")}
      >
        {WALLPAPER_PATTERNS.map((option, index) => {
          const isSelected = pattern === option;
          // One tab stop for the whole group: the checked swatch is it, or
          // the first swatch if somehow none is checked yet.
          const isTabStop = selectedIndex === -1 ? index === 0 : isSelected;
          return (
            <button
              key={option}
              ref={(node) => {
                swatchRefs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isTabStop ? 0 : -1}
              className={styles.swatchButton}
              onClick={() => setPattern(option)}
              onKeyDown={(event) => onSwatchKeyDown(event, index)}
            >
              <span
                className={isSelected ? styles.swatchSelected : styles.swatch}
                data-wallpaper-pattern={option}
              />
              {/* The caption is the accessible name for the radio button above
                  it, so a screen reader announces the pattern rather than
                  nothing at all. */}
              <span
                className={isSelected ? styles.captionSelected : styles.caption}
              >
                {t(`messages:wallpaper.pattern.${option}`)}
              </span>
            </button>
          );
        })}
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
