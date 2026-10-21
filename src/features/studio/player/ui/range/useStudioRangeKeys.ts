import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { clampValue, isRightToLeft, steppedValue } from "./studioRangeGeometry";
import type {
  StudioRangeLatestRef,
  StudioRangePreviewControl,
} from "./studioRangeInteraction";

export interface StudioRangeKeysControl {
  /** Arrows, PageUp/PageDown, Home and End. A drag in progress swallows them. */
  handleKeyDown: (
    event: KeyboardEvent<HTMLInputElement>,
    isDragging: boolean,
  ) => void;
  /** A native step (a screen reader increment) counts as one key step. */
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Commits a pending key burst now; nothing when none is pending. */
  flushPendingCommit: () => void;
  /** Drops a pending key burst with no commit; true when one was pending. */
  cancelPendingCommit: () => boolean;
}

interface StudioRangeKeysOptions {
  inputRef: RefObject<HTMLInputElement | null>;
  latestRef: StudioRangeLatestRef;
  preview: StudioRangePreviewControl;
  /** Bumps when the slider resets; a pending burst drops with no commit. */
  resetGeneration: number;
}

/** Keyboard stepping. Release mode previews each step and commits once the
 *  keys go quiet for keyCommitDelayMs; continuous mode commits every step. */
export function useStudioRangeKeys({
  inputRef,
  latestRef,
  preview,
  resetGeneration,
}: StudioRangeKeysOptions): StudioRangeKeysControl {
  const commitTimerRef = useRef<number | null>(null);

  const control = useMemo(() => {
    const clearTimer = () => {
      if (commitTimerRef.current !== null) {
        window.clearTimeout(commitTimerRef.current);
      }
      commitTimerRef.current = null;
    };
    const commitPending = () => {
      clearTimer();
      const pendingValue = preview.previewRef.current;
      if (pendingValue === null) return;
      latestRef.current.onCommit(pendingValue);
      preview.endPreview();
    };
    const applyStep = (nextValue: number) => {
      const latest = latestRef.current;
      if (latest.commitMode === "continuous") {
        latest.onCommit(nextValue);
        return;
      }
      preview.showPreview(nextValue);
      clearTimer();
      commitTimerRef.current = window.setTimeout(
        commitPending,
        latest.keyCommitDelayMs,
      );
    };
    const currentValue = () =>
      preview.previewRef.current ?? latestRef.current.displayedValue;

    return {
      handleKeyDown: (
        event: KeyboardEvent<HTMLInputElement>,
        isDragging: boolean,
      ) => {
        const latest = latestRef.current;
        const input = inputRef.current;
        const isReversed = input ? isRightToLeft(input) : false;
        const nextValue = steppedValue(
          event.key,
          currentValue(),
          latest.keySteps,
          latest.min,
          latest.max,
          isReversed,
        );
        if (nextValue === null) return;
        // The slider owns these keys; the window-level shortcuts stay out.
        event.preventDefault();
        event.stopPropagation();
        if (latest.isDisabled || isDragging) return;
        // At a boundary the step lands on the current value; nothing to commit.
        if (nextValue === currentValue()) return;
        applyStep(nextValue);
      },
      handleChange: (event: ChangeEvent<HTMLInputElement>) => {
        const latest = latestRef.current;
        if (latest.isDisabled) return;
        const rawValue = Number(event.currentTarget.value);
        if (Number.isNaN(rawValue)) return;
        const nextValue = clampValue(rawValue, latest.min, latest.max);
        if (nextValue === currentValue()) return;
        applyStep(nextValue);
      },
      flushPendingCommit: () => {
        if (commitTimerRef.current !== null) commitPending();
      },
      cancelPendingCommit: () => {
        if (commitTimerRef.current === null) return false;
        clearTimer();
        preview.endPreview();
        return true;
      },
    };
  }, [inputRef, latestRef, preview]);

  useLayoutEffect(() => {
    if (resetGeneration === 0 || commitTimerRef.current === null) return;
    window.clearTimeout(commitTimerRef.current);
    commitTimerRef.current = null;
  }, [resetGeneration]);

  // Unmounting mid burst still lands the last step.
  useEffect(() => () => control.flushPendingCommit(), [control]);

  return control;
}
