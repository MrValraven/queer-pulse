import type { ReactNode } from "react";
import { studioHeroTitleLength } from "./studioHeroTitleSize";
import styles from "./studio.module.css";

/** The eyebrow, the page's one h1 and the credit line. */
export function HeroHeading({
  kind,
  title,
  titleId,
  by,
}: {
  kind: ReactNode;
  title: ReactNode;
  titleId?: string;
  by: ReactNode;
}) {
  const titleLength = studioHeroTitleLength(title);
  return (
    <>
      <div className={styles.kind}>{kind}</div>
      {/* A long title steps down in size and clamps to three lines; the
          full text stays in the DOM and in the tooltip. */}
      <h1
        id={titleId}
        data-length={titleLength === "default" ? undefined : titleLength}
        title={
          typeof title === "string" && titleLength !== "default"
            ? title
            : undefined
        }
      >
        {title}
      </h1>
      <div className={styles.by}>{by}</div>
    </>
  );
}

/** The action row, then the caller's extra block (a pay pill). */
export function HeroActionsRow({
  actions,
  actionsClassName,
  isActionsCompact,
  children,
}: {
  actions: ReactNode;
  actionsClassName?: string;
  isActionsCompact?: boolean;
  children?: ReactNode;
}) {
  return (
    <>
      <div
        className={
          actionsClassName
            ? `${styles.heroActions} ${actionsClassName}`
            : styles.heroActions
        }
        data-compact={isActionsCompact || undefined}
      >
        {actions}
      </div>
      {children}
    </>
  );
}
