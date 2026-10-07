import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { ListingDraft } from "./listBusiness.data";
import {
  withListingKind,
  withWhereFoundChoice,
  type WhereFoundChoice,
} from "./listingKind";
import {
  MAX_ONLINE_MORE_LINKS,
  newOnlineMoreLinkRow,
  normalizeOnlineDetails,
  ONLINE_FULFILMENT_OPTIONS,
  ONLINE_PAYMENT_METHODS,
  ONLINE_SESSION_FORMATS,
  type ListingOnlineDetailsDraft,
  type OnlineFulfilment,
  type OnlineMainLink,
  type OnlineMoreLinkRow,
  type OnlinePaymentMethod,
  type OnlineSessionFormat,
} from "./listingOnline.data";

/** The plain answers `setOnlineDetail` writes in one go. */
export type OnlineDetailsPatch = Partial<
  Pick<
    ListingOnlineDetailsDraft,
    "pickupNote" | "shipsFrom" | "isVatIncluded" | "registration" | "replyNote"
  >
>;

function patchOnlineDetails(
  draft: ListingDraft,
  next: (details: ListingOnlineDetailsDraft) => ListingOnlineDetailsDraft,
): ListingDraft {
  return {
    ...draft,
    onlineDetails: next(normalizeOnlineDetails(draft.onlineDetails)),
  };
}

/** Turn one value on or off in a list kept in vocabulary order. */
function toggledInOrder<Value extends string>(
  current: readonly Value[],
  value: Value,
  vocabulary: readonly Value[],
): Value[] {
  const isOn = current.includes(value);
  return vocabulary.filter((entry) =>
    entry === value ? !isOn : current.includes(entry),
  );
}

/**
 * The online selling block's setters, beside each other like the services
 * and menu setters. Every read heals through `normalizeOnlineDetails`, so a
 * draft from before the feature edits as the empty block. Link rows are
 * addressed by their client ids, never by index.
 */
export function useOnlineSetters(
  setDraft: Dispatch<SetStateAction<ListingDraft>>,
) {
  const setOnline = useCallback(
    (isOnline: boolean) =>
      setDraft((draft) => withListingKind(draft, isOnline)),
    [setDraft],
  );
  const chooseWhereFound = useCallback(
    (choice: WhereFoundChoice) =>
      setDraft((draft) => withWhereFoundChoice(draft, choice)),
    [setDraft],
  );
  const setCity = useCallback(
    (city: string) => setDraft((draft) => ({ ...draft, city })),
    [setDraft],
  );
  const setHasOnlineShop = useCallback(
    (hasOnlineShop: boolean) =>
      setDraft((draft) => ({ ...draft, hasOnlineShop })),
    [setDraft],
  );
  const setAdultTermsAccepted = useCallback(
    (isAccepted: boolean) =>
      setDraft((draft) => ({ ...draft, adultTermsAccepted: isAccepted })),
    [setDraft],
  );
  const setMainLink = useCallback(
    (patch: Partial<OnlineMainLink>) =>
      setDraft((draft) =>
        patchOnlineDetails(draft, (details) => ({
          ...details,
          mainLink: { ...details.mainLink, ...patch },
        })),
      ),
    [setDraft],
  );
  const addMoreLink = useCallback(
    () =>
      setDraft((draft) =>
        patchOnlineDetails(draft, (details) =>
          details.moreLinks.length >= MAX_ONLINE_MORE_LINKS
            ? details
            : {
                ...details,
                moreLinks: [...details.moreLinks, newOnlineMoreLinkRow()],
              },
        ),
      ),
    [setDraft],
  );
  const setMoreLink = useCallback(
    (id: string, patch: Partial<Omit<OnlineMoreLinkRow, "id">>) =>
      setDraft((draft) =>
        patchOnlineDetails(draft, (details) => ({
          ...details,
          moreLinks: details.moreLinks.map((row) =>
            row.id === id ? { ...row, ...patch } : row,
          ),
        })),
      ),
    [setDraft],
  );
  const removeMoreLink = useCallback(
    (id: string) =>
      setDraft((draft) =>
        patchOnlineDetails(draft, (details) => ({
          ...details,
          moreLinks: details.moreLinks.filter((row) => row.id !== id),
        })),
      ),
    [setDraft],
  );
  const toggleFulfilment = useCallback(
    (option: OnlineFulfilment) =>
      setDraft((draft) =>
        patchOnlineDetails(draft, (details) => ({
          ...details,
          fulfilment: toggledInOrder(
            details.fulfilment,
            option,
            ONLINE_FULFILMENT_OPTIONS,
          ),
        })),
      ),
    [setDraft],
  );
  const togglePayment = useCallback(
    (method: OnlinePaymentMethod) =>
      setDraft((draft) =>
        patchOnlineDetails(draft, (details) => ({
          ...details,
          payments: toggledInOrder(
            details.payments,
            method,
            ONLINE_PAYMENT_METHODS,
          ),
        })),
      ),
    [setDraft],
  );
  const toggleSessionFormat = useCallback(
    (format: OnlineSessionFormat) =>
      setDraft((draft) =>
        patchOnlineDetails(draft, (details) => ({
          ...details,
          sessionFormats: toggledInOrder(
            details.sessionFormats,
            format,
            ONLINE_SESSION_FORMATS,
          ),
        })),
      ),
    [setDraft],
  );
  const setOnlineDetail = useCallback(
    (patch: OnlineDetailsPatch) =>
      setDraft((draft) =>
        patchOnlineDetails(draft, (details) => ({ ...details, ...patch })),
      ),
    [setDraft],
  );

  return {
    setOnline,
    chooseWhereFound,
    setCity,
    setHasOnlineShop,
    setAdultTermsAccepted,
    setMainLink,
    addMoreLink,
    setMoreLink,
    removeMoreLink,
    toggleFulfilment,
    togglePayment,
    toggleSessionFormat,
    setOnlineDetail,
  };
}
