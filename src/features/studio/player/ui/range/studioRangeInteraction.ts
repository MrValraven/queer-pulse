import type { RefObject } from "react";
import type {
  StudioRangeBubbleContent,
  StudioRangeCommitMode,
  StudioRangeKeySteps,
} from "./studioRange.types";

export type StudioRangePointerType = "mouse" | "touch" | "pen";

/** The props and displayed value as of the last render, for handlers, timers and frames. */
export interface StudioRangeLatest {
  min: number;
  max: number;
  /** The clamped value the slider draws right now. */
  displayedValue: number;
  isDisabled: boolean;
  commitMode: StudioRangeCommitMode;
  keySteps: StudioRangeKeySteps;
  keyCommitDelayMs: number;
  onCommit: (value: number) => void;
  onPreviewChange?: (previewValue: number | null) => void;
  describeValue?: (value: number) => StudioRangeBubbleContent | null;
}

export type StudioRangeLatestRef = RefObject<StudioRangeLatest>;

/** The live preview a drag or a key burst draws until it commits or ends. */
export interface StudioRangePreviewControl {
  /** The preview as handlers see it, ahead of the next render. */
  previewRef: RefObject<number | null>;
  showPreview: (previewValue: number) => void;
  /** Clears the preview and reports null, once. */
  endPreview: () => void;
}

/** The geometry a drag cached at press start. */
export interface StudioRangeDragGeometry {
  isRightToLeft: boolean;
  width: number;
  pointerType: StudioRangePointerType;
}

export function toRangePointerType(
  pointerType: string,
): StudioRangePointerType {
  if (pointerType === "touch" || pointerType === "pen") return pointerType;
  return "mouse";
}
