import { useRef, type KeyboardEvent } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { cx } from "../../shared/lib/cx";
import type { VouchMode } from "./vouchGraph.types";
import styles from "./vouchGraphShell.module.css";

const MOTION_EASE = [0.22, 0.68, 0.16, 1] as const;
const MOTION_SECONDS = 0.22;

interface VouchGraphCountPillProps {
  count: number;
  /** What screen readers announce for the pill. */
  label: string;
  tone: "warn" | "accent";
}

/** A small count pill that scales in when the count rises above zero and
 *  out when it drops back to zero. */
export function VouchGraphCountPill({
  count,
  label,
  tone,
}: VouchGraphCountPillProps) {
  const { reducedMotion } = useMotionPrefs();
  const duration = reducedMotion ? 0 : MOTION_SECONDS;
  return (
    <AnimatePresence initial={false}>
      {count > 0 && (
        <m.span
          key="pill"
          className={cx(
            styles.countPill,
            tone === "warn" ? styles.countPillWarn : styles.countPillAccent,
          )}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration, ease: MOTION_EASE }}
        >
          <span aria-hidden>{count}</span>
          <span className="visuallyHidden">{label}</span>
        </m.span>
      )}
    </AnimatePresence>
  );
}

export interface VouchGraphModeTabsProps {
  mode: VouchMode;
  openCaseCount: number;
  isScenesAvailable: boolean;
  /** Id of the stage each tab switches (the tabs' `aria-controls`). */
  stageId?: string;
  onChangeMode: (mode: VouchMode) => void;
}

/**
 * Network, Scenes, Safety and Invites as one tablist. Scenes folds away
 * when the view has fewer than two scenes (D4) unless it is the active tab.
 * Safety carries the open case count (B1). Arrow keys, Home and End move
 * focus between tabs; Enter or Space switches.
 */
export function VouchGraphModeTabs({
  mode,
  openCaseCount,
  isScenesAvailable,
  stageId,
  onChangeMode,
}: VouchGraphModeTabsProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const duration = reducedMotion ? 0 : MOTION_SECONDS;
  const isScenesShown = isScenesAvailable || mode === "clusters";

  const focusOrder: VouchMode[] = isScenesShown
    ? ["plain", "clusters", "safety", "invites"]
    : ["plain", "safety", "invites"];
  const tabRefs = useRef(new Map<VouchMode, HTMLButtonElement>());

  // The focus order comes from the modes on show, so a Scenes tab that is
  // folding away is skipped.
  function moveFocus(
    event: KeyboardEvent<HTMLButtonElement>,
    tabMode: VouchMode,
  ) {
    const currentIndex = focusOrder.indexOf(tabMode);
    if (currentIndex < 0) return;
    const lastIndex = focusOrder.length - 1;
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") {
      nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
    }
    if (event.key === "ArrowLeft") {
      nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = lastIndex;
    if (nextIndex === null) return;
    event.preventDefault();
    const nextMode = focusOrder[nextIndex];
    if (nextMode) tabRefs.current.get(nextMode)?.focus();
  }

  function renderTab(tabMode: VouchMode, labelKey: string) {
    const isSelected = mode === tabMode;
    return (
      <button
        type="button"
        role="tab"
        aria-selected={isSelected}
        aria-controls={stageId}
        tabIndex={isSelected ? 0 : -1}
        className={cx(styles.mode, isSelected && styles.modeOn)}
        ref={(element) => {
          if (element) tabRefs.current.set(tabMode, element);
          else tabRefs.current.delete(tabMode);
        }}
        onClick={() => onChangeMode(tabMode)}
        onKeyDown={(event) => moveFocus(event, tabMode)}
      >
        {t(`admin:vouchGraph.modes.${labelKey}`)}
        {tabMode === "safety" && (
          <VouchGraphCountPill
            count={openCaseCount}
            tone="warn"
            label={t("admin:vouchGraph.modes.safetyBadgeAria", {
              count: openCaseCount,
            })}
          />
        )}
      </button>
    );
  }

  return (
    <div
      className={styles.modes}
      role="tablist"
      aria-label={t("admin:vouchGraph.modes.ariaLabel")}
    >
      {renderTab("plain", "network")}
      <AnimatePresence initial={false}>
        {isScenesShown && (
          <m.span
            key="scenes"
            role="presentation"
            className={styles.modeSlot}
            initial={{ opacity: 0, width: 0, overflow: "hidden" }}
            animate={{ opacity: 1, width: "auto", overflow: "visible" }}
            exit={{
              opacity: 0,
              width: 0,
              overflow: "hidden",
              transition: {
                duration,
                ease: MOTION_EASE,
                overflow: { duration: 0 },
              },
            }}
            transition={{
              duration,
              ease: MOTION_EASE,
              overflow: { duration: 0, delay: duration },
            }}
          >
            {renderTab("clusters", "scenes")}
          </m.span>
        )}
      </AnimatePresence>
      {renderTab("safety", "safety")}
      {renderTab("invites", "invites")}
    </div>
  );
}
