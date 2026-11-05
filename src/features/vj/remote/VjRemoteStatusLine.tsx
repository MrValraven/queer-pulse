import { useState, type JSX } from "react";
import { FiAlertTriangle, FiWifiOff } from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  vjRemoteOfflineKeyOf,
  type VjRemoteOfflineReason,
} from "./vjRemoteOffline";
import styles from "./VjRemote.module.css";

interface VjRemoteStatusLineProps {
  /** Lets a blocked control point aria-describedby at the reason. */
  id?: string;
  offlineReason: VjRemoteOfflineReason | null;
  errorKey: string | null;
}

interface VjStatusMessage {
  key: string;
  isOffline: boolean;
}

function messageOf(
  offlineReason: VjRemoteOfflineReason | null,
  errorKey: string | null,
): VjStatusMessage | null {
  if (offlineReason !== null) {
    return { key: vjRemoteOfflineKeyOf(offlineReason), isOffline: true };
  }
  if (errorKey !== null) return { key: errorKey, isOffline: false };
  return null;
}

/**
 * The one line at the top of the control bar: why the remote cannot send
 * (the connection reason wins), or why the last command was refused. It
 * keeps the last words drawn while it folds away.
 */
export function VjRemoteStatusLine({
  id,
  offlineReason,
  errorKey,
}: VjRemoteStatusLineProps): JSX.Element {
  const { t } = useTranslation();
  const message = messageOf(offlineReason, errorKey);
  const [lastMessage, setLastMessage] = useState<VjStatusMessage | null>(
    message,
  );
  if (
    message !== null &&
    (message.key !== lastMessage?.key ||
      message.isOffline !== lastMessage.isOffline)
  ) {
    setLastMessage(message);
  }
  const shownMessage = message ?? lastMessage;
  const Icon = shownMessage?.isOffline ? FiWifiOff : FiAlertTriangle;

  return (
    <div id={id} role="status" className={styles.statusRegion}>
      <Collapse isOpen={message !== null}>
        <p
          className={styles.statusLine}
          data-vj-status={shownMessage?.isOffline ? "offline" : "error"}
        >
          <Icon aria-hidden="true" focusable="false" />
          <span>{shownMessage === null ? "" : t(shownMessage.key)}</span>
        </p>
      </Collapse>
    </div>
  );
}
