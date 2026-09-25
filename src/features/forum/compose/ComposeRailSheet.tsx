import { type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { m, useIsPresent, useMotionValue } from "motion/react";
import { FiX } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useDismiss, useScrimDismiss } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { ComposeRailTab } from "./ComposeRailTab";
import {
  PANES,
  type ComposeRailPane,
  type PaneCounts,
} from "./composeRailPanes";
import { COMPOSE_EASE } from "./composeMotion";
import { useClaimEscape, useSheetDrag } from "./composeRailSheetHooks";
import styles from "./ComposeRail.module.css";

// ── The rail as a bottom sheet ──────────────────────────────────────────────
// Mounted by `ComposeRail` inside an `AnimatePresence`, so it slides up on the
// way in and back down on the way out; the sheet stays mounted (trap, scroll
// lock and all) until that exit has finished, then `useDismiss` restores focus.
//
// Nothing inside the sheet may use `layout` or `layoutId` on an element that
// mounts and unmounts while the sheet is open. Motion registers such an
// element with the sheet's presence and never unregisters it on unmount, so
// the sheet's exit would wait forever on an element that is already gone,
// leaving an invisible scrim over a scroll-locked page.

export interface ComposeRailSheetBlocks {
  postingAs: ReactNode;
  preview: ReactNode;
  similar: ReactNode;
  checklist: ReactNode;
}

export function ComposeRailSheet({
  pane,
  onPaneChange,
  onClose,
  blocks,
  counts,
}: {
  pane: ComposeRailPane;
  onPaneChange: (pane: ComposeRailPane) => void;
  onClose: () => void;
  blocks: ComposeRailSheetBlocks;
  counts: PaneCounts;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  // False from the moment the sheet starts sliding away. From then on it is
  // `inert` and the scrim lets clicks through, so a tap during the exit can
  // neither switch the pane (reopening it) nor land on a fading scrim.
  const isPresent = useIsPresent();
  // Focus trap, scroll lock, Escape and focus restore, all from one hook. The
  // sheet is mounted only while open, so it runs once per opening.
  const sheetRef = useDismiss<HTMLDivElement>(onClose);
  useClaimEscape();
  const scrimProps = useScrimDismiss(onClose);
  // The drag writes here and the exit animates from here, so a sheet let go
  // mid-drag carries on down from where the finger left it.
  const sheetOffsetY = useMotionValue(0);
  const grabberProps = useSheetDrag(sheetOffsetY, onClose, reducedMotion);
  const duration = reducedMotion ? 0 : 0.25;

  return createPortal(
    <m.div
      className={styles.scrim}
      role="presentation"
      {...scrimProps}
      inert={!isPresent}
      style={{ pointerEvents: isPresent ? undefined : "none" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, ease: COMPOSE_EASE }}
    >
      <m.div
        ref={sheetRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={t("forum:composePage.rail.label")}
        className={styles.sheet}
        style={{ y: sheetOffsetY }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ duration, ease: COMPOSE_EASE }}
      >
        {/* Drag down to dismiss. Decorative to a screen reader: Escape, the
            scrim and the Close button all reach the same outcome, so the
            gesture is never the only way out. */}
        <span className={styles.grabber} aria-hidden="true" {...grabberProps} />
        <div className={styles.sheetHead}>
          <div
            className={`${styles.tabs} ${styles.sheetTabs}`}
            role="group"
            aria-label={t("forum:composePage.rail.tabsLabel")}
            style={{ "--pane-count": PANES.length } as CSSProperties}
          >
            {PANES.map((candidate) => (
              <ComposeRailTab
                key={candidate}
                pane={candidate}
                counts={counts}
                aria-pressed={candidate === pane}
                onClick={() => onPaneChange(candidate)}
              />
            ))}
            {/* One wash for the pressed tab, always mounted, that slides a
                whole tab width (gap included) per step. */}
            <m.span
              className={styles.tabIndicator}
              aria-hidden="true"
              initial={false}
              animate={{ x: `${PANES.indexOf(pane) * 100}%` }}
              transition={{ duration, ease: COMPOSE_EASE }}
            />
          </div>
          <button
            type="button"
            className={styles.close}
            aria-label={t("shared:modal.close")}
            onClick={onClose}
          >
            <FiX aria-hidden="true" />
          </button>
        </div>
        <div className={styles.sheetBody}>
          {/* Keyed by pane, so switching tabs fades the new block up into
              view. */}
          <m.div
            key={pane}
            className={styles.sheetPane}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.22,
              ease: COMPOSE_EASE,
            }}
          >
            {pane === "preview" && (
              <>
                {blocks.postingAs}
                {blocks.preview}
              </>
            )}
            {pane === "similar" && blocks.similar}
            {pane === "checklist" && blocks.checklist}
          </m.div>
        </div>
      </m.div>
    </m.div>,
    document.body,
  );
}
