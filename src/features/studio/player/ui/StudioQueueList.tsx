import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, m, useIsPresent } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { Button, Collapse } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  useStudioPlayer,
  type StudioPlayerValue,
  type StudioQueueItem,
} from "../studioPlayerContext";
import { radioFilterLabelKey } from "../studioQueue";
import {
  StudioQueueGroup,
  type QueueFocusRequest,
  type QueueFocusTarget,
} from "./StudioQueueGroup";
import { queueOrderKey } from "./studioQueueMoves";
import { StudioQueuePlayed } from "./StudioQueuePlayed";
import { StudioQueueUndoRow } from "./StudioQueueUndoRow";
import { QueueRowSummary } from "./StudioQueueRow";
import { useStudioQueueUndo } from "./useStudioQueueUndo";
import styles from "./StudioQueue.module.css";

type GroupKind = "user" | "upcoming";

type Translate = ReturnType<typeof useTranslation>["t"];

/** Built at click time, so it holds the order and the focus the click saw. */
function focusRequestFor(
  target: QueueFocusTarget,
  entries: readonly StudioQueueItem[],
): QueueFocusRequest {
  return {
    target,
    orderKey: queueOrderKey(entries),
    fromElement: document.activeElement,
  };
}

/** Where focus goes once a removed row has left. */
function focusAfterRemoval(
  entries: readonly StudioQueueItem[],
  index: number,
): QueueFocusTarget {
  const neighbour = entries[index + 1] ?? entries[index - 1];
  return neighbour
    ? { entryId: neighbour.queueEntryId, control: "remove" }
    : "heading";
}

/** "Next from {source}", or "Next up" for a ready-made list. A radio is
 *  named from its filter in the language on screen now. */
function upcomingHeadingText(player: StudioPlayerValue, t: Translate): string {
  const source = player.queue.source;
  if (!source || source.kind === "tracks") return t("studio:queue.nextUp");
  const radioFilter = source.radioFilter ?? player.radio?.filter;
  const sourceName =
    source.kind === "radio" && radioFilter
      ? t(radioFilterLabelKey(radioFilter))
      : source.label;
  return sourceName
    ? t("studio:queue.nextFrom", { source: sourceName })
    : t("studio:queue.nextUp");
}

/** "Clear queue", fading in and out with the rows it clears. */
function ClearQueueButton({ onClear }: { onClear: () => void }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const isPresent = useIsPresent();
  return (
    <m.span
      className={styles.clearSlot}
      inert={!isPresent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.18 }}
    >
      <Button
        variant="quiet"
        size="sm"
        className={styles.clear}
        onClick={onClear}
      >
        {t("studio:queue.clear")}
      </Button>
    </m.span>
  );
}

/** Now playing, Your queue, Next from {source} and Played (spec 7.3).
 *  `isInDialog` is for Now playing's modal sheet, where Undo shows as a row
 *  in the queue because the app's toasts sit outside the dialog. */
