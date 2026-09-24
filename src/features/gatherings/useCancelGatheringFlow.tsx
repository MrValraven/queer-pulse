import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { gatheringCancelledPath } from "./data";
import type { useCancelEvent } from "./api/useEventMutations";

/**
 * The manage dashboard's "cancel this standalone gathering" confirm: the same
 * `ConfirmDialog`, copy and follow-through (`gatheringCancelledPath`) that
 * `GatheringHostBar` opens from the public page, so both doors ask the host
 * one question in one voice.
 *
 * Takes the page's own `cancelEvent` mutation, which the series branch
 * (`SeriesEditScopeModal`) also fires, so the dialog's pending state tracks
 * the one request either path sends. The caller renders `cancelDialog` once
 * and calls `requestCancel` for a gathering outside a series.
 */
export function useCancelGatheringFlow({
  slug,
  title,
  attendeeCount,
  cancelEvent,
}: {
  slug: string;
  /** Named in the confirm title. */
  title: string;
  /** The people holding a seat, who the confirm says are told. */
  attendeeCount: number;
  cancelEvent: ReturnType<typeof useCancelEvent>;
}): { requestCancel: () => void; cancelDialog: ReactNode } {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isCancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const confirmCancel = () => {
    setCancelConfirmOpen(false);
    cancelEvent.mutate(undefined);
    void navigate(gatheringCancelledPath(slug));
  };

  const cancelDialog = (
    <ConfirmDialog
      open={isCancelConfirmOpen}
      tone="destructive"
      loading={cancelEvent.isPending}
      title={t("gatherings:hostBar.cancelTitle", { title })}
      description={t("gatherings:hostBar.cancelBody", {
        count: attendeeCount,
      })}
      confirmLabel={t("gatherings:hostBar.cancelConfirmCta")}
      cancelLabel={t("gatherings:hostBar.cancelKeepCta")}
      onConfirm={confirmCancel}
      onClose={() => setCancelConfirmOpen(false)}
    />
  );

  return { requestCancel: () => setCancelConfirmOpen(true), cancelDialog };
}
