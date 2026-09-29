import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSetQueerOwnedVerified } from "./api/useSetQueerOwnedVerified";
import type { ListingQueueRow } from "./api/adminListings.api";

/**
 * The moderator's "Confirm / Withdraw queer-owned" control for one listing:
 * offered only when the submitter claimed the listing is queer-owned
 * (`linkToProfile`), it flips `queerOwnedVerified`, toasts the outcome and
 * then calls `onDone` (the drawer closes itself through it).
 */
export function useQueerOwnedToggle(
  row: ListingQueueRow,
  onDone: (() => void) | undefined,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const setQueerOwnedVerified = useSetQueerOwnedVerified();
  const isVerified = row.detail.queerOwnedVerified;

  function toggle() {
    setQueerOwnedVerified.mutate(
      { row, verified: !isVerified },
      {
        onSuccess: () => {
          showToast(
            t(
              isVerified
                ? "admin:adminListings.queerOwned.toast.unverified"
                : "admin:adminListings.queerOwned.toast.verified",
              { name: row.name },
            ),
            "success",
          );
          onDone?.();
        },
      },
    );
  }

  return {
    isAvailable: Boolean(row.detail.linkToProfile),
    isPending: setQueerOwnedVerified.isPending,
    label: t(
      isVerified
        ? "admin:adminListings.queerOwned.unverifyCta"
        : "admin:adminListings.queerOwned.verifyCta",
    ),
    toggle,
  };
}
