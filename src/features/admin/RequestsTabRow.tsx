import { FiCheck, FiX } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { photoOf } from "../communities/communityPeople";
import type { ModRequest } from "../communities/community.model";
import styles from "./ModPanel.module.css";

/**
 * One pending join request in the mod panel's Requests tab, split out of
 * `RequestsTab` so that component stays under the per-component line limit.
 * Purely presentational: the tab owns the review write, its optimistic state
 * and its toasts.
 */
export function RequestsTabRow({
  request,
  isBusy,
  onApprove,
  onDecline,
}: {
  request: ModRequest;
  /** A decision on this row, or a bulk approve, is still in flight. */
  isBusy: boolean;
  onApprove: () => void;
  onDecline: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();

  const decline = () => {
    if (!isBusy) onDecline();
  };

  return (
    <div className={styles.modRow}>
      <Avatar
        initials={request.person.initials}
        tint={request.person.tint}
        src={photoOf(request.person, demoMode)}
        size={42}
        alt={request.person.name}
      />
      <div className={styles.modMain}>
        <div className={styles.modName}>{request.person.name}</div>
        {request.note && <div className={styles.modNote}>"{request.note}"</div>}
        <div className={styles.modMeta}>
          {t("admin:modPanel.requests.requestedAgo", { time: request.time })}
        </div>
      </div>
      <div className={styles.modActions}>
        <Button variant="jade" onClick={onApprove} disabled={isBusy}>
          <FiCheck aria-hidden /> {t("admin:modPanel.requests.approveCta")}
        </Button>
        <span
          role="button"
          tabIndex={0}
          aria-disabled={isBusy || undefined}
          className={styles.declineBtn}
          onClick={decline}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              decline();
            }
          }}
        >
          <FiX aria-hidden /> {t("admin:modPanel.requests.declineCta")}
        </span>
      </div>
    </div>
  );
}
