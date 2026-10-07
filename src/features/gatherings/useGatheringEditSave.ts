import { useState, type Dispatch, type SetStateAction } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { SeriesScope, UpdateEventDto } from "./api/events.api";
import type { useUpdateEvent } from "./api/useEventMutations";
import type { GatheringDetailsDraft } from "./editDetailsDraft";
import type { SeriesScopeModalMode } from "./ManageGatheringModals";
import type { VenueSelection } from "./VenuePicker";
import {
  applyEditDraft,
  applyVenueSelection,
  buildEditPatch,
  buildFieldEditPatch,
  changedEditableFields,
  type GatheringState,
} from "./manageGatheringState";

/** An edit to a repeating gathering, held until the host picks a scope. */
interface PendingEdit {
  patch: UpdateEventDto;
  /** The dashboard as it stood before the edit folded in. Dismissing the
   *  scope prompt sends nothing, so the screen goes back to this. */
  snapshot: GatheringState;
  /** Field and venue saves confirm with a toast once the server holds the
   *  change; the full edit modal shows its own success panel. */
  shouldToast: boolean;
}

/**
 * How the manage dashboard saves an edit, and the MSG-10 this-vs-future
 * prompt a repeating gathering asks first.
 *
 * Three kinds of edit arrive here. The full edit modal sends `buildEditPatch`,
 * its whole draft, and asks its scope once the modal closes (prompt mode
 * `"edit"`). A focused Overview editor (`GatheringFieldEditor`) sends only the
 * field it changed (`buildFieldEditPatch`), and the venue editor sends the
 * venue with its listing link and address. Those two ask their scope at once
 * (prompt mode `"editField"`, whose copy speaks of one change) and confirm
 * with the "Saved" toast. Every edit folds into local state at once; on a
 * repeating gathering it waits in `pendingEdit` until the host picks a scope,
 * and a dismissed prompt puts the pre-edit state back.
 *
 * A schedule-only field save skips the prompt: the server never copies a
 * start or an end onto the other dates in a series (events.service.ts
 * `update()` strips both before it touches them), so "this date" is the
 * only answer it could act on.
 *
 * Safe in demo: `useUpdateEvent` resolves there without a request.
 */
