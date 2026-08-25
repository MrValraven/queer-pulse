import type { ReactNode } from "react";
import styles from "./CardVerifyPage.module.css";

/**
 * The band across the top of the verify panel: a coloured rail, a marked icon,
 * the verdict, and one line saying what the verdict means for the person
 * reading it.
 *
 * Split out because all four answers this page can give — a good card, a card
 * that is no longer good, a code that does not resolve, and a check that never
 * happened — open with exactly this and differ only below it.
 */
export function CardVerdictBanner({
  icon,
  title,
  lead,
}: {
  icon: ReactNode;
  title: string;
  /** What the verdict means at a door. Omitted where the body says it. */
  lead?: string;
}) {
  return (
    <header className={styles.verdict}>
      <span className={styles.verdictMark} aria-hidden="true">
        {icon}
      </span>
      <div>
        {/* `role="status"` rides the verdict itself so a screen reader hears
            the answer, and only the answer, the moment it resolves. */}
        <p className={styles.verdictText} role="status">
          {title}
        </p>
        {lead ? <p className={styles.verdictLead}>{lead}</p> : null}
      </div>
    </header>
  );
}
