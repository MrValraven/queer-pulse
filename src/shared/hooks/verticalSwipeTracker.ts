export const SWIPE_DISTANCE_THRESHOLD = 120;
export const SWIPE_VELOCITY_THRESHOLD = 0.5;
const MINIMUM_FLICK_DISTANCE = 24;

export interface VerticalSwipeOptions {
  direction: "up" | "down";
  distanceThreshold?: number;
  velocityThreshold?: number;
}

export interface VerticalSwipeTracker {
  start: (clientY: number, time: number) => void;
  /** Travel in the swipe's direction so far, floored at 0. */
  move: (clientY: number) => number;
  /** True when the gesture went far enough, or fast enough. */
  end: (clientY: number, time: number) => boolean;
  cancel: () => void;
  isActive: () => boolean;
}

/** The arithmetic of a one-axis swipe, apart from any DOM event. */
export function createVerticalSwipeTracker(
  options: VerticalSwipeOptions,
): VerticalSwipeTracker {
  const distanceThreshold =
    options.distanceThreshold ?? SWIPE_DISTANCE_THRESHOLD;
  const velocityThreshold =
    options.velocityThreshold ?? SWIPE_VELOCITY_THRESHOLD;
  const sign = options.direction === "down" ? 1 : -1;
  let startY: number | null = null;
  let startTime = 0;
  const travel = (clientY: number) =>
    startY === null ? 0 : Math.max(0, (clientY - startY) * sign);
  return {
    start(clientY, time) {
      startY = clientY;
      startTime = time;
    },
    move: travel,
    end(clientY, time) {
      if (startY === null) return false;
      const distance = travel(clientY);
      const velocity = distance / Math.max(1, time - startTime);
      startY = null;
      return (
        distance >= distanceThreshold ||
        (distance >= MINIMUM_FLICK_DISTANCE && velocity >= velocityThreshold)
      );
    },
    cancel() {
      startY = null;
    },
    isActive: () => startY !== null,
  };
}
