import { useEffect, useRef, useState, type RefObject } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioErrorCodeOf } from "./api/studio.api";
import type { StudioSellerPurchaseView } from "./api/studioPurchases.adapters";
import type { DeclineStudioPurchaseBody } from "./api/studioPurchases.types";
import { useStudioPurchaseDecisions } from "./api/useStudioPurchaseMutations";
import {
  STUDIO_ERROR_MESSAGE_KEY,
  studioErrorMessageKeyOf,
} from "./studioErrors.data";

export interface StudioInboxFailure {
  message: string;
  /** Remounts the alert, so a repeat of the same line is read again. */
  sequence: number;
  isShown: boolean;
}

/** Where focus goes once the decline dialog has left: the next row's
 *  Confirm by purchase id, else the panel heading (null). */
interface PendingFocus {
  nextId: string | null;
}

/** Focus the Confirm of the row with `nextId`, else the panel heading. */
function focusNextConfirm(
  listRef: RefObject<HTMLUListElement | null>,
  headingRef: RefObject<HTMLHeadingElement | null>,
  nextId: string | null,
) {
  const nextConfirm = nextId
    ? listRef.current?.querySelector<HTMLButtonElement>(
        `[data-purchase-confirm="${CSS.escape(nextId)}"]`,
      )
    : null;
  (nextConfirm ?? headingRef.current)?.focus();
}

/** The To confirm panel's decisions. A decided row, or one another member
 *  of the persona already answered (409 `studio_purchase_not_pending`),
 *  leaves the list at once, its line goes to the status region and focus
 *  moves to the next row's Confirm, else to the panel heading. After a
 *  decline that move waits for the dialog's exit to complete
 *  (`handleDeclineExitComplete`), so the dialog's own focus hand-back to
 *  the leaving row's Decline lands first and the move wins. Any other
 *  failure keeps the row: a confirm names its reason above the list, a
 *  decline inside the still open dialog, with the reason and note kept. */
export function useStudioInboxDecide({
  subprofileId,
  purchases,
  listRef,
  headingRef,
}: {
  subprofileId: string;
  purchases: StudioSellerPurchaseView[];
  listRef: RefObject<HTMLUListElement | null>;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const { t } = useTranslation();
  const decisions = useStudioPurchaseDecisions(subprofileId);
  const [answeredIds, setAnsweredIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [listFailure, setListFailure] = useState<StudioInboxFailure | null>(
    null,
  );
  const [declineTarget, setDeclineTarget] =
    useState<StudioSellerPurchaseView | null>(null);
  const [declineError, setDeclineError] = useState<string | null>(null);
  const pendingFocusRef = useRef<PendingFocus | null>(null);
  const [exitedDialogCount, setExitedDialogCount] = useState(0);
  const items = purchases.filter((purchase) => !answeredIds.has(purchase.id));

  // Runs after the commit that removed the decline dialog, so its unmount
  // focus hand-back has already happened.
  useEffect(() => {
    const pendingFocus = pendingFocusRef.current;
    if (exitedDialogCount === 0 || !pendingFocus) return;
    pendingFocusRef.current = null;
    focusNextConfirm(listRef, headingRef, pendingFocus.nextId);
  }, [exitedDialogCount, listRef, headingRef]);

  function dropRow(
    purchase: StudioSellerPurchaseView,
    message: string,
    isFromDeclineDialog: boolean,
  ) {
    const index = items.findIndex((candidate) => candidate.id === purchase.id);
    const nextId = (items[index + 1] ?? items[index - 1])?.id ?? null;
    setStatusMessage(message);
    setDeclineTarget(null);
    setAnsweredIds((current) => new Set(current).add(purchase.id));
    if (isFromDeclineDialog) pendingFocusRef.current = { nextId };
    else focusNextConfirm(listRef, headingRef, nextId);
  }

  async function decide(
    purchase: StudioSellerPurchaseView,
    action: () => Promise<void>,
    successKey: string,
    onFailure: (message: string) => void,
    failedKey: string,
    isFromDeclineDialog: boolean,
  ) {
    setListFailure((current) => current && { ...current, isShown: false });
    setDeclineError(null);
    // Emptied first, so a repeat of the same line is announced again.
    setStatusMessage("");
    try {
      await action();
      const name =
        purchase.buyer?.name ?? t("studio:purchase.inbox.deletedAccount");
      dropRow(
        purchase,
        t(successKey, { name, title: purchase.item.title }),
        isFromDeclineDialog,
      );
    } catch (error) {
      if (studioErrorCodeOf(error) === "studio_purchase_not_pending") {
        dropRow(
          purchase,
          t(STUDIO_ERROR_MESSAGE_KEY.studio_purchase_not_pending),
          isFromDeclineDialog,
        );
        return;
      }
      onFailure(
        `${t(failedKey)}. ${t(studioErrorMessageKeyOf(error, "save"))}`,
      );
    }
  }

  return {
    items,
    isBusy: decisions.busyPurchaseId !== null,
    busyPurchaseId: decisions.busyPurchaseId,
    statusMessage,
    listFailure,
    declineTarget,
    declineError,
    openDecline: (purchase: StudioSellerPurchaseView) => {
      setDeclineError(null);
      setDeclineTarget(purchase);
    },
    closeDecline: () => setDeclineTarget(null),
    /** The decline dialog's `AnimatePresence` `onExitComplete`. */
    handleDeclineExitComplete: () => {
      if (pendingFocusRef.current) setExitedDialogCount((count) => count + 1);
    },
    confirm: (purchase: StudioSellerPurchaseView) =>
      void decide(
        purchase,
        () => decisions.confirm(purchase.id),
        "studio:purchase.inbox.confirmed",
        (message) =>
          setListFailure((current) => ({
            message,
            sequence: (current?.sequence ?? 0) + 1,
            isShown: true,
          })),
        "studio:purchase.inbox.confirmFailed",
        false,
      ),
    decline: (
      purchase: StudioSellerPurchaseView,
      body: DeclineStudioPurchaseBody,
    ) =>
      void decide(
        purchase,
        () => decisions.decline(purchase.id, body),
        "studio:purchase.inbox.declined",
        setDeclineError,
        "studio:purchase.inbox.declineFailed",
        true,
      ),
  };
}
