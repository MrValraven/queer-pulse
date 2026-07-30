import { useCallback, useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { useScrollLock } from "../../shared/hooks";
import { resolveAvatarSrc } from "../../shared/lib/avatarUrl";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GalleryShot } from "./DirectoryGallery";
import styles from "./DirectorySpacePage.module.css";

// `button:not([disabled])` alone would also match the aria-hidden backdrop
// button below (it's a real <button>, just tabIndex={-1}); the `.filter`
// in `focusables()` below drops anything with tabIndex === -1 to keep it
// out of the trap.
const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Full-screen photo lightbox for the directory detail gallery. Mirrors the
 * gatherings `PhotoViewer` pattern: self-contained (locks scroll while
 * mounted, only ever mounted when open), full-bleed dialog with a hidden
 * backdrop button behind the visible close control, Esc + arrow-key nav.
 *
 * Focus handling mirrors `shared/components/ui/Modal.tsx`'s `useDismiss`
 * (initial focus in, Tab trap, focus restore on close) inlined here rather
 * than reused, since this dialog's full-bleed backdrop-button shape doesn't
 * fit that primitive.
 */
export function DirectoryLightbox({
  shots,
  startIndex,
  placeName,
  onClose,
}: {
  shots: GalleryShot[];
  startIndex: number;
  placeName: string;
  onClose: () => void;
}) {
  useScrollLock();
  const { t } = useTranslation();
  const [index, setIndex] = useState(startIndex);
  const hasMultiple = shots.length > 1;
  const dialogRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (direction: number) =>
      setIndex((current) => (current + direction + shots.length) % shots.length),
    [shots.length],
  );

  // Latest-callback refs so the mount-only effect below (deps `[]`) never
  // re-runs the initial-focus/trap setup on a parent re-render.
  const goRef = useRef(go);
  const onCloseRef = useRef(onClose);
  const hasMultipleRef = useRef(hasMultiple);
  useEffect(() => {
    goRef.current = go;
    onCloseRef.current = onClose;
    hasMultipleRef.current = hasMultiple;
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = (): HTMLElement[] =>
      dialog
        ? Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
            (el) => el.offsetParent !== null && el.tabIndex !== -1,
          )
        : [];

    // Initial focus: first focusable inside (the close button), else the
    // dialog itself.
    const first = focusables()[0];
    if (first) first.focus();
    else dialog?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (hasMultipleRef.current && event.key === "ArrowRight") {
        goRef.current(1);
        return;
      }
      if (hasMultipleRef.current && event.key === "ArrowLeft") {
        goRef.current(-1);
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const items = focusables();
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (!firstEl || !lastEl) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const active = document.activeElement;
      if (event.shiftKey && (active === firstEl || active === dialog)) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && active === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, []);

  const shot = shots[index]!;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={t("marketing:directory.detail.galleryAria", {
        name: placeName,
      })}
      className={styles.lightbox}
    >
      {/* Full-bleed dialog: click-to-dismiss can't live on the dialog itself,
          so a real button behind the content carries the affordance. Hidden
          from AT since the topbar close button already exposes it, and kept
          out of the Tab trap above via its tabIndex={-1}. */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        className={styles.lightboxBackdrop}
        onClick={onClose}
      />
      <div className={styles.lightboxTopbar}>
        {hasMultiple && (
          <span className={styles.lightboxCounter}>
            {index + 1} / {shots.length}
          </span>
        )}
        <button
          type="button"
          className={styles.lightboxClose}
          onClick={onClose}
          aria-label={t("marketing:directory.detail.lightboxClose")}
        >
          <FiX />
        </button>
      </div>

      <div className={styles.lightboxStage}>
        {hasMultiple && (
          <button
            type="button"
            className={styles.lightboxNav}
            onClick={() => go(-1)}
            aria-label={t("marketing:directory.detail.prevPhoto")}
          >
            <FiChevronLeft />
          </button>
        )}

        <img
          src={resolveAvatarSrc(shot.url, 2000)}
          alt={shot.alt}
          decoding="async"
          referrerPolicy="no-referrer"
          className={styles.lightboxImg}
        />

        {hasMultiple && (
          <button
            type="button"
            className={styles.lightboxNav}
            onClick={() => go(1)}
            aria-label={t("marketing:directory.detail.nextPhoto")}
          >
            <FiChevronRight />
          </button>
        )}
      </div>
    </div>
  );
}
