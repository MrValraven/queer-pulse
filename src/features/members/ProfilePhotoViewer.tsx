import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { ImageSlot } from "../../shared/components/ui";
import type { ImageSlotTint } from "../../shared/components/ui/ImageSlot";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ProfilePhotoViewer.module.css";

export interface ProfilePhotoViewerProps {
  /** High-res source for the enlarged photo (already a real image URL). */
  src: string;
  /** The member's display name — labels the dialog and captions the photo. */
  name: string;
  /** Tint of the framed slot; mirrors the avatar's own tint. */
  tint?: ImageSlotTint;
  onClose: () => void;
}

/**
 * Full-screen viewer for a single profile photo — the enlarged version you get
 * by tapping a member's avatar. Modeled on `StudioLightbox` (portal, scroll-
 * lock, focus-trap, Esc-to-close) but pared down to one image: no arrows, no
 * counter. Backdrop clicks close it; the photo itself and its caption are the
 * only non-closing hit targets. Adds no JS-driven motion — the global
 * `prefers-reduced-motion` block collapses the CSS fade-in.
 */
export function ProfilePhotoViewer({
  src,
  name,
  tint = "plum",
  onClose,
}: ProfilePhotoViewerProps) {
  const { t } = useTranslation();
  useScrollLock();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={name}
    >
      {/* A real backdrop button (rather than an onClick on the dialog) so
          tapping outside the photo closes it while staying keyboard/AT-safe. */}
      <button
        type="button"
        className={styles.backdrop}
        onClick={onClose}
        aria-label={t("shared:modal.close")}
      />
      <button
        ref={closeRef}
        type="button"
        className={styles.close}
        onClick={onClose}
        aria-label={t("shared:modal.close")}
      >
        <FiX aria-hidden />
      </button>
      <figure className={styles.figure}>
        <div className={styles.art}>
          <ImageSlot
            src={src}
            alt={name}
            tint={tint}
            radius={20}
            width="100%"
            height="100%"
            srcSize={900}
            loading="eager"
          />
        </div>
        <figcaption className={styles.caption}>{name}</figcaption>
      </figure>
    </div>,
    document.body,
  );
}
