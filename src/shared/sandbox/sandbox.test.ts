import { afterEach, describe, expect, it, vi } from "vitest";
import { isSandbox } from "./sandbox";

const setSearch = (search: string) => {
  window.history.replaceState({}, "", `/${search}`);
};

afterEach(() => {
  setSearch("");
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("isSandbox", () => {
  it("is false in production regardless of markers", () => {
    vi.stubEnv("DEV", false);
    setSearch("?sandbox=1");
    expect(isSandbox()).toBe(false);
  });

  it("is true in dev when the ?sandbox query param is present", () => {
    vi.stubEnv("DEV", true);
    setSearch("?sandbox=1");
    expect(isSandbox()).toBe(true);
  });

  it("is true in dev when the hosting iframe is tagged data-sandbox=1", () => {
    vi.stubEnv("DEV", true);
    setSearch("");
    const frame = document.createElement("iframe");
    frame.setAttribute("data-sandbox", "1");
    vi.stubGlobal("frameElement", frame);
    expect(isSandbox()).toBe(true);
  });

  it("is false in dev with no markers", () => {
    vi.stubEnv("DEV", true);
    setSearch("");
    expect(isSandbox()).toBe(false);
  });
});
