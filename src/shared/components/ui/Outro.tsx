import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import styles from "./Outro.module.css";

interface OutroProps {
  /** Closing headline. Use an `<em>` for the coral emphasis. */
  title: ReactNode;
  /** Supporting line under the title. */
  sub?: ReactNode;
  /** Call-to-action button(s). */
  children?: ReactNode;
  /** Extra class on the `<section>` for one-off overrides. */
  className?: string;
}

/**
 * The standard plum closing band used at the foot of most pages: a serif title
 * (with coral `<em>` emphasis), a muted sub-line, and one or more CTA buttons —
 * each part revealed on scroll. Pass the button(s) as children.
 */
export function Outro({ title, sub, children, className }: OutroProps) {
  return (
    <section className={[styles.outro, className].filter(Boolean).join(" ")}>
      <div className="wrap">
        <Reveal as="h2" className={styles.title}>
          {title}
        </Reveal>
        {sub && (
          <Reveal as="p" className={styles.sub} delay={80}>
            {sub}
          </Reveal>
        )}
        {children && (
          <Reveal className={styles.actions} delay={140}>
            {children}
          </Reveal>
        )}
      </div>
    </section>
  );
}
