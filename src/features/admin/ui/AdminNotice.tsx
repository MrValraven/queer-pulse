import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { FiAlertTriangle, FiCheckCircle, FiInfo } from "react-icons/fi";
import styles from "./AdminNotice.module.css";

type AdminNoticeTone = "error" | "warn" | "info" | "success";

const TONE_ICON: Record<AdminNoticeTone, IconType> = {
  error: FiAlertTriangle,
  warn: FiAlertTriangle,
  info: FiInfo,
  success: FiCheckCircle,
};

const TONE_CLASS: Record<AdminNoticeTone, string | undefined> = {
  error: styles.error,
  warn: styles.warn,
  info: styles.info,
  success: styles.success,
};

interface AdminNoticeProps {
  tone: AdminNoticeTone;
  title?: ReactNode;
  children: ReactNode;
  /** Any node, usually a `Button` such as "Reload this list". */
  action?: ReactNode;
  /** Overrides the role the tone implies (error is an alert, the rest are
   *  status). A standing reading shown on load keeps the error look with
   *  `status`, so it does not interrupt a screen reader on arrival. */
  liveRole?: "alert" | "status" | "none";
}

/**
 * The one banner for load errors, stale data, degraded service and refresh
 * failures. An error is announced at once (`role="alert"`); the other tones
 * wait their turn (`role="status"`).
 */
export function AdminNotice({
  tone,
  title,
  children,
  action,
  liveRole,
}: AdminNoticeProps) {
  const Icon = TONE_ICON[tone];
  return (
    <div
      className={[styles.notice, TONE_CLASS[tone]].filter(Boolean).join(" ")}
      role={
        liveRole === "none"
          ? undefined
          : (liveRole ?? (tone === "error" ? "alert" : "status"))
      }
    >
      <Icon className={styles.icon} aria-hidden />
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        <div className={styles.text}>{children}</div>
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
