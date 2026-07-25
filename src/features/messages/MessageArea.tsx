import { Fragment, type RefObject } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { MessageRunView, type RunParticipant } from "./MessageRun";
import { groupIntoRuns } from "./messageRuns";
import type { ChatMessage } from "./data";
import styles from "./MessagesPage.module.css";

/**
 * `day` is a stable canonical id ("Today" / "Yesterday", or an already
 * locale-formatted date string from the adapter) — only the two chrome buckets
 * computed client-side resolve through the catalog; any other value is a date
 * string rendered as-is.
 */
function dayHeading(day: string, t: TFunction): string {
  if (day === "Today") return t("messages:day.today");
  if (day === "Yesterday") return t("messages:day.yesterday");
  return day;
}

export interface MessageAreaProps {
  areaRef: RefObject<HTMLDivElement | null>;
  messageGroups: { day: string; items: ChatMessage[] }[];
  loadingOlder: boolean;
  onScroll: () => void;
  /** The message the "New messages" divider renders before (matched by reference). */
  dividerAnchorMessage: ChatMessage | undefined;
  counterpart: RunParticipant;
  self: RunParticipant;
  counterpartName: string;
  onRetry: (message: ChatMessage) => void;
  /** True when the counterpart's read watermark has caught the last outbound message. */
  seenActive: boolean;
  lastOutbound: ChatMessage | undefined;
  onReactionToggle: (
    message: ChatMessage,
    key: MessageReactionKey,
    mine: boolean,
  ) => void;
  onReportMessage: (message: ChatMessage) => void;
  onDeleteMessage: (message: ChatMessage) => void;
  viewerIsStaff: boolean;
}

/** The scrolling conversation log: older-history spinner, day-grouped runs, and
 *  the unread divider. Scroll behaviour is owned by the parent via `areaRef`. */
export function MessageArea({
  areaRef,
  messageGroups,
  loadingOlder,
  onScroll,
  dividerAnchorMessage,
  counterpart,
  self,
  counterpartName,
  onRetry,
  seenActive,
  lastOutbound,
  onReactionToggle,
  onReportMessage,
  onDeleteMessage,
  viewerIsStaff,
}: MessageAreaProps) {
  const { t } = useTranslation();
  return (
    <div
      className={styles.area}
      ref={areaRef}
      role="log"
      aria-live="polite"
      onScroll={onScroll}
    >
      {loadingOlder && (
        <div className={styles.loadingOlder}>
          {t("messages:conversation.loadingOlder")}
        </div>
      )}
      {messageGroups.map((group) => (
        <div key={group.day} className={styles.dayGroup}>
          <div className={styles.daySep}>
            <span className={styles.daySepLabel}>{dayHeading(group.day, t)}</span>
          </div>
          <div className={styles.runs} role="list">
            {groupIntoRuns(group.items, undefined, dividerAnchorMessage).map(
              (run, index) => {
                const runKey = run.items[0]?.id ?? `${group.day}-run-${index}`;
                const showDivider =
                  dividerAnchorMessage !== undefined &&
                  run.items[0] === dividerAnchorMessage;
                return (
                  <Fragment key={runKey}>
                    {showDivider && (
                      <div className={styles.unreadDivider} role="listitem">
                        <span>{t("messages:conversation.unreadDivider")}</span>
                      </div>
                    )}
                    <MessageRunView
                      run={run}
                      counterpart={counterpart}
                      self={self}
                      selfName={t("messages:conversation.you")}
                      counterpartName={counterpartName}
                      onRetry={onRetry}
                      showSeen={
                        seenActive &&
                        run.items[run.items.length - 1] === lastOutbound
                      }
                      onReactionToggle={onReactionToggle}
                      onReportMessage={onReportMessage}
                      onDeleteMessage={onDeleteMessage}
                      viewerIsStaff={viewerIsStaff}
                    />
                  </Fragment>
                );
              },
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
