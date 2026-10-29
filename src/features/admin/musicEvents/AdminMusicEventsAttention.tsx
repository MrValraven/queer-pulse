import type { ReactNode } from "react";
import { FiInbox, FiMic } from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { Translation } from "../../../shared/i18n/Translation";
import { useMusicEventAttention } from "./api/useMusicEvents";
import styles from "./AdminMusicEvents.module.css";

/**
 * What waits on the team across every upcoming house music event: member
 * invite requests to approve or decline, and lineup invites with no reply
 * yet. The nav badge counts the invite requests only, since a lineup invite
 * waits on the artist alone. Each line folds in once its count
 * is above 0, and the counts roll as the team works through them.
 */
export function AdminMusicEventsAttention() {
  const attention = useMusicEventAttention({ isEnabled: true });
  const requestCount = attention.pendingInviteRequestCount;
  const lineupCount = attention.pendingLineupCount;
  const hasAttention = requestCount > 0 || lineupCount > 0;
  return (
    <div role="status">
      <Collapse isOpen={hasAttention}>
        <div className={styles.attention}>
          <Collapse isOpen={requestCount > 0}>
            <AttentionLine
              icon={<FiInbox aria-hidden />}
              i18nKey="admin:musicEvents.attention.requests"
              count={requestCount}
            />
          </Collapse>
          <Collapse isOpen={lineupCount > 0}>
            <AttentionLine
              icon={<FiMic aria-hidden />}
              i18nKey="admin:musicEvents.attention.lineup"
              count={lineupCount}
              isQuiet
            />
          </Collapse>
        </div>
      </Collapse>
    </div>
  );
}

function AttentionLine({
  icon,
  i18nKey,
  count,
  isQuiet = false,
}: {
  icon: ReactNode;
  i18nKey: string;
  count: number;
  /** Information the team cannot act on, so it drops the task tone. */
  isQuiet?: boolean;
}) {
  const format = useFormat();
  return (
    <p
      className={
        isQuiet
          ? `${styles.attentionLine} ${styles.attentionLineQuiet}`
          : styles.attentionLine
      }
    >
      <span className={styles.attentionIcon}>{icon}</span>
      <span>
        <Translation
          i18nKey={i18nKey}
          values={{ count }}
          slots={{
            count: (
              <RollingNumber
                className={styles.attentionCount}
                value={format.number(count)}
                numericValue={count}
              />
            ),
          }}
        />
      </span>
    </p>
  );
}
