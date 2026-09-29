import { Fragment } from "react";
import { FiChevronDown } from "react-icons/fi";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { DeskTone } from "./deskTones";
import type { DeskPieceGroup } from "./pipelineGroups";
import styles from "./PiecesPipeline.module.css";

/** Only the two groups that ask something of the editor get a colour; every
 *  other header stays in the table's quiet ink. */
const GROUP_TONE: Partial<Record<string, DeskTone>> = {
  "your-turn": "you",
  late: "late",
};

export interface PieceGroupHeaderProps {
  group: DeskPieceGroup;
  isCollapsed: boolean;
  /** Id of the element holding the group's rows, for `aria-controls`. */
  bodyId: string;
  onToggle: (group: DeskPieceGroup) => void;
}

/**
 * The sticky header over one pipeline group: its name, how many pieces it
 * holds and the fold toggle. It stays pinned while its rows scroll past, so a
 * long group never loses its name, and it stays visible when folded so the
 * count still tells the editor what is inside.
 *
 * A heading wrapping a disclosure button (the APG accordion shape), so screen
 * reader users can jump group to group by heading.
 */
export function PieceGroupHeader({
  group,
  isCollapsed,
  bodyId,
  onToggle,
}: PieceGroupHeaderProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const label = group.labelKey ? t(group.labelKey) : (group.label ?? "");
  const count = group.pieces.length;
  // "2 more under Late": the rest of this group's focus chip, so the chip's
  // count and the group's never read as two answers to one question.
  const notes = (group.heldElsewhere ?? []).map((overlap) =>
    t("magazine:desk.groups.moreUnder", {
      count: overlap.count,
      group: t(overlap.labelKey),
    }),
  );
  const accessibleName = [
    t("magazine:desk.pipeline.groupAria", { group: label, count }),
    ...notes,
  ].join(", ");

  return (
    <h2
      className={styles.groupHeader}
      data-tone={GROUP_TONE[group.id]}
      data-collapsed={isCollapsed}
    >
      <button
        type="button"
        className={styles.groupToggle}
        // A stable hook for `useDeskShowAtRisk`'s "show at risk" reveal:
        // every group's toggle carries it, so `querySelector` finds the
        // FIRST one in DOM order (the first group) without guessing at
        // markup shape (an `h2` query could also match an unrelated
        // heading elsewhere in the table).
        data-desk-group-heading
        aria-expanded={!isCollapsed}
        aria-controls={bodyId}
        aria-label={accessibleName}
        onClick={() => onToggle(group)}
      >
        <FiChevronDown aria-hidden className={styles.groupChevron} />
        <span className={styles.groupLabel}>{label}</span>
        <span className={styles.groupCount}>{format.number(count)}</span>
        {notes.map((note) => (
          <Fragment key={note}>
            <span aria-hidden="true" className={styles.groupNoteSeparator}>
              ·
            </span>
            <span className={styles.groupNote}>{note}</span>
          </Fragment>
        ))}
      </button>
    </h2>
  );
}
