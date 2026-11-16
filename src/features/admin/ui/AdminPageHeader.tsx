import type { ReactNode } from "react";
import styles from "./adminUi.module.css";

export function AdminPageHeader({
  eyebrow,
  title,
  sub,
  actions,
  meta,
  size = "compact",
  isLive,
  titleId,
}: {
  /** The nav section the page lives in. */
  eyebrow?: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
  /** Small muted text beside the actions, e.g. "Counted at 10:13". */
  meta?: ReactNode;
  /** `"compact"` is the page default. `"hero"` keeps the large fluid title
   *  and is used by the Overview only. */
  size?: "compact" | "hero";
  /** Shows the pulsing jade dot before the eyebrow, for a live surface. */
  isLive?: boolean;
  /** Gives the heading this id and `tabIndex={-1}` so the page can move focus
   *  onto it in code (e.g. after the element holding focus unmounts). */
  titleId?: string;
}) {
  const hasSide = Boolean(actions) || Boolean(meta);
  return (
    <div
      className={[styles.ph, size === "hero" && styles.phHero]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.phText}>
        {(eyebrow || isLive) && (
          <div className={styles.eyebrow}>
            {isLive && <span className={styles.eyebrowDot} aria-hidden />}
            {eyebrow}
          </div>
        )}
        <h1
          id={titleId}
          tabIndex={titleId ? -1 : undefined}
          className={styles.h1}
        >
          {title}
        </h1>
        {sub && <p className={styles.phSub}>{sub}</p>}
      </div>
      {hasSide && (
        <div className={styles.phSide}>
          {meta && <span className={styles.phMeta}>{meta}</span>}
          {actions && <div className={styles.phActions}>{actions}</div>}
        </div>
      )}
    </div>
  );
}
