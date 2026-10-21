import type { CSSProperties } from "react";
import sk from "./studioSkeleton.module.css";

/** A single shimmering line, light-on-dark (mirrors SkeletonLine for studio). */
export function StudioLine({
  width = "100%",
  height = 14,
  style,
}: {
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={sk.shimmer}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}

/** Mirrors studio.module.css .card: square cover + title line + meta line. */
export function StudioCardSkeleton() {
  return (
    <div className={sk.card}>
      <div className={`${sk.shimmer} ${sk.cardCov}`} />
      <StudioLine width="80%" height={15} style={{ marginTop: 2 }} />
      <StudioLine width="50%" height={12} />
    </div>
  );
}

/** Mirrors studio.module.css .setRow: number, cover, title, pay, time. */
export function StudioTrackRowSkeleton() {
  return (
    <div className={sk.setRow}>
      <StudioLine width={14} height={12} />
      <div className={`${sk.shimmer} ${sk.setCov}`} />
      <div>
        <StudioLine width="55%" height={13} />
        <StudioLine width="35%" height={11} style={{ marginTop: 6 }} />
      </div>
      <StudioLine width={64} height={11} />
      <StudioLine width={28} height={11} />
    </div>
  );
}

/** A grid of card skeletons (count mirrors the real result row). */
export function StudioCardGridSkeleton({
  count,
  className,
  style,
}: {
  count: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={className} style={style}>
      {Array.from({ length: count }).map((_, i) => (
        <StudioCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Props every skeleton container shares. A page that stacks several skeletons
 *  sets isDecorative on each and wraps them in one labelled status. */
function busyProps(label: string, isDecorative: boolean) {
  return isDecorative
    ? ({ "aria-hidden": true } as const)
    : ({ role: "status", "aria-busy": true, "aria-label": label } as const);
}

/** Hero: optional cover beside title, meta and action lines. */
export function StudioHeroSkeleton({
  hasCover = true,
  label,
  isDecorative = false,
}: {
  hasCover?: boolean;
  label: string;
  isDecorative?: boolean;
}) {
  return (
    <div className={sk.hero} {...busyProps(label, isDecorative)}>
      {hasCover && <div className={`${sk.shimmer} ${sk.heroCover}`} />}
      <div className={sk.heroText}>
        <StudioLine width="30%" height={12} />
        <StudioLine width="60%" height={36} />
        <StudioLine width="40%" height={14} />
        <StudioLine width={120} height={40} style={{ marginTop: 8 }} />
      </div>
    </div>
  );
}

/** Tracklist rows on the real row's columns at every breakpoint. */
export function StudioTracklistSkeleton({
  rows = 8,
  showCover = true,
  label,
  isDecorative = false,
}: {
  rows?: number;
  showCover?: boolean;
  label: string;
  isDecorative?: boolean;
}) {
  const rowClass = showCover
    ? `${sk.trackRow} ${sk.trackRowCover}`
    : sk.trackRow;
  return (
    <div {...busyProps(label, isDecorative)}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className={rowClass}>
          <div className={sk.trackNumber}>
            <StudioLine width={14} height={12} />
          </div>
          {showCover && <div className={`${sk.shimmer} ${sk.trackCover}`} />}
          <div className={sk.trackText}>
            <StudioLine width="55%" height={13} />
            <StudioLine width="35%" height={11} />
          </div>
          <StudioLine width={28} height={11} />
        </div>
      ))}
    </div>
  );
}

/** A sideways shelf of card skeletons (2.3 visible on phones). */
export function StudioShelfSkeleton({
  cards = 6,
  label,
  isDecorative = false,
}: {
  cards?: number;
  label: string;
  isDecorative?: boolean;
}) {
  return (
    <div className={sk.shelf} {...busyProps(label, isDecorative)}>
      {Array.from({ length: cards }).map((_, cardIndex) => (
        <div key={cardIndex} className={sk.shelfCard}>
          <StudioCardSkeleton />
        </div>
      ))}
    </div>
  );
}

/** Table rows with equal-width cells, plus a header line. */
export function StudioTableSkeleton({
  rows = 5,
  columns,
  label,
  isDecorative = false,
}: {
  rows?: number;
  columns: number;
  label: string;
  isDecorative?: boolean;
}) {
  const columnStyle = { "--skeleton-columns": columns } as CSSProperties;
  return (
    <div {...busyProps(label, isDecorative)}>
      <div className={sk.tableRow} style={columnStyle}>
        {Array.from({ length: columns }).map((_, columnIndex) => (
          <StudioLine key={columnIndex} width="50%" height={11} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className={sk.tableRow} style={columnStyle}>
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <StudioLine key={columnIndex} width="75%" height={13} />
          ))}
        </div>
      ))}
    </div>
  );
}