export function useGatheringEditSave({
  isSeries,
  gatheringState,
  setGatheringState,
  updateEvent,
  onChooseCancelScope,
}: {
  isSeries: boolean;
  gatheringState: GatheringState;
  setGatheringState: Dispatch<SetStateAction<GatheringState>>;
  updateEvent: ReturnType<typeof useUpdateEvent>;
  /** The host's scope answer for a cancel the page asked about. */
  onChooseCancelScope: (scope: SeriesScope) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [seriesScopeModal, setSeriesScopeModal] =
    useState<SeriesScopeModalMode>(null);
  const [pendingEdit, setPendingEdit] = useState<PendingEdit | null>(null);

  // Sends an edit and, for a field or venue save, confirms it once the
  // server holds it. `mutateAsync` ties the toast to THIS call: TanStack v5
  // fires a per-call `onSuccess` on `mutate` only for the latest call.
  const sendEdit = (
    patch: UpdateEventDto & { seriesScope?: SeriesScope },
    shouldToast: boolean,
  ) =>
    updateEvent
      .mutateAsync(patch)
      .then(() => {
        if (shouldToast)
          showToast(t("gatherings:manage.overview.savedToast"), "success");
      })
      .catch(() => {
        // Already shown: the app-wide MutationCache `onError`
        // (shared/api/errorHandling.ts `handleMutationError`) toasts every
        // failed write that does not opt out with `meta.silentError`, and
        // `useUpdateEvent` does not.
      });

  // Reads `gatheringState` from this render, the PRE-edit snapshot. One
  // pending edit is all there can be: the full modal saves once per opening
  // and asks on close, and the field and venue editors ask at once, so the
  // modal prompt is up before another editor can open.
  const stashEdit = (patch: UpdateEventDto, shouldToast: boolean) =>
    setPendingEdit({ patch, snapshot: gatheringState, shouldToast });

  // The full edit modal's save. `buildEditPatch` reads the PRE-edit snapshot
  // from this closure's `gatheringState`; see its doc for why that matters.
  const saveEditDraft = (draft: GatheringDetailsDraft) => {
    setGatheringState((current) => applyEditDraft(current, draft, fmt, t));
    const patch = buildEditPatch(gatheringState, draft);
    if (isSeries) stashEdit(patch, false);
    else void sendEdit(patch, false);
  };

  // A focused editor's save. The editor closes itself right after, so a
  // repeating gathering asks its scope here (the full modal asks on close).
  const saveFieldEdit = (draft: GatheringDetailsDraft) => {
    const fields = changedEditableFields(gatheringState, draft);
    // `canSaveFieldEdit` holds all three of these in the editor already.
    // Checked again here because the server refuses an empty description
    // with a 400, and an unreadable start would throw in `toISOString`,
    // while the screen would already show the edit folded in.
    if (fields.length === 0) return;
    if (fields.includes("description") && !draft.description.trim()) return;
    if (
      fields.includes("schedule") &&
      Number.isNaN(new Date(draft.startAt).getTime())
    ) {
      return;
    }
    const patch = buildFieldEditPatch(gatheringState, draft);
    // The description folds in as the trimmed text the patch sends.
    const foldedDraft = fields.includes("description")
      ? { ...draft, description: draft.description.trim() }
      : draft;
    setGatheringState((current) =>
      applyEditDraft(current, foldedDraft, fmt, t),
    );
    const isScheduleOnly = fields.every((field) => field === "schedule");
    if (isSeries && !isScheduleOnly) {
      stashEdit(patch, true);
      setSeriesScopeModal("editField");
      return;
    }
    void sendEdit(isSeries ? { ...patch, seriesScope: "this" } : patch, true);
  };

  // The venue editor's save, which keeps the directory listing link a
  // plain-text draft would drop. A repeating gathering asks its scope at
  // once, the same as a field save.
  const saveVenue = (selection: VenueSelection) => {
    const patch: UpdateEventDto = {
      venue: selection.text,
      listingId: selection.listingId,
      ...(selection.address ? { address: selection.address } : {}),
    };
    setGatheringState((current) => applyVenueSelection(current, selection));
    if (isSeries) {
      stashEdit(patch, true);
      setSeriesScopeModal("editField");
      return;
    }
    void sendEdit(patch, true);
  };

  // The full modal closed: a save it stashed now asks this-vs-future.
  const askScopeForPendingEdit = () => {
    if (pendingEdit) setSeriesScopeModal("edit");
  };

  // The host's answer to the `SeriesEditScopeModal` prompt. It fires the
  // deferred cancel or edit with the chosen `SeriesScope`.
  const chooseSeriesScope = (scope: SeriesScope) => {
    const mode = seriesScopeModal;
    setSeriesScopeModal(null);
    if (mode === "cancel") {
      onChooseCancelScope(scope);
    } else if ((mode === "edit" || mode === "editField") && pendingEdit) {
      void sendEdit(
        { ...pendingEdit.patch, seriesScope: scope },
        pendingEdit.shouldToast,
      );
      setPendingEdit(null);
    }
  };

  // Dismissed without an answer: nothing was sent, so an edit already shown
  // on screen is taken back off it. Restored over the latest state, keeping
  // a cover saved meanwhile unless this edit is the one that changed it.
  const closeSeriesScope = () => {
    setSeriesScopeModal(null);
    if (pendingEdit) {
      const { patch, snapshot } = pendingEdit;
      setGatheringState((current) =>
        patch.coverImageUrl === undefined
          ? { ...snapshot, coverImageUrl: current.coverImageUrl }
          : snapshot,
      );
      setPendingEdit(null);
    }
  };

  return {
    seriesScopeModal,
    openCancelScope: () => setSeriesScopeModal("cancel"),
    saveEditDraft,
    saveFieldEdit,
    saveVenue,
    askScopeForPendingEdit,
    chooseSeriesScope,
    closeSeriesScope,
  };
}
