import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiHelpCircle } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { useMediaQuery, useOutsideDismiss } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { VouchMode } from "./vouchGraph.types";
import styles from "./vouchGraphCanvas.module.css";

/** `admin:` catalog keys that describe what a mode shows. */
const MODE_NOTE_KEYS: Partial<Record<VouchMode, string>> = {
  clusters: "vouchGraph.canvas.hint.clusters",
  safety: "vouchGraph.canvas.hint.safety",
};

/** D4: under this many visible people the hint drops the path clause. */
const PATH_HINT_MIN_NODES = 3;

const HIDDEN_STATE = { opacity: 0, y: 6 };
const SHOWN_STATE = { opacity: 1, y: 0 };
const ENTER_EASE = [0.22, 0.68, 0.16, 1] as const;

/** The tip lines for this mode and pointer: a mode note when the mode has
 *  one, then the gestures (touch copy on touch screens), then the keys. */
function hintKeysFor(
  mode: VouchMode,
  nodeCount: number,
  isTouch: boolean,
): string[] {
  const modeNoteKey = MODE_NOTE_KEYS[mode];
  const keys = modeNoteKey ? [modeNoteKey] : [];
  if (isTouch) return [...keys, "vouchGraph.canvas.hint.touch"];
  const gestureKey =
    nodeCount < PATH_HINT_MIN_NODES
      ? "vouchGraph.canvas.hint.plainNoPath"
      : "vouchGraph.canvas.hint.plain";
  return [...keys, gestureKey, "vouchGraph.canvas.hint.keyboard"];
}

/** The canvas gesture tips, folded behind a "?" button in the stage's
 *  bottom-left corner so they never cover nodes. Outside presses and Escape
 *  close them; Escape stops at the tips before it reaches the graph modal. */
export function VouchGraphCanvasHint({
  mode,
  nodeCount,
}: {
  mode: VouchMode;
  nodeCount: number;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isTouch = useMediaQuery("(pointer: coarse)");
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  useOutsideDismiss(isOpen, wrapRef, () => setIsOpen(false));

  // A native listener stops Escape before the modal's document listener.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.isComposing) return;
      event.preventDefault();
      event.stopPropagation();
      setIsOpen(false);
      buttonRef.current?.focus();
    };
    wrap.addEventListener("keydown", closeOnEscape);
    return () => wrap.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <div ref={wrapRef} className={styles.hintWrap}>
      <AnimatePresence>
        {isOpen && (
          <m.div
            key="hint"
            id={panelId}
            className={styles.hintPanel}
            initial={HIDDEN_STATE}
            animate={SHOWN_STATE}
            exit={HIDDEN_STATE}
            transition={{
              duration: reducedMotion ? 0 : 0.18,
              ease: ENTER_EASE,
            }}
          >
            {hintKeysFor(mode, nodeCount, isTouch).map((key) => (
              <p key={key}>{t(`admin:${key}`)}</p>
            ))}
          </m.div>
        )}
      </AnimatePresence>
      <button
        ref={buttonRef}
        type="button"
        className={styles.hintButton}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        aria-label={t("admin:vouchGraph.canvas.hint.toggle")}
        title={t("admin:vouchGraph.canvas.hint.toggle")}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <FiHelpCircle aria-hidden />
      </button>
    </div>
  );
}
