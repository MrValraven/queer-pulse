import { renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { quizshowRemotePath, quizshowScreenPath } from "./quizshowPaths";
import {
  eventScope,
  gameScope,
  QuizshowScopeContext,
  quizshowScopeKey,
  quizshowScopeRemotePath,
  quizshowScopeRemoteUrl,
  quizshowScopeScreenPath,
  useQuizshowScopeKind,
} from "./quizshowScope";

describe("quizshow scope", () => {
  it("routes an event scope to the event's screen and remote", () => {
    const scope = eventScope("pride-brunch-jun");
    expect(quizshowScopeScreenPath(scope)).toBe(
      quizshowScreenPath("pride-brunch-jun"),
    );
    expect(quizshowScopeRemotePath(scope)).toBe(
      quizshowRemotePath("pride-brunch-jun"),
    );
  });
  it("routes a game scope under /play/games", () => {
    const scope = gameScope("g1");
    expect(quizshowScopeScreenPath(scope)).toBe("/play/games/g1/screen");
    expect(quizshowScopeRemotePath(scope)).toBe("/play/games/g1/remote");
    expect(
      quizshowScopeRemoteUrl(scope).endsWith("/play/games/g1/remote"),
    ).toBe(true);
  });
  it("keys the two kinds apart", () => {
    expect(quizshowScopeKey(eventScope("x"))).toBe("event:x");
    expect(quizshowScopeKey(gameScope("x"))).toBe("game:x");
    expect(quizshowScopeKey(eventScope("x"))).not.toBe(
      quizshowScopeKey(gameScope("x")),
    );
  });
  it("reads event when no scope provider is mounted", () => {
    const { result } = renderHook(() => useQuizshowScopeKind());
    expect(result.current).toBe("event");
  });
  it("reads game under a game scope provider", () => {
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(
        QuizshowScopeContext.Provider,
        { value: gameScope("g1") },
        children,
      );
    const { result } = renderHook(() => useQuizshowScopeKind(), { wrapper });
    expect(result.current).toBe("game");
  });
});
