import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ListingStatus } from "../../marketing/listBusiness/listBusiness.data";
import { useSetListingStatus } from "./useSetListingStatus";
import { useRemoveListing } from "./useRemoveListing";
import { useAskListingQuestion } from "./useAskListingQuestion";
import type { ListingQueueRow } from "./adminListings.api";

export interface UseListingModerationOptions {
  /** Called after `moveTo`/`sendBack`/`remove` resolves successfully — the
   *  drawer passes its own `onClose` here so any completed action dismisses
   *  it. Asking a question completes through `AskQuestionModal`'s own
   *  `onAsked`, not this. */
  onDone?: () => void;
}

/**
 * The single place a moderator's actions on one queue row live: status moves,
 * send-back, remove, and ask — composing `useSetListingStatus` /
 * `useRemoveListing` / `useAskListingQuestion`. Each of those mutations
 * already patches the shared `[admin-listings]` cache directly (see
 * `patchListingInCache` in `useAdminListings`), so no page needs a local
 * status-override or removed-refs map. `isPending` is unified across all
 * three mutations so every button driven by this hook — row, drawer, and the
 * confirm/ask modals — disables together (fixing the old inconsistent
 * disabled-state coverage).
 *
 * `reason` on `sendBack`/`remove` is optional moderator free text, forwarded
 * to `useSetListingStatus`/`useRemoveListing` and on to the live-mode PATCH
 * `/listings/:ref/status` and DELETE `/listings/admin/:ref` bodies, which the
 * backend records on the listing's moderation event (and DMs to the
 * submitter on send-back/remove — see `listings.service.ts`). Demo mode logs
 * it (`logInfo`) rather than sending it anywhere; the demo history panel
 * reads a static fixture, not a live session log.
 */
export function useListingModeration(
  row: ListingQueueRow,
  { onDone }: UseListingModerationOptions = {},
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const setStatus = useSetListingStatus();
  const removeListing = useRemoveListing();
  const askQuestion = useAskListingQuestion();

  function moveTo(status: ListingStatus) {
    setStatus.mutate(
      { row, status },
      {
        onSuccess: () => {
          showToast(
            t("admin:adminListings.toast.moved", {
              name: row.name,
              status: t(`admin:adminListings.status.${status}`),
            }),
            "success",
          );
          onDone?.();
        },
      },
    );
  }

  function sendBack(reason?: string) {
    setStatus.mutate(
      { row, status: "review", reason },
      {
        onSuccess: () => {
          showToast(
            t("admin:adminListings.toast.moved", {
              name: row.name,
              status: t("admin:adminListings.status.review"),
            }),
            "success",
          );
          onDone?.();
        },
      },
    );
  }

  function remove(reason?: string) {
    removeListing.mutate(
      { row, reason },
      {
        onSuccess: () => {
          showToast(
            t("admin:adminListings.remove.toast.removed", { name: row.name }),
            "success",
          );
          onDone?.();
        },
      },
    );
  }

  return {
    moveTo,
    sendBack,
    remove,
    /** The raw ask-a-question mutation, for `AskQuestionModal` to drive
     *  directly — it owns the body-text UI and its own success/close flow. */
    ask: askQuestion,
    isPending: setStatus.isPending || removeListing.isPending || askQuestion.isPending,
  };
}
