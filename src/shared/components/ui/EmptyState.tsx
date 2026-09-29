import type { ReactNode } from "react";
import { Button } from "./Button";
import styles from "./EmptyState.module.css";

interface EmptyStateAction {
  label: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  /** The action's work is running. The button stays mounted and focusable
   *  with `aria-disabled`, so focus stays on it; the caller guards `onClick`. */
  isBusy?: boolean;
}

interface EmptyStateProps {
  /** Icon element (react-icons), shown in a tinted circle. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Primary call-to-action that helps the user recover or move on. */
  action?: EmptyStateAction;
  /** Secondary, lower-emphasis action. */
  secondaryAction?: EmptyStateAction;
  /** Tighter padding for inline/in-grid usage. */
  compact?: boolean;
  /** Heading level for the title, `2` or `3`. Defaults to `3` for a panel
   *  nested under a section heading; use `2` when the panel sits straight
   *  under the page `h1`, such as a full-page notice replacing its content. */
  headingLevel?: 2 | 3;
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
    <Button
      variant={variant}
      onClick={action.onClick}
      aria-disabled={action.isBusy || undefined}
    >
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
  headingLevel = 3,
  className,
}: EmptyStateProps) {
  const cls = [styles.empty, compact && styles.compact, className]
    .filter(Boolean)
    .join(" ");
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className={cls} role="status">
      {icon && (
        <span className={styles.icon} aria-hidden>
          {icon}
        </span>
      )}
      <Heading className={styles.title}>{title}</Heading>
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
