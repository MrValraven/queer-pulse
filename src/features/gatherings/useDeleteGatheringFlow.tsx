import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { ApiError } from "../../shared/api/client";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { eventKeys } from "./api/eventKeys";
import { useDeleteEvent } from "./api/useEventMutations";

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
 * The whole "delete this gathering" flow: the confirm dialog, the mutation,
 * and what happens after it (drop the cached detail, toast, back to the
 * events board, or a toast naming why the server refused).
 *
 * Shared by the public page's `GatheringHostBar` and the manage dashboard's
 * Danger zone so both doors ask the same question and read a refusal the same
 * way. The caller renders `deleteDialog` once and calls `requestDelete` from
 * its button. Demo mode runs the same flow, since `useDeleteEvent` resolves
 * without a request there.
 */
export function useDeleteGatheringFlow({
  slug,
  title,
  routeParam,
}: {
  slug: string;
  /** Named in the confirm title and the success toast. */
  title: string;
  /** The raw `:slug` route param the detail query is keyed on. */
  routeParam: string | undefined;
}): {
  requestDelete: () => void;
  isDeletePending: boolean;
  deleteDialog: ReactNode;
} {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const deleteEvent = useDeleteEvent(slug);
  const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

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
        showToast(t("gatherings:hostBar.deletedToast", { title }), "success");
        void navigate(routes.events);
      },
      onError: (error) => {
        setDeleteConfirmOpen(false);
        showToast(deleteErrorMessage(error, t), "error");
      },
    });
  };

  const deleteDialog = (
    <ConfirmDialog
      open={isDeleteConfirmOpen}
      tone="destructive"
      loading={deleteEvent.isPending}
      title={t("gatherings:hostBar.deleteTitle", { title })}
      description={t("gatherings:hostBar.deleteBody")}
      confirmLabel={t("gatherings:hostBar.deleteConfirmCta")}
      cancelLabel={t("gatherings:hostBar.deleteKeepCta")}
      onConfirm={confirmDelete}
      onClose={() => setDeleteConfirmOpen(false)}
    />
  );

  return {
    requestDelete: () => setDeleteConfirmOpen(true),
    isDeletePending: deleteEvent.isPending,
    deleteDialog,
  };
}
