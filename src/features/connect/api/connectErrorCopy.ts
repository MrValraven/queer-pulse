import {
  causeErrorKey,
  type CauseErrorCopy,
  type CauseErrorOverrides,
} from "../../../shared/api/causeErrorKey";

/**
 * The words a failed connection action says (accept, decline, reply, withdraw,
 * and the private note). Each map holds only what the action itself can say;
 * every other failure (offline, signed out, a restricted account, an inactive
 * membership, a rate limit, a server fault) reads as the shared
 * `shared:apiError.*` cause. Resolve a result with `t(copy.key, copy.values)`.
 *
 * `PATCH /connections/:id`, `PATCH /connections/:id/reply`, `PUT
 * /connections/:id/note` and `DELETE /connections/:id` send no machine
 * `code`, so the status is the signal: 404 is a connection that no longer
 * exists, 409 is a request that was already answered or withdrawn ("There is
 * no pending request"), and the note's 400 is the 500-character cap.
 */
export const CONNECTION_ACTION_CAUSE_OVERRIDES: CauseErrorOverrides = {
  404: "connect:toast.requestGone",
  409: "connect:toast.alreadyAnswered",
};

export const CONNECTION_NOTE_CAUSE_OVERRIDES: CauseErrorOverrides = {
  400: "connect:note.error.tooLong",
  404: "connect:toast.requestGone",
};

export function connectionActionCause(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, CONNECTION_ACTION_CAUSE_OVERRIDES);
}

export function connectionNoteCause(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, CONNECTION_NOTE_CAUSE_OVERRIDES);
}
