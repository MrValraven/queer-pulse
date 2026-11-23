import { useState } from "react";
import { Button, Collapse, LoadErrorState } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { memberRefDisplayName } from "../../shared/api/refs";
import type { RosterMember } from "./community.model";
import {
  communityErrorText,
  OWNERSHIP_OFFER_OWNER_SIDE_KEYS,
} from "./communityErrors";
import { OfferOwnershipModal } from "./OfferOwnershipModal";
import {
  useCancelCommunityOwnershipOffer,
  useCommunityOwnershipOffer,
} from "./api/useCommunityOwnershipOffers";
import styles from "./CommunityDangerZone.module.css";

/**
 * PRD-514. The owner's row in the danger zone for handing the community on.
 *
 * With no open offer it explains the offer flow and opens the picker. With an
 * open one it says who it went to and when it lapses, and offers to cancel it:
 * the backend allows one open offer per community, so the picker stays shut
 * until this one is answered, lapses or is cancelled.
 */
export function CommunityOwnershipOfferPanel({
  slug,
  roster,
  isRosterLoading,
  isRosterError,
  onRosterRetry,
}: {
  slug: string;
  roster: RosterMember[];
  /** The roster read's state, handed on to the picker so it waits on it. */
  isRosterLoading?: boolean;
  isRosterError?: boolean;
  onRosterRetry?: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { offer, isLoading, isError, refetch } =
    useCommunityOwnershipOffer(slug);
  const cancelOffer = useCancelCommunityOwnershipOffer(slug);

  const cancel = () => {
    if (cancelOffer.isPending) return;
    cancelOffer.mutate(undefined, {
      onSuccess: () =>
        showToast(t("communities:ownershipOffer.cancelled"), "success"),
      onError: (error) =>
        showToast(
          communityErrorText(t, error, OWNERSHIP_OFFER_OWNER_SIDE_KEYS),
          "error",
        ),
    });
  };

  // Only an offer still waiting on its answer holds the seat.
  const openOffer = offer?.status === "offered" ? offer : null;
  // The pending line keeps drawing the last open offer while it folds away
  // after a cancel, so the closing panel never empties mid-animation.
  const [shownOffer, setShownOffer] = useState(openOffer);
  if (
    openOffer &&
    (openOffer.id !== shownOffer?.id ||
      openOffer.expiresAt !== shownOffer.expiresAt)
  ) {
    setShownOffer(openOffer);
  }

  if (isError) {
    return <LoadErrorState compact onRetry={refetch} />;
  }

  return (
    <div className={styles.row}>
      <div className={styles.rowLabel}>
        {t("communities:ownershipOffer.title")}
      </div>
      {/* The explainer and the pending line trade places with a fold, so a
          sent or cancelled offer never snaps the danger zone's layout. */}
      {/* The flex column lives on an inner div: Collapse sets its own
          wrapper to flow-root inline, which a class on it cannot override. */}
      <Collapse isOpen={openOffer !== null}>
        {shownOffer && (
          <div className={styles.rowState}>
            <p className={styles.rowText} role="status">
              {t("communities:ownershipOffer.pending", {
                name:
                  memberRefDisplayName(shownOffer.offeree, t) ||
                  t("communities:common.someMember"),
                date: fmt.date(new Date(shownOffer.expiresAt)),
              })}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancel}
              disabled={cancelOffer.isPending}
            >
              {t("communities:ownershipOffer.cancel")}
            </Button>
          </div>
        )}
      </Collapse>
      <Collapse isOpen={openOffer === null}>
        <div className={styles.rowState}>
          <p className={styles.rowText}>
            {t("communities:ownershipOffer.explainer")}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPickerOpen(true)}
            // Until the read lands an open offer may exist, and sending a
            // second would only come back refused.
            disabled={isLoading}
          >
            {t("communities:ownershipOffer.offerCta")}
          </Button>
        </div>
      </Collapse>
      {isPickerOpen && (
        <OfferOwnershipModal
          slug={slug}
          roster={roster}
          isRosterLoading={isRosterLoading}
          isRosterError={isRosterError}
          onRosterRetry={onRosterRetry}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </div>
  );
}
