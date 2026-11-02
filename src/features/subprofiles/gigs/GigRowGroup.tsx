import { useCallback, useId, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { Collapse } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useRowDragReorder } from "../useRowDragReorder";
import { GigRow } from "./GigRow";
import { GigRowGroupHeader } from "./GigRowGroupHeader";
import { GigRowSlot } from "./GigRowSlot";
import type { GigRowEntry } from "./gigRows";
import styles from "./GigRowGroup.module.css";

/**
 * GigRowGroup: one of the two gig lists ("upcoming" or "past") of the Gigs
 * editor. Wave 2 composes it twice from `groupGigRows(rows)`.
 *
 * Renders a header (label + count in a RollingNumber, and for "past" a
 * show/hide toggle), then ONLY the rows inside the drag container. One
 * `useRowDragReorder` instance lives here, so dragging works inside one
 * group only. Rows animate in and out (height + opacity, instant
 * under reduced motion). While any row is leaving, grip drags, move buttons
 * and the leaving row's pointer events are all no-ops.
 *
 * Group-local indices: `isFirst` / `isLast` and `onReorder` indices count
 * inside the group. The flat-array index is available as
 * `entry.globalIndex` when the parent needs it.
 *
 * "upcoming" is always open and shows `gigEditor.upcoming.empty` (animated)
 * when it has no entries. "past" lives in the shared Collapse, driven by
 * `isOpen` / `onToggleOpen`; it renders nothing while it has no entries.
 * The parent owns `isOpen` (collapsed when upcoming exist, open when none,
 * auto-open for undated rows or after a save lands a gig in Past).
 *
 * Props (every handler receives the row's `_uid`, so the parent has no
 * group-index to flat-index mapping to do):
 *   group            "upcoming" | "past"
 *   entries          GigRowEntry[] for this group, in persisted order
 *   canFeature       whether the section supports a spotlight item
 *   isOpen           past only: whether rows are shown (default true)
 *   onToggleOpen     past only: toggles isOpen; omit for upcoming
 *   jumpTargetUid    `_uid` whose Edit button is the field-jump landing spot
 *   onReorder        (fromGroupIndex, toGroupIndex) after a grip drag swap
 *   onEdit / onMoveUp / onMoveDown / onToggleFeature / onRemove  (rowUid)
 */
export interface GigRowGroupProps {
  group: "upcoming" | "past";
  entries: GigRowEntry[];
  canFeature: boolean;
  isOpen?: boolean;
  onToggleOpen?: () => void;
  jumpTargetUid?: string | null;
  onReorder: (fromGroupIndex: number, toGroupIndex: number) => void;
  onEdit: (rowUid: string) => void;
  onMoveUp: (rowUid: string) => void;
  onMoveDown: (rowUid: string) => void;
  onToggleFeature: (rowUid: string) => void;
  onRemove: (rowUid: string) => void;
}

export function GigRowGroup({
  group,
  entries,
  canFeature,
  isOpen = true,
  onToggleOpen,
  jumpTargetUid = null,
  onReorder,
  onEdit,
  onMoveUp,
  onMoveDown,
  onToggleFeature,
  onRemove,
}: GigRowGroupProps) {
  const { t } = useTranslation();
  const headingId = useId();
  const panelId = useId();
  const exitingCountRef = useRef(0);
  const handleExitStart = useCallback(() => {
    exitingCountRef.current += 1;
  }, []);
  const handleExitComplete = useCallback(() => {
    exitingCountRef.current = 0;
  }, []);
  const isPast = group === "past";

  const { containerRef, draggingIndex, gripHandlers } = useRowDragReorder(
    (from, to) => {
      if (exitingCountRef.current === 0) onReorder(from, to);
    },
  );
  // Handlers that do nothing while a row is still leaving, so the list the
  // person acts on is the list they see.
  const whenSettled = (action: () => void) => () => {
    if (exitingCountRef.current === 0) action();
  };

  if (isPast && entries.length === 0) return null;

  const rows = (
    <div id={panelId}>
      <div className={styles.rows} ref={containerRef}>
        <AnimatePresence initial={false} onExitComplete={handleExitComplete}>
          {entries.map(({ row }, index) => {
            const armDrag = gripHandlers(index).onPointerDown;
            return (
              <GigRowSlot
                key={row._uid}
                isHeld={draggingIndex === index}
                onExitStart={handleExitStart}
              >
                <GigRow
                  item={row}
                  rowUid={row._uid}
                  canFeature={canFeature}
                  isFirst={index === 0}
                  isLast={index === entries.length - 1}
                  gripHandlers={{
                    onPointerDown: (event) => {
                      if (exitingCountRef.current === 0) armDrag(event);
                    },
                  }}
                  isDragging={draggingIndex === index}
                  isFlat
                  isPast={isPast}
                  isJumpTarget={jumpTargetUid === row._uid}
                  onEdit={() => onEdit(row._uid)}
                  onMoveUp={whenSettled(() => onMoveUp(row._uid))}
                  onMoveDown={whenSettled(() => onMoveDown(row._uid))}
                  onToggleFeature={() => onToggleFeature(row._uid)}
                  onRemove={whenSettled(() => onRemove(row._uid))}
                />
              </GigRowSlot>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <section className={styles.group} aria-labelledby={headingId}>
      <GigRowGroupHeader
        group={group}
        count={entries.length}
        headingId={headingId}
        isOpen={isOpen}
        onToggleOpen={isPast ? onToggleOpen : undefined}
        panelId={panelId}
      />
      {isPast ? (
        <Collapse isOpen={isOpen}>{rows}</Collapse>
      ) : (
        <>
          <Collapse isOpen={entries.length === 0}>
            <p className={styles.empty}>
              {t("subprofiles:gigEditor.upcoming.empty")}
            </p>
          </Collapse>
          {rows}
        </>
      )}
    </section>
  );
}
