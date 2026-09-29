import { useEffect, type RefObject } from "react";

/** The core's share of Ping's width (`.core { inset: 37% }` leaves 26%). */
const CORE_SHARE = 0.26;
/** How far the eye may turn, as a share of the core's own width. */
const MAX_GAZE_SHARE = 0.7;
/** Pointer distance, in Ping widths, at which the eye is fully turned. */
const FULL_TURN_REACH = 1.5;
/** Stillness before Ping gives up on the pointer and looks around again. */
const IDLE_BEFORE_RETURN_MS = 2500;
/** Matches the `.gaze` transition, so the loop resumes once the eye is home. */
const RETURN_DURATION_MS = 560;
/** How long the core takes to leave its look-around pose when tracking starts. */
const POSE_RELEASE_MS = 420;

/**
 * Makes Ping's eye follow the pointer. One window `pointermove` listener,
 * throttled to one update per animation frame, writes `--ping-gaze-x` and
 * `--ping-gaze-y` on the gaze wrapper, whose CSS transition does the easing.
 * The look-around keyframes live on the travelling eye and the core inside it,
 * so they never fight the gaze over one transform.
 *
 * While tracking, `data-tracking` on the root switches the look-around loop
 * off, and the eye and core ease out of whatever pose the loop left them in. After
 * 2.5s without movement the eye eases back to centre and the loop restarts
 * from its first frame, which is that same centred pose.
 *
 * `isEnabled` is the caller's call: searching mood, a fine hovering pointer,
 * and motion allowed. Everything is undone when it turns false or on unmount.
 */
export function usePingGaze(
  rootRef: RefObject<HTMLElement | null>,
  gazeRef: RefObject<HTMLElement | null>,
  travelRef: RefObject<HTMLElement | null>,
  coreRef: RefObject<HTMLElement | null>,
  isEnabled: boolean,
): void {
  useEffect(() => {
    const root = rootRef.current;
    const gaze = gazeRef.current;
    const travel = travelRef.current;
    const core = coreRef.current;
    if (!isEnabled || !root || !gaze || !travel || !core) return;

    let frameId = 0;
    let idleTimeoutId = 0;
    let resumeTimeoutId = 0;
    let isTracking = false;
    let pointerX = 0;
    let pointerY = 0;

    const setGaze = (offsetX: number, offsetY: number): void => {
      gaze.style.setProperty("--ping-gaze-x", `${offsetX.toFixed(2)}px`);
      gaze.style.setProperty("--ping-gaze-y", `${offsetY.toFixed(2)}px`);
    };

    const startTracking = (): void => {
      // Read both loop poses before the loop stands down, then ease each
      // layer from where it was, so neither the eye nor the core jumps.
      const posedElements = [travel, core].map((element) => ({
        element,
        loopPose: getComputedStyle(element).transform,
      }));
      root.dataset.tracking = "true";
      isTracking = true;
      const easeOut = getComputedStyle(root)
        .getPropertyValue("--ease-out")
        .trim();
      for (const { element, loopPose } of posedElements) {
        if (!loopPose || loopPose === "none") continue;
        element.animate([{ transform: loopPose }, { transform: "none" }], {
          duration: POSE_RELEASE_MS,
          easing: easeOut || "ease-out",
        });
      }
    };

    const returnToCentre = (): void => {
      setGaze(0, 0);
      resumeTimeoutId = window.setTimeout(() => {
        delete root.dataset.tracking;
        isTracking = false;
      }, RETURN_DURATION_MS);
    };

    const applyGaze = (): void => {
      frameId = 0;
      const rect = root.getBoundingClientRect();
      if (rect.width === 0) return;
      window.clearTimeout(resumeTimeoutId);
      if (!isTracking) startTracking();

      const deltaX = pointerX - (rect.left + rect.width / 2);
      const deltaY = pointerY - (rect.top + rect.height / 2);
      const distance = Math.hypot(deltaX, deltaY);
      const maxOffset = rect.width * CORE_SHARE * MAX_GAZE_SHARE;
      const turn = Math.min(1, distance / (rect.width * FULL_TURN_REACH));
      const scale = distance === 0 ? 0 : (maxOffset * turn) / distance;
      setGaze(deltaX * scale, deltaY * scale);

      window.clearTimeout(idleTimeoutId);
      idleTimeoutId = window.setTimeout(returnToCentre, IDLE_BEFORE_RETURN_MS);
    };

    const handlePointerMove = (event: PointerEvent): void => {
      // A hybrid laptop can still send touch; Ping only watches a cursor.
      if (event.pointerType === "touch") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frameId === 0) frameId = window.requestAnimationFrame(applyGaze);
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(idleTimeoutId);
      window.clearTimeout(resumeTimeoutId);
      delete root.dataset.tracking;
      gaze.style.removeProperty("--ping-gaze-x");
      gaze.style.removeProperty("--ping-gaze-y");
    };
  }, [rootRef, gazeRef, travelRef, coreRef, isEnabled]);
}
