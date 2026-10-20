import { useTranslation } from "../../shared/i18n/useTranslation";
import { useTrustGraph } from "./trustGraph/useTrustGraph";
import { TONE, relationshipLabel } from "./trustGraph/trustGraphModel";
import type { ConnectionRow, ConnectionTab } from "./useVouchConnectionList";
import styles from "./vouchGraphConnections.module.css";

export interface VouchGraphConnectionRowProps {
  row: ConnectionRow;
  personId: string;
  tab: ConnectionTab;
  isActive: boolean;
  isHovered: boolean;
  onHoverChange: (id: string | null) => void;
  onGo: (id: string) => void;
}

/** One connection: avatar, name, a line of chips, and the vouch reason. */
export function VouchGraphConnectionRow({
  row,
  personId,
  tab,
  isActive,
  isHovered,
  onHoverChange,
  onGo,
}: VouchGraphConnectionRowProps) {
  const { t } = useTranslation();
  const graph = useTrustGraph();
  const other = graph.peopleById[row.otherId];
  if (!other) return null;
  const ink = TONE[other.tone];
  const { edge } = row;
  const isInboundInvite =
    tab === "vouchedBy" && edge.kind === "invite" && edge.to === personId;
  const relationship = relationshipLabel(t, edge.relationship);
  const hasChips =
    Boolean(edge.mutual) || isInboundInvite || Boolean(relationship);
  const classNames = [
    styles.row,
    row.isWithdrawn ? styles.rowWithdrawn : "",
    isActive ? styles.rowActive : "",
    isHovered ? styles.rowHover : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      type="button"
      className={classNames}
      data-connection-id={row.otherId}
      onClick={() => onGo(row.otherId)}
      onMouseEnter={() => onHoverChange(row.otherId)}
      onMouseLeave={() => onHoverChange(null)}
      onFocus={() => onHoverChange(row.otherId)}
      onBlur={() => onHoverChange(null)}
    >
      <span
        className={styles.avatar}
        style={{ background: ink.fill, color: ink.stroke }}
      >
        {other.initials}
      </span>
      <span className={styles.rowText}>
        <span className={styles.nameLine}>
          <span className={styles.name}>{other.name}</span>
          {row.isWithdrawn && (
            <span className={styles.withdrawnTag}>
              {t("admin:vouchGraph.inspector.list.withdrawnTag")}
            </span>
          )}
        </span>
        {hasChips && (
          <span className={styles.chips}>
            {edge.mutual && (
              <span className={`${styles.chip} ${styles.chipMutual}`}>
                {t("admin:vouchGraph.inspector.chip.mutual")}
              </span>
            )}
            {relationship && (
              <span className={styles.chip}>{relationship}</span>
            )}
            {isInboundInvite && (
              <span className={styles.chip}>
                {t("admin:vouchGraph.inspector.chip.invitedThem")}
              </span>
            )}
          </span>
        )}
        {edge.reason && <span className={styles.reason}>“{edge.reason}”</span>}
      </span>
    </button>
  );
}
