import type { ReactNode, RefObject } from "react";

export type StudioRangeVariant = "seek" | "volume";
export type StudioRangeSize = "bar" | "large";
export type StudioRangeCommitMode = "release" | "continuous";

export interface StudioRangeKeySteps {
  /** ArrowLeft/Right/Up/Down (Left and Right swap under RTL). */
  arrow: number;
  /** PageUp/PageDown. Home/End always go to min/max. */
  page: number;
}

/** A span as fractions of the track, 0 to 1, in reading order. */
export interface StudioRangeFractionSpan {
  startFraction: number;
  endFraction: number;
}

export interface StudioRangeBubbleContent {
  /** "1:23" */
  valueLabel: string;
  /** A chapter title, or null. */
  detailLabel: string | null;
}

/** The DOM nodes the hover hook writes to; StudioRangeBubble attaches them. */
export interface StudioRangeBubbleRefs {
  /** Positioned with an inline transform and left untransitioned. */
  anchorRef: RefObject<HTMLDivElement | null>;
  /** Gets `data-visible` while shown. */
  bubbleRef: RefObject<HTMLDivElement | null>;
  /** Text via textContent; gets `data-empty` when there is no detail. */
  detailRef: RefObject<HTMLSpanElement | null>;
  valueRef: RefObject<HTMLSpanElement | null>;
}

export interface StudioRangeSliderProps {
  variant: StudioRangeVariant;
  /** Default "bar". */
  size?: StudioRangeSize;
  min: number;
  max: number;
  /** Drawn when no preview is active (clock time, held seek, volume percent). */
  value: number;
  /** Focusable and announced, ignores pointer and keys, drawn at rest. */
  isDisabled?: boolean;
  /** "release": one onCommit per drag (pointerup) or per key burst. "continuous": onCommit on press, every move and every key step. */
  commitMode: StudioRangeCommitMode;
  keySteps: StudioRangeKeySteps;
  /** Release mode: delay after the last key before committing. Default 150. */
  keyCommitDelayMs?: number;
  /** Native input step; default "any". */
  inputStep?: number | "any";
  /** The preview value on every drag move or key step; null once the preview ends. */
  onPreviewChange?: (previewValue: number | null) => void;
  onCommit: (value: number) => void;
  ariaLabel: string;
  ariaValueText: string;
  /** The native input's reported value; defaults to the displayed value. */
  ariaValueNow?: number;
  /** Enables the hover/drag bubble; null hides it for that value. */
  describeValue?: (value: number) => StudioRangeBubbleContent | null;
  /** Chapter ticks, fractions 0 to 1 (default track only). */
  tickFractions?: readonly number[];
  /** Faint second fill (default track only). */
  bufferedSpans?: readonly StudioRangeFractionSpan[];
  /** Custom visuals replacing the default track (the waveform), rendered in flow as the root's first child. */
  visual?: ReactNode;
  /** The slider assigns its root element here, so a painter can write --studio-range-progress every frame. */
  progressElementRef?: RefObject<HTMLDivElement | null>;
  /** Any change cancels a drag or a pending key commit with no commit. */
  interactionResetKey?: string | null;
  /** A one-off glide of the fill (mute toggle). */
  isGliding?: boolean;
  onGlideEnd?: () => void;
  className?: string;
}
