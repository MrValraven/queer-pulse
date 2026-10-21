import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type TransitionEvent,
} from "react";
import { StudioRangeBubble } from "./StudioRangeBubble";
import { StudioRangeTrack } from "./StudioRangeTrack";
import type { StudioRangeSliderProps } from "./studioRange.types";
import { clampValue, fractionOfValue } from "./studioRangeGeometry";
import type {
  StudioRangeLatest,
  StudioRangePointerType,
  StudioRangePreviewControl,
} from "./studioRangeInteraction";
import { useStudioRangeDrag } from "./useStudioRangeDrag";
import { useStudioRangeHover } from "./useStudioRangeHover";
import { useStudioRangeKeys } from "./useStudioRangeKeys";
import { useStudioRangePointerHover } from "./useStudioRangePointerHover";
import styles from "./StudioRangeSlider.module.css";

const DEFAULT_KEY_COMMIT_DELAY_MS = 150;

/** The preview state plus a ref mirror that handlers read between renders. */
function useStudioRangePreview(latestRef: { current: StudioRangeLatest }) {
  const [previewValue, setPreviewValue] = useState<number | null>(null);
  const previewRef = useRef<number | null>(null);
  const preview = useMemo<StudioRangePreviewControl>(
    () => ({
      previewRef,
      showPreview: (nextValue: number) => {
        previewRef.current = nextValue;
        setPreviewValue(nextValue);
        latestRef.current.onPreviewChange?.(nextValue);
      },
      endPreview: () => {
        if (previewRef.current === null) return;
        previewRef.current = null;
        setPreviewValue(null);
        latestRef.current.onPreviewChange?.(null);
      },
    }),
    [latestRef],
  );
  return { previewValue, setPreviewValue, preview };
}

/** The shared seek and volume slider: a hidden native range input for focus,
 *  keys and screen readers, under visuals that pointer handlers on the root
 *  drive. */
export function StudioRangeSlider({
  variant,
  size = "bar",
  min,
  max,
  value,
  isDisabled = false,
  commitMode,
  keySteps,
  keyCommitDelayMs = DEFAULT_KEY_COMMIT_DELAY_MS,
  inputStep,
  onPreviewChange,
  onCommit,
  ariaLabel,
  ariaValueText,
  ariaValueNow,
  describeValue,
  tickFractions,
  bufferedSpans,
  visual,
  progressElementRef,
  interactionResetKey = null,
  isGliding = false,
  onGlideEnd,
  className,
}: StudioRangeSliderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const latestRef = useRef<StudioRangeLatest>({
    min,
    max,
    displayedValue: clampValue(value, min, max),
    isDisabled,
    commitMode,
    keySteps,
    keyCommitDelayMs,
    onCommit,
    onPreviewChange,
    describeValue,
  });
  const { previewValue, setPreviewValue, preview } =
    useStudioRangePreview(latestRef);
  const [dragPointerType, setDragPointerType] =
    useState<StudioRangePointerType | null>(null);
  const [resetGeneration, setResetGeneration] = useState(0);
  const [resetInputs, setResetInputs] = useState({
    resetKey: interactionResetKey,
    isDisabled,
  });
  // A new reset key (a new track) or turning disabled drops any drag or key
  // burst with no commit; the hooks clear their timers and frames in effects.
  if (
    resetInputs.resetKey !== interactionResetKey ||
    resetInputs.isDisabled !== isDisabled
  ) {
    const shouldReset =
      resetInputs.resetKey !== interactionResetKey || isDisabled;
    setResetInputs({ resetKey: interactionResetKey, isDisabled });
    if (shouldReset) {
      setPreviewValue(null);
      setDragPointerType(null);
      setResetGeneration((generation) => generation + 1);
    }
  }

  const displayedValue = clampValue(previewValue ?? value, min, max);
  useLayoutEffect(() => {
    latestRef.current = {
      min,
      max,
      displayedValue,
      isDisabled,
      commitMode,
      keySteps,
      keyCommitDelayMs,
      onCommit,
      onPreviewChange,
      describeValue,
    };
  });
  useLayoutEffect(() => {
    if (resetGeneration > 0) preview.endPreview();
  }, [preview, resetGeneration]);

  const hover = useStudioRangeHover({ rootRef, latestRef, resetGeneration });
  const keys = useStudioRangeKeys({
    inputRef,
    latestRef,
    preview,
    resetGeneration,
  });
  const drag = useStudioRangeDrag({
    rootRef,
    inputRef,
    latestRef,
    preview,
    hover,
    flushKeyCommit: keys.flushPendingCommit,
    setDragPointerType,
    resetGeneration,
  });
  const pointerHover = useStudioRangePointerHover({ isDisabled, hover, drag });

  const setRootElement = useCallback(
    (element: HTMLDivElement | null) => {
      rootRef.current = element;
      if (progressElementRef) progressElementRef.current = element;
    },
    [progressElementRef],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      // An Escape with nothing to cancel bubbles on, so Now Playing closes.
      if (drag.cancelDrag() || keys.cancelPendingCommit()) {
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }
    keys.handleKeyDown(event, drag.isDragging());
  };
  const handleGlideEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (
      event.target === event.currentTarget &&
      event.propertyName === "--studio-range-progress"
    ) {
      onGlideEnd?.();
    }
  };

  const pointerType = dragPointerType ?? pointerHover.hoverPointerType;
  const rootStyle = {
    "--studio-range-progress": fractionOfValue(displayedValue, min, max),
  } as CSSProperties;

  return (
    <div
      ref={setRootElement}
      className={[styles.range, className].filter(Boolean).join(" ")}
      data-studio-range={variant}
      data-size={size}
      data-dragging={dragPointerType !== null ? "" : undefined}
      data-pointer={pointerType ?? undefined}
      data-disabled={isDisabled ? "" : undefined}
      data-gliding={isGliding ? "" : undefined}
      style={rootStyle}
      onPointerDown={drag.handlePointerDown}
      onPointerMove={pointerHover.handlePointerMove}
      onPointerUp={drag.handlePointerUp}
      onPointerCancel={drag.handlePointerCancel}
      onLostPointerCapture={drag.handleLostPointerCapture}
      onPointerEnter={pointerHover.handlePointerEnter}
      onPointerLeave={pointerHover.handlePointerLeave}
      onTransitionEnd={handleGlideEnd}
      onTransitionCancel={handleGlideEnd}
    >
      {visual ?? (
        <StudioRangeTrack
          tickFractions={tickFractions}
          bufferedSpans={bufferedSpans}
        />
      )}
      {describeValue ? <StudioRangeBubble refs={hover.bubbleRefs} /> : null}
      <input
        ref={inputRef}
        type="range"
        className={styles.input}
        min={min}
        max={max}
        step={inputStep ?? keySteps.arrow}
        value={ariaValueNow ?? displayedValue}
        aria-label={ariaLabel}
        aria-valuetext={ariaValueText}
        aria-disabled={isDisabled || undefined}
        onKeyDown={handleKeyDown}
        onChange={keys.handleChange}
        onBlur={keys.flushPendingCommit}
      />
    </div>
  );
}
