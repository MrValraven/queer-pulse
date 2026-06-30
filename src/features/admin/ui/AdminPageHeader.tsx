import type { ReactNode } from "react";
import styles from "./adminUi.module.css";

export function AdminPageHeader({
  eyebrow,
  title,
  sub,
  actions,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className={styles.ph}>
      <div className={styles.phText}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden />
          {eyebrow}
        </div>
        <h1 className={styles.h1}>{title}</h1>
        {sub && <p className={styles.phSub}>{sub}</p>}
      </div>
      {actions && <div className={styles.phActions}>{actions}</div>}
    </div>
  );
}
