import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Eyebrow.module.css";

interface EyebrowProps extends HTMLAttributes<HTMLDivElement> {
  /** Show the pulsing jade "live" dot. */
  live?: boolean;
  children: ReactNode;
}

export function Eyebrow({
  live = false,
  className,
  children,
  ...rest
}: EyebrowProps) {
  return (
    <div
      className={[styles.eyebrow, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {live && <span className={styles.liveDot} aria-hidden />}
      {children}
    </div>
  );
}
