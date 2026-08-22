import { describe, expect, it } from "vitest";
import { foldNavigation, previousNavEntry, type NavEntry } from "./navHistory";

const entry = (pathname: string, key: string, search = ""): NavEntry => ({
  pathname,
  search,
  key,
});

describe("foldNavigation", () => {
  it("appends a pushed entry", () => {
    const stack = [entry("/communities/casa", "k1")];
    expect(foldNavigation(stack, entry("/members/ana", "k2"), "PUSH")).toEqual([
      entry("/communities/casa", "k1"),
      entry("/members/ana", "k2"),
    ]);
  });

  it("swaps the top on REPLACE instead of stacking a second entry", () => {
    // navigate(to, { replace: true }) supersedes the current entry, so the
    // page BEFORE it stays the one you came from.
    const stack = [entry("/forum/t/hello", "k1"), entry("/members/ana", "k2")];
    const next = foldNavigation(
      stack,
      entry("/members/ana-b", "k3"),
      "REPLACE",
    );
    expect(next).toEqual([
      entry("/forum/t/hello", "k1"),
      entry("/members/ana-b", "k3"),
    ]);
  });

  it("truncates back to the entry a POP returns to", () => {
    const stack = [
      entry("/feed", "k1"),
      entry("/members/ana", "k2"),
      entry("/members/ana/design", "k3"),
    ];
    const next = foldNavigation(stack, entry("/members/ana", "k2"), "POP");
    expect(next).toEqual([entry("/feed", "k1"), entry("/members/ana", "k2")]);
  });

  it("resets to just this entry when a POP lands on a key we never saw", () => {
    // A forward-pop, or a session restored from a stack older than this page
    // load: what came before is genuinely unknowable, so callers should fall
    // back rather than trust a stale tail.
    const stack = [entry("/feed", "k1"), entry("/members/ana", "k2")];
    expect(foldNavigation(stack, entry("/search", "k9"), "POP")).toEqual([
      entry("/search", "k9"),
    ]);
  });

  it("is a no-op for the entry already on top (StrictMode double render)", () => {
    const stack = [entry("/feed", "k1"), entry("/members/ana", "k2")];
    expect(foldNavigation(stack, entry("/members/ana", "k2"), "PUSH")).toBe(
      stack,
    );
  });

  it("trims the oldest entries past the cap", () => {
    let stack = [entry("/0", "k0")];
    for (let index = 1; index <= 20; index += 1) {
      stack = [
        ...foldNavigation(stack, entry(`/${index}`, `k${index}`), "PUSH"),
      ];
    }
    expect(stack).toHaveLength(12);
    expect(stack[0]).toEqual(entry("/9", "k9"));
    expect(stack[stack.length - 1]).toEqual(entry("/20", "k20"));
  });
});

describe("previousNavEntry", () => {
  it("returns the entry before the current one", () => {
    const stack = [entry("/feed", "k1"), entry("/members/ana", "k2")];
    expect(previousNavEntry(stack)).toEqual(entry("/feed", "k1"));
  });

  it("returns null on the first entry of a session", () => {
    expect(previousNavEntry([entry("/members/ana", "k1")])).toBeNull();
  });
});
