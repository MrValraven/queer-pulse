import {
  EditDetailsModal,
  type GatheringDetailsDraft,
} from "./EditDetailsModal";
import { MessageAttendeesModal } from "./MessageAttendeesModal";
import { SeriesEditScopeModal } from "./SeriesEditScopeModal";
import type { SeriesScope } from "./api/events.api";

/** Which this-vs-future prompt is open, if any (MSG-10). */
export type SeriesScopeModalMode = "edit" | "cancel" | null;

/**
 * Every modal the manage dashboard can raise, in one place: edit details, the
 * recurring-series this-vs-future prompt, and the demo-only message-attendees
 * composer. Purely a shell — each modal owns its own state, and every decision
 * about what to do with the result stays on the page.
 */
export function ManageGatheringModals({
  editInitial,
  onCloseEdit,
  onSaveEdit,
  seriesScopeMode,
  onChooseSeriesScope,
  onCloseSeriesScope,
  isMessageOpen,
  attendeeCount,
  onCloseMessage,
}: {
  /** The edit modal's starting draft, or null when it isn't open. */
  editInitial: GatheringDetailsDraft | null;
  onCloseEdit: () => void;
  onSaveEdit: (draft: GatheringDetailsDraft) => void;
  seriesScopeMode: SeriesScopeModalMode;
  onChooseSeriesScope: (scope: SeriesScope) => void;
  onCloseSeriesScope: () => void;
  isMessageOpen: boolean;
  attendeeCount: number;
  onCloseMessage: () => void;
}) {
  return (
    <>
      {editInitial && (
        <EditDetailsModal
          initial={editInitial}
          onClose={onCloseEdit}
          onSave={onSaveEdit}
        />
      )}

      {seriesScopeMode && (
        <SeriesEditScopeModal
          mode={seriesScopeMode}
          onChoose={onChooseSeriesScope}
          onClose={onCloseSeriesScope}
        />
      )}

      {isMessageOpen && (
        <MessageAttendeesModal
          attendeeCount={attendeeCount}
          onClose={onCloseMessage}
        />
      )}
    </>
  );
}
