import type { ReactNode } from "react";
import { Button } from "./Button";
import styles from "./EmptyState.module.css";

interface EmptyStateAction {
  label: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  /** Icon element (react-icons), shown in a tinted circle. */
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  /** Primary call-to-action that helps the user recover or move on. */
  action?: EmptyStateAction;
  /** Secondary, lower-emphasis action. */
  secondaryAction?: EmptyStateAction;
  /** Tighter padding for inline/in-grid usage. */
  compact?: boolean;
  className?: string;
}

function ActionButton({
  action,
  variant,
}: {
  action: EmptyStateAction;
  variant: "primary" | "ghost";
}) {
  if (action.to) {
    return (
      <Button variant={variant} to={action.to}>
        {action.label}
      </Button>
    );
  }
  if (action.href) {
    return (
      <Button variant={variant} href={action.href}>
        {action.label}
      </Button>
    );
  }
  return (
    <Button variant={variant} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

/**
 * Friendly empty / no-results state. A soft cream-tinted panel (never a white
 * void) with an optional tinted icon, serif title, supporting copy and up to
 * two recovery actions. Use anywhere a list, filter or search yields nothing.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  compact = false,
  className,
}: EmptyStateProps) {
  const cls = [styles.empty, compact && styles.compact, className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} role="status">
      {icon && (
        <span className={styles.icon} aria-hidden>
          {icon}
        </span>
      )}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.desc}>{description}</p>}
      {(action || secondaryAction) && (
        <div className={styles.actions}>
          {action && <ActionButton action={action} variant="primary" />}
          {secondaryAction && (
            <ActionButton action={secondaryAction} variant="ghost" />
          )}
        </div>
      )}
    </div>
  );
}
