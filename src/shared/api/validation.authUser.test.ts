import { describe, expect, it } from "vitest";
import { validateAuthUser } from "./validation";

/** A minimal valid `GET /auth/me` body; each case spreads its own extras in. */
function authMeBody(extraFields: Record<string, unknown> = {}) {
  return {
    id: "member-1",
    email: "member@queerpulse.test",
    status: "active",
    role: "member",
    ageAttestedAt: "2026-01-01T00:00:00.000Z",
    onboardedAt: "2026-01-01T00:00:00.000Z",
    profile: { slug: "member-one", firstName: "Member", lastName: "One" },
    ...extraFields,
  };
}

describe("validateAuthUser: earlyAccessFeatures", () => {
  it("keeps the granted feature keys the backend sends", () => {
    const user = validateAuthUser(
      authMeBody({ earlyAccessFeatures: ["quizshow"] }),
    );
    expect(user.earlyAccessFeatures).toEqual(["quizshow"]);
  });

  it("defaults to no grants when an older backend omits the field", () => {
    const user = validateAuthUser(authMeBody());
    expect(user.earlyAccessFeatures).toEqual([]);
  });

  it("reads a malformed value as no grants", () => {
    const user = validateAuthUser(
      authMeBody({ earlyAccessFeatures: "quizshow" }),
    );
    expect(user.earlyAccessFeatures).toEqual([]);
  });

  it("drops entries that are not strings and keeps the rest", () => {
    const user = validateAuthUser(
      authMeBody({ earlyAccessFeatures: ["quizshow", 7, null, { key: "x" }] }),
    );
    expect(user.earlyAccessFeatures).toEqual(["quizshow"]);
  });

  it("keeps a key this build does not know yet, for callers to narrow", () => {
    const user = validateAuthUser(
      authMeBody({ earlyAccessFeatures: ["future-feature"] }),
    );
    expect(user.earlyAccessFeatures).toEqual(["future-feature"]);
  });
});

describe("validateAuthUser: hasGoogle", () => {
  it("keeps hasGoogle false for an email-only member", () => {
    const user = validateAuthUser(authMeBody({ hasGoogle: false }));
    expect(user.hasGoogle).toBe(false);
  });

  it("keeps hasGoogle true", () => {
    const user = validateAuthUser(authMeBody({ hasGoogle: true }));
    expect(user.hasGoogle).toBe(true);
  });

  it("reads a missing value as true, since every older account has Google", () => {
    const user = validateAuthUser(authMeBody());
    expect(user.hasGoogle).toBe(true);
  });

  it("reads a malformed value as true", () => {
    const user = validateAuthUser(authMeBody({ hasGoogle: "yes" }));
    expect(user.hasGoogle).toBe(true);
  });
});
