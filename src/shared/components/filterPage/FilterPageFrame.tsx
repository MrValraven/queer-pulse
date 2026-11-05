import type { ReactNode } from "react";
import styles from "./FilterPage.module.css";

interface FilterPageFrameProps {
  /** Drops the frame's bottom padding, for a page whose own sections (an
   *  outro, a band of tips) follow the layout inside the frame and bring
   *  their own spacing. */
  isBottomFlush?: boolean;
  children: ReactNode;
}

/** The filter page's outer frame: the 1440px centred column with the
 *  members directory's gutters. A page renders it inside its shell
 *  (`PageShell` or `AppShell`) and puts `FilterPageHeader` and
 *  `FilterPageLayout` inside it, in that order. */
export function FilterPageFrame({
  isBottomFlush = false,
  children,
}: FilterPageFrameProps) {
  return (
    <div
      className={[styles.page, isBottomFlush && styles.pageFlush]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
