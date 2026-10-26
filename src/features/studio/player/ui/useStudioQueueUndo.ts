import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  studioErrorMessageKey,
  studioErrorMessageKeyOf,
} from "../../studioErrors.data";
import { useStudioPlayer, type StudioQueueItem } from "../studioPlayerContext";
import {
  sourceIndexAtRemovalOf,
  takeLastQueueFailure,
} from "../studioQueueActions";

/** As long as the Undo stays up: long enough to read and reach (DES-26). */
export const QUEUE_UNDO_MS = 5200;

/** What the queue says after a removal, inside Now playing: the dialog is
 *  `aria-modal`, so the app's toasts outside it are out of reach there. */
export interface QueueUndoNotice {
  id: number;
  message: string;
  /** Absent on a line that only reports (an Undo that could not land). */
  onUndo?: () => void;
}

type RemovedGroup = "user" | "upcoming";

let noticeCount = 0;

/** The line, with Undo when given: a toast on the page, or an inline row
 *  plus the queue's status line inside Now playing. */
function useQueueNotice(isInDialog: boolean, announce: (text: string) => void) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [notice, setNotice] = useState<QueueUndoNotice | null>(null);
  const timerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );
  const dismiss = useCallback(() => setNotice(null), []);
  const show = useCallback(
    (message: string, onUndo?: () => void) => {
      if (!isInDialog) {
        if (onUndo)
          showToast(message, "info", QUEUE_UNDO_MS, {
            label: t("studio:queue.undo"),
            onClick: onUndo,
          });
        else showToast(message, "error");
        return;
      }
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      noticeCount += 1;
      const id = noticeCount;
      setNotice({ id, message, onUndo });
      announce(message);
      timerRef.current = window.setTimeout(() => {
        setNotice((current) => (current?.id === id ? null : current));
      }, QUEUE_UNDO_MS);
    },
    [announce, isInDialog, showToast, t],
  );
  return { notice, show, dismiss };
}

/**
 * Clear queue and Remove act at once and offer Undo, so one mis-tap never
 * wipes a hand-built queue. On the page the Undo rides in a toast; inside
 * Now playing it is an inline row in the queue, with the same line on the
 * queue's status region. Each Undo runs once, so a double tap on a leaving
 * toast never adds the tracks twice. A row of Your queue goes back to its
 * own place through the player's restore, and a "Next from" row back to its
 * own slot in the source, never before the track playing now. Neither reads
 * the network, so Undo works offline. Only when a restore cannot land on a
 * live queue does the row join the end of Your queue through Add to queue.
 * A track that cannot come back says why. Nothing here leaves this tab.
 */
export function useStudioQueueUndo({
  isInDialog,
  announce,
}: {
  isInDialog: boolean;
  announce: (text: string) => void;
}) {
  const { t } = useTranslation();
  const player = useStudioPlayer();
  const playerRef = useRef(player);
  useLayoutEffect(() => {
    playerRef.current = player;
  });
  const { notice, show, dismiss } = useQueueNotice(isInDialog, announce);

  /** Why a track did not come back: Hide explicit, or the read's own reason
   *  (offline, access, gone), else that it can no longer play. */
  const failureMessageOf = useCallback(
    (item: StudioQueueItem) => {
      if (item.isExplicit && playerRef.current.playbackSettings.hideExplicit)
        return t("studio:queue.undoHiddenExplicitToast", { title: item.title });
      const failure = takeLastQueueFailure();
      const reasonKey =
        failure === null || failure === undefined
          ? null
          : studioErrorMessageKeyOf(failure, "queue");
      if (reasonKey && reasonKey !== studioErrorMessageKey(null))
        return t(reasonKey);
      return t("studio:queue.undoUnavailableToast", { title: item.title });
    },
    [t],
  );

  /** Re-adds through Add to queue and moves the rows to `atIndex`. The
   *  moves queue behind the adds in the player's own order. */
  const readd = useCallback(
    async (items: readonly StudioQueueItem[], atIndex: number) => {
      const lengthBefore = playerRef.current.queue.userItems.length;
      let restoredCount = 0;
      for (const item of items) {
        if (!(await playerRef.current.addToQueue(item.trackId))) {
          show(failureMessageOf(item));
          break;
        }
        restoredCount += 1;
      }
      const targetIndex = Math.min(atIndex, lengthBefore);
      for (let offset = 0; offset < restoredCount; offset += 1)
        playerRef.current.moveUserItem(
          lengthBefore + offset,
          targetIndex + offset,
        );
    },
    [failureMessageOf, show],
  );

  /** Rows of Your queue go back exactly through the player's restore. */
  const restoreUserRows = useCallback(
    (items: readonly StudioQueueItem[], atIndex: number) => {
      const restoreEntry = playerRef.current.restoreQueueEntry;
      if (!restoreEntry) return readd(items, atIndex);
      items.forEach((item, offset) => {
        const isBack = restoreEntry(item, "user", atIndex + offset);
        if (!isBack && playerRef.current.queue.current === null)
          show(t("studio:queue.undoStoppedToast", { title: item.title }));
      });
    },
    [readd, show, t],
  );

  /** A "Next from" row goes back to its slot in the source: `index` is its
   *  place among the upcoming rows, after the source position it left at. */
  const restoreUpcomingRow = useCallback(
    (
      item: StudioQueueItem,
      index: number,
      sourceIndexAtRemoval: number | null,
    ) => {
      const restoreEntry = playerRef.current.restoreQueueEntry;
      const isBack =
        restoreEntry !== undefined &&
        sourceIndexAtRemoval !== null &&
        restoreEntry(item, "source", sourceIndexAtRemoval + 1 + index);
      if (isBack) return;
      if (playerRef.current.queue.current === null) {
        show(t("studio:queue.undoStoppedToast", { title: item.title }));
        return;
      }
      return readd([item], Number.POSITIVE_INFINITY);
    },
    [readd, show, t],
  );

  const offer = useCallback(
    (message: string, restore: () => unknown) => {
      let hasRun = false;
      show(message, () => {
        if (hasRun) return;
        hasRun = true;
        dismiss();
        void restore();
      });
    },
    [dismiss, show],
  );

  return {
    notice,
    dismissNotice: dismiss,
    offerRemoveUndo: (
      item: StudioQueueItem,
      group: RemovedGroup,
      index: number,
    ) => {
      // Read now: the player noted the source position as the row left.
      const sourceIndexAtRemoval =
        group === "upcoming" ? sourceIndexAtRemovalOf(item.queueEntryId) : null;
      offer(t("studio:queue.removedToast", { title: item.title }), () =>
        group === "user"
          ? restoreUserRows([item], index)
          : restoreUpcomingRow(item, index, sourceIndexAtRemoval),
      );
    },
    offerClearUndo: (items: readonly StudioQueueItem[]) =>
      offer(t("studio:queue.clearedToast", { count: items.length }), () =>
        restoreUserRows(items, 0),
      ),
  };
}
