import { useId, type ReactNode, type Ref } from "react";
import styles from "./AdminPanel.module.css";

export interface AdminPanelProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Right-aligned controls in the header row. */
  actions?: ReactNode;
  children: ReactNode;
  /** `flush` drops the body padding. Tables use it so rows run edge to edge. */
  padding?: "default" | "flush";
  as?: "section" | "div";
  /** Gives the title `tabIndex={-1}` so a page can move focus onto it. */
  isTitleFocusable?: boolean;
  /** Ref to the title h2. */
  titleRef?: Ref<HTMLHeadingElement>;
  /** Gives the title this id. Falls back to a generated one. */
  titleId?: string;
  className?: string;
  /** Extra class on the body wrapper (the element that carries `flush`). */
  bodyClassName?: string;
  /** Flush bodies only: skip the corner clip so popovers (a row menu) can
   *  overflow, and round the first and last child to the panel corners. */
  isOverflowVisible?: boolean;
}

/**
 * The one admin surface: a paper card on the cream canvas with an optional
 * header row (serif title, description, actions) above the body.
 */
export function AdminPanel({
  title,
  description,
  actions,
  children,
  padding = "default",
  as: Tag = "section",
  titleId,
  isTitleFocusable = false,
  titleRef,
  className,
  bodyClassName,
  isOverflowVisible = false,
}: AdminPanelProps) {
  const generatedId = useId();
  const headingId = titleId ?? `admin-panel-${generatedId}`;
  const hasTitle = title !== undefined && title !== null && title !== false;
  const hasHeader = hasTitle || Boolean(description) || Boolean(actions);

  return (
    <Tag
      className={[styles.panel, className].filter(Boolean).join(" ")}
      aria-labelledby={hasTitle ? headingId : undefined}
      role={Tag === "div" && hasTitle ? "group" : undefined}
    >
      {hasHeader && (
        <header className={styles.header}>
          <div className={styles.headText}>
            {hasTitle && (
              <h2
                id={headingId}
                ref={titleRef}
                tabIndex={isTitleFocusable ? -1 : undefined}
                className={styles.title}
              >
                {title}
              </h2>
            )}
            {description && <p className={styles.description}>{description}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      <div
        className={[
          styles.body,
          padding === "flush" ? styles.flush : undefined,
          padding === "flush" && isOverflowVisible
            ? styles.flushVisible
            : undefined,
          bodyClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </Tag>
  );
}
