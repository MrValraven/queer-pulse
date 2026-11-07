// The demo VJ server's stage timers (contract 7.14): the strobe cap, the
// overlay auto-hide and the countdown hold, each armed for an absolute
// server time read from the state. Mirrors VjStageTimers of
// queerpulse-backend/src/vj/stage/vj-stage-timers.ts; the owner reduces the
// fired stage event and syncs again.

import { VJ_LIMITS, type VjStageState } from "../../../shared/contracts/vj";

/** One timeout armed for a server time. */
export interface VjDemoTimer {
  /** Arms for a server time; the same time keeps the armed timeout, null clears. */
  arm(atServerMs: number | null): void;
  clear(): void;
  /** Fires at once when the armed time has passed (a hidden tab's throttled
   *  timeout ran late or not at all). */
  fireIfDue(): void;
  /** The armed server time, or null when nothing is armed. */
  target(): number | null;
}

/** Longest delay `setTimeout` honours; a longer wait re-arms on fire. */
const TIMEOUT_DELAY_MAX_MS = 2_147_483_647;

type VjTimeoutHandle = ReturnType<typeof setTimeout>;

/** Node timers (tests) unref so a pending stage timer never holds the
 *  process open; browser timers are plain numbers and need nothing. */
function unrefVjTimeout(handle: unknown): void {
  if (typeof handle !== "object" || handle === null) return;
  if (!("unref" in handle) || typeof handle.unref !== "function") return;
  (handle as { unref: () => void }).unref();
}

/** One setTimeout armed for a server time; re-arming at the same time keeps it; null clears. */
export function createVjDemoTimer(
  now: () => number,
  onFire: () => void,
): VjDemoTimer {
  let armed: { target: number; handle: VjTimeoutHandle } | null = null;

  const clear = () => {
    if (armed !== null) clearTimeout(armed.handle);
    armed = null;
  };

  // A handle no longer armed does nothing; a fire before its target (a delay
  // past the setTimeout maximum, or a server clock that stepped back)
  // re-arms for the rest.
  const handleFire = (handle: VjTimeoutHandle) => {
    if (armed === null || armed.handle !== handle) return;
    const { target } = armed;
    armed = null;
    if (now() < target) {
      start(target);
      return;
    }
    onFire();
  };

  function start(target: number) {
    const delay = Math.min(Math.max(0, target - now()), TIMEOUT_DELAY_MAX_MS);
    const handle: VjTimeoutHandle = setTimeout(() => {
      handleFire(handle);
    }, delay);
    unrefVjTimeout(handle);
    armed = { target, handle };
  }

  return {
    arm(atServerMs) {
      if ((armed?.target ?? null) === atServerMs) return;
      clear();
      if (atServerMs !== null) start(atServerMs);
    },
    clear,
    fireIfDue() {
      if (armed === null || now() < armed.target) return;
      clear();
      onFire();
    },
    target: () => armed?.target ?? null,
  };
}

/** The server times the three stage timers want for a state, null when off. */
export interface VjDemoTimerTargets {
  strobeEndsAt: number | null;
  overlayHidesAt: number | null;
  countdownEndsAt: number | null;
}

/** The three timer targets of C 7.14 and the strobe, read from a state: the
 *  strobe 10 s after its stamp while strobing, the overlay at hideAt while
 *  visible, the countdown 10 s after zero while visible. */
export function vjDemoTimerTargetsOf(state: VjStageState): VjDemoTimerTargets {
  const { effects, overlay, countdown } = state;
  return {
    strobeEndsAt:
      effects.isStrobing && effects.strobeStartedAt !== null
        ? effects.strobeStartedAt + VJ_LIMITS.strobeMaxDurationMs
        : null,
    overlayHidesAt:
      overlay.isVisible && overlay.hideAt !== null ? overlay.hideAt : null,
    countdownEndsAt:
      countdown.isVisible && countdown.targetAt !== null
        ? countdown.targetAt + VJ_LIMITS.countdownHoldMs
        : null,
  };
}

/** The stage event each timer's fire dispatches (vjDemoStage.ts). */
export type VjDemoTimerEventKind =
  "strobeTimeout" | "overlayTimeout" | "countdownEnd";

/** Every timer event, in the order sync walks them (the backend's order). */
const VJ_DEMO_TIMER_EVENT_KINDS: readonly VjDemoTimerEventKind[] = [
  "strobeTimeout",
  "overlayTimeout",
  "countdownEnd",
];

export interface VjDemoStageTimers {
  /** Arms, re-arms or clears each timer from the state's targets; a target
   *  that did not change keeps its timer. */
  sync(state: VjStageState): void;
  /** Fires every timer whose target has passed, earliest first. */
  fireOverdue(): void;
  /** Clears every timer (server stop). */
  clear(): void;
}

/** A demo stage's strobe, overlay and countdown timers. A strobe that is on
 *  with no stamp (never expected: the settle step stamps it) still ends 10 s
 *  after the first sync that saw it, so a demo strobe never runs past the cap. */
export function createVjDemoStageTimers(
  now: () => number,
  onFire: (kind: VjDemoTimerEventKind) => void,
): VjDemoStageTimers {
  const timers = Object.fromEntries(
    VJ_DEMO_TIMER_EVENT_KINDS.map((kind) => [
      kind,
      createVjDemoTimer(now, () => onFire(kind)),
    ]),
  ) as Record<VjDemoTimerEventKind, VjDemoTimer>;
  let unstampedStrobeSeenAt: number | null = null;

  const strobeTargetOf = (state: VjStageState, stamped: number | null) => {
    const isUnstamped = state.effects.isStrobing && stamped === null;
    if (!isUnstamped) {
      unstampedStrobeSeenAt = null;
      return stamped;
    }
    unstampedStrobeSeenAt ??= now();
    return unstampedStrobeSeenAt + VJ_LIMITS.strobeMaxDurationMs;
  };

  return {
    sync(state) {
      const targets = vjDemoTimerTargetsOf(state);
      timers.strobeTimeout.arm(strobeTargetOf(state, targets.strobeEndsAt));
      timers.overlayTimeout.arm(targets.overlayHidesAt);
      timers.countdownEnd.arm(targets.countdownEndsAt);
    },
    fireOverdue() {
      const currentTime = now();
      const overdue = VJ_DEMO_TIMER_EVENT_KINDS.flatMap((kind) => {
        const target = timers[kind].target();
        return target !== null && target <= currentTime
          ? [{ kind, target }]
          : [];
      }).sort((first, second) => first.target - second.target);
      // Each fire may sync the others again; fireIfDue re-reads its own.
      for (const { kind } of overdue) timers[kind].fireIfDue();
    },
    clear() {
      for (const kind of VJ_DEMO_TIMER_EVENT_KINDS) timers[kind].clear();
      unstampedStrobeSeenAt = null;
    },
  };
}
