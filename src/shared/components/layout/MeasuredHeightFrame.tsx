import {
  type ReactNode,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { cx } from "../../lib/cx";
import styles from "./MeasuredHeightFrame.module.css";
import { useMeasuredContentHeight } from "./useMeasuredContentHeight";

/** How far apart, in pixels, the height on screen and the content's height
 *  may be for the frame to count as at rest. */
const SETTLED_HEIGHT_TOLERANCE = 0.5;
/** `--ease`, written out for the Web Animation, which reads no custom
 *  properties. */
const HANDOVER_EASE = "cubic-bezier(0.22, 0.68, 0.16, 1)";
/** `--dur-base`, in milliseconds. */
const HANDOVER_DURATION_MS = 250;

/**
 * A box that eases to its content's height (`useMeasuredContentHeight`), so
 * whatever sits below glides when the content grows or shrinks, for content
 * whose size changes in one layout pass: a chip row gaining a line, one view
 * swapped for another. Content that already animates its own height (a
 * `Collapse`) belongs outside the frame, where the frame never chases it.
 *
 * Content that does both turns `shouldAnimateHeight` off while a `Collapse`
 * inside does the moving. The frame then sits at the content's natural
 * height, so the `Collapse` drives the motion alone and the frame follows it
 * on the same frame, with nothing clipped. Turned off mid-glide, or in the
 * same render that swaps the content, the frame goes back to the content's
 * height at once and carries what was left of the glide as a bottom margin
 * on the content that eases to nothing, so the content below lands without
 * a jump while the frame follows the content from then on.
 *
 * The first measurement lands without a transition, so a frame never grows in
 * on load. The frame clips while it moves, and its padding (cancelled by a
 * matching negative margin) keeps a focus ring at the content's edge inside
 * the clip. Reduced motion shortens the transition to nothing (base.css) and
 * skips the handover.
 */
export function MeasuredHeightFrame({
  children,
  className,
  shouldAnimateHeight = true,
}: {
  children: ReactNode;
  className?: string;
  /** Whether the frame eases to each new measurement. When false it keeps
   *  the content's natural height (`auto`), which follows the content with
   *  no delay. Switching it on mid-life starts from the height on screen,
   *  and switching it off mid-glide finishes the glide on the way down to
   *  `auto`. Defaults to true. */
  shouldAnimateHeight?: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const { contentRef, contentHeight, isTransitionEnabled } =
    useMeasuredContentHeight<HTMLDivElement>();
  const { isHandingOver, glideStart } = useGlideHandover(
    shouldAnimateHeight,
    frameRef,
    contentRef,
    contentHeight,
  );
  const isSized =
    (shouldAnimateHeight || isHandingOver) &&
    isTransitionEnabled &&
    contentHeight !== null;
  const isHeldAtGlideStart = isSized && glideStart !== null;
  return (
    <div
      ref={frameRef}
      className={cx(
        styles.frame,
        isSized && !isHeldAtGlideStart && styles.frameSized,
        className,
      )}
      style={isSized ? { height: glideStart ?? contentHeight } : undefined}
    >
      <div ref={contentRef} className={styles.content}>
        {children}
      </div>
    </div>
  );
}

/**
 * Lets the frame drop its eased height, and take it up again, without a
 * jump.
 *
 * `isHandingOver` is true for the one commit where `shouldAnimateHeight`
 * turns off, so the frame still holds its eased height when the layout
 * effect reads it. The effect then sets the gap between that height and the
 * content's as a bottom margin on the content, releases the frame to `auto`
 * before the next paint, and eases the margin to zero over one glide. A
 * frame already at rest lets go with nothing to carry.
 *
 * Turning `shouldAnimateHeight` back on while that margin is still easing
 * away stops it, and `glideStart` holds the frame for one frame at the
 * height it had on screen (the content plus what was left of the margin),
 * with no transition, so the glide to the next measurement starts from there.
 */
function useGlideHandover(
  shouldAnimateHeight: boolean,
  frameRef: RefObject<HTMLDivElement | null>,
  contentRef: RefObject<HTMLDivElement | null>,
  contentHeight: number | null,
) {
  const { reducedMotion } = useMotionPrefs();
  const handoverRef = useRef<Animation | null>(null);
  const [wasAnimatingHeight, setWasAnimatingHeight] =
    useState(shouldAnimateHeight);
  const [isHandingOver, setIsHandingOver] = useState(false);
  const [glideStart, setGlideStart] = useState<number | null>(null);
  if (shouldAnimateHeight !== wasAnimatingHeight) {
    setWasAnimatingHeight(shouldAnimateHeight);
    setIsHandingOver(!shouldAnimateHeight);
  }

  useLayoutEffect(() => {
    if (!shouldAnimateHeight) return;
    const handover = handoverRef.current;
    const content = contentRef.current;
    handoverRef.current = null;
    if (!handover || handover.playState !== "running" || !content) return;
    const leftoverMargin = Number.parseFloat(
      getComputedStyle(content).marginBottom,
    );
    handover.cancel();
    if (contentHeight === null) return;
    if (Math.abs(leftoverMargin) <= SETTLED_HEIGHT_TOLERANCE) return;

    setGlideStart(contentHeight + leftoverMargin);
  }, [shouldAnimateHeight, contentRef, contentHeight]);

  useEffect(() => {
    if (glideStart === null) return;
    const frameId = requestAnimationFrame(() => setGlideStart(null));
    return () => cancelAnimationFrame(frameId);
  }, [glideStart]);

  useLayoutEffect(() => {
    if (!isHandingOver) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the frame holds its eased height for this one commit so the gap can be read below; the release re-renders before the next paint.
    setIsHandingOver(false);
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content || reducedMotion) return;
    const remainingGlide =
      Number.parseFloat(getComputedStyle(frame).height) -
      content.getBoundingClientRect().height;
    if (Math.abs(remainingGlide) <= SETTLED_HEIGHT_TOLERANCE) return;
    const handover = content.animate(
      [{ marginBottom: `${remainingGlide}px` }, { marginBottom: "0px" }],
      {
        duration: HANDOVER_DURATION_MS,
        easing: HANDOVER_EASE,
        fill: "backwards",
      },
    );
    // Timed from now. Left to itself it takes the start of the last frame
    // drawn, which after an idle spell is long gone, and the first frame
    // lands deep into the glide. Until the next frame catches up, the
    // backwards fill holds the full margin.
    handover.startTime = performance.now();
    handoverRef.current = handover;
  }, [isHandingOver, frameRef, contentRef, reducedMotion]);

  useEffect(() => () => handoverRef.current?.cancel(), []);

  return { isHandingOver, glideStart };
}
