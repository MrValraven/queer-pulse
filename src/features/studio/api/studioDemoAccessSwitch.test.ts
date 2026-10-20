import { beforeEach, describe, expect, it } from "vitest";
import {
  DEMO_STUDIO_ACCESS_STORAGE_KEY,
  isDemoStudioAccessOff,
} from "./studioDemoAccessSwitch";

beforeEach(() => {
  window.localStorage.removeItem(DEMO_STUDIO_ACCESS_STORAGE_KEY);
});

describe("isDemoStudioAccessOff", () => {
  it("is off by default", () => {
    expect(isDemoStudioAccessOff("")).toBe(false);
  });

  it("switches off with ?studioAccess=off and remembers it", () => {
    expect(isDemoStudioAccessOff("?studioAccess=off")).toBe(true);
    expect(isDemoStudioAccessOff("")).toBe(true);
  });

  it("switches back on with ?studioAccess=on", () => {
    isDemoStudioAccessOff("?studioAccess=off");
    expect(isDemoStudioAccessOff("?studioAccess=on")).toBe(false);
    expect(isDemoStudioAccessOff("")).toBe(false);
  });

  it("ignores any other value", () => {
    expect(isDemoStudioAccessOff("?studioAccess=maybe")).toBe(false);
  });
});
