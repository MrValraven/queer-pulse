import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FiEdit2, FiSettings, FiSlash, FiTool, FiTrash2 } from "react-icons/fi";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { ApiError } from "../../shared/api/client";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import {
  EditDetailsModal,
  type GatheringDetailsDraft,
} from "./EditDetailsModal";
import { SeriesEditScopeModal } from "./SeriesEditScopeModal";
import type { SeriesScopeModalMode } from "./ManageGatheringModals";
import {
  applyEditDraft,
  buildEditPatch,
  editDraftFormatFields,
  liveInitialState,
  type GatheringState,
} from "./manageGatheringState";
import { dateToDatetimeValue } from "./manageGatheringDates";
import {
  gatheringCancelledPath,
  manageGatheringPath,
  type GatheringDetail,
} from "./data";
import type { SeriesScope, UpdateEventDto } from "./api/events.api";
import { eventKeys } from "./api/eventKeys";
import { useAttendees } from "./api/useAttendees";
import {
  useCancelEvent,
  useDeleteEvent,
  useUpdateEvent,
} from "./api/useEventMutations";
import styles from "./GatheringHostBar.module.css";

/**
 * Why a delete was refused, in the host's own terms.
 *
 * The 409 is the one worth spelling out: the gathering is still published and
 * people are holding RSVPs or invites, so removing it would make an evening
 * vanish off their plans with nobody told. Cancelling first is the fix,
 * because cancel is the path that notifies. The 403 is a co-host, who may call
 * a gathering off and may not erase it.
 *
 * Reads the STATUS, the way `rsvpErrors` reads a refused RSVP, since these are
 * plain HTTP outcomes with no typed discriminator behind them (a code-bearing
 * refusal is read by `code` instead: see `isAttendanceWindowClosed`).
 */
function deleteErrorMessage(error: unknown, t: TFunction): string {
  if (error instanceof ApiError) {
    if (error.status === 409) return t("gatherings:hostBar.deleteBlockedToast");
    if (error.status === 403)
      return t("gatherings:hostBar.deleteHostOnlyToast");
    if (error.status === 404) return t("gatherings:hostBar.deleteGoneToast");
  }
  return t("gatherings:hostBar.deleteFailedToast");
}

/**
 * The strip itself: a label saying whose controls these are, then the four
 * actions. Presentational, so every decision about what an action MEANS stays
 * in `GatheringHostBar` below with the mutations and the modals.
 */
function GatheringHostActionRow({
  slug,
  isCancelled,
  isCancelPending,
  isDeletePending,
  onEdit,
  onCancel,
  onDelete,
}: {
  slug: string;
  /** The gathering has already been called off. */
  isCancelled: boolean;
  isCancelPending: boolean;
  isDeletePending: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.bar}>
      <span className={styles.label}>
        <span className={styles.labelIcon} aria-hidden>
          <FiTool />
        </span>
        {t("gatherings:hostBar.label")}
      </span>
      <div className={styles.actions}>
        <Button size="sm" variant="ghost" onClick={onEdit}>
          <FiEdit2 aria-hidden /> {t("gatherings:hostBar.editCta")}
        </Button>
        {/* The way through to attendees, announcements and the day-of
            dashboard, kept quiet: the in-place actions are what a host
            standing on this page usually wants. */}
        <Button size="sm" variant="ghost" to={manageGatheringPath(slug)}>
          <FiSettings aria-hidden /> {t("gatherings:hostBar.manageCta")}
        </Button>
        {/* A gathering already called off has nothing left to cancel, and the
            banner above this bar already says so. */}
        {!isCancelled && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={isCancelPending}
          >
            <FiSlash aria-hidden /> {t("gatherings:hostBar.cancelCta")}
          </Button>
        )}
        <Button
          size="sm"
          variant="danger"
          onClick={onDelete}
          disabled={isDeletePending}
        >
          <FiTrash2 aria-hidden /> {t("gatherings:hostBar.deleteCta")}
        </Button>
      </div>
    </div>
  );
}

/**
 * The host's action strip on the public gathering page.
 *
 * A host standing on their own gathering could see everything a guest sees and
 * do none of it. The page already knew who they were (`viewerIsOrganizer`,
 * from the server's `isOrganizer`) and never used it, so the only route to
 * editing or calling the evening off was a link buried in My Events. Edit,
 * cancel and delete now act IN PLACE, on the page the host is already looking
 * at, and Manage carries them through to attendees, announcements and the
 * day-of dashboard when they want the rest of it.
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
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const updateEvent = useUpdateEvent(gathering.slug);
  const cancelEvent = useCancelEvent(gathering.slug);
  const deleteEvent = useDeleteEvent(gathering.slug);
  // The cancel confirm has to say how many people it actually tells, and the
  // detail DTO's `spots` line is seats LEFT rather than a head count. This is
  // the manage dashboard's own query under the same key, so a host who goes on
  // to Manage pays for it once, and it only runs for an organizer because the
  // whole bar only mounts for one.
  const { data: attendees } = useAttendees(gathering.slug);
  const attendeeCount = attendees?.goingCount ?? 0;

  const [isEditOpen, setEditOpen] = useState(false);
  const [isCancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
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

  const confirmDelete = () => {
    deleteEvent.mutate(undefined, {
      onSuccess: () => {
        // The detail query is keyed on the RAW route param, and invalidating
        // it would only schedule a refetch that now 404s. Drop the entry so a
        // back-navigation cannot repaint the deleted gathering from cache.
        queryClient.removeQueries({
          queryKey: eventKeys.detail(routeParam, demoMode),
        });
        setDeleteConfirmOpen(false);
        showToast(
          t("gatherings:hostBar.deletedToast", { title: gathering.title }),
          "success",
        );
        void navigate(routes.events);
      },
      onError: (error) => {
        setDeleteConfirmOpen(false);
        showToast(deleteErrorMessage(error, t), "error");
      },
    });
  };

  return (
    <>
      <GatheringHostActionRow
        slug={gathering.slug}
        isCancelled={gathering.cancelled === true}
        isCancelPending={cancelEvent.isPending}
        isDeletePending={deleteEvent.isPending}
        onEdit={() => setEditOpen(true)}
        onCancel={askToCancel}
        onDelete={() => setDeleteConfirmOpen(true)}
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

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        tone="destructive"
        loading={deleteEvent.isPending}
        title={t("gatherings:hostBar.deleteTitle", { title: gathering.title })}
        description={t("gatherings:hostBar.deleteBody")}
        confirmLabel={t("gatherings:hostBar.deleteConfirmCta")}
        cancelLabel={t("gatherings:hostBar.deleteKeepCta")}
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirmOpen(false)}
      />
    </>
  );
}
