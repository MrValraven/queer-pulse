import type { ReactNode, RefObject } from "react";
import styles from "./ListingDeleteFlow.module.css";

/**
 * A step's heading. `tabIndex={-1}` lets the flow move focus here on every
 * step change, so a screen reader announces the new step and a keyboard user
 * starts reading from its top. `aria-describedby` points at the step count in
 * Modal's eyebrow, so "Step 2 of 4" is read along with the heading.
 */
export function ListingDeleteStepHeading({
  headingRef,
  stepCountId,
  children,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
  stepCountId: string;
  children: ReactNode;
}) {
  return (
    <h4
      ref={headingRef}
      tabIndex={-1}
      aria-describedby={stepCountId}
      className={styles.stepHeading}
    >
      {children}
    </h4>
  );
}
