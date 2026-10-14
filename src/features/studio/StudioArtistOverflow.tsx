import { AnimatePresence, m } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiMoreHorizontal } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useOutsideDismiss } from "../../shared/hooks/useOutsideDismiss";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioPressPath } from "./studioPaths";
import releaseStyles from "./StudioRelease.module.css";

/** The artist hero's overflow for a visitor: the persona's press kit.
 *  Escape, a press outside and tabbing out close it; Escape returns focus
 *  to the trigger. */
export function StudioArtistOverflow({
  subprofileId,
  name,
}: {
  subprofileId: string;
  name: string;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const menuId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);
  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };
  useOutsideDismiss(isOpen, wrapRef, () => setIsOpen(false), {
    onEscape: close,
  });
  // Opening moves focus into the menu, onto its first item.
  useEffect(() => {
    if (isOpen) firstItemRef.current?.focus();
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
        aria-label={t("studio:artistPage.v3.moreAria", { name })}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <FiMoreHorizontal aria-hidden />
      </button>
      <AnimatePresence>
        {isOpen && (
          <m.div
            key="menu"
            id={menuId}
            role="menu"
            className={releaseStyles.menu}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.16 }}
          >
            <Link
              ref={firstItemRef}
              role="menuitem"
              to={studioPressPath(subprofileId)}
              className={releaseStyles.menuItem}
              onClick={() => setIsOpen(false)}
            >
              {t("studio:artistPage.v3.pressKit")}
            </Link>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
