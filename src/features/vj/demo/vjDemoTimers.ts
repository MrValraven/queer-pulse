// The demo VJ server's stage timers (contract 7.14): the strobe cap, the
// overlay auto-hide, the countdown hold and the sequence step timer
// (sequences contract 5.7, 10.4), each armed for an absolute server time
// read from the state. Mirrors VjStageTimers of
// queerpulse-backend/src/vj/stage/vj-stage-timers.ts: a timer never arms
// again for the target it last fired for, and a retry arms a fired target
// later. The owner reduces the fired stage event and syncs again.

import {
  VJ_LIMITS,
  vjSetlistTimerTargetAt,
  type VjStageState,
} from "../../../shared/contracts/vj";

/** One timeout armed for a server time. */
export interface VjDemoTimer {
  /** Arms for a state target; the same target keeps the armed timeout (a
   *  pending retry included), the target it last fired for arms nothing,
   *  and null clears and forgets the fired target. */
  arm(atServerMs: number | null): void;
  /** Arms to fire at `fireAtServerMs` for the target it last fired for,
   *  whatever the fired memory says; an armed timer is kept. */
  retry(fireAtServerMs: number): void;
  /** Clears the timeout and the fired memory. */
  clear(): void;
  /** Fires at once when the armed time has passed (a hidden tab's throttled
   *  timeout ran late or not at all). */
  fireIfDue(): void;
  /** The armed fire time, or null when nothing is armed. */
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

/** One armed timeout: when it fires and the state target it serves. A plain
 *  arm fires at the target it serves; a retry fires later for the target
 *  that already fired. */
interface VjArmedDemoTimer {
  fireAt: number;
  servedTarget: number;
  handle: VjTimeoutHandle;
}

/** One setTimeout armed for a server time; re-arming at the same target
 *  keeps it; the target it last fired for is never armed again; null
 *  clears. */
export function createVjDemoTimer(
  now: () => number,
  onFire: () => void,
): VjDemoTimer {
  let armed: VjArmedDemoTimer | null = null;
  let firedTarget: number | null = null;

  const clearArmed = () => {
    if (armed !== null) clearTimeout(armed.handle);
    armed = null;
  };

  const fire = (servedTarget: number) => {
    firedTarget = servedTarget;
    onFire();
  };

  // A handle no longer armed does nothing; a fire before its time (a delay
  // past the setTimeout maximum, or a server clock that stepped back)
  // re-arms for the rest.
  const handleFire = (handle: VjTimeoutHandle) => {
    if (armed === null || armed.handle !== handle) return;
    const { fireAt, servedTarget } = armed;
    armed = null;
    if (now() < fireAt) {
      start(fireAt, servedTarget);
      return;
    }
    fire(servedTarget);
  };

  function start(fireAt: number, servedTarget: number) {
    const delay = Math.min(Math.max(0, fireAt - now()), TIMEOUT_DELAY_MAX_MS);
    const handle: VjTimeoutHandle = setTimeout(() => {
      handleFire(handle);
    }, delay);
    unrefVjTimeout(handle);
    armed = { fireAt, servedTarget, handle };
  }

  return {
    arm(atServerMs) {
      if (armed !== null && armed.servedTarget === atServerMs) return;
      clearArmed();
      if (atServerMs === null) {
        firedTarget = null;
        return;
      }
      if (firedTarget === atServerMs) return;
      start(atServerMs, atServerMs);
    },
    retry(fireAtServerMs) {
      if (armed !== null) return;
      start(fireAtServerMs, firedTarget ?? fireAtServerMs);
    },
    clear() {
      clearArmed();
      firedTarget = null;
    },
    fireIfDue() {
      if (armed === null || now() < armed.fireAt) return;
      const { servedTarget } = armed;
      clearArmed();
      fire(servedTarget);
    },
    target: () => armed?.fireAt ?? null,
  };
}

/** The server times the stage timers want for a state, null when off. */
export interface VjDemoTimerTargets {
  strobeEndsAt: number | null;
  overlayHidesAt: number | null;
  countdownEndsAt: number | null;
  /** The step timer: quantizedAdvanceEarlyMs before stepEndsAt while playing. */
  setlistAdvancesAt: number | null;
}

/** The timer targets of C 7.14 and sequences 5.7, read from a state: the
 *  strobe 10 s after its stamp while strobing, the overlay at hideAt while
 *  visible, the countdown 10 s after zero while visible, and the step timer
 *  quantizedAdvanceEarlyMs before the step end while a sequence plays. */
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
    setlistAdvancesAt: vjSetlistTimerTargetAt(state),
  };
}

/** The stage event each timer's fire dispatches (vjDemoStage.ts). */
export type VjDemoTimerEventKind =
  "strobeTimeout" | "overlayTimeout" | "countdownEnd" | "setlistTimer";

/** Every timer event, in the order sync walks them (the backend's order),
 *  the step timer last. */
const VJ_DEMO_TIMER_EVENT_KINDS: readonly VjDemoTimerEventKind[] = [
  "strobeTimeout",
  "overlayTimeout",
  "countdownEnd",
  "setlistTimer",
];

export interface VjDemoStageTimers {
  /** Arms, re-arms or clears each timer from the state's targets; a target
   *  that did not change keeps its timer, and a target a timer already
   *  fired for arms nothing. */
  sync(state: VjStageState): void;
  /** Arms a kind to fire again at `fireAtServerMs` for the target it last
   *  fired for (the step timer after a failed read); an armed kind keeps
   *  its timer. */
  retry(kind: VjDemoTimerEventKind, fireAtServerMs: number): void;
  /** Fires every timer whose target has passed, earliest first. */
  fireOverdue(): void;
  /** Clears every timer and the fired memory (server stop, a dropped stage). */
  clear(): void;
}

/** A demo stage's strobe, overlay, countdown and step timers. A strobe that is on
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
      timers.setlistTimer.arm(targets.setlistAdvancesAt);
    },
    retry(kind, fireAtServerMs) {
      timers[kind].retry(fireAtServerMs);
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
