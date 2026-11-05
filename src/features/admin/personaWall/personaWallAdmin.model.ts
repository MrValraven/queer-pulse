import {
  PERSONA_WALL_MAX_PICKS,
  personaWallReasonOf,
  personaWallRefusedStateOf,
  type PersonaWallPickDTO,
  type PersonaWallPublicState,
  type PersonaWallReasonCode,
} from "../../subprofiles/api/personaWall.api";
import type { SubprofileKind } from "../../subprofiles/api/subprofiles.api";
import { WALL_LAYOUT_PHONE_SIX } from "../../subprofiles/subprofileCreditsWall.data";
import { KIND_LABEL_KEYS } from "../../subprofiles/subprofile-kinds";
import {
  studioReasonOf,
  type StudioFailureReason,
} from "../../studio/studioReason";

/** A state that keeps a pick off the public wall. */
type HiddenPersonaWallState = Exclude<PersonaWallPublicState, "shown">;

/** The line each wall refusal shows, one per reason code the server sends
 *  (contract section 3). A not-listed refusal that names its state reads
 *  {@link PERSONA_WALL_NOT_LISTED_KEY} first; this line names all four
 *  causes for a body that carries none. */
export const PERSONA_WALL_REASON_KEY: Record<PersonaWallReasonCode, string> = {
  PERSONA_WALL_FULL: "admin:personaWall.error.full",
  PERSONA_WALL_ALREADY_PICKED: "admin:personaWall.error.alreadyPicked",
  PERSONA_WALL_PERSONA_NOT_FOUND: "admin:personaWall.error.personaNotFound",
  PERSONA_WALL_NOT_LISTED: "admin:personaWall.error.notListed.unknownState",
  PERSONA_WALL_PICK_NOT_FOUND: "admin:personaWall.error.pickNotFound",
  PERSONA_WALL_REORDER_MISMATCH: "admin:personaWall.error.reorderMismatch",
  PERSONA_WALL_INVALID_FILL_ORDER: "admin:personaWall.error.invalidFillOrder",
};

/** The add refusal's line for each state a not-listed body can name. */
export const PERSONA_WALL_NOT_LISTED_KEY: Record<
  HiddenPersonaWallState,
  string
> = {
  draft: "admin:personaWall.error.notListed.draft",
  not_open: "admin:personaWall.error.notListed.not_open",
  removed: "admin:personaWall.error.notListed.removed",
  taken_down: "admin:personaWall.error.notListed.taken_down",
};

/** The line for a failure that carries no wall reason: the connection, the
 *  server, or the account's access. */
export const PERSONA_WALL_FAILURE_KEY: Record<StudioFailureReason, string> = {
  offline: "admin:personaWall.failure.offline",
  timeout: "admin:personaWall.failure.timeout",
  rateLimited: "admin:personaWall.failure.rateLimited",
  server: "admin:personaWall.failure.server",
  unreachable: "admin:personaWall.failure.unreachable",
  forbidden: "admin:personaWall.failure.forbidden",
  notFound: "admin:personaWall.failure.notFound",
  restricted: "admin:personaWall.failure.restricted",
  unknown: "admin:personaWall.failure.unknown",
};

/**
 * The catalog key that names why a wall read or write failed. A not-listed
 * refusal with a known `publicState` names that state; any other known code
 * reads its own line; anything else is named by how the request failed.
 * Pass {@link PERSONA_WALL_ERROR_VALUES} as the interpolation values.
 */
export function personaWallErrorKeyOf(cause: unknown): string {
  const refusedState = personaWallRefusedStateOf(cause);
  if (refusedState !== null) return PERSONA_WALL_NOT_LISTED_KEY[refusedState];
  const reasonCode = personaWallReasonOf(cause);
  if (reasonCode !== null) return PERSONA_WALL_REASON_KEY[reasonCode];
  return PERSONA_WALL_FAILURE_KEY[studioReasonOf(cause)];
}

/** The numbers the refusal lines quote (`{max}`). */
export const PERSONA_WALL_ERROR_VALUES = {
  max: PERSONA_WALL_MAX_PICKS,
} as const;

/** The chip on a pick that the public wall skips. */
export const PERSONA_WALL_STATE_CHIP_KEY: Record<
  HiddenPersonaWallState,
  string
> = {
  draft: "admin:personaWall.state.draft",
  not_open: "admin:personaWall.state.not_open",
  removed: "admin:personaWall.state.removed",
  taken_down: "admin:personaWall.state.taken_down",
};

/** The line under that chip saying why the pick is off the wall. */
export const PERSONA_WALL_STATE_REASON_KEY: Record<
  HiddenPersonaWallState,
  string
> = {
  draft: "admin:personaWall.stateReason.draft",
  not_open: "admin:personaWall.stateReason.not_open",
  removed: "admin:personaWall.stateReason.removed",
  taken_down: "admin:personaWall.stateReason.taken_down",
};

/** The drag payload type for moving a pick row. */
export const PERSONA_WALL_DRAG_TYPE = "application/x-admin-persona-wall-pick";

/** How many tiles the wall draws on a phone. */
export const PERSONA_WALL_PHONE_TILES = WALL_LAYOUT_PHONE_SIX.spans.length;

/**
 * The picks a phone leaves out: the shown picks past the phone's tile count,
 * counted among shown picks only, since a hidden pick takes no tile and
 * moves every later pick up one. A hidden pick is never in the set.
 */
export function desktopOnlyPickIds(
  picks: readonly PersonaWallPickDTO[],
): ReadonlySet<string> {
  const shownPicks = picks.filter((pick) => pick.publicState === "shown");
  return new Set(
    shownPicks.slice(PERSONA_WALL_PHONE_TILES).map((pick) => pick.id),
  );
}

/** The catalog key of a persona kind's label, or null for a kind this
 *  build does not know (a newer server). */
export function personaKindLabelKey(kind: string): string | null {
  return Object.hasOwn(KIND_LABEL_KEYS, kind)
    ? KIND_LABEL_KEYS[kind as SubprofileKind]
    : null;
}
