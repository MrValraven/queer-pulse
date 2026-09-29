import type { CSSProperties } from "react";
import styles from "./SystemStage.module.css";

interface StageRevealProps {
  className: string;
  style: CSSProperties;
}

/**
 * Joins an element to the SystemStage entrance: it rises in 55ms after the
 * element at `index - 1`. The eyebrow is 0, SystemStageTitle 1 and
 * SystemStageLead 2 by default, so a page numbers its own blocks from 3.
 * Spread the result onto the element; `className` is merged in.
 */
export function stageRevealProps(
  index: number,
  className?: string,
): StageRevealProps {
  return {
    className: className ? `${className} ${styles.reveal}` : `${styles.reveal}`,
    style: { "--i": index } as CSSProperties,
  };
}
