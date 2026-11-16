import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowDown,
  FiArrowUp,
  FiArrowUpRight,
  FiMinus,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { SkeletonLine } from "../../../shared/components/ui";
import styles from "./AdminStat.module.css";

export type AdminStatDelta = {
  text: ReactNode;
  tone: "up" | "down" | "flat" | "warn" | "alert";
};

const DELTA_ICON: Record<AdminStatDelta["tone"], IconType> = {
  up: FiArrowUp,
  down: FiArrowDown,
  flat: FiMinus,
  warn: FiAlertTriangle,
  alert: FiAlertCircle,
};

export function AdminStatTiles({
  children,
  columns = 4,
  label,
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  /** Accessible name for the list of tiles. */
  label?: string;
}) {
  return (
    <div className={styles.tiles}>
      <div
        className={styles.grid}
        data-columns={columns}
        role="list"
        aria-label={label}
      >
        {children}
      </div>
    </div>
  );
}

interface AdminStatBaseProps {
  label: ReactNode;
  value: ReactNode;
  icon?: IconType;
  delta?: AdminStatDelta;
  hint?: ReactNode;
  tone?: "default" | "alert" | "warn";
  isLoading?: boolean;
}

/** A tile is a filter button (`onClick`), a link to another page (`to`), or
 *  plain. `to` and `onClick` cannot be combined. */
export type AdminStatProps = AdminStatBaseProps &
  (
    | {
        /** Turns the tile into a button. Set `isPressed` for a filter toggle;
         *  leave it out for a plain action tile. */
        onClick?: () => void;
        isPressed?: boolean;
        to?: undefined;
      }
    | {
        /** Router path. The label becomes a link that covers the whole tile. */
        to: string;
        onClick?: undefined;
        isPressed?: undefined;
      }
  );

export function AdminStat({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  tone = "default",
  onClick,
  to,
  isPressed,
  isLoading = false,
}: AdminStatProps) {
  const DeltaIcon = delta ? DELTA_ICON[delta.tone] : null;

  // A loading tile is never a button: nothing to filter by yet, and SkeletonLine
  // renders a div, which a button cannot contain.
  const isPressable = Boolean(onClick) && !isLoading;

  const isLink = Boolean(to) && !isLoading;

  const labelText = <span className={styles.labelText}>{label}</span>;

  const content = (
    <>
      <span className={styles.label}>
        {Icon && <Icon className={styles.icon} aria-hidden />}
        {isLink && to ? (
          <Link to={to} className={styles.stretchLink}>
            {labelText}
          </Link>
        ) : (
          labelText
        )}
        {isLink && <FiArrowUpRight className={styles.cue} aria-hidden />}
      </span>
      {isLoading ? (
        <div className={styles.value}>
          <SkeletonLine width="55%" height={28} />
        </div>
      ) : (
        <span className={styles.value}>{value}</span>
      )}
      {!isLoading && delta && DeltaIcon && (
        <span className={`${styles.delta} ${styles[`delta_${delta.tone}`]}`}>
          <DeltaIcon className={styles.deltaIcon} aria-hidden />
          {delta.text}
        </span>
      )}
      {!isLoading && hint && <span className={styles.hint}>{hint}</span>}
    </>
  );

  const tileClass = [
    styles.tile,
    tone === "default" ? undefined : styles[`tone_${tone}`],
    isPressable ? styles.pressable : undefined,
    isLink ? styles.linkTile : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div role="listitem" className={styles.item}>
      {isPressable ? (
        <button
          type="button"
          className={tileClass}
          aria-pressed={isPressed}
          onClick={onClick}
        >
          {content}
        </button>
      ) : (
        <div
          className={tileClass}
          aria-busy={isLoading || undefined}
          aria-disabled={onClick && isLoading ? true : undefined}
        >
          {content}
        </div>
      )}
    </div>
  );
}
