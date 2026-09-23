import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { EditDetailsModal } from "./EditDetailsModal";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import { SeriesEditScopeModal } from "./SeriesEditScopeModal";
import type { SeriesScopeModalMode } from "./ManageGatheringModals";
import {
  applyEditDraft,
  buildEditPatch,
  editDraftCareFields,
  editDraftFormatFields,
  liveInitialState,
  type GatheringState,
} from "./manageGatheringState";
import { dateToDatetimeValue } from "./manageGatheringDates";
import { gatheringCancelledPath, type GatheringDetail } from "./data";
import type { SeriesScope, UpdateEventDto } from "./api/events.api";
import { useAttendees } from "./api/useAttendees";
import { useCancelEvent, useUpdateEvent } from "./api/useEventMutations";
import { useDeleteGatheringFlow } from "./useDeleteGatheringFlow";
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
 * day-of dashboard when they want the rest of it.
 *
 * They first shipped as a strip of four full-size buttons that competed with
 * the RSVP for attention; one icon button in the header keeps them a tap away.
 *
 * Edit and cancel run on the manage dashboard's own layer (`liveInitialState`
 * / `applyEditDraft` / `buildEditPatch`, `EditDetailsModal`,
 * `SeriesEditScopeModal`), so the two surfaces cannot drift into two different
 * meanings of "save" or two different answers to MSG-10's this-vs-future.
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
  // detail DTO's `spots` line is seats LEFT rather than a head count. This is
  // the manage dashboard's own query under the same key, so a host who goes on
  // to Manage pays for it once, and it only runs for an organizer because the
  // whole host menu only mounts for one.
  const { data: attendees } = useAttendees(gathering.slug);
  const attendeeCount = attendees?.goingCount ?? 0;

  const [isEditOpen, setEditOpen] = useState(false);
  const [isCancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  // MSG-10, exactly as the manage dashboard does it: a repeating gathering
  // asks this-vs-future, and a saved edit's patch waits in `pendingEditPatch`
  // until the host answers.
  const [seriesScopeModal, setSeriesScopeModal] =
    useState<SeriesScopeModalMode>(null);
  const [pendingEditPatch, setPendingEditPatch] =
    useState<UpdateEventDto | null>(null);

  // The PRE-edit snapshot `buildEditPatch` compares against (read its doc: the
  // community comparison depends on this being the PERSISTED value). Re-seeded
  // during render whenever the fetched gathering changes, so a second edit
  // after a save reads what the server now holds instead of a snapshot frozen
  // at mount. Render-time reset rather than an effect, so it lands in the same
  // commit, the pattern `useGatheringRsvp` already uses on this page.
  const [previousGathering, setPreviousGathering] = useState(gathering);
  const [gatheringState, setGatheringState] = useState<GatheringState>(() =>
    liveInitialState(gathering, fmt, t),
  );
  if (previousGathering !== gathering) {
    setPreviousGathering(gathering);
    setGatheringState(liveInitialState(gathering, fmt, t));
  }

  const saveEditDraft = (draft: GatheringDetailsDraft) => {
    setGatheringState((current) => applyEditDraft(current, draft, fmt, t));
    const patch = buildEditPatch(gatheringState, draft);
    if (gathering.series) setPendingEditPatch(patch);
    else updateEvent.mutate(patch);
  };

  // The host's answer to `SeriesEditScopeModal`: fires the deferred cancel or
  // edit with the scope they picked.
  const chooseSeriesScope = (scope: SeriesScope) => {
    const mode = seriesScopeModal;
    setSeriesScopeModal(null);
    if (mode === "cancel") {
      cancelEvent.mutate(scope);
      void navigate(gatheringCancelledPath(gathering.slug));
    } else if (mode === "edit" && pendingEditPatch) {
      updateEvent.mutate({ ...pendingEditPatch, seriesScope: scope });
      setPendingEditPatch(null);
    }
  };

  // A repeating gathering asks which dates instead of the plain confirm, the
  // same swap the manage dashboard makes.
  const askToCancel = () => {
    if (gathering.series) setSeriesScopeModal("cancel");
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
        onEdit={() => setEditOpen(true)}
        onCancel={askToCancel}
        onDelete={requestDelete}
      />

      {isEditOpen && (
        <EditDetailsModal
          initial={{
            title: gatheringState.title,
            startAt: dateToDatetimeValue(gatheringState.startAt),
            // "" when the gathering states no end, which the modal reads as
            // an empty (and still clearable) end field.
            endAt: gatheringState.endAt
              ? dateToDatetimeValue(gatheringState.endAt)
              : "",
            location: gatheringState.location,
            description: gatheringState.description,
            visibility: gatheringState.visibility,
            communitySlug: gatheringState.communitySlug,
            // Family, format, the host's own words and the details bag, read
            // off the persisted state in one place (see its doc for how a
            // stored value that is not a catalog key opens the modal).
            ...editDraftFormatFields(gatheringState),
            // The cover, care and RSVP settings, read the same way.
            ...editDraftCareFields(gatheringState),
          }}
          onClose={() => {
            setEditOpen(false);
            // MSG-10. A save on a repeating gathering stashed its patch
            // instead of sending it; closing the modal is the cue to ask
            // this-vs-future.
            if (pendingEditPatch) setSeriesScopeModal("edit");
          }}
          onSave={saveEditDraft}
        />
      )}

      {seriesScopeModal && (
        <SeriesEditScopeModal
          mode={seriesScopeModal}
          onChoose={chooseSeriesScope}
          onClose={() => {
            setSeriesScopeModal(null);
            setPendingEditPatch(null);
          }}
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
