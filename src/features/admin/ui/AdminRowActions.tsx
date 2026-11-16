import type { ReactNode } from "react";
import styles from "./AdminRowActions.module.css";

/** Classes a row's buttons take inside `AdminRowActions`. `danger` turns a
 *  `ghost` Button into the outline danger tone for a destructive action. */
export const adminRowActionClasses = {
  danger: styles.danger,
};

/**
 * The action group at the end of a list or table row. It lays its buttons out
 * in one row (8px apart, end-aligned on desktop, wrapping on a phone) and sizes
 * every shared `Button` or link inside it to the compact row size: 36px tall on
 * a mouse, the 44px touch target on a coarse pointer, tighter side padding and
 * no drop shadow.
 *
 * Action rule for a row:
 * - One primary (filled) action at most, e.g. "Approve".
 * - Every other action is outline (`ghost`) or `quiet`.
 * - A destructive action ("Decline", "Remove") is outline in the danger tone.
 *   A filled red button stays out of rows.
 * - With three or more secondary actions, the primary stays visible and the
 *   rest move into the page's overflow menu when it has one; a page without
 *   one shows two at most.
 *
 * ```tsx
 * <AdminRowActions>
 *   <Button
 *     size="sm"
 *     variant="ghost"
 *     className={adminRowActionClasses.danger}
 *   >
 *     Decline
 *   </Button>
 *   <Button size="sm">Approve</Button>
 * </AdminRowActions>
 * ```
 */
export function AdminRowActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[styles.rowActions, className].filter(Boolean).join(" ")}
      data-admin-row-actions=""
    >
      {children}
    </div>
  );
}
