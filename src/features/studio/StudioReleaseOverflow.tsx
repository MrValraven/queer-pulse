import { useEffect, useId, useRef, useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { useOutsideDismiss } from "../../shared/hooks/useOutsideDismiss";
import { useTranslation } from "../../shared/i18n/useTranslation";
import releaseStyles from "./StudioRelease.module.css";

/** The release's overflow menu. Escape and a click outside close it, and
 *  focus returns to the trigger. */
export function StudioReleaseOverflow({ onReport }: { onReport: () => void }) {
  const { t } = useTranslation();
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);
  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };
  useOutsideDismiss(isOpen, wrapRef, () => setIsOpen(false), {
    onEscape: close,
  });
  // Opening brings the whole menu into view (on a phone it can open below
  // the fold), then moves focus onto its first item; preventScroll keeps
  // the focus from cutting the smooth scroll short. jsdom leaves
  // scrollIntoView undefined.
  useEffect(() => {
    if (!isOpen) return;
    menuRef.current?.scrollIntoView?.({ block: "nearest" });
    firstItemRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  return (
    <div
      className={releaseStyles.overflow}
      ref={wrapRef}
      onBlur={(event) => {
        // Tabbing out of the menu closes it. A blur with no next target
        // (a press on the page) is left to the outside-press handler.
        const nextFocus = event.relatedTarget;
        if (nextFocus && !event.currentTarget.contains(nextFocus))
          setIsOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        className={releaseStyles.overflowTrigger}
        aria-label={t("studio:release.moreActions")}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <FiMoreHorizontal aria-hidden />
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          className={releaseStyles.menu}
        >
          <button
            type="button"
            ref={firstItemRef}
            role="menuitem"
            className={releaseStyles.menuItem}
            onClick={() => {
              // Focus is back on the trigger before the dialog opens, so the
              // dialog hands focus back to it on close.
              close();
              onReport();
            }}
          >
            {t("studio:release.report")}
          </button>
        </div>
      )}
    </div>
  );
}
