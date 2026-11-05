import type { ReactNode } from "react";
import { Button, ModalSheet } from "../ui";
import styles from "./FilterPage.module.css";

interface FiltersSheetProps {
  /** The sheet's heading and its dialog name, such as "Filter members". */
  title: string;
  /** The footer button's text, such as "Show 12 members". It renders as one
   *  flex item, so a `<Translation slots>` sentence with a RollingNumber
   *  stays whole. */
  showResultsLabel: ReactNode;
  onClose: () => void;
  /** Normally the page's `FilterSidebarPanel` with `isInSheet`. */
  children: ReactNode;
}

/** The mobile bottom sheet holding the filters: a heading, the panel, and a
 *  sticky "Show N results" button that closes it. A page mounts it as
 *  `isMobile && isSheetOpen`, with `closeSheet` as `onClose`, the way the
 *  members directory does. */
export function FiltersSheet({
  title,
  showResultsLabel,
  onClose,
  children,
}: FiltersSheetProps) {
  return (
    <ModalSheet onClose={onClose} ariaLabel={title}>
      <h2 className={styles.sheetTitle}>{title}</h2>
      {children}
      <div className={styles.sheetFoot}>
        <Button type="button" variant="primary" onClick={onClose}>
          {/* One flex item, so the Button's gap never splits the sentence. */}
          <span>{showResultsLabel}</span>
        </Button>
      </div>
    </ModalSheet>
  );
}
