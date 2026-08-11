import { useRef } from "react";
import { createPortal } from "react-dom";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { useScrollLock } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { resolveAvatarSrc } from "../../../shared/lib/avatarUrl";
import { useLightboxDialog } from "../useLightboxDialog";
import type { SubprofileItemView } from "../api/subprofiles.adapters";
import styles from "./GalleryLightbox.module.css";

export interface GalleryLightboxProps {
  /** The persona's gallery photos — the same flat array `getGalleryWorks`
   *  builds and `useImageLightbox` indexes into. */
  items: SubprofileItemView[];
  index: number;
  /** The persona's display name — used to caption each photo's alt text. */
  name: string;
  onClose: () => void;
  /** `-1` for previous, `1` for next — the caller owns/wraps the index. */
  onMove: (delta: number) => void;
}

/**
 * Full-screen viewer for the universal `gallery` section's photos. Reuses the
 * same interaction scaffold as `StudioLightbox` (fixed portal overlay,
 * `role="dialog"` + focus-trap, Esc to close, ←/→ to move, `useScrollLock`)
 * and `ProfilePhotoViewer`'s backdrop-to-close, but shows the WHOLE photo
 * (`object-fit: contain`, natural aspect) rather than a cropped fixed-ratio
 * frame — gallery photos are arbitrary shapes, so cropping them defeats the
 * "see it bigger" intent. No JS-driven motion; the global
 * `prefers-reduced-motion` block collapses the CSS fade-in.
 */
export function GalleryLightbox({
  items,
  index,
  name,
  onClose,
  onMove,
}: GalleryLightboxProps) {
  const { t } = useTranslation();
  useScrollLock();
  const dialogRef = useRef<HTMLDivElement>(null);
  const item = items[index];

  useLightboxDialog(dialogRef, { onClose, onMove });

  if (!item || !item.imageUrl) return null;

  const alt = t("subprofiles:galleryPhotoAlt", {
    name,
    number: String(index + 1),
  });

  return createPortal(
    <div
      ref={dialogRef}
      tabIndex={-1}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={t("subprofiles:galleryLightboxLabel", { name })}
    >
      {/* A real backdrop button (not an onClick on the dialog) so tapping
          outside the photo closes it while staying keyboard/AT-safe. */}
      <button
        type="button"
        className={styles.backdrop}
        onClick={onClose}
        aria-label={t("shared:modal.close")}
      />
      <button
        type="button"
        className={styles.close}
        onClick={onClose}
        aria-label={t("shared:modal.close")}
      >
        <FiX aria-hidden />
      </button>
      {items.length > 1 && (
        <button
          type="button"
          className={`${styles.arrow} ${styles.left}`}
          onClick={() => onMove(-1)}
          aria-label={t("subprofiles:skinExtras.studio.previous")}
        >
          <FiChevronLeft aria-hidden />
        </button>
      )}
      <figure className={styles.figure}>
        <img
          className={styles.photo}
          src={resolveAvatarSrc(item.imageUrl, 1400)}
          alt={alt}
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </figure>
      {items.length > 1 && (
        <button
          type="button"
          className={`${styles.arrow} ${styles.right}`}
          onClick={() => onMove(1)}
          aria-label={t("subprofiles:skinExtras.studio.next")}
        >
          <FiChevronRight aria-hidden />
        </button>
      )}
      {items.length > 1 && (
        <div className={styles.count}>
          {index + 1} / {items.length}
        </div>
      )}
    </div>,
    document.body,
  );
}
