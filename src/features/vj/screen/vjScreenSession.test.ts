import { beforeEach, describe, expect, it } from "vitest";
import type { AuthUser } from "../../auth/api/auth.api";
import {
  VJ_SCREEN_SESSION_KEY,
  VJ_SCREEN_SESSION_MAX_AGE_MS,
  readVjScreenSession,
  saveVjScreenSession,
  toProvisionalVjAdmin,
} from "./vjScreenSession";

function buildUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: "user-1",
    email: "admin@example.org",
    status: "active",
    role: "admin",
    ageAttestedAt: "2026-01-01T00:00:00.000Z",
    onboardedAt: "2026-01-02T00:00:00.000Z",
    suspendedUntil: null,
    suspension: null,
    staffRoles: ["magazine_editor"],
    earlyAccessFeatures: ["quizshow"],
    profile: {
      slug: "alex-rivera",
      firstName: "Alex",
      lastName: "Rivera",
      pronouns: "they/them",
      avatarUrl: "https://files.example/avatar.jpg",
    },
    ...overrides,
  };
}

describe("vjScreenSession", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves an active admin", () => {
    saveVjScreenSession(buildUser(), 1_000);
    expect(readVjScreenSession(1_000)).toEqual({
      userId: "user-1",
      ageAttestedAt: "2026-01-01T00:00:00.000Z",
      onboardedAt: "2026-01-02T00:00:00.000Z",
      profile: { slug: "alex-rivera", firstName: "Alex", lastName: "Rivera" },
      savedAt: 1_000,
    });
  });

  it("clears the record for a member or a suspended admin", () => {
    saveVjScreenSession(buildUser(), 1_000);
    saveVjScreenSession(buildUser({ role: "member" }), 2_000);
    expect(localStorage.getItem(VJ_SCREEN_SESSION_KEY)).toBeNull();

    saveVjScreenSession(buildUser(), 3_000);
    saveVjScreenSession(buildUser({ status: "suspended" }), 4_000);
    expect(localStorage.getItem(VJ_SCREEN_SESSION_KEY)).toBeNull();
    expect(readVjScreenSession(4_000)).toBeNull();
  });

  it("reads nothing past seven days", () => {
    saveVjScreenSession(buildUser(), 1_000);
    expect(
      readVjScreenSession(1_000 + VJ_SCREEN_SESSION_MAX_AGE_MS),
    ).not.toBeNull();
    expect(
      readVjScreenSession(1_000 + VJ_SCREEN_SESSION_MAX_AGE_MS + 1),
    ).toBeNull();
    expect(localStorage.getItem(VJ_SCREEN_SESSION_KEY)).toBeNull();
  });

  it("turns the record into a provisional admin", () => {
    saveVjScreenSession(buildUser(), 1_000);
    const record = readVjScreenSession(1_000);
    expect(record).not.toBeNull();
    if (record === null) return;
    const provisionalAdmin = toProvisionalVjAdmin(record);
    expect(provisionalAdmin.role).toBe("admin");
    expect(provisionalAdmin.status).toBe("active");
    expect(provisionalAdmin.id).toBe("user-1");
    expect(provisionalAdmin.email).toBe("");
    expect(provisionalAdmin.staffRoles).toEqual([]);
    expect(provisionalAdmin.earlyAccessFeatures).toEqual([]);
    expect(provisionalAdmin.suspendedUntil).toBeNull();
    expect(provisionalAdmin.suspension).toBeNull();
    expect(provisionalAdmin.profile.slug).toBe("alex-rivera");
  });

  it("keeps only the id, the onboarding dates and the three profile fields", () => {
    saveVjScreenSession(buildUser(), 1_000);
    const storedText = localStorage.getItem(VJ_SCREEN_SESSION_KEY) ?? "";
    const storedRecord = JSON.parse(storedText) as Record<string, unknown>;
    expect(Object.keys(storedRecord).sort()).toEqual([
      "ageAttestedAt",
      "onboardedAt",
      "profile",
      "savedAt",
      "userId",
    ]);
    expect(Object.keys(storedRecord.profile as object).sort()).toEqual([
      "firstName",
      "lastName",
      "slug",
    ]);
    expect(storedText).not.toContain("admin@example.org");
    expect(storedText).not.toContain("avatar");
  });
});
