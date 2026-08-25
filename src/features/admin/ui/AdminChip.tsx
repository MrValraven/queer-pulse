import type { ReactNode } from "react";
import styles from "./adminUi.module.css";

export type AdminTone =
  "danger" | "coral" | "amber" | "warn" | "jade" | "violet" | "plum" | "ghost";

export function AdminChip({
  tone = "plum",
  dot = false,
  title,
  children,
  className,
}: {
  tone?: AdminTone;
  dot?: boolean;
  /** Optional tooltip text — a plain-language expansion for a chip whose
   *  label alone is terse (e.g. a duplicate flag), surfaced natively via the
   *  `title` attribute so it needs no extra markup or JS to be accessible. */
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={[styles.chip, styles[`chip_${tone}`], className]
        .filter(Boolean)
        .join(" ")}
      title={title}
    >
      {dot && <span className={styles.chipDot} aria-hidden />}
      {children}
    </span>
  );
}

/** Stronger, square-cornered category label (ax-cat). */
export function AdminCat({
  tone = "coral",
  children,
}: {
  tone?: "danger" | "coral" | "jade";
  children: ReactNode;
}) {
  return (
    <span className={[styles.cat, styles[`cat_${tone}`]].join(" ")}>
      {children}
    </span>
  );
}
