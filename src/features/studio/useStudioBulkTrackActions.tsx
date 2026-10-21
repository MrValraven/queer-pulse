import { useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { FiList, FiPlusCircle } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioSelectionAction } from "./kit/StudioSelectionBar";
import type { StudioRowSelection } from "./kit/useStudioRowSelection";
import { useStudioQueueMany } from "./player/studioQueueActions";
import { StudioAddToPlaylistPicker } from "./StudioAddToPlaylistPicker";
import { studioErrorMessageKeyOf } from "./studioErrors.data";

/**
 * The bulk actions a playlist and Liked songs share in selection mode: Add
 * to playlist (the usual picker, with every picked track) and Add to queue.
 * `trackIdsOf` turns the picked row ids into the playable track ids, in list
 * order. Render `picker` once, beside the selection bar.
 */
export function useStudioBulkTrackActions(
  selection: StudioRowSelection,
  trackIdsOf: (rowIds: string[]) => string[],
): { actions: StudioSelectionAction[]; picker: ReactNode } {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { addManyToQueue } = useStudioQueueMany();
  const [pickTrackIds, setPickTrackIds] = useState<string[] | null>(null);

  /** One toast for the whole selection: all of it, part of it with the
   *  reason the rest stayed out, or none of it with that reason. */
  async function addToQueue(trackIds: string[]) {
    const { queuedCount, totalCount, error } = await addManyToQueue(trackIds);
    const reason = error ? t(studioErrorMessageKeyOf(error, "queue")) : "";
    if (queuedCount === 0) {
      showToast(
        reason
          ? t("studio:selection.queueFailedReasonToast", { reason })
          : t("studio:selection.queueFailedToast"),
        "error",
      );
      return;
    }
    if (queuedCount < totalCount)
      showToast(
        t("studio:selection.queuedSomeToast", {
          count: queuedCount,
          total: totalCount,
          reason,
        }).trim(),
        "warning",
      );
    else
      showToast(
        t("studio:selection.queuedToast", { count: queuedCount }),
        "success",
      );
    selection.clear();
  }

  const actions: StudioSelectionAction[] = [
    {
      id: "addToPlaylist",
      label: t("studio:selection.addToPlaylist"),
      icon: <FiPlusCircle aria-hidden />,
      onRun: (rowIds) => {
        const trackIds = trackIdsOf(rowIds);
        if (trackIds.length === 0) {
          showToast(t("studio:selection.nothingPlayableToast"), "info");
          return;
        }
        setPickTrackIds(trackIds);
      },
    },
    {
      id: "addToQueue",
      label: t("studio:selection.addToQueue"),
      icon: <FiList aria-hidden />,
      onRun: (rowIds) => {
        const trackIds = trackIdsOf(rowIds);
        if (trackIds.length === 0) {
          showToast(t("studio:selection.nothingPlayableToast"), "info");
          return;
        }
        void addToQueue(trackIds);
      },
    },
  ];

  const picker = (
    <AnimatePresence>
      {pickTrackIds && (
        <StudioAddToPlaylistPicker
          key="bulk-picker"
          trackIds={pickTrackIds}
          subjectTitle={t("studio:selection.pickerSubject", {
            count: pickTrackIds.length,
          })}
          onAdded={selection.clear}
          onClose={() => setPickTrackIds(null)}
        />
      )}
    </AnimatePresence>
  );
  return { actions, picker };
}
