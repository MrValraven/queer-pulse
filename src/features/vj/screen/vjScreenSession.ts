import type { AuthUser } from "../../auth/api/auth.api";

export const VJ_SCREEN_SESSION_KEY = "queerpulse.vj.screen.session.v1";
export const VJ_SCREEN_SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** The one staff grant that opens the VJ screen below the Admin tier. */
const VJ_OPERATOR_GRANT = "vj_operator";

/**
 * The only facts kept about the admin or VJ operator who set up a screen:
 * enough to boot the route offline. The email, the avatar, every token and
 * every other staff grant stay out.
 */
export interface VjScreenSessionRecord {
  userId: string;
  ageAttestedAt: string | null;
  onboardedAt: string | null;
  profile: { slug: string; firstName: string; lastName: string };
  savedAt: number;
  /**
   * True when the screen was set up by someone below the Admin tier through
   * the `vj_operator` grant, so the stand-in carries that grant alone. False
   * for an admin, who stands in on the account tier. A record saved before
   * this field existed belongs to an admin and reads as false.
   */
  hasVjOperatorGrant: boolean;
}

/**
 * Whether a confirmed user may keep a VJ screen record: an active admin, or
 * an active account holding the `vj_operator` grant. The same union
 * `RolesOrStaffGuard` admits on `AdminVjController` and the `/vj` socket.
 */
export function isVjScreenOperator(user: AuthUser): boolean {
  if (user.status !== "active") return false;
  return user.role === "admin" || user.staffRoles.includes(VJ_OPERATOR_GRANT);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

/** The stored record as written before `hasVjOperatorGrant` existed. */
type StoredVjScreenSessionRecord = Omit<
  VjScreenSessionRecord,
  "hasVjOperatorGrant"
> & { hasVjOperatorGrant?: boolean };

function isSessionRecord(value: unknown): value is StoredVjScreenSessionRecord {
  if (!isPlainObject(value)) return false;
  const profile = value.profile;
  return (
    (value.hasVjOperatorGrant === undefined ||
      typeof value.hasVjOperatorGrant === "boolean") &&
    typeof value.userId === "string" &&
    value.userId.length > 0 &&
    isNullableString(value.ageAttestedAt) &&
    isNullableString(value.onboardedAt) &&
    typeof value.savedAt === "number" &&
    Number.isFinite(value.savedAt) &&
    isPlainObject(profile) &&
    typeof profile.slug === "string" &&
    typeof profile.firstName === "string" &&
    typeof profile.lastName === "string"
  );
}

export function clearVjScreenSession(): void {
  try {
    localStorage.removeItem(VJ_SCREEN_SESSION_KEY);
  } catch {
    // Storage blocked: nothing to clear.
  }
}

/** Keeps the record for an active admin or VJ operator and clears it for
 *  anyone else. */
export function saveVjScreenSession(user: AuthUser, now = Date.now()): void {
  if (!isVjScreenOperator(user)) {
    clearVjScreenSession();
    return;
  }
  const record: VjScreenSessionRecord = {
    userId: user.id,
    ageAttestedAt: user.ageAttestedAt,
    onboardedAt: user.onboardedAt,
    profile: {
      slug: user.profile.slug,
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
    },
    savedAt: now,
    hasVjOperatorGrant: user.role !== "admin",
  };
  try {
    localStorage.setItem(VJ_SCREEN_SESSION_KEY, JSON.stringify(record));
  } catch {
    // Quota or blocked storage: the screen then needs the network to boot.
  }
}

export function readVjScreenSession(
  now = Date.now(),
): VjScreenSessionRecord | null {
  let rawRecord: string | null;
  try {
    rawRecord = localStorage.getItem(VJ_SCREEN_SESSION_KEY);
  } catch {
    return null;
  }
  if (rawRecord === null) return null;
  try {
    const parsedRecord: unknown = JSON.parse(rawRecord);
    if (
      isSessionRecord(parsedRecord) &&
      now - parsedRecord.savedAt <= VJ_SCREEN_SESSION_MAX_AGE_MS
    ) {
      return {
        ...parsedRecord,
        hasVjOperatorGrant: parsedRecord.hasVjOperatorGrant === true,
      };
    }
  } catch {
    // Unparseable text is dropped below.
  }
  clearVjScreenSession();
  return null;
}

/**
 * The saved admin or VJ operator as a provisional user. An admin stands in on
 * the account tier with no grants; a VJ operator stands in as a member holding
 * `vj_operator` alone, which is exactly what authGate needs to admit the
 * screen route and nothing more.
 */
export function toProvisionalVjUser(record: VjScreenSessionRecord): AuthUser {
  return {
    id: record.userId,
    email: "",
    status: "active",
    role: record.hasVjOperatorGrant ? "member" : "admin",
    ageAttestedAt: record.ageAttestedAt,
    onboardedAt: record.onboardedAt,
    suspendedUntil: null,
    suspension: null,
    staffRoles: record.hasVjOperatorGrant ? [VJ_OPERATOR_GRANT] : [],
    earlyAccessFeatures: [],
    profile: {
      slug: record.profile.slug,
      firstName: record.profile.firstName,
      lastName: record.profile.lastName,
    },
  };
}
