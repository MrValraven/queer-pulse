import { useId, type ReactNode, type HTMLAttributes } from "react";
import { FiChevronDown, FiSliders } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./RefineDrawer.module.css";

/**
 * The "Refine" pill that opens the drawer.
 *
 * It carries the count of everything currently narrowing the list from inside
 * the drawer, so a closed drawer still says that filters are applied. What
 * those filters ARE is a separate job, answered by `ActiveFilters`.
 */
export function RefineToggle({
  isOpen,
  panelId,
  onToggle,
  activeCount = 0,
  className,
}: {
  isOpen: boolean;
  panelId: string;
  onToggle: () => void;
  /** Active filters living inside the drawer. Zero hides the badge. */
  activeCount?: number;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className={[styles.toggle, className].filter(Boolean).join(" ")}
      aria-expanded={isOpen}
      aria-controls={panelId}
      onClick={onToggle}
    >
      <FiSliders aria-hidden />
      {t("shared:refine.label")}
      {activeCount > 0 && (
        <span className={styles.count} aria-hidden>
          {activeCount}
        </span>
      )}
      <span
        className={[styles.chevron, isOpen && styles.chevronOpen]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      >
        <FiChevronDown />
      </span>
    </button>
  );
}

/**
 * The drawer itself: a paper panel whose DIRECT CHILDREN each become a band,
 * separated by a hairline. Pass one element per group.
 *
 * The body stays mounted so it can animate open AND closed; `inert` keeps the
 * hidden groups out of tab order and off screen readers meanwhile.
 */
export function RefinePanel({
  isOpen,
  isSettled,
  panelId,
  children,
}: {
  isOpen: boolean;
  isSettled: boolean;
  panelId: string;
  children: ReactNode;
}) {
  return (
    <div
      className={[styles.wrap, isOpen && styles.wrapOpen]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        id={panelId}
        className={[styles.body, isSettled && styles.bodyOpen]
          .filter(Boolean)
          .join(" ")}
        inert={!isOpen || undefined}
      >
        <div className={styles.panel}>{children}</div>
      </div>
    </div>
  );
}

/**
 * One named band inside the panel: an uppercase label over its controls.
 *
 * ARIA wiring is left to the caller, because only the caller knows whether the
 * band is a semantic grouping. Pass `labelId` plus `role="group"` +
 * `aria-labelledby` when it is, or point a `Select`'s `labelledBy` at it; a
 * band that is only a visual heading needs neither.
 */
export function RefineGroup({
  label,
  labelId,
  children,
  ...rest
}: {
  label: string;
  /** Id put on the label element, so a control inside can be named by it. */
  labelId?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "className">) {
  const generatedId = useId();

  return (
    <div className={styles.group} {...rest}>
      <span className={styles.groupLabel} id={labelId ?? generatedId}>
        {label}
      </span>
      {children}
    </div>
  );
}

/**
 * Two short groups side by side inside one band, stacking on narrow screens.
 * The first column is capped so a select can't stretch across the whole row.
 */
export function RefineSplit({ children }: { children: ReactNode }) {
  return <div className={styles.split}>{children}</div>;
}

/** A quiet line under a control, explaining what it is currently doing. */
export function RefineNote({ children }: { children: ReactNode }) {
  return <p className={styles.note}>{children}</p>;
}
