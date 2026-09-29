import { useId, type ReactNode } from "react";
import { useFormat } from "../../../../shared/i18n/format";
import styles from "./rail.module.css";

export type RailCardKind = "health" | "pitches" | "team" | "activity";

export interface RailCardProps {
  /** Which card this is. Written to `data-rail-card`, where the rail's
   *  stacked layout reads it to put Pitches first. */
  kind: RailCardKind;
  title: string;
  /** A count beside the title. Zero renders muted so it recedes. */
  count?: number;
  /** When given, a count above zero is a button that opens what it counts,
   *  so the heading number is a door like every other number on the desk. */
  onCountClick?: () => void;
  /** The count button's accessible name, naming the action ("Open pitch
   *  triage, 4 waiting"). */
  countActionLabel?: string;
  /** True when `onCountClick` opens a dialog, so the button can say so
   *  ahead of the press (`aria-haspopup="dialog"`). */
  countOpensDialog?: boolean;
  children: ReactNode;
}

/**
 * One band of the desk rail: an eyebrow title over its content. The rail is
 * a single surface, so a card draws no box of its own; the hairline and
 * spacing between bands come from `DeskRail.module.css`. The heading labels
 * the section, so each band is a named region for screen reader navigation.
 * The count sits beside the heading, outside it, so the heading and the
 * region are named by the title alone.
 */
export function RailCard({
  kind,
  title,
  count,
  onCountClick,
  countActionLabel,
  countOpensDialog,
  children,
}: RailCardProps) {
  const headingId = useId();
  const format = useFormat();
  const isCountButton = onCountClick !== undefined && (count ?? 0) > 0;
  return (
    <section
      className={styles.card}
      data-rail-card={kind}
      aria-labelledby={headingId}
    >
      <div className={styles.titleRow}>
        <h2 id={headingId} className={styles.title}>
          {title}
        </h2>
        {count === undefined ? null : isCountButton ? (
          <button
            type="button"
            className={styles.titleCountButton}
            aria-label={countActionLabel}
            aria-haspopup={countOpensDialog ? "dialog" : undefined}
            onClick={onCountClick}
          >
            {format.number(count)}
          </button>
        ) : (
          <span className={styles.titleCount} data-zero={count === 0}>
            {format.number(count)}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
