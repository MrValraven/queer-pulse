/**
 * The help legend: while the "?" toggle has help captions on, a short list
 * folds open under a row of small controls (the top row, the mirror band,
 * the strips) or over the clip grid. Each line pairs a small marker that
 * looks like the control (its icon, its label, or both) with what the
 * control does, so a row of 44px buttons gets its captions without
 * squeezing text under each one. Lines whose control comes and goes (search,
 * skip, the set list steps) fade in and out with it while the rest glide.
 * Each line's text carries `vjHelpCaptionIdOf(id)`, and the control points
 * its aria-describedby at it through `useVjHelpDescribedBy` while help is on.
 */
import type { JSX, ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { Collapse } from "../../../../shared/components/ui/Collapse";
import { useVjHelpCaptions } from "../hooks/useVjHelpCaptions";
import styles from "./VjHelpLegend.module.css";
import { vjHelpCaptionIdOf } from "./useVjHelpDescribedBy";

/** The app's ease-out token (--ease-out) at its fast duration (--dur-fast). */
const VJ_LEGEND_ITEM_TRANSITION = {
  duration: 0.15,
  ease: [0.16, 1, 0.3, 1] as const,
};
const VJ_LEGEND_ITEM_INSTANT = { duration: 0 };

export interface VjHelpLegendItem {
  /** The inventory id (`back`, `packTab`): keys the line and names its text's id. */
  id: string;
  marker: ReactNode;
  text: string;
}

/**
 * Where the legend sits: `afterInGap` follows a row inside a flex column
 * whose gap it takes over (so opening it never snaps the gap in), `after`
 * follows a row in a plain block, `before` sits over the clip grid.
 */
export type VjHelpLegendPlacement = "afterInGap" | "after" | "before";

export interface VjHelpLegendProps {
  items: readonly VjHelpLegendItem[];
  placement: VjHelpLegendPlacement;
}

export function VjHelpLegend({
  items,
  placement,
}: VjHelpLegendProps): JSX.Element {
  const { isOn } = useVjHelpCaptions();
  const { reducedMotion } = useMotionPrefs();
  const transition = reducedMotion
    ? VJ_LEGEND_ITEM_INSTANT
    : VJ_LEGEND_ITEM_TRANSITION;
  return (
    <Collapse
      isOpen={isOn && items.length > 0}
      className={placement === "afterInGap" ? styles.foldInGap : undefined}
    >
      <ul
        className={styles.legend}
        data-placement={placement}
        data-vj-help-legend=""
      >
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((item) => (
            <m.li
              key={item.id}
              layout="position"
              className={styles.item}
              data-vj-help-legend-item={item.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={transition}
            >
              {item.marker}
              <p id={vjHelpCaptionIdOf(item.id)} className={styles.text}>
                {item.text}
              </p>
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
    </Collapse>
  );
}

export type VjHelpMarkerTone = "live" | "mute";

export interface VjHelpMarkerProps {
  /** A Feather icon drawn `aria-hidden` with `fill="none"`, or a drawn shape. */
  icon?: ReactNode;
  /** The control's own visible label, when it has one. */
  label?: string;
  tone?: VjHelpMarkerTone;
}

/**
 * A small glass pill that looks like the control a legend line describes:
 * round with only an icon, a pill with a label. Hidden from assistive tech
 * when it holds only an icon; a label reads as the line's lead word.
 */
export function VjHelpMarker({
  icon,
  label,
  tone,
}: VjHelpMarkerProps): JSX.Element {
  const isIconOnly = label === undefined;
  return (
    <span
      className={styles.marker}
      data-shape={isIconOnly ? "round" : "pill"}
      data-tone={tone}
      aria-hidden={isIconOnly || undefined}
    >
      {icon}
      {label !== undefined ? (
        <span className={styles.markerLabel}>{label}</span>
      ) : null}
    </span>
  );
}

export type VjHelpShapeKind = "dot" | "mirror" | "ring";

/** A drawn stand-in for a control with no icon: the screens dot, the mini mirror, the ring. */
export function VjHelpShape({ kind }: { kind: VjHelpShapeKind }): JSX.Element {
  return <span className={styles.shape} data-shape={kind} aria-hidden="true" />;
}

/** The recent strip's marker: the newest clip's thumbnail, round like its chip. */
export function VjHelpThumbMarker({
  thumbnailUrl,
}: {
  thumbnailUrl: string;
}): JSX.Element {
  return (
    <span className={styles.marker} data-shape="thumb" aria-hidden="true">
      <img
        className={styles.thumb}
        src={thumbnailUrl}
        alt=""
        width={24}
        height={24}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </span>
  );
}
