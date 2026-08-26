import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AdminMembersPage.module.css";

/**
 * The three decisions on one pending applicant, extracted from
 * `JoinRequestCard` so that card stays under the repo's 200-line component
 * limit.
 *
 * The three labels are `white-space: nowrap` and together outrun a narrow
 * queue column, so the row wraps: the two quiet options share the first line
 * and "welcome in" gets a full-width line below.
 *
 * Waitlisting stays gated on `stage === "pending" && onWaitlist` exactly as it
 * was on the card: a row already waitlisted has nowhere further to be put, and
 * a queue that hands down no `onWaitlist` offers no such button.
 */
export function JoinRequestDecisionActions({
  stage,
  isBusy,
  onApprove,
  onDecline,
  onWaitlist,
}: {
  stage: "pending" | "waitlisted";
  /** True while this card's own decision is in flight, so the buttons render a
   *  real disabled state and a second click cannot fire a second review. */
  isBusy: boolean;
  onApprove: () => void;
  onDecline: () => void;
  onWaitlist?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.queueActions}>
      <Button
        variant="ghost"
        size="md"
        className={styles.queueActionSecondary}
        disabled={isBusy}
        onClick={onDecline}
      >
        {t("admin:members.verify.declineCta")}
      </Button>
      {stage === "pending" && onWaitlist && (
        <Button
          variant="ghost"
          size="md"
          className={styles.queueActionSecondary}
          disabled={isBusy}
          onClick={onWaitlist}
        >
          {t("admin:members.verify.waitlistCta")}
        </Button>
      )}
      <Button
        variant="jade"
        size="md"
        className={styles.queueActionPrimary}
        disabled={isBusy}
        onClick={onApprove}
      >
        {t("admin:members.verify.approveCta")}
      </Button>
    </div>
  );
}
