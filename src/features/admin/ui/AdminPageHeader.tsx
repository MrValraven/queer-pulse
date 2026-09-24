import type { ReactNode } from "react";
import styles from "./adminUi.module.css";

export function AdminPageHeader({
  eyebrow,
  title,
  sub,
  actions,
  titleId,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
  /** Gives the heading this id and `tabIndex={-1}` so the page can move focus
   *  onto it in code (e.g. after the element holding focus unmounts). */
  titleId?: string;
}) {
  return (
    <div className={styles.ph}>
      <div className={styles.phText}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden />
          {eyebrow}
        </div>
        <h1
          id={titleId}
          tabIndex={titleId ? -1 : undefined}
          className={styles.h1}
        >
          {title}
        </h1>
        {sub && <p className={styles.phSub}>{sub}</p>}
      </div>
      {actions && <div className={styles.phActions}>{actions}</div>}
    </div>
  );
}
