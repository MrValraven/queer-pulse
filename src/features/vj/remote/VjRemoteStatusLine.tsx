import { useState, type JSX } from "react";
import { FiAlertTriangle, FiWifiOff } from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { VjErrorValues } from "../live/vjStageCommands";
import {
  vjRemoteOfflineKeyOf,
  type VjRemoteOfflineReason,
} from "./vjRemoteOffline";
import styles from "./page/VjRemoteDock.module.css";

interface VjRemoteStatusLineProps {
  /** Lets a blocked control point aria-describedby at the reason. */
  id?: string;
  offlineReason: VjRemoteOfflineReason | null;
  errorKey: string | null;
  /** The {max} or {min} `errorKey` interpolates; the offline lines take none. */
  values?: VjErrorValues | null;
}

interface VjStatusMessage {
  key: string;
  isOffline: boolean;
  values: VjErrorValues | null;
}

function messageOf(
  offlineReason: VjRemoteOfflineReason | null,
  errorKey: string | null,
  values: VjErrorValues | null,
): VjStatusMessage | null {
  if (offlineReason !== null) {
    return {
      key: vjRemoteOfflineKeyOf(offlineReason),
      isOffline: true,
      values: null,
    };
  }
  if (errorKey !== null) return { key: errorKey, isOffline: false, values };
  return null;
}

function isSameVjStatusMessage(
  message: VjStatusMessage,
  other: VjStatusMessage | null,
): boolean {
  return (
    other !== null &&
    message.key === other.key &&
    message.isOffline === other.isOffline &&
    message.values?.max === other.values?.max &&
    message.values?.min === other.values?.min
  );
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
  values = null,
}: VjRemoteStatusLineProps): JSX.Element {
  const { t } = useTranslation();
  const message = messageOf(offlineReason, errorKey, values);
  const [lastMessage, setLastMessage] = useState<VjStatusMessage | null>(
    message,
  );
  if (message !== null && !isSameVjStatusMessage(message, lastMessage)) {
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
          <span>
            {shownMessage === null
              ? ""
              : t(shownMessage.key, { ...shownMessage.values })}
          </span>
        </p>
      </Collapse>
    </div>
  );
}
