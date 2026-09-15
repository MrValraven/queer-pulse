import {
  COMPOSE_PHOTO_LIMIT,
  COMPOSE_POLL_MIN_OPTIONS,
  type ComposeBlocker,
  type ComposeThreadState,
} from "./composeThread.types";
import { hasAddressWording } from "./composeNudges";

// ── What stops a publish ────────────────────────────────────────────────────
// A nudge is advice the member may ignore. A blocker is not: publishing stays
// refused until it clears, and the footer says which one is holding it, in the
// order below.
//
// There is deliberately NO client-side post cooldown here. Rate limiting is
// the server's, and a timer in the browser can only ever guess at an allowance
// the server actually owns: it locks out a member the server would have let
// through, and it cannot stop one who reloads the page. When the API answers
// 429, the publish flow surfaces that answer.

export interface ComposeBlockerInput {
  state: ComposeThreadState;
  /** True when `useSimilarThreads` matched an existing thread closely enough
   *  to call this title a repeat of it. */
  isDuplicateTitle: boolean;
  /** The title of that thread, for the footer message. */
  duplicateTitle?: string | null;
  /** Has the member ticked the doxxing nudge's acknowledgement? */
  isDoxxingAcknowledged: boolean;
}

export function composeBlockers({
  state,
  isDuplicateTitle,
  duplicateTitle,
  isDoxxingAcknowledged,
}: ComposeBlockerInput): ComposeBlocker[] {
  const blockers: ComposeBlocker[] = [];

  if (isDuplicateTitle) {
    blockers.push({
      id: "duplicateTitle",
      messageKey: "forum:composePage.blocker.duplicateTitle",
      values: duplicateTitle ? { title: duplicateTitle } : undefined,
    });
  }

  if (hasAddressWording(state.body) && !isDoxxingAcknowledged) {
    blockers.push({
      id: "unacknowledgedDoxxing",
      messageKey: "forum:composePage.blocker.unacknowledgedDoxxing",
    });
  }

  if (state.poll) {
    const filled = state.poll.options.filter(
      (option) => option.trim().length > 0,
    ).length;
    if (filled < COMPOSE_POLL_MIN_OPTIONS) {
      blockers.push({
        id: "pollNeedsTwoOptions",
        messageKey: "forum:composePage.blocker.pollNeedsTwoOptions",
        values: { count: COMPOSE_POLL_MIN_OPTIONS },
      });
    }
  }

  if (state.photos.length > COMPOSE_PHOTO_LIMIT) {
    blockers.push({
      id: "tooManyPhotos",
      messageKey: "forum:composePage.blocker.tooManyPhotos",
      values: { count: COMPOSE_PHOTO_LIMIT },
    });
  }

  return blockers;
}
