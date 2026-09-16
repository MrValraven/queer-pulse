import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMessageJumpPhase, type MessageJumpPhase } from "./messageJumpStore";
import styles from "./MessageJumpStatus.module.css";

const PHASE_COPY_KEYS: Record<MessageJumpPhase, string> = {
  finding: "messages:jump.finding",
  notFound: "messages:jump.notFound",
  tooFar: "messages:jump.tooFar",
  loadFailed: "messages:jump.loadFailed",
};

/**
 * The overlays over the top of the log. A jump-to-message's status: "finding
 * it" while older pages load, then why it could not be reached if it could
 * not. Otherwise, while an older page loads, a quiet "loading earlier
 * messages" pill (hidden while a jump status speaks, since that already covers
 * its paging). The polite live region stays mounted so its first message is
 * announced; the loading pill stays out of it so scrolling back is not
 * narrated page by page. Both sit in a zero-height slot above the scroll
 * container, so they never shift the log or the virtualizer's coordinates,
 * and they never take pointer input.
 */
export function MessageJumpStatus({
  conversationId,
  isLoadingOlder,
}: {
  conversationId: string;
  isLoadingOlder: boolean;
}) {
  const { t } = useTranslation();
  const phase = useMessageJumpPhase(conversationId);
  return (
    <div className={styles.statusAnchor} data-log-overlay="">
      <div role="status" aria-live="polite" aria-atomic="true">
        {phase && (
          <p
            key={phase}
            className={[
              styles.statusPill,
              phase === "finding" && styles.statusPillFinding,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {t(PHASE_COPY_KEYS[phase])}
          </p>
        )}
      </div>
      {!phase && isLoadingOlder && (
        <p className={styles.loadingOlder}>
          {t("messages:conversation.loadingOlder")}
        </p>
      )}
    </div>
  );
}
