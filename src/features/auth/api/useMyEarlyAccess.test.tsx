import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import {
  AuthContext,
  type AuthContextValue,
} from "../../../app/providers/authContext";
import type { AuthUser } from "./auth.api";
import { useHasEarlyAccess } from "./useMyEarlyAccess";

function memberWith(earlyAccessFeatures: string[]): AuthUser {
  return {
    id: "member-1",
    email: "member@queerpulse.test",
    status: "active",
    role: "member",
    staffRoles: [],
    earlyAccessFeatures,
    ageAttestedAt: "2026-01-01T00:00:00.000Z",
    onboardedAt: "2026-01-01T00:00:00.000Z",
    suspendedUntil: null,
    suspension: null,
    profile: { slug: "member-one", firstName: "Member", lastName: "One" },
  };
}

function authValue(user: AuthUser | null): AuthContextValue {
  return {
    loggedIn: user !== null,
    checking: false,
    preparing: false,
    user,
    status: user?.status ?? null,
    role: user?.role ?? null,
    staffRoles: [],
    authError: null,
    signIn: () => {},
    signOut: () => {},
    endPreparing: () => {},
    refresh: () => Promise.resolve(),
    markOnboarded: () => {},
  };
}

function wrapperWith(value: AuthContextValue) {
  return ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

describe("useHasEarlyAccess", () => {
  it("is true for a member holding the grant", () => {
    const { result } = renderHook(() => useHasEarlyAccess("quizshow"), {
      wrapper: wrapperWith(authValue(memberWith(["quizshow"]))),
    });
    expect(result.current).toBe(true);
  });

  it("is false for a member without the grant", () => {
    const { result } = renderHook(() => useHasEarlyAccess("quizshow"), {
      wrapper: wrapperWith(authValue(memberWith([]))),
    });
    expect(result.current).toBe(false);
  });

  it("is false when signed out", () => {
    const { result } = renderHook(() => useHasEarlyAccess("quizshow"), {
      wrapper: wrapperWith(authValue(null)),
    });
    expect(result.current).toBe(false);
  });

  it("is false without an AuthProvider, so pages render in component tests", () => {
    const { result } = renderHook(() => useHasEarlyAccess("quizshow"));
    expect(result.current).toBe(false);
  });
});
