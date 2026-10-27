import type { ReactNode } from "react";
import styles from "./studio.module.css";

/** The eyebrow, the page's one h1 and the credit line. */
export function HeroHeading({
  kind,
  title,
  titleId,
  by,
}: {
  kind: ReactNode;
  title: ReactNode;
  titleId?: string;
  by: ReactNode;
}) {
  return (
    <>
      <div className={styles.kind}>{kind}</div>
      <h1 id={titleId}>{title}</h1>
      <div className={styles.by}>{by}</div>
    </>
  );
}

/** The action row, then the caller's extra block (a pay pill). */
export function HeroActionsRow({
  actions,
  actionsClassName,
  isActionsCompact,
  children,
}: {
  actions: ReactNode;
  actionsClassName?: string;
  isActionsCompact?: boolean;
  children?: ReactNode;
}) {
  return (
    <>
      <div
        className={
          actionsClassName
            ? `${styles.heroActions} ${actionsClassName}`
            : styles.heroActions
        }
        data-compact={isActionsCompact || undefined}
      >
        {actions}
      </div>
      {children}
    </>
  );
}
