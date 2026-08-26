import type { AuthUser } from "../../features/auth/api/auth.api";
import type { ProfileDTO } from "../../features/members/api/members.api";
import type { SearchResponseDTO } from "../../features/members/api/search.api";
import type {
  DirectoryCardDTO,
  DirectoryDetailDTO,
} from "../../features/marketing/api/directory.api";
import type { ResponseValidator } from "./client";

/**
 * Hand-written runtime guards for the highest-risk API response shapes (P1-12).
 *
 * This is a deliberately SMALL seam, not a schema library and not per-endpoint
 * coverage. It exists to prove the `validate` option on `client.ts` on the one
 * response the whole app is hostage to — `GET /auth/me`. A malformed auth/me
 * (a backend field rename, a truncated body) otherwise flows through as
 * `undefined`/mis-typed fields and silently corrupts or holds EVERY gated route
 * behind the AuthLoader. Validating it turns that into a loud `ApiError(422)`.
 *
 * The guards throw a precise message on the first bad field; `client.ts` catches
 * the throw and re-raises it as `ApiError(422, "Malformed response …")`. They
 * only assert the fields the app actually relies on, and only their primitive
 * shape — this is a tripwire for shape drift, not a full contract.
 */

/** True for a non-null, non-array plain object we can safely index into. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Assert `value` is a string, or throw naming the offending field. */
function assertString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(
      `expected "${field}" to be a string, got ${describe(value)}`,
    );
  }
}

/** Assert `value` is a string OR null (the app's nullable-timestamp shape). */
function assertStringOrNull(
  value: unknown,
  field: string,
): asserts value is string | null {
  if (value !== null && typeof value !== "string") {
    throw new Error(
      `expected "${field}" to be a string or null, got ${describe(value)}`,
    );
  }
}

/** Assert `value` is a finite number, or throw naming the offending field. */
function assertNumber(value: unknown, field: string): asserts value is number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(
      `expected "${field}" to be a number, got ${describe(value)}`,
    );
  }
}

/** Assert `value` is a finite number OR null (the app's nullable-number shape). */
function assertNumberOrNull(
  value: unknown,
  field: string,
): asserts value is number | null {
  if (value !== null && (typeof value !== "number" || Number.isNaN(value))) {
    throw new Error(
      `expected "${field}" to be a number or null, got ${describe(value)}`,
    );
  }
}

/** Assert `value` is a boolean, or throw naming the offending field. */
function assertBoolean(
  value: unknown,
  field: string,
): asserts value is boolean {
  if (typeof value !== "boolean") {
    throw new Error(
      `expected "${field}" to be a boolean, got ${describe(value)}`,
    );
  }
}

/** Assert `value` is an array, or throw naming the offending field. */
function assertArray(
  value: unknown,
  field: string,
): asserts value is unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(
      `expected "${field}" to be an array, got ${describe(value)}`,
    );
  }
}

/** Assert `value` is one of an allowed set of string literals. */
function assertOneOf(
  value: unknown,
  field: string,
  allowed: readonly string[],
): void {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new Error(
      `expected "${field}" to be one of [${allowed.join(", ")}], got ${describe(
        value,
      )}`,
    );
  }
}

/** A short, safe description of an unknown value for error messages. */
function describe(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "an array";
  return typeof value;
}

const MEMBER_STATUSES = ["active", "suspended", "deactivated"] as const;
const MEMBER_ROLES = ["member", "moderator", "admin"] as const;

/**
 * Validate a `GET /auth/me` body. Returns it narrowed to `AuthUser`, or throws
 * with the first field that is missing / the wrong primitive type. Pass this as
 * the `validate` argument to `apiGet<AuthUser>("/auth/me", …)`.
 */
