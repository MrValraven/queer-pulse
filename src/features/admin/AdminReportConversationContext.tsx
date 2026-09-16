import { useState } from "react";
import { FiMessageSquare, FiRefreshCw, FiShield } from "react-icons/fi";
import { Button, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useReportConversationContext } from "./api/useReportConversationContext";
import { ConversationContextMessage } from "./AdminReportConversationMessage";
import styles from "./AdminReportEvidence.module.css";

/**
 * PRD-360: the conversation around a reported message, for the moderator who
 * asks to see it.
 *
 * Closed by default on purpose. Opening it reads a private conversation and
 * writes a `conversation_context_viewed` row to this report's action history,
 * so it happens on a click the moderator chooses to make, and the button says
 * up front that the opening is recorded and that nobody in the conversation is
 * told. Up to 20 messages either side, oldest first, the reported one marked.
 */
export function ReportConversationContext({ reportId }: { reportId: string }) {
  const { t } = useTranslation();
  const [isRequested, setIsRequested] = useState(false);
  const contextQuery = useReportConversationContext(reportId, isRequested);

  if (!isRequested) {
    return (
      <div className={styles.contextGate}>
        <Button variant="ghost" onClick={() => setIsRequested(true)}>
          <FiMessageSquare aria-hidden />{" "}
          {t("admin:moderation.reportDrawer.conversationContext.openCta")}
        </Button>
        <p className={styles.evidenceNote}>
          <FiShield aria-hidden />
          {t("admin:moderation.reportDrawer.conversationContext.auditNotice")}
        </p>
      </div>
    );
  }

  if (contextQuery.isPending) {
    return (
      <div
        className={styles.contextWindow}
        aria-busy="true"
        aria-label={t(
          "admin:moderation.reportDrawer.conversationContext.loading",
        )}
      >
        <SkeletonLine height={48} style={{ borderRadius: 14 }} />
        <SkeletonLine height={48} style={{ marginTop: 8, borderRadius: 14 }} />
        <SkeletonLine height={48} style={{ marginTop: 8, borderRadius: 14 }} />
      </div>
    );
  }

  if (contextQuery.isError) {
    return (
      <div className={styles.contextGate} role="alert">
        <p className={styles.evidenceNote}>
          {t("admin:moderation.reportDrawer.conversationContext.error")}
        </p>
        <Button variant="ghost" onClick={() => void contextQuery.refetch()}>
          <FiRefreshCw aria-hidden />{" "}
          {t("admin:moderation.reportDrawer.conversationContext.retryCta")}
        </Button>
      </div>
    );
  }

  const context = contextQuery.data;
  return (
    <div className={styles.contextWindow}>
      <p className={styles.evidenceNote}>
        {t("admin:moderation.reportDrawer.conversationContext.windowNote")}
      </p>
      {context.hasEarlierMessages && (
        <p className={styles.contextEdge}>
          {t(
            "admin:moderation.reportDrawer.conversationContext.earlierNotShown",
          )}
        </p>
      )}
      <ol
        className={styles.contextList}
        aria-label={t(
          "admin:moderation.reportDrawer.conversationContext.listLabel",
        )}
      >
        {context.messages.map((message) => (
          <ConversationContextMessage key={message.id} message={message} />
        ))}
      </ol>
      {context.hasLaterMessages && (
        <p className={styles.contextEdge}>
          {t("admin:moderation.reportDrawer.conversationContext.laterNotShown")}
        </p>
      )}
    </div>
  );
}
