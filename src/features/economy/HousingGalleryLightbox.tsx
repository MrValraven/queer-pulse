import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GalleryPhoto } from "./housingGalleryPhotos";
import styles from "./housingGallery.module.css";

interface LightboxProps {
  photos: GalleryPhoto[];
  startIndex: number;
  title: string;
  onClose: () => void;
}

/**
 * Accessible full-screen gallery viewer: keyboard nav (←/→/Esc), swipe on
 * touch, a focus trap, and focus restore on close. Renders a real image for a
 * URL entry (through `resolveAvatarSrc`, like `ImageSlot`) and a captioned
 * tinted frame for a demo caption entry. Mounted only while open.
 */
export function HousingGalleryLightbox({
  photos,
  startIndex,
  title,
  onClose,
}: LightboxProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(startIndex);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dragStartXRef = useRef<number | null>(null);
  useScrollLock();

  const total = photos.length;
  const goPrev = useCallback(
    () => setIndex((current) => (current - 1 + total) % total),
    [total],
  );
  const goNext = useCallback(
    () => setIndex((current) => (current + 1) % total),
    [total],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialog?.focus();
    const focusables = (): HTMLElement[] =>
      dialog
        ? Array.from(
            dialog.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((element) => element.offsetParent !== null)
        : [];
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") return onClose();
      if (event.key === "ArrowLeft") return goPrev();
      if (event.key === "ArrowRight") return goNext();
      if (event.key !== "Tab" || !dialog) return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [onClose, goPrev, goNext]);

  const handlePointerDown = (event: ReactPointerEvent) => {
    if (event.pointerType === "mouse") return;
    dragStartXRef.current = event.clientX;
  };
  const handlePointerEnd = (event: ReactPointerEvent) => {
    if (dragStartXRef.current === null) return;
    const distance = event.clientX - dragStartXRef.current;
    dragStartXRef.current = null;
    if (Math.abs(distance) < 48 || total < 2) return;
    if (distance < 0) goNext();
    else goPrev();
  };

  const photo = photos[index];
  const imageAlt = t("economy:housingGallery.photoAlt", {
    title,
    index: index + 1,
    total,
  });

  return createPortal(
    <div
      className={styles.scrim}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className={styles.bar}>
          {/* The counter IS the live region: stepping through the photos only
              swaps this number and the <img alt> in place, which is silent, so
              the visible position doubles as the polite announcement. The
              digits read badly out loud ("3 / 8"), so they are hidden from the
              reader and a worded equivalent carrying the photo's own label sits
              beside them. Its text changes on every step, since the position
              always does. */}
          <span className={styles.counter} role="status">
            <span aria-hidden="true">
              {t("economy:housingGallery.counter", {
                index: index + 1,
                total,
              })}
            </span>
            <span className="visuallyHidden">
              {t("economy:housingGallery.slideAnnouncement", {
                index: index + 1,
                total,
                label: photo?.caption ?? title,
              })}
            </span>
          </span>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onClose}
            aria-label={t("economy:housingGallery.close")}
          >
            <FiX aria-hidden />
          </button>
        </div>

        <div
          className={styles.stage}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          {photo?.src ? (
            <img
              className={styles.stageImg}
              src={resolveAvatarSrc(photo.src, 1600)}
              alt={imageAlt}
              decoding="async"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className={styles.stagePlaceholder}>{photo?.caption}</div>
          )}

          {total > 1 && (
            <>
              <button
                type="button"
                className={`${styles.iconBtn} ${styles.nav} ${styles.navPrev}`}
                onClick={goPrev}
                aria-label={t("economy:housingGallery.prev")}
              >
                <FiChevronLeft aria-hidden />
              </button>
              <button
                type="button"
                className={`${styles.iconBtn} ${styles.nav} ${styles.navNext}`}
                onClick={goNext}
                aria-label={t("economy:housingGallery.next")}
              >
                <FiChevronRight aria-hidden />
              </button>
            </>
          )}
        </div>

        <p className={styles.caption}>{photo?.caption ?? imageAlt}</p>
      </div>
    </div>,
    document.body,
  );
}
