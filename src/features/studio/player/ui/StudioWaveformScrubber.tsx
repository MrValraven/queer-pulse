import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { barsForWidth, chapterTickPositions } from "./studioWaveformBars";
import styles from "./StudioWaveformScrubber.module.css";

const HEIGHTS = { bar: 32, large: 48 } as const;

function useElementWidth() {
  const [width, setWidth] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);
  const ref = useCallback((element: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!element) return;
    const measure = () => setWidth(element.getBoundingClientRect().width);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    observerRef.current = new ResizeObserver(measure);
    observerRef.current.observe(element);
  }, []);
  return { width, ref };
}

/** One stacked copy of the drawing; CSS clips and tints each copy. */
function WaveformLayer({
  className,
  viewBox,
  children,
}: {
  className: string | undefined;
  viewBox: string;
  children: ReactNode;
}) {
  return (
    <svg
      className={`${styles.layer} ${className ?? ""}`}
      aria-hidden="true"
      focusable="false"
      viewBox={viewBox}
      preserveAspectRatio="none"
    >
      {children}
    </svg>
  );
}

/** Bars from the upload-time peaks, drawn as the seek slider's visuals
 *  (spec 7.7). The slider around them owns pointer and keys and writes
 *  --studio-range-progress and --studio-range-hover, which clip the
 *  played and hovered copies of the bars. */
export function StudioWaveformScrubber({
  peaks,
  chapterStarts,
  duration,
  size,
}: {
  peaks: readonly number[];
  chapterStarts: readonly number[];
  duration: number;
  size: "bar" | "large";
}) {
  const { width, ref } = useElementWidth();
  const height = HEIGHTS[size];
  const viewBox = `0 0 ${Math.max(1, width)} ${height}`;
  const bars = useMemo(() => barsForWidth(peaks, width), [peaks, width]);
  const ticks = useMemo(
    () => chapterTickPositions(chapterStarts, duration),
    [chapterStarts, duration],
  );
  const barShapes = useMemo(() => {
    const slot = bars.length > 0 ? width / bars.length : 0;
    return bars.map((value, index) => {
      const barHeight = Math.max(2, value * height);
      return (
        <rect
          key={index}
          x={index * slot}
          y={(height - barHeight) / 2}
          width={Math.max(1, slot - 1)}
          height={barHeight}
          rx={1}
        />
      );
    });
  }, [bars, width, height]);

  return (
    <div
      ref={ref}
      className={styles.scrubber}
      data-size={size}
      aria-hidden="true"
    >
      <WaveformLayer className={styles.unplayed} viewBox={viewBox}>
        {barShapes}
      </WaveformLayer>
      <WaveformLayer className={styles.ghost} viewBox={viewBox}>
        {barShapes}
      </WaveformLayer>
      <WaveformLayer className={styles.played} viewBox={viewBox}>
        {barShapes}
      </WaveformLayer>
      <WaveformLayer className={styles.ticks} viewBox={viewBox}>
        {ticks.map((position) => (
          <line
            key={position}
            data-chapter-tick=""
            className={styles.tick}
            x1={position * width}
            x2={position * width}
            y1={0}
            y2={height}
          />
        ))}
      </WaveformLayer>
      <div className={styles.hoverLine} />
    </div>
  );
}
