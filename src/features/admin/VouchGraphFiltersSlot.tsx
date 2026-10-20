import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Collapse } from "../../shared/components/ui";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import styles from "./vouchGraphShell.module.css";

/** The width where the inspector turns into a bottom sheet
 *  (vouchGraphInspector.module.css), so the filters follow it. */
const PHONE_QUERY = "(max-width: 920px)";
const SHEET_EASE = [0.22, 0.68, 0.16, 1] as const;
const SHEET_SECONDS = 0.28;
const SCRIM_SECONDS = 0.2;

interface FiltersSheetProps {
  onClose: () => void;
  onFocusLeave: () => void;
  children: ReactNode;
}

/** The phone sheet itself. It takes focus as it rises, so Escape and Tab
 *  start inside it, and goes `inert` while it slides away. */
function FiltersSheet({ onClose, onFocusLeave, children }: FiltersSheetProps) {
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  const sheetRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    sheetRef.current?.focus({ preventScroll: true });
  }, []);
  return (
    <m.div
      ref={sheetRef}
      className={styles.filtersSheet}
      tabIndex={-1}
      inert={!isPresent}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{
        duration: reducedMotion ? 0 : SHEET_SECONDS,
        ease: SHEET_EASE,
      }}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || event.nativeEvent.isComposing) return;
        // This Escape belongs to the sheet: the network stays open.
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }}
      onBlur={(event) => {
        // Tabbing out of the sheet folds it away, so focus never lands on
        // a control hidden behind the scrim.
        const nextTarget = event.relatedTarget;
        if (
          nextTarget instanceof Node &&
          !sheetRef.current?.contains(nextTarget)
        ) {
          onFocusLeave();
        }
      }}
    >
      {children}
    </m.div>
  );
}

/**
 * Where the filters panel opens (B7). Wide screens: a drop-down that lies
 * over the top of the stage and folds open with `Collapse`, so the graph
 * keeps its size. Phones: a bottom sheet over a scrim, above the inspector
 * sheet, with its own scroll; the graph stays in view through the scrim and
 * a tap on it closes the filters.
 */
export function VouchGraphFiltersSlot({
  isOpen,
  onClose,
  onFocusLeave,
  children,
}: FiltersSheetProps & { isOpen: boolean }) {
  const isPhone = useMediaQuery(PHONE_QUERY);
  const { reducedMotion } = useMotionPrefs();
  if (!isPhone) {
    return (
      <Collapse isOpen={isOpen} className={styles.filtersDrop}>
        {children}
      </Collapse>
    );
  }
  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          key="scrim"
          className={styles.filtersScrim}
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : SCRIM_SECONDS }}
          onClick={onClose}
        />
      )}
      {isOpen && (
        <FiltersSheet key="sheet" onClose={onClose} onFocusLeave={onFocusLeave}>
          {children}
        </FiltersSheet>
      )}
    </AnimatePresence>
  );
}
