import { describe, it, expect } from "vitest";
import { detectTrigger } from "./detectTrigger";

describe("detectTrigger", () => {
  it("detects a member trigger at the caret", () => {
    expect(detectTrigger("hey @an")).toEqual({
      kind: "member",
      query: "an",
      start: 4,
    });
  });

  it("detects a member trigger with a capitalized query", () => {
    expect(detectTrigger("hey @An")).toEqual({
      kind: "member",
      query: "An",
      start: 4,
    });
  });

  it("detects a community trigger", () => {
    expect(detectTrigger("see c/cre")).toEqual({
      kind: "community",
      query: "cre",
      start: 4,
    });
  });

  it("detects a bare @ with an empty query", () => {
    expect(detectTrigger("@")).toEqual({ kind: "member", query: "", start: 0 });
  });

  it("returns null when the token is not at the caret", () => {
    expect(detectTrigger("@ana done")).toBeNull();
  });

  it("returns null for an email in progress", () => {
    expect(detectTrigger("me@ho")).toBeNull();
  });

  it("returns null when there is no trigger", () => {
    expect(detectTrigger("plain words")).toBeNull();
  });
});
