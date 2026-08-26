import { useState } from "react";
import { FiCheck, FiCornerUpLeft, FiEyeOff, FiSlash } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  AdminHousingListingDTO,
  HousingListingDecisionAction,
} from "./api/adminHousingListings.api";
import { allowedDecisions } from "./adminHousingListingsStatus";
import { AdminModal } from "./ui";
import styles from "./AdminHousingListingsPage.module.css";

const DECISION_META: Record<
  HousingListingDecisionAction,
  { labelKey: string; icon: typeof FiCheck; isReasonRequired: boolean }
> = {
  approve: {
    labelKey: "admin:housingListings.decide.approve",
    icon: FiCheck,
    isReasonRequired: false,
  },
  request_changes: {
    labelKey: "admin:housingListings.decide.requestChanges",
    icon: FiCornerUpLeft,
    isReasonRequired: true,
  },
  reject: {
    labelKey: "admin:housingListings.decide.reject",
    icon: FiSlash,
    isReasonRequired: true,
  },
  take_down: {
    labelKey: "admin:housingListings.decide.takeDown",
    icon: FiEyeOff,
    isReasonRequired: true,
  },
};

/**
 * The reason a moderator writes when they send a listing back, refuse it, or
 * pull it. Required by the backend for all three, and shown to the lister
 * verbatim, so the prompt says so plainly: this is one person writing to
 * another about their home.
 */
export function HousingDecisionReasonModal({
  action,
  listingTitle,
  isPending,
  onSubmit,
  onClose,
}: {
  action: HousingListingDecisionAction;
  listingTitle: string;
  isPending: boolean;
  onSubmit: (reason: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const trimmed = reason.trim();
  const isValid = trimmed.length >= 4;

  return (
    <AdminModal
      eyebrow={t("admin:housingListings.decide.reasonEyebrow")}
      title={t(`admin:housingListings.decide.reasonTitle.${action}`)}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            {t("admin:housingListings.decide.cancel")}
          </Button>
          <Button
            variant={action === "request_changes" ? "primary" : "danger"}
            size="md"
            disabled={!isValid || isPending}
            onClick={() => onSubmit(trimmed)}
          >
            {t(DECISION_META[action].labelKey)}
          </Button>
        </>
      }
    >
      <p className={styles.reasonListing}>{listingTitle}</p>
      <label className={styles.reasonLabel} htmlFor="housing-decision-reason">
        {t("admin:housingListings.decide.reasonLabel")}
      </label>
      <textarea
        id="housing-decision-reason"
        className={styles.reasonInput}
        value={reason}
        maxLength={1000}
        rows={5}
        onChange={(event) => setReason(event.target.value)}
        placeholder={t(
          `admin:housingListings.decide.reasonPlaceholder.${action}`,
        )}
        aria-describedby="housing-decision-reason-hint"
      />
      <p id="housing-decision-reason-hint" className={styles.reasonHint}>
        {t("admin:housingListings.decide.reasonHint")}
      </p>
    </AdminModal>
  );
}

/** The decision row on a queue card. Approve is one click, because that is the
 * decision a moderator makes most and the queue exists to be worked through. */
export function AdminHousingListingDecisionBar({
  listing,
  isPending,
  onDecide,
}: {
  listing: AdminHousingListingDTO;
  isPending: boolean;
  onDecide: (action: HousingListingDecisionAction) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.decisionBar}>
      {allowedDecisions(listing.status).map((action) => {
        const meta = DECISION_META[action];
        const DecisionIcon = meta.icon;
        return (
          <Button
            key={action}
            size="md"
            variant={
              action === "approve"
                ? "jade"
                : action === "request_changes"
                  ? "ghost"
                  : "danger"
            }
            disabled={isPending}
            onClick={() => onDecide(action)}
          >
            <DecisionIcon aria-hidden />
            {t(meta.labelKey)}
          </Button>
        );
      })}
    </div>
  );
}
