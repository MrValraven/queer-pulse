import type { ReactNode } from "react";
import { FiChevronDown } from "react-icons/fi";
import styles from "./AdminMemberAccessPanel.module.css";

/** Granted or active, nothing held, or the state could not be read. */
export type AdminAccessTone = "on" | "off" | "warn";

const DOT_CLASS: Record<AdminAccessTone, string | undefined> = {
  on: styles.dot_on,
  off: styles.dot_off,
  warn: styles.dot_warn,
};

/**
 * The frame around the drawer's access rows. A list, so each row is an item
 * and the hairline between two rows belongs to the second one: a row that
 * renders nothing while it loads leaves no empty slot or doubled line.
 */
export function AdminAccessPanel({ children }: { children: ReactNode }) {
  return <ul className={styles.panel}>{children}</ul>;
}

/**
 * One access row in the member drawer: what the access is, where the member
 * stands (a status line led by a tone dot), an optional footnote, and the
 * action on the right. Staff roles, the ambassador tag, Studio access and
 * Invites all share it so the four read as one panel.
 *
 * With `disclosure`, the title and status become a single button that shows
 * and hides `children`, and the chevron takes the action's place. The
 * footnote stays outside that button, since it explains the state.
 */
export function AdminAccessRow({
  title,
  status,
  tone,
  footnote,
  footnoteId,
  action,
  disclosure,
  children,
}: {
  title: string;
  status: string;
  tone: AdminAccessTone;
  footnote?: ReactNode;
  /** `id` for the footnote, so a control in `action` can point
   *  `aria-describedby` at it. */
  footnoteId?: string;
  action?: ReactNode;
  disclosure?: {
    isOpen: boolean;
    onToggle: () => void;
    /** `id` of the always-mounted region the button shows and hides. */
    controlsId: string;
  };
  children?: ReactNode;
}) {
  const text = (
    <span className={styles.text}>
      <span className={styles.title}>{title}</span>
      <span className={styles.status}>
        <span className={`${styles.dot} ${DOT_CLASS[tone]}`} aria-hidden />
        <span>{status}</span>
      </span>
    </span>
  );

  return (
    <li className={styles.row}>
      {disclosure ? (
        <button
          type="button"
          className={`${styles.head} ${styles.headButton}`}
          aria-expanded={disclosure.isOpen}
          aria-controls={disclosure.controlsId}
          onClick={disclosure.onToggle}
        >
          {text}
          <span
            className={`${styles.chevron} ${
              disclosure.isOpen ? styles.chevronOpen : ""
            }`}
            aria-hidden
          >
            <FiChevronDown />
          </span>
        </button>
      ) : (
        <div className={styles.head}>
          {text}
          {action && <div className={styles.action}>{action}</div>}
        </div>
      )}
      {footnote && (
        <p id={footnoteId} className={styles.footnote}>
          {footnote}
        </p>
      )}
      {children}
    </li>
  );
}
