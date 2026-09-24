import type { ReactNode } from "react";
import { useTherapistEditHref } from "./TherapistEditContext";
import { TherapistEditLink } from "./TherapistEditLink";
import type { TherapistEditTarget } from "./therapistEditLinks.data";
import styles from "./TherapistPractical.module.css";

/** The owner's "Edit" link in a practical cell's top corner, level with
 *  its title. Pass it as the cell's first child. */
export function PracticalEditLink({ target }: { target: TherapistEditTarget }) {
  return <TherapistEditLink target={target} className={styles.cellEdit} />;
}

interface PracticalEditSlotProps {
  target: TherapistEditTarget;
  children: ReactNode;
}

/** For a cell that takes no extra child (the sessions and small print
 *  cells): in owner mode it rides a wrapper that places the same corner
 *  link over the cell. Every other mode gets the cell alone, unwrapped. */
export function PracticalEditSlot({
  target,
  children,
}: PracticalEditSlotProps) {
  const href = useTherapistEditHref(target);
  if (!href) return <>{children}</>;
  return (
    <div className={styles.editSlot}>
      <PracticalEditLink target={target} />
      {children}
    </div>
  );
}
