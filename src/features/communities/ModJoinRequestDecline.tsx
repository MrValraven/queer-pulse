import { useId, useState } from "react";
import { FiEye } from "react-icons/fi";
import { Button, RadioCardGroup } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { DeclineKind } from "./api/communityJoin.api";
import {
  DECLINE_KINDS,
  REAPPLY_WAIT_DAYS,
  type JoinRequestDecision,
} from "./joinRequestReview.data";
import styles from "./ModJoinRequestRow.module.css";

/**
 * The confirm step behind "Decline". Declining used to be a bare button that
 * fired straight away and told the applicant nothing.
 *
 * Two things are being asked here. WHICH KIND of no it is, worded for the
 * moderator in terms of what actually happens to the person (the two waits
 * come from the backend's own constants, see `REAPPLY_WAIT_DAYS`), and
 * optionally a note. That note is applicant-facing by design: the backend
 * stores it on the request and shows it to them, so the field says so plainly.
 * Moderator-only thinking has its own column (`internalNote`) that no response
 * ever carries, and must not be typed in here.
 */
export function ModJoinRequestDecline({
  name,
  isPending,
  onConfirm,
  onCancel,
}: {
  name: string;
  isPending: boolean;
  onConfirm: (decision: JoinRequestDecision) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [declineKind, setDeclineKind] = useState<DeclineKind>("not_now");
  const [declineReason, setDeclineReason] = useState("");
  const kindLabelId = useId();
  const reasonId = useId();
  const reasonHintId = useId();

  return (
    <div className={styles.decline}>
      <div className={styles.declineTitle}>
        {t("communities:detail.modtools.joinRequests.decline.title", { name })}
      </div>

      <div className={styles.declineLabel} id={kindLabelId}>
        {t("communities:detail.modtools.joinRequests.decline.kindLabel")}
      </div>
      <RadioCardGroup<DeclineKind>
        value={declineKind}
        onChange={setDeclineKind}
        ariaLabelledBy={kindLabelId}
        ariaLabel={t(
          "communities:detail.modtools.joinRequests.decline.kindLabel",
        )}
        className={styles.kinds}
        optionClassName={styles.kind}
        checkedClassName={styles.kindChecked}
        options={DECLINE_KINDS.map((option) => ({
          id: option.value,
          render: (
            <>
              <span className={styles.kindLabel}>{t(option.labelKey)}</span>
              <span className={styles.kindDesc}>
                {t(option.descriptionKey, {
                  days: REAPPLY_WAIT_DAYS[option.value],
                })}
              </span>
            </>
          ),
        }))}
      />

      <label className={styles.declineLabel} htmlFor={reasonId}>
        {t("communities:detail.modtools.joinRequests.decline.reasonLabel")}
      </label>
      <p className={styles.declineHint} id={reasonHintId}>
        <FiEye aria-hidden />{" "}
        {t("communities:detail.modtools.joinRequests.decline.reasonHint")}
      </p>
      <textarea
        id={reasonId}
        className={styles.reason}
        rows={3}
        maxLength={500}
        aria-describedby={reasonHintId}
        placeholder={t(
          "communities:detail.modtools.joinRequests.decline.reasonPlaceholder",
        )}
        value={declineReason}
        onChange={(event) => setDeclineReason(event.target.value)}
      />

      <div className={styles.declineActions}>
        <Button
          variant="primary"
          size="sm"
          disabled={isPending}
          onClick={() =>
            onConfirm({
              isApproved: false,
              declineKind,
              ...(declineReason.trim()
                ? { declineReason: declineReason.trim() }
                : {}),
            })
          }
        >
          {t("communities:detail.modtools.joinRequests.decline.confirmCta")}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          {t("communities:detail.modtools.joinRequests.decline.cancelCta")}
        </Button>
      </div>
    </div>
  );
}
