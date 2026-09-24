import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ListingStatus } from "../../marketing/listBusiness/listBusiness.data";
import { useSetListingStatus } from "./useSetListingStatus";
import { useRemoveListing } from "./useRemoveListing";
import { useAskListingQuestion } from "./useAskListingQuestion";
import type { ListingQueueRow } from "./adminListings.api";

export interface UseListingModerationOptions {
  /** Called after `moveTo`/`sendBack`/`remove` resolves successfully; the
   *  drawer passes its own `onClose` here so any completed action dismisses
   *  it. Asking a question completes through `AskQuestionModal`'s own
   *  `onAsked` instead. */
  onDone?: () => void;
}

/**
 * The single place a moderator's actions on one queue row live: status moves,
 * send-back, remove, and ask, composing `useSetListingStatus` /
 * `useRemoveListing` / `useAskListingQuestion`. Each of those mutations
 * already patches the shared `[admin-listings]` cache directly (see
 * `patchListingInCache` in `useAdminListings`), so no page needs a local
 * status-override or removed-refs map. `isPending` is unified across all
 * three mutations so every button driven by this hook (row, drawer, and the
 * confirm/ask modals) disables together (fixing the old inconsistent
 * disabled-state coverage).
 *
 * `reason` is moderator free text: optional on `sendBack`, required on
 * `remove` (the moderator delete flow asks for it). It is forwarded to
 * `useSetListingStatus`/`useRemoveListing` and on to the live-mode PATCH
 * `/admin/listings/:ref/status` and DELETE `/admin/listings/:ref` bodies,
 * which the backend records on the listing's moderation event and DMs to the
 * submitter on send-back and remove (see `listings.service.ts`). Demo mode
 * logs it (`logInfo`) and sends it nowhere; the demo history panel reads a
 * static fixture.
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

  /** Resolves once the server confirmed the delete (after the success toast
   *  and `onDone`), and rejects on failure so `ListingDeleteFlow` can keep
   *  itself open with an inline error. Awaits `mutateAsync` so the toast still
   *  fires when the row that opened the flow has already left the queue. */
  async function remove(reason: string) {
    await removeListing.mutateAsync({ row, reason });
    showToast(
      t("admin:adminListings.remove.toast.removed", { name: row.name }),
      "success",
    );
    onDone?.();
  }

  return {
    moveTo,
    sendBack,
    remove,
    /** The raw ask-a-question mutation, for `AskQuestionModal` to drive
     *  directly; it owns the body-text UI and its own success/close flow. */
    ask: askQuestion,
    isPending:
      setStatus.isPending || removeListing.isPending || askQuestion.isPending,
  };
}
