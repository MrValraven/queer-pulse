import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GroupListingStatus } from "./api/adminHousingGroupListings.api";
import {
  allowedDecisions,
  DECISION_META,
  DECISION_VARIANT,
} from "./adminHousingGroupListingsStatus";
import { AdminModal } from "./ui";
import styles from "./AdminHousingGroupListingsPage.module.css";

/**
 * The reason a moderator writes when they send a question back or refuse a
 * listing. Required by the backend for both, and shown to the poster verbatim,
 * so the prompt says so plainly: this is one person writing to another about
 * a room they took the time to write up.
 */
export function GroupListingReasonModal({
  status,
  listingTitle,
  isPending,
  onSubmit,
  onClose,
}: {
  status: GroupListingStatus;
  listingTitle: string;
  isPending: boolean;
  onSubmit: (reason: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const trimmedReason = reason.trim();
  const isValid = trimmedReason.length >= 4;

  return (
    <AdminModal
      eyebrow={t("admin:groupListingQueue.decide.reasonEyebrow")}
      title={t(`admin:groupListingQueue.decide.reasonTitle.${status}`)}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant={DECISION_VARIANT[status]}
            size="md"
            disabled={!isValid || isPending}
            onClick={() => onSubmit(trimmedReason)}
          >
            {t(DECISION_META[status].labelKey)}
          </Button>
        </>
      }
    >
      <p className={styles.reasonListing}>{listingTitle}</p>
      <label
        className={styles.reasonLabel}
        htmlFor="group-listing-decision-reason"
      >
        {t("admin:groupListingQueue.decide.reasonLabel")}
      </label>
      <textarea
        id="group-listing-decision-reason"
        className={styles.reasonInput}
        value={reason}
        maxLength={1000}
        rows={5}
        onChange={(event) => setReason(event.target.value)}
        placeholder={t(
          `admin:groupListingQueue.decide.reasonPlaceholder.${status}`,
        )}
        aria-describedby="group-listing-decision-reason-hint"
      />
      <p id="group-listing-decision-reason-hint" className={styles.reasonHint}>
        {t("admin:groupListingQueue.decide.reasonHint")}
      </p>
    </AdminModal>
  );
}

/** The decision row on a queue card. Publishing is one click, because that is
 *  the decision a moderator makes most and the queue exists to be worked. */
export function GroupListingDecisionBar({
  status,
  listingTitle,
  isPending,
  onDecide,
}: {
  status: GroupListingStatus;
  listingTitle: string;
  isPending: boolean;
  onDecide: (next: GroupListingStatus) => void;
}) {
  const { t } = useTranslation();
  const decisions = allowedDecisions(status);

  if (decisions.length === 0) {
    return (
      <p className={styles.reasonHint}>
        {t("admin:groupListingQueue.decide.liveNote")}
      </p>
    );
  }

  return (
    <div
      className={styles.decisionBar}
      role="group"
      aria-label={t("admin:groupListingQueue.decide.groupLabel", {
        title: listingTitle,
      })}
    >
      {decisions.map((next) => {
        const meta = DECISION_META[next];
        const DecisionIcon = meta.icon;
        return (
          <Button
            key={next}
            size="md"
            variant={DECISION_VARIANT[next]}
            disabled={isPending}
            onClick={() => onDecide(next)}
          >
            <DecisionIcon aria-hidden />
            {t(meta.labelKey)}
          </Button>
        );
      })}
    </div>
  );
}
