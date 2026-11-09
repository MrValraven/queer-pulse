import { Collapse } from "../../../../shared/components/ui";
import { useVjHelpCaptions } from "../hooks/useVjHelpCaptions";
import styles from "./VjDockRows.module.css";

export interface VjDockHelpEntry {
  /** The id a control's aria-describedby points at while help is on. */
  id: string;
  /** The control's short visible name, leading the line. */
  term: string;
  text: string;
  /** False folds the line away with its control (the length under Cut). */
  isShown?: boolean;
}

export interface VjDockHelpLegendProps {
  entries: readonly VjDockHelpEntry[];
}

/**
 * The help captions for one dock row, folded in under the row while help
 * captions are on. The row's chips are too narrow to hold a sentence each,
 * so every control gets one line here, in the row's order, led by the
 * control's own name. Each control points its aria-describedby at its line
 * (the description only) while help is on. Help off renders nothing, so the
 * dock looks exactly as it does without help.
 */
export function VjDockHelpLegend({ entries }: VjDockHelpLegendProps) {
  const { isOn } = useVjHelpCaptions();
  return (
    <Collapse isOpen={isOn}>
      <div className={styles.helpLegend} data-vj-help-legend="">
        {entries.map((entry) => (
          <Collapse key={entry.id} isOpen={entry.isShown ?? true}>
            <p className={styles.helpEntry} data-vj-help-caption="">
              <span className={styles.helpTerm}>{entry.term}</span>{" "}
              <span id={entry.id}>{entry.text}</span>
            </p>
          </Collapse>
        ))}
      </div>
    </Collapse>
  );
}