export const validateAuthUser: ResponseValidator<AuthUser> = (data) => {
  if (!isRecord(data)) {
    throw new Error(`expected an object, got ${describe(data)}`);
  }

  assertString(data.id, "id");
  assertString(data.email, "email");
  assertOneOf(data.status, "status", MEMBER_STATUSES);
  assertOneOf(data.role, "role", MEMBER_ROLES);
  assertStringOrNull(data.ageAttestedAt, "ageAttestedAt");
  assertStringOrNull(data.onboardedAt, "onboardedAt");

  const { profile } = data;
  if (!isRecord(profile)) {
    throw new Error(
      `expected "profile" to be an object, got ${describe(profile)}`,
    );
  }
  assertString(profile.slug, "profile.slug");
  assertString(profile.firstName, "profile.firstName");
  assertString(profile.lastName, "profile.lastName");

  // The optional fields (pronouns, avatarUrl) are intentionally not asserted:
  // the app treats their absence as a valid state, so validating them would
  // reject legitimate bodies. This guard is a tripwire for the REQUIRED shape.

  // `staffRoles` is additive and backend-optional (older/partial payloads may
  // omit it entirely) — default to `[]` rather than assert, so a missing or
  // malformed value never turns into a loud 422 for an unrelated field.
  data.staffRoles = Array.isArray(data.staffRoles)
    ? data.staffRoles.filter(
        (value): value is string => typeof value === "string",
      )
    : [];

  // `policyVersions` (ID-14) is normalised rather than asserted, for the same
  // reason as `staffRoles`: a backend that predates the field, or one that
  // sends a half-shaped object, must not 422 every gated route — it should just
  // mean "no re-acceptance signal", which the gate reads as "nothing to ask".
  // Anything that is not a complete, well-typed pair is dropped entirely.
  data.policyVersions = isValidPolicyVersions(data.policyVersions)
    ? data.policyVersions
    : undefined;

  return data as unknown as AuthUser;
};

/** True only for a complete, well-typed `AuthUser["policyVersions"]`. */
function isValidPolicyVersions(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const isVersionOrNull = (field: unknown) =>
    field === null || typeof field === "string";
  return (
    typeof value.currentTerms === "string" &&
    typeof value.currentGuidelines === "string" &&
    isVersionOrNull(value.acceptedTerms) &&
    isVersionOrNull(value.acceptedGuidelines)
  );
}

const VISIBILITIES = ["open", "network", "private"] as const;

/**
 * Validate a `GET /profiles/:slug` body — the public profile every visitor's
 * member page is hostage to. Only the fields the profile page always relies on
 * are asserted: the identity trio, the `vouchCount`/`visibility` trust signals,
 * and `limited` (the flag that decides whether a viewer sees the full record or
 * the redacted network/private card — a missing/mis-typed `limited` would
 * silently over- or under-expose a member). The many optional sections (bio,
 * work, socials, activity, related, …) are intentionally NOT asserted: the app
 * treats each as an "absent is valid" state, so validating them would reject
 * legitimate bodies. A tripwire for the REQUIRED shape, not a full contract.
 */
export const validateProfile: ResponseValidator<ProfileDTO> = (data) => {
  if (!isRecord(data)) {
    throw new Error(`expected an object, got ${describe(data)}`);
  }
  assertString(data.slug, "slug");
  assertString(data.firstName, "firstName");
  assertString(data.lastName, "lastName");
  assertNumber(data.vouchCount, "vouchCount");
  assertOneOf(data.visibility, "visibility", VISIBILITIES);
  assertBoolean(data.limited, "limited");
  return data as unknown as ProfileDTO;
};

const TINTS = ["coral", "jade", "plum"] as const;
// Four values, not three: "suspended" is a granted badge the platform has put
// on hold pending review. The server derives it per card, so a validator that
// only knew the three stored values would reject an entirely valid directory
// page the moment one badge was suspended.
const SAFE_SPACE_STATUSES = [
  "none",
  "verified",
  "suspended",
  "removed",
] as const;

/**
 * Assert one directory card's required shape in place, prefixing the field path
 * so an error inside a list names the offending index (e.g. `[3].latitude`).
 * Every field here is one the directory grid + map ALWAYS read: the identity
 * strings, the `tint`/`av` presentation primitives, the `owned` flag, and the
 * nullable `memberFirst`/`latitude`/`longitude`/`safeSpaceTier` — a silently
 * `undefined` `latitude` would drop a pin off the map with no error, exactly the
 * P1-12 failure. `null` is a legitimate value for the nullable fields.
 */
