import type { ReactNode } from "react";
import { FiMusic, FiX } from "react-icons/fi";
import { IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { StudioShareKind } from "./studioLinkTarget";
import type { StudioShareCardSurface } from "./studioShareCard.types";
import styles from "./StudioShareCardFrame.module.css";

const SURFACE_CLASS: Record<StudioShareCardSurface, string | undefined> = {
  chat: styles.chat,
  post: styles.post,
  composer: styles.composer,
};

/** The fixed box every card state and the lazy fallback render inside. A
 *  lyric card is taller, set by its kind, which the link names before any
 *  read: so its box too keeps one height in every state. */
export function StudioShareCardFrame({
  surface,
  kind,
  label,
  onRemove,
  children,
}: {
  surface: StudioShareCardSurface;
  kind?: StudioShareKind;
  /** The group's accessible name, e.g. "Studio track". */
  label?: string;
  onRemove?: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div
      role={label ? "group" : undefined}
      aria-label={label || undefined}
      className={[styles.frame, SURFACE_CLASS[surface]]
        .filter(Boolean)
        .join(" ")}
      data-studio-share-frame={surface}
      data-kind={kind === "lyric" ? "lyric" : undefined}
      data-removable={onRemove ? "" : undefined}
    >
      {children}
      {onRemove && (
        <IconButton
          size="sm"
          className={styles.remove}
          aria-label={t("studio:share.card.removeCta")}
          onClick={onRemove}
        >
          <FiX aria-hidden />
        </IconButton>
      )}
    </div>
  );
}

/** The loading shapes, a cover and two lines where the card's sit. The
 *  loading layer and the lazy fallback both paint this. */
export function StudioShareCardPlaceholder({
  children,
}: {
  /** Extra content, e.g. the loading layer's visually hidden status. */
  children?: ReactNode;
}) {
  return (
    <div
      className={styles.placeholderBody}
      aria-busy={children ? true : undefined}
    >
      <span className={styles.placeholderArt} aria-hidden="true" />
      <span className={styles.placeholderLines} aria-hidden="true">
        <span />
        <span />
      </span>
      {children}
    </div>
  );
}

/** The card's stand-in when its chunk fails to load or it throws while
 *  rendering: the Studio mark and one line from the eager `shared` namespace,
 *  motion-free, so this eager chunk needs nothing from Studio to paint it. */
export function StudioShareCardUnavailable() {
  const { t } = useTranslation();
  return (
    <div className={styles.placeholderBody}>
      <span className={styles.unavailableMark} aria-hidden="true">
        <FiMusic />
      </span>
      <span className={styles.unavailableNotice}>
        {t("shared:studioShare.unavailable")}
      </span>
    </div>
  );
}
