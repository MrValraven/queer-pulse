import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { formatTrackTime } from "../../api/studio.adapters";
import { barsForWidth, chapterTickPositions } from "./studioWaveformBars";
import styles from "./StudioWaveformScrubber.module.css";
import { useStudioSmoothProgress } from "./useStudioSmoothProgress";

/** The class the range input takes when it lies over the bars. */
export const WAVEFORM_OVERLAY_CLASS = styles.overlay;

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

/** Bars from the upload-time peaks behind the seek slider (spec 7.7). The
 *  slider passed as `children` stays the only control. While playing, the
 *  played clip glides between clock ticks at `playbackRate`. */
export function StudioWaveformScrubber({
  peaks,
  chapterStarts,
  currentTime,
  duration,
  isPlaying,
  playbackRate,
  size,
  children,
}: {
  peaks: readonly number[];
  chapterStarts: readonly number[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: number;
  size: "bar" | "large";
  children: ReactNode;
}) {
  const { width, ref } = useElementWidth();
  const height = HEIGHTS[size];
  const clipId = `waveform-clip-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const [hover, setHover] = useState<{ x: number; seconds: number } | null>(
    null,
  );
  const bars = useMemo(() => barsForWidth(peaks, width), [peaks, width]);
  const ticks = useMemo(
    () => chapterTickPositions(chapterStarts, duration),
    [chapterStarts, duration],
  );
  const progress =
    duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
  const paintPlayedClip = useCallback(
    (rect: SVGRectElement, fraction: number) => {
      rect.setAttribute("width", String(fraction * width));
    },
    [width],
  );
  const playedClipRef = useStudioSmoothProgress({
    currentTime,
    duration,
    isPlaying,
    playbackRate,
    paint: paintPlayedClip,
  });
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

  function trackHover(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || duration <= 0 || width <= 0) return;
    const left = event.currentTarget.getBoundingClientRect().left;
    const hoverOffsetX = Math.min(width, Math.max(0, event.clientX - left));
    setHover({ x: hoverOffsetX, seconds: (hoverOffsetX / width) * duration });
  }

  return (
    <div
      ref={ref}
      className={styles.scrubber}
      data-size={size}
      onPointerMove={trackHover}
      onPointerLeave={() => setHover(null)}
    >
      <svg
        className={styles.bars}
        aria-hidden="true"
        focusable="false"
        viewBox={`0 0 ${Math.max(1, width)} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <clipPath id={clipId}>
            <rect
              ref={playedClipRef}
              x={0}
              y={0}
              width={progress * width}
              height={height}
            />
          </clipPath>
        </defs>
        <g className={styles.unplayed}>{barShapes}</g>
        <g className={styles.played} clipPath={`url(#${clipId})`}>
          {barShapes}
        </g>
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
        <line
          className={styles.hoverLine}
          data-visible={hover ? "" : undefined}
          x1={hover?.x ?? 0}
          x2={hover?.x ?? 0}
          y1={0}
          y2={height}
        />
      </svg>
      <span
        className={styles.hoverTime}
        data-visible={hover ? "" : undefined}
        style={{
          left: `clamp(var(--hover-half-width), ${hover?.x ?? 0}px, calc(100% - var(--hover-half-width)))`,
        }}
        aria-hidden="true"
      >
        {formatTrackTime(hover?.seconds ?? 0)}
      </span>
      {children}
    </div>
  );
}