export function StudioQueueList({
  headingLevel,
  isInDialog = false,
}: {
  headingLevel: 2 | 3;
  isInDialog?: boolean;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const { queue } = player;
  const [announcement, setAnnouncement] = useState("");
  const undo = useStudioQueueUndo({ isInDialog, announce: setAnnouncement });
  const nowHeadingRef = useRef<HTMLHeadingElement>(null);
  const [focusRequests, setFocusRequests] = useState<
    Record<GroupKind, QueueFocusRequest | null>
  >({ user: null, upcoming: null });
  // A handover during a drag remounts both groups, which cancels the drag.
  const [dragGeneration, setDragGeneration] = useState(0);
  const isDraggingRef = useRef(false);
  const currentEntryId = queue.current?.queueEntryId ?? null;
  useEffect(() => {
    if (isDraggingRef.current)
      setDragGeneration((generation) => generation + 1);
  }, [currentEntryId]);
  const onDragChange = useCallback((isDragging: boolean) => {
    isDraggingRef.current = isDragging;
  }, []);

  const requestFocus = (kind: GroupKind, request: QueueFocusRequest) =>
    setFocusRequests((previous) => ({ ...previous, [kind]: request }));

  function groupProps(kind: GroupKind, entries: readonly StudioQueueItem[]) {
    const move =
      kind === "user" ? player.moveUserItem : player.moveUpcomingSourceItem;
    return {
      entries,
      focusRequest: focusRequests[kind],
      onFocusHandled: () =>
        setFocusRequests((previous) =>
          previous[kind] ? { ...previous, [kind]: null } : previous,
        ),
      onDragChange,
      onPlay: (entry: StudioQueueItem) => player.playEntry(entry.queueEntryId),
      onMove: (
        fromIndex: number,
        toIndex: number,
        entry: StudioQueueItem,
        isFromButton: boolean,
      ) => {
        // Only Move up and Move down keep focus on themselves; a drag
        // leaves focus where it is.
        if (isFromButton) {
          const control = toIndex < fromIndex ? "moveUp" : "moveDown";
          requestFocus(
            kind,
            focusRequestFor({ entryId: entry.queueEntryId, control }, entries),
          );
        }
        move(fromIndex, toIndex);
        setAnnouncement(
          t("studio:queue.movedStatus", {
            title: entry.title,
            position: toIndex + 1,
          }),
        );
      },
      onRemove: (index: number) => {
        const entry = entries[index];
        if (!entry) return;
        requestFocus(
          kind,
          focusRequestFor(focusAfterRemoval(entries, index), entries),
        );
        player.removeEntry(entry.queueEntryId);
        // The Undo toast says what went, in its own live region.
        undo.offerRemoveUndo(entry, kind, index);
      },
    };
  }

  const NowHeading = headingLevel === 2 ? "h2" : "h3";
  const hasUserItems = queue.userItems.length > 0;

  return (
    <div className={styles.list}>
      <StudioQueueUndoRow notice={undo.notice} />
      {queue.current && (
        <section className={styles.group}>
          <NowHeading
            ref={nowHeadingRef}
            tabIndex={-1}
            className={styles.groupHeading}
          >
            {t("studio:queue.nowPlaying")}
          </NowHeading>
          <div className={`${styles.row} ${styles.rowCurrent}`}>
            <QueueRowSummary item={queue.current} />
          </div>
        </section>
      )}
      <StudioQueueGroup
        key={`user-${dragGeneration}`}
        heading={t("studio:queue.yours")}
        headingLevel={headingLevel}
        headingAction={
          <AnimatePresence initial={false}>
            {hasUserItems && (
              <ClearQueueButton
                key="clear"
                onClear={() => {
                  const clearedItems = queue.userItems;
                  requestFocus(
                    "user",
                    focusRequestFor("heading", clearedItems),
                  );
                  player.clearUserQueue();
                  undo.offerClearUndo(clearedItems);
                }}
              />
            )}
          </AnimatePresence>
        }
        emptyHint={
          <Collapse isOpen={!hasUserItems}>
            <p className={styles.hint}>{t("studio:queue.emptyHint")}</p>
          </Collapse>
        }
        {...groupProps("user", queue.userItems)}
      />
      <StudioQueueGroup
        key={`upcoming-${dragGeneration}`}
        heading={upcomingHeadingText(player, t)}
        headingLevel={headingLevel}
        emptyHint={
          <Collapse isOpen={queue.upcomingSourceItems.length === 0}>
            <p className={styles.hint}>{t("studio:queue.upcomingEmpty")}</p>
          </Collapse>
        }
        {...groupProps("upcoming", queue.upcomingSourceItems)}
      />
      <StudioQueuePlayed
        headingLevel={headingLevel}
        onBeforeClear={() => nowHeadingRef.current?.focus()}
      />
      <p className="visuallyHidden" role="status">
        {announcement}
      </p>
    </div>
  );
}
