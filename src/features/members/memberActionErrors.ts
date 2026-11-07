import { ApiError } from "../../shared/api/client";
import {
  causeErrorKey,
  type CauseErrorCopy,
} from "../../shared/api/causeErrorKey";

/**
 * The cause lines for the member's own profile-side writes: claiming a perk,
 * changing a badge's visibility, hiding the profile from one member, quick
 * edits to a place's listing and the board's respond, close and renew. Every
 * other cause (no connection, signed out, restricted account, inactive
 * membership, throttle, server fault, timeout) comes from `shared:apiError.*`.
 * Statuses and sentences are quoted from queerpulse-backend
 * `recognition/recognition.service.ts`, `social/hidden-from.service.ts`,
 * `profiles/profiles.service.ts` and `listings/listings.service.ts`.
 */

/** `POST /me/recognition/perks/:key/claim`: `PERK_LEVEL_NOT_REACHED` is the
 *  coded 403 for a perk above the member's level. */
export function claimPerkErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, {
    PERK_LEVEL_NOT_REACHED: "members:perks.claim.error.levelNotReached",
  });
}

/** `PATCH /me/recognition/badges/:key/visibility`: 404 for a badge that does
 *  not exist or one the member has not earned. */
export function badgeVisibilityErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, {
    404: "members:badges.drawer.visibilityError.notEarned",
  });
}

/** `POST /profiles/me/hidden-from/:slug`: 400 when the slug is the member's
 *  own, 404 when no such member is reachable. */
export function hideFromErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, {
    400: "members:profile.whoSeesWhat.hiddenFrom.error.self",
    404: "members:profile.whoSeesWhat.hiddenFrom.error.notFound",
  });
}

/** `DELETE /profiles/me/hidden-from/:slug`: 404 when the profile was not
 *  hidden from that member (never hidden, or already shown again). */
export function unhideFromErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, {
    404: "members:profile.whoSeesWhat.hiddenFrom.error.notHidden",
  });
}

/** `PATCH /listings/:ref` from the place quick edit: 404 for a listing the
 *  member no longer owns or co-manages, 400 for a website or phone the API
 *  rejects. */
export function quickEditListingErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, {
    400: "members:places.quickEdit.error.invalid",
    404: "members:places.quickEdit.error.notFound",
  });
}

/** `POST /profiles/:slug/board/:post/respond`: 403 for a board that is not
 *  open to the viewer, 404 for a post that is closed, lapsed or gone. */
export function boardRespondErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, {
    403: "members:content.board.error.notOpen",
    404: "members:content.board.error.postGone",
  });
}

/** Closing a board post: 404 when the member has no post with that slug. */
export function boardCloseErrorCopy(error: unknown): CauseErrorCopy {
  return causeErrorKey(error, {
    404: "members:content.board.error.postGone",
  });
}

/**
 * Renewing a board post: 404 for a post that is gone, and a 409 that carries
 * two different sentences and no code: "This post is closed. Reopen it from the
 * board editor." and "This post has been renewed as many times as it can
 * be...". A reworded closed sentence reads as the renew limit. Candidate for a
 * backend code (see the report).
 */
export function boardRenewErrorCopy(error: unknown): CauseErrorCopy {
  if (
    error instanceof ApiError &&
    error.status === 409 &&
    error.message.toLowerCase().includes("is closed")
  ) {
    return { key: "members:content.board.error.postClosed" };
  }
  return causeErrorKey(error, {
    404: "members:content.board.error.postGone",
    409: "members:content.board.renewLimitReached",
  });
}
