import { ApiError } from "../../../shared/api/client";
import { SKIN_META, type SkinFamily } from "../subprofile-skins";

/** Why the server refused a persona type change (contract C2). */
export type PersonaKindChangeReason =
  "unchanged" | "other_family" | "studio_releases" | "studio_taken_down";

/** A refusal reason plus the numbers and families the copy interpolates. */
export type PersonaKindChangeDetails =
  | { reason: "unchanged" }
  | {
      reason: "other_family";
      currentFamily: SkinFamily;
      requestedFamily: SkinFamily;
    }
  | {
      reason: "studio_releases";
      releaseCount: number;
      requestedHasStudio: boolean;
    }
  | { reason: "studio_taken_down"; takenDownCount: number };

/** The typed `code` the server puts in a 422 body, per reason. */
export const PERSONA_KIND_CHANGE_CODES: Record<
  PersonaKindChangeReason,
  string
> = {
  unchanged: "PERSONA_KIND_UNCHANGED",
  other_family: "PERSONA_KIND_OTHER_FAMILY",
  studio_releases: "PERSONA_KIND_STUDIO_RELEASES",
  studio_taken_down: "PERSONA_KIND_STUDIO_TAKEN_DOWN",
};

/** A persona type change the server refused, with the reason it named. */
export class PersonaKindChangeError extends Error {
  readonly reason: PersonaKindChangeReason;
  readonly details: PersonaKindChangeDetails;

  constructor(details: PersonaKindChangeDetails) {
    super(
      `Persona type change refused: ${PERSONA_KIND_CHANGE_CODES[details.reason]}`,
    );
    this.name = "PersonaKindChangeError";
    this.reason = details.reason;
    this.details = details;
  }
}

const isSkinFamily = (value: unknown): value is SkinFamily =>
  typeof value === "string" &&
  Object.prototype.hasOwnProperty.call(SKIN_META, value);

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 1;

const readDetails = (
  body: Record<string, unknown>,
): PersonaKindChangeDetails | null => {
  switch (body.code) {
    case PERSONA_KIND_CHANGE_CODES.unchanged:
      return { reason: "unchanged" };
    case PERSONA_KIND_CHANGE_CODES.other_family:
      if (!isSkinFamily(body.currentFamily)) return null;
      if (!isSkinFamily(body.requestedFamily)) return null;
      return {
        reason: "other_family",
        currentFamily: body.currentFamily,
        requestedFamily: body.requestedFamily,
      };
    case PERSONA_KIND_CHANGE_CODES.studio_releases:
      if (!isPositiveInteger(body.releaseCount)) return null;
      if (typeof body.requestedHasStudio !== "boolean") return null;
      return {
        reason: "studio_releases",
        releaseCount: body.releaseCount,
        requestedHasStudio: body.requestedHasStudio,
      };
    case PERSONA_KIND_CHANGE_CODES.studio_taken_down:
      if (!isPositiveInteger(body.takenDownCount)) return null;
      return {
        reason: "studio_taken_down",
        takenDownCount: body.takenDownCount,
      };
    default:
      return null;
  }
};

/**
 * Reads a failed type change as a typed refusal. Returns null for anything that
 * is not a 422 with a known code and valid details, so the caller falls back to
 * its generic error handling for those.
 */
export function toPersonaKindChangeError(
  error: unknown,
): PersonaKindChangeError | null {
  if (!(error instanceof ApiError) || error.status !== 422) return null;
  if (typeof error.data !== "object" || error.data === null) return null;
  const details = readDetails(error.data as Record<string, unknown>);
  return details ? new PersonaKindChangeError(details) : null;
}
