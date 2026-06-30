import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Tag.module.css";

export function Tag({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={[styles.tag, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </span>
  );
}

export function TagRow({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[styles.row, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

export type ChipKind =
  "offering" | "looking" | "feature" | "network" | "locked";

interface KindChipProps extends HTMLAttributes<HTMLSpanElement> {
  kind?: ChipKind;
  children: ReactNode;
}

export function KindChip({
  kind = "offering",
  className,
  children,
  ...rest
}: KindChipProps) {
  return (
    <span
      className={[styles.chip, styles[kind], className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </span>
  );
}
