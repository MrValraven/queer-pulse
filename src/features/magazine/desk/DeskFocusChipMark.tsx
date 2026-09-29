import type { IconType } from "react-icons";
import { FiAlertTriangle, FiClock } from "react-icons/fi";
import type { DeskFocusId } from "./deskFocus";
import type { DeskTone } from "./deskTones";
import { DeskToneDot } from "./DeskToneDot";
import styles from "./DeskFocusBar.module.css";

/** Chips whose tone another chip shares get the mark the rest of the desk
 *  already uses for the same state, in place of the tone dot: Stalled wears
 *  the clock a stalled row shows beside its stage age (With writers keeps
 *  the amber dot), and At risk the warning sign on the rail's forecast (Late
 *  keeps the red dot). */
const FOCUS_CHIP_ICONS: Partial<Record<DeskFocusId, IconType>> = {
  stalled: FiClock,
  "at-risk": FiAlertTriangle,
};

/**
 * A focus chip's tone mark: its icon when `FOCUS_CHIP_ICONS` names one, else
 * the tone dot. Decorative either way, since the chip's label carries the
 * meaning; the icon only keeps two chips of one colour apart at a glance.
 */
export function DeskFocusChipMark({
  id,
  tone,
}: {
  id: DeskFocusId;
  tone: DeskTone;
}) {
  const ChipIcon = FOCUS_CHIP_ICONS[id];
  if (ChipIcon) {
    return <ChipIcon aria-hidden="true" className={styles.chipIcon} />;
  }
  return <DeskToneDot tone={tone} />;
}
