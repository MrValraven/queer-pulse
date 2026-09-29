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
  // A busy row keeps its buttons focusable (`aria-disabled`, which the shared
  // Button styles as disabled) and these guards stop them firing mid-write.
  const approve = () => {
    if (!isBusy) onApprove();
  };
  const decline = () => {
    if (!isBusy) onDecline();
  };

  return (
    <div className={[styles.modRow, styles.modRowWithActions].join(" ")}>
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
        {/* DES-425: each label names the person it acts on. */}
        <Button
          variant="jade"
          onClick={approve}
          aria-disabled={isBusy || undefined}
          aria-label={t("admin:modPanel.requests.approveAriaLabel", {
            name: request.person.name,
          })}
        >
          <FiCheck aria-hidden /> {t("admin:modPanel.requests.approveCta")}
        </Button>
        <Button
          variant="ghost"
          onClick={decline}
          aria-disabled={isBusy || undefined}
          aria-label={t("admin:modPanel.requests.declineAriaLabel", {
            name: request.person.name,
          })}
        >
          <FiX aria-hidden /> {t("admin:modPanel.requests.declineCta")}
        </Button>
      </div>
    </div>
  );
}
