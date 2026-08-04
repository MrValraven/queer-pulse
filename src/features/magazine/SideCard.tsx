import type { ReactNode } from "react";
import { cx } from "../../shared/lib/cx";
import styles from "./EditorDashboardPage.module.css";

/**
 * The shared right-rail card shell every editor side-card repeats: a
 * `styles.sideCard` wrapper with an `<h4>` heading, then the card body.
 * `title` is a ReactNode so a heading can carry inline extras (e.g. the
 * section-budget "slots open" count); `className` layers on card variants
 * such as the coral quick-actions surface.
 */
export function SideCard({
  title,
  children,
  className,
}: {
  title: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx(styles.sideCard, className)}>
      <h4>{title}</h4>
      {children}
    </div>
  );
}
