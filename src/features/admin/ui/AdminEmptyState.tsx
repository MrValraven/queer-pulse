import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { EmptyState } from "../../../shared/components/ui/EmptyState";
import styles from "./AdminEmptyState.module.css";

interface AdminEmptyStateProps {
  icon?: IconType;
  title: ReactNode;
  body?: ReactNode;
  /** Any node, usually a `Button`. */
  action?: ReactNode;
  /** `panel` is the full empty state; `inline` is a quiet line inside a panel
   *  or list. */
  size?: "panel" | "inline";
}

/**
 * The one empty state for the admin console. The panel size wraps the shared
 * `EmptyState`; the inline size replaces every local empty-line paragraph.
 */
export function AdminEmptyState({
  icon: Icon,
  title,
  body,
  action,
  size = "panel",
}: AdminEmptyStateProps) {
  if (size === "inline") {
    return (
      <div className={styles.inline} role="status">
        {Icon && <Icon className={styles.inlineIcon} aria-hidden />}
        <p className={styles.inlineText}>
          <span className={styles.inlineTitle}>{title}</span>
          {body && <span className={styles.inlineBody}> {body}</span>}
        </p>
        {action && <div className={styles.inlineAction}>{action}</div>}
      </div>
    );
  }
  return (
    <div
      className={[styles.panel, action && styles.hasAction]
        .filter(Boolean)
        .join(" ")}
    >
      <EmptyState
        icon={Icon ? <Icon /> : undefined}
        title={title}
        description={body}
        headingLevel={2}
        compact
        className={styles.panelBare}
      />
      {action && <div className={styles.panelAction}>{action}</div>}
    </div>
  );
}