function assertDirectoryCard(value: unknown, path: string): void {
  if (!isRecord(value)) {
    throw new Error(
      `expected "${path}" to be an object, got ${describe(value)}`,
    );
  }
  assertString(value.slug, `${path}.slug`);
  assertString(value.name, `${path}.name`);
  assertString(value.cat, `${path}.cat`);
  assertString(value.hood, `${path}.hood`);
  assertString(value.blurb, `${path}.blurb`);
  assertOneOf(value.tint, `${path}.tint`, TINTS);
  assertString(value.av, `${path}.av`);
  assertBoolean(value.owned, `${path}.owned`);
  assertStringOrNull(value.memberFirst, `${path}.memberFirst`);
  assertNumberOrNull(value.latitude, `${path}.latitude`);
  assertNumberOrNull(value.longitude, `${path}.longitude`);
  assertOneOf(
    value.safeSpaceStatus,
    `${path}.safeSpaceStatus`,
    SAFE_SPACE_STATUSES,
  );
  assertNumberOrNull(value.safeSpaceTier, `${path}.safeSpaceTier`);
}

/**
 * Validate a `GET /directory` body — the public directory grid/map list. Asserts
 * the top-level shape is an array and that every card carries the required
 * fields above. Pass as the `validate` argument to the `apiGet<DirectoryCardDTO[]>`
 * call.
 */
export const validateDirectoryList: ResponseValidator<DirectoryCardDTO[]> = (
  data,
) => {
  assertArray(data, "response");
  data.forEach((card, index) => assertDirectoryCard(card, `[${index}]`));
  return data as unknown as DirectoryCardDTO[];
};

/**
 * Validate a `GET /directory/:slug` body — one directory listing's full detail
 * payload. It extends the grid card, so the shared required fields are asserted
 * the same way; on top of those only `tagline` (always rendered in the detail
 * header) and the numeric `savedCount` trust signal are asserted. The many
 * nested detail blocks (owner, social, hours, rating, safe-space narrative, …)
 * are intentionally left unasserted — each has an "absent/empty is valid" state
 * and asserting their inner shape would risk rejecting legitimate bodies.
 */
export const validateDirectoryDetail: ResponseValidator<DirectoryDetailDTO> = (
  data,
) => {
  assertDirectoryCard(data, "response");
  // assertDirectoryCard has narrowed `data` to a record on success.
  const detail = data as Record<string, unknown>;
  assertString(detail.tagline, "tagline");
  assertNumber(detail.savedCount, "savedCount");
  return data as DirectoryDetailDTO;
};

const SEARCH_RESULT_TYPES = [
  "member",
  "community",
  "event",
  "forum",
  // A single forum REPLY, distinct from "forum" (a thread). Search reaches
  // into post bodies since SOC-08, so a reply is now its own result type.
  "forumPost",
  "business",
  "magazine",
  "job",
  "housing",
  "resource",
  "subprofile",
  "topic",
] as const;

/**
 * Validate a `GET /search` body — the unified cross-entity search response that
 * drives the ⌘K palette. Asserts the envelope (`query` + a `results` array) and
 * each result's required fields: the `type` discriminant (the FE switches icon +
 * link target on it, so an unknown token would render a broken row) and the
 * `slug`/`name`/`sub` strings. `avatarUrl` is optional (member rows only) and is
 * left unasserted.
 */
export const validateSearchResponse: ResponseValidator<SearchResponseDTO> = (
  data,
) => {
  if (!isRecord(data)) {
    throw new Error(`expected an object, got ${describe(data)}`);
  }
  assertString(data.query, "query");
  assertArray(data.results, "results");
  data.results.forEach((result, index) => {
    const path = `results[${index}]`;
    if (!isRecord(result)) {
      throw new Error(
        `expected "${path}" to be an object, got ${describe(result)}`,
      );
    }
    assertOneOf(result.type, `${path}.type`, SEARCH_RESULT_TYPES);
    assertString(result.slug, `${path}.slug`);
    assertString(result.name, `${path}.name`);
    assertString(result.sub, `${path}.sub`);
  });
  return data as unknown as SearchResponseDTO;
};
