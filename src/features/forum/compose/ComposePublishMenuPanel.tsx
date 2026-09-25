import { type KeyboardEvent, type RefObject } from "react";
import { m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { PublishMode } from "./composeThread.types";
import styles from "./ComposePublishMenu.module.css";

export interface ComposePublishMenuPanelProps {
  menuId: string;
  triggerId: string;
  menuRef: RefObject<HTMLDivElement | null>;
  modes: readonly PublishMode[];
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  onChoose: (mode: PublishMode) => void;
}

/**
 * The menu surface itself. It grows out of the caret (the menu opens upward
 * from the end edge) and shrinks back into it, so it stays mounted through
 * its exit under the caller's `AnimatePresence`. While it is leaving it is
 * `inert`: a second press on a row that is already fading out would publish
 * twice.
 */
export function ComposePublishMenuPanel({
  menuId,
  triggerId,
  menuRef,
  modes,
  onKeyDown,
  onChoose,
}: ComposePublishMenuPanelProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();

  return (
    <m.div
      id={menuId}
      ref={menuRef}
      role="menu"
      tabIndex={-1}
      aria-labelledby={triggerId}
      className={styles.menu}
      onKeyDown={onKeyDown}
      inert={!isPresent}
      initial={{ opacity: 0, scale: 0.96, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 4 }}
      transition={{
        duration: reducedMotion ? 0 : 0.18,
        ease: [0.22, 0.68, 0.16, 1],
      }}
    >
      {modes.map((mode) => (
        <button
          key={mode}
          type="button"
          role="menuitem"
          tabIndex={-1}
          className={styles.item}
          onClick={() => onChoose(mode)}
        >
          <b>{t(`forum:composePage.publishMenu.${mode}.label`)}</b>
          <small>{t(`forum:composePage.publishMenu.${mode}.sub`)}</small>
        </button>
      ))}
    </m.div>
  );
}
