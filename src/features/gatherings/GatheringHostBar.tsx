import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { EditDetailsModal } from "./EditDetailsModal";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { SeriesEditScopeModal } from "./SeriesEditScopeModal";
import {
  editDraftFromState,
  liveInitialState,
  liveStateKeepingGuests,
  type GatheringState,
} from "./manageGatheringState";
import { gatheringCancelledPath, type GatheringDetail } from "./data";
import { useAttendees } from "./api/useAttendees";
import { useCancelEvent, useUpdateEvent } from "./api/useEventMutations";
import { useDeleteGatheringFlow } from "./useDeleteGatheringFlow";
import { useGatheringEditSave } from "./useGatheringEditSave";
import {
  useRefreshGuestListAfterLeadChange,
  useSaveGuestCommunityChanges,
} from "./useSaveGuestCommunityChanges";
import { SavedGuestListContext } from "./savedGuestListContext";
import { useSeedGuestCommunities } from "./useSeedGuestCommunities";
import { GatheringHostMenu } from "./GatheringHostMenu";

/**
 * The host's tools on the public gathering page: a "more" menu in the page
 * header (`GatheringHostMenu`) plus the modals and confirms its actions open.
 *
 * A host standing on their own gathering could see everything a guest sees and
 * do none of it. The page already knew who they were (`viewerIsOrganizer`,
 * from the server's `isOrganizer`) and never used it, so the only route to
 * editing or calling the evening off was a link buried in My Events. Edit,
 * cancel and delete now act IN PLACE, on the page the host is already looking
 * at, and Manage carries them through to attendees, announcements and the
 * Check-in tab when they want the rest of it.
 *
 * They first shipped as a strip of four full-size buttons that competed with
 * the RSVP for attention; one icon button in the header keeps them a tap away.
 *
 * Edit and cancel run on the Manage page's own save path
 * (`useGatheringEditSave`, with `buildEditPatch`, the guest community
 * changes and MSG-10's this-vs-future prompt), so the two surfaces share
 * one meaning of "save".
 */
export function GatheringHostBar({
  gathering,
  routeParam,
}: {
  gathering: GatheringDetail;
  /** The raw `:slug` route param the detail query is keyed on. */
  routeParam: string | undefined;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const navigate = useNavigate();

  const updateEvent = useUpdateEvent(gathering.slug);
  const cancelEvent = useCancelEvent(gathering.slug);
  const { requestDelete, isDeletePending, deleteDialog } =
    useDeleteGatheringFlow({
      slug: gathering.slug,
      title: gathering.title,
      routeParam,
    });
  // The cancel confirm has to say how many people it actually tells, and the
  // detail DTO's `spots` line counts the seats LEFT. This is
  // the manage dashboard's own query under the same key, so a host who goes on
  // to Manage pays for it once, and it only runs for an organizer because the
  // whole host menu only mounts for one.
  const { data: attendees } = useAttendees(gathering.slug);
  const attendeeCount = attendees?.goingCount ?? 0;

  // The draft the edit modal opened on, or null while it is closed. Kept
  // whole because the modal freezes it, and Save reads the host's guest
  // changes against the list it holds.
  const [editInitial, setEditInitial] = useState<GatheringDetailsDraft | null>(
    null,
  );
  const [isCancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  // The PRE-edit snapshot `buildEditPatch` compares against (read its doc: the
  // community comparison depends on this being the PERSISTED value). Re-seeded
  // during render whenever the fetched gathering changes, so a second edit
  // after a save reads what the server now holds. A render-time reset lands
  // in the same commit as the new gathering, the pattern `useGatheringRsvp`
  // already uses on this page. The guest list has its own query, so the
  // re-seed keeps it (`liveStateKeepingGuests`).
  const [previousGathering, setPreviousGathering] = useState(gathering);
  const [gatheringState, setGatheringState] = useState<GatheringState>(() =>
    liveInitialState(gathering, fmt, t),
  );
  if (previousGathering !== gathering) {
    setPreviousGathering(gathering);
    setGatheringState((current) =>
      liveStateKeepingGuests(current, gathering, fmt, t),
    );
  }
  const { guestListStatus, retryGuestList } = useSeedGuestCommunities({
    slug: gathering.slug,
    setGatheringState,
  });
  const saveGuestCommunities = useSaveGuestCommunityChanges(gathering.slug);
  const refreshGuestListAfterLeadChange = useRefreshGuestListAfterLeadChange(
    gathering.slug,
  );

  // MSG-10 runs exactly as the Manage page runs it: a repeating gathering's
  // edit waits for the this-vs-future answer, and a picked cancel scope
  // cancels and leaves for the cancelled page.
  const editSave = useGatheringEditSave({
    isSeries: Boolean(gathering.series),
    gatheringState,
    setGatheringState,
    updateEvent,
    onSaveGuestCommunities: saveGuestCommunities,
    onLeadCommunityChanged: refreshGuestListAfterLeadChange,
    onChooseCancelScope: (scope) => {
      cancelEvent.mutate(scope);
      void navigate(gatheringCancelledPath(gathering.slug));
    },
  });

  // A repeating gathering asks which dates through the series prompt, the
  // same swap the manage dashboard makes; a single date gets the plain confirm.
  const askToCancel = () => {
    if (gathering.series) editSave.openCancelScope();
    else setCancelConfirmOpen(true);
  };

  const confirmCancel = () => {
    setCancelConfirmOpen(false);
    cancelEvent.mutate(undefined);
    void navigate(gatheringCancelledPath(gathering.slug));
  };

  return (
    <>
      <GatheringHostMenu
        slug={gathering.slug}
        title={gathering.title}
        isCancelled={gathering.cancelled === true}
        isCancelPending={cancelEvent.isPending}
        isDeletePending={isDeletePending}
        onEdit={() => setEditInitial(editDraftFromState(gatheringState))}
        onCancel={askToCancel}
        onDelete={requestDelete}
      />

      {editInitial && (
        // The guest field reads the saved list from here, and shows it
        // loading when the modal opened before the list answered.
        <SavedGuestListContext.Provider
          value={{
            status: guestListStatus,
            guests: gatheringState.guestCommunities ?? [],
            onRetry: retryGuestList,
          }}
        >
          <EditDetailsModal
            initial={editInitial}
            onClose={() => {
              setEditInitial(null);
              // MSG-10. A save on a repeating gathering stashed its patch to
              // send later; closing the modal is the cue to ask
              // this-vs-future.
              editSave.askScopeForPendingEdit();
            }}
            onSave={(draft) =>
              editSave.saveEditDraft(draft, editInitial.guestCommunities)
            }
          />
        </SavedGuestListContext.Provider>
      )}

      {editSave.seriesScopeModal && (
        <SeriesEditScopeModal
          mode={editSave.seriesScopeModal}
          onChoose={editSave.chooseSeriesScope}
          onClose={editSave.closeSeriesScope}
        />
      )}

      <ConfirmDialog
        open={isCancelConfirmOpen}
        tone="destructive"
        loading={cancelEvent.isPending}
        title={t("gatherings:hostBar.cancelTitle", { title: gathering.title })}
        description={t("gatherings:hostBar.cancelBody", {
          count: attendeeCount,
        })}
        confirmLabel={t("gatherings:hostBar.cancelConfirmCta")}
        cancelLabel={t("gatherings:hostBar.cancelKeepCta")}
        onConfirm={confirmCancel}
        onClose={() => setCancelConfirmOpen(false)}
      />

      {deleteDialog}
    </>
  );
}
