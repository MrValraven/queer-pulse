import { type ButtonHTMLAttributes } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiCheckCircle, FiEye, FiSearch } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import {
  PANE_LABEL_KEY,
  type ComposeRailPane,
  type PaneCounts,
} from "./composeRailPanes";
import { COMPOSE_EASE } from "./composeMotion";
import styles from "./ComposeRail.module.css";

// ── One opener in the rail's segmented row ──────────────────────────────────
// The same button in both places: in flow below 1023px, where it opens the
// sheet, and in the sheet's head, where it switches pane. Only the sheet's
// copy is pressed; the sheet draws the sliding wash over the pressed tab.

type ComposeRailTabProps = {
  pane: ComposeRailPane;
  counts: PaneCounts;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "type">;

export function ComposeRailTab({
  pane,
  counts,
  ...buttonProps
}: ComposeRailTabProps) {
  const { t } = useTranslation();
  return (
    <button type="button" className={styles.tab} {...buttonProps}>
      <PaneIcon pane={pane} />
      {t(PANE_LABEL_KEY[pane])}
      <PaneCount pane={pane} {...counts} />
    </button>
  );
}

function PaneIcon({ pane }: { pane: ComposeRailPane }) {
  if (pane === "preview") return <FiEye aria-hidden="true" />;
  if (pane === "similar") return <FiSearch aria-hidden="true" />;
  return <FiCheckCircle aria-hidden="true" />;
}

/** The number on a tab, when that tab has one worth showing. It pops in the
 *  moment it has something to say, and back out when it no longer does. */
function PaneCount({
  pane,
  similarCount,
  readyCount,
  readyTotal,
}: { pane: ComposeRailPane } & PaneCounts) {
  const format = useFormat();
  const { reducedMotion } = useMotionPrefs();
  const label =
    pane === "similar" && similarCount && similarCount > 0
      ? format.number(similarCount)
      : pane === "checklist" && readyCount !== undefined && readyTotal
        ? `${format.number(readyCount)}/${format.number(readyTotal)}`
        : null;
  return (
    <AnimatePresence initial={false}>
      {label !== null && (
        <m.span
          key="count"
          className={styles.tabCount}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{
            duration: reducedMotion ? 0 : 0.22,
            ease: COMPOSE_EASE,
          }}
        >
          {label}
        </m.span>
      )}
    </AnimatePresence>
  );
}
