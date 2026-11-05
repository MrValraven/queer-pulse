import type { AuthUser } from "../../auth/api/auth.api";

export const VJ_SCREEN_SESSION_KEY = "queerpulse.vj.screen.session.v1";
export const VJ_SCREEN_SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * The only facts kept about the admin who set up a screen: enough to boot the
 * route offline. The email, the avatar and every token stay out.
 */
export interface VjScreenSessionRecord {
  userId: string;
  ageAttestedAt: string | null;
  onboardedAt: string | null;
  profile: { slug: string; firstName: string; lastName: string };
  savedAt: number;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isSessionRecord(value: unknown): value is VjScreenSessionRecord {
  if (!isPlainObject(value)) return false;
  const profile = value.profile;
  return (
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

/** Keeps the record for an active admin and clears it for anyone else. */
export function saveVjScreenSession(user: AuthUser, now = Date.now()): void {
  if (user.role !== "admin" || user.status !== "active") {
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
      return parsedRecord;
    }
  } catch {
    // Unparseable text is dropped below.
  }
  clearVjScreenSession();
  return null;
}

export function toProvisionalVjAdmin(record: VjScreenSessionRecord): AuthUser {
  return {
    id: record.userId,
    email: "",
    status: "active",
    role: "admin",
    ageAttestedAt: record.ageAttestedAt,
    onboardedAt: record.onboardedAt,
    suspendedUntil: null,
    suspension: null,
    staffRoles: [],
    earlyAccessFeatures: [],
    profile: {
      slug: record.profile.slug,
      firstName: record.profile.firstName,
      lastName: record.profile.lastName,
    },
  };
}
